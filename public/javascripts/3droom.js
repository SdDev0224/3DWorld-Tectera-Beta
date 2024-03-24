import * as THREE from '/build/three.module.js';
import { GLTFLoader } from "/javascripts/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "/javascripts/jsm/loaders/DRACOLoader.js";
import { FBXLoader } from "/javascripts/jsm/loaders/FBXLoader.js";
import { OrbitControls } from '/javascripts/jsm/controls/OrbitControls.js';
import { CSS3DObject } from '/javascripts/jsm/renderers/CSS3DRenderer.js';

// Base
// Global Variables & Constants
let model;
let CharacterAnimations = {};
let mixer = null;
const globalScale = 1.5

let textureMain = new THREE.TextureLoader().load("/textures/background1.jpg")
let texturePrev = new THREE.TextureLoader().load("/textures/background2.jpg")
let textureNext = new THREE.TextureLoader().load("/textures/background3.jpg")

let textures = []

textures.push(textureMain)
textures.push(texturePrev)
textures.push(textureNext)

// Canvas
const canvas = document.querySelector("#scene");

// Scene
const scene = new THREE.Scene();

const texture = new THREE.TextureLoader().load("images/001.jpg");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;

scene.background = texture

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/static/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Returns The Loaded animations from the
// Character Animation Object
class CharacterAnimationMapProxy {
  constructor(animations) {
    this._animations = animations;
  }

  get animations() {
    return this._animations;
  }
}

class FiniteStateMachine {
  constructor() {
    this._states = {};
    this._currentState = null;
  }

  _AddState(name, type) {
    this._states[name] = type;
  }

  SetState(name) {
    const prevState = this._currentState;

    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
      prevState.Exit();
    }

    const state = new this._states[name](this);

    this._currentState = state;
    state.Enter(prevState);
  }

  Update(timeElapsed, input) {
    if (this._currentState) {
      this._currentState.Update(timeElapsed, input);
    }
  }
}

class CharacterFSM extends FiniteStateMachine {
  constructor(proxy) {
    super();
    this._proxy = proxy;
    this._Init();
  }

  _Init() {
    this._AddState("idle", IdleState);
    this._AddState("walk", WalkState);
    this._AddState("walkback", WalkBackState);
    this._AddState("run", RunState);
    this._AddState("jump", JumpState);
  }
}

class State {
  constructor(parent) {
    this._parent = parent;
  }

  Enter() { }
  Exit() { }
  Update() { }
}

class CharacterController {
  constructor() {
    // params: {camera, scene}
    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this._acceleration = new THREE.Vector3(1, 0.25, 8.0);
    this._velocity = new THREE.Vector3(0, 0,);
    this._animations = {};
    this._input = new CharacterControllerKeyboardInput();
    this._stateMachine = new CharacterFSM(
      new CharacterAnimationMapProxy(this._animations)
    );

    this._LoadModels();
  }

  _setText(str) {
    this._text = str
  }

  _getText() {
    return this._text
  }

  _LoadModels() {
    gltfLoader.load("/static/models/krtin/krtinRPM.glb", (gltf) => {
      this._model = gltf.scene;
      this._model.rotation.set(0, Math.PI, 0);
      this._model.traverse((object) => {
        object.frustumCulled = false
      });
      this._model.scale.set(globalScale, globalScale, globalScale)
      scene.add(this._model);
      mixer = new THREE.AnimationMixer(this._model);
      this._loadingManagert = new THREE.LoadingManager();
      this._loadingManagert.onLoad = () => {
        this._stateMachine.SetState("idle");
      };

      const _OnLoad = (name, obj) => {
        const clip = obj.animations[0];
        const action = mixer.clipAction(clip);
        this._animations[name] = {
          clip,
          action,
        };
      };
      const fbxloader = new FBXLoader(this._loadingManagert);
      fbxloader.load("/static/models/krtin/walk.fbx", (a) => _OnLoad("walk", a));
      fbxloader.load("/static/models/krtin/walkback.fbx", (a) => _OnLoad("walkback", a));
      fbxloader.load("/static/models/krtin/run.fbx", (a) => _OnLoad("run", a));
      fbxloader.load("/static/models/krtin/jump.fbx", (a) => _OnLoad("jump", a));
      fbxloader.load("/static/models/krtin/Idle.fbx", (a) => _OnLoad("idle", a));
    });
  }

  Update(timeInSeconds) {
    if (!this._model) return;
    this._stateMachine.Update(timeInSeconds, this._input);
    const velocity = this._velocity;
    const frameDecceleration = new THREE.Vector3(
      velocity.x * this._decceleration.x,
      velocity.y * this._decceleration.y,
      velocity.z * this._decceleration.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z =
      Math.sign(frameDecceleration.z) *
      Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));
    velocity.add(frameDecceleration);
    const controlModel = this._model;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlModel.quaternion.clone();

    const acc = this._acceleration.clone();

    if (this._input._keys.shift) acc.multiplyScalar(2.0);

    if (this._input._keys.forward) velocity.z += acc.z * timeInSeconds * globalScale;

    if (this._input._keys.backward) {
      velocity.z -= acc.z * timeInSeconds * globalScale;
    }

    if (this._input._keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(
        _A,
        4.0 * Math.PI * timeInSeconds * this._acceleration.y
      );
      _R.multiply(_Q);
    }
    if (this._input._keys.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(
        _A,
        4.0 * -Math.PI * timeInSeconds * this._acceleration.y
      );
      _R.multiply(_Q);
    }

    controlModel.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlModel.quaternion);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlModel.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlModel.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    controlModel.position.add(forward);
    controlModel.position.add(sideways);

    oldPosition.copy(controlModel.position);
  }
}

// Keyboard Input to move the characters
class CharacterControllerKeyboardInput {
  constructor() {
    this._Init();
  }

  _Init() {
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    };
    document.addEventListener("keydown", (e) => this._onKeyDown(e), false);
    document.addEventListener("keyup", (e) => this._onKeyUp(e), false);
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case 37: // backward
        this._keys.left = true;
        break;
      case 38: // right
        this._keys.forward = true;
        break;
      case 39: // forward
        this._keys.right = true;
        break;
      case 40: // left
        this._keys.backward = true;
        break;
      case 16: // SHIFT
        this._keys.shift = true;
        break;
    }
  }

  _onKeyUp(event) {
    switch (event.keyCode) {
      case 37: // backward
        this._keys.left = false;
        break;
      case 38: // right
        this._keys.forward = false;
        break;
      case 39: // forward
        this._keys.right = false;
        break;
      case 40: // left
        this._keys.backward = false;
        break;
      case 16: // SHIFT
        this._keys.shift = false;
        break;
    }
  }
}

class IdleState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return "idle";
  }

  Enter(prevState) {
    const idleAction = this._parent._proxy._animations["idle"].action;

    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.7, true);
    }
    idleAction.play();
  }

  Exit() { }

  Update(_, input) {
    if (input._keys.forward) this._parent.SetState("walk");
    else if (input._keys.backward) this._parent.SetState("walkback");
    else if (input._keys.space) this._parent.SetState("jump");
  }
}

class WalkState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return "walk";
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations["walk"].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;
      curAction.enabled = true;

      if (prevAction.Name == "run") {
        const ratio =
          curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }
      curAction.crossFadeFrom(prevAction, 0.2, true);
    }
    curAction.play();
  }

  Exit() { }

  Update(_, input) {
    if (input._keys.forward || input._keys.backward) {
      if (input._keys.shift) {
        this._parent.SetState("run");
      }
      return;
    }

    this._parent.SetState("idle");
  }
}

class WalkBackState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return "walkback";
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations["walkback"].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;
      curAction.enabled = true;

      if (prevAction.Name == "run") {
        const ratio =
          curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }
      curAction.crossFadeFrom(prevAction, 0.2, true);
    }
    curAction.play();
  }

  Exit() { }

  Update(_, input) {
    if (input._keys.forward || input._keys.backward) {
      if (input._keys.shift) {
        this._parent.SetState("run");
      }
      return;
    }

    this._parent.SetState("idle");
  }
}

class RunState extends State {
  constructor(parent) {
    super(parent);
  }

  get Name() {
    return "run";
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations["run"].action;
    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.enabled = true;

      if (prevState.Name == "walk") {
        const ratio =
          curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.5, true);
    }
    curAction.play();
  }

  Exit() { }

  Update(timeElapsed, input) {
    if (input._keys.forward || input._keys.backward) {
      if (!input._keys.shift) {
        this._parent.SetState("walk");
      }
      return;
    }

    this._parent.SetState("idle");
  }
}

class JumpState extends State {
  constructor(parent) {
    super(parent);

    this._FinishedCallback = () => {
      this._Finished();
    };
  }

  get Name() {
    return "jump";
  }

  Enter(prevState) {
    const curAction = this._parent._proxy._animations["jump"].action;
    const mixer = curAction.getMixer();
    mixer.addEventListener("finished", this._FinishedCallback);

    if (prevState) {
      const prevAction = this._parent._proxy._animations[prevState.Name].action;

      curAction.reset();
      curAction.setLoop(THREE.LoopOnce, 1);
      curAction.clampWhenFinished = true;
      curAction.crossFadeFrom(prevAction, 0.2, true);
    }
    curAction.play();
  }

  _Finished() {
    this._Cleanup();
    this._parent.SetState("idle");
  }

  _Cleanup() {
    const action = this._parent._proxy._animations["jump"].action;

    action.getMixer().removeEventListener("finished", this._CleanupCallback);
  }

  Exit() {
    this._Cleanup();
  }

  Update(_, input) {
    if (input._keys.forward || input._keys.backward) {
      if (input._keys.shift) {
        this._parent.SetState("run");
      }
      return;
    }

    this._parent.SetState("idle");
  }
}

const RPMcharacter = new CharacterController();

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(-3, 10, -10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = -2;
dirLight.shadow.camera.left = -2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
scene.add(dirLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 5);
hemiLight.position.set(0, 500, 0);
scene.add(hemiLight);


// speech bubble
// get canvas and context
const drawingCanvas = document.createElement('canvas')
const drawingContext = drawingCanvas.getContext('2d')

// // image
// const img = document.getElementById('speechbubble')
// drawingContext.drawImage(img, 0, 0, 190, 150)

// text

// material
let canvasTexture = new THREE.CanvasTexture(drawingCanvas);
canvasTexture.needsUpdate = true;
let canvasMaterial = new THREE.SpriteMaterial({ map: canvasTexture, color: 0xffffff });
canvasMaterial.opacity = 0.9

const sprite = new THREE.Sprite(canvasMaterial);
sprite.scale.set(3, 1.5, 0)
sprite.opacity = 0.5
scene.add(sprite);

// new speech bubble
let i = 0
const element = document.createElement('div');
element.className = 'element';
element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';

const number = document.createElement('div');
number.className = 'number';
number.textContent = (i / 5) + 1;
element.appendChild(number);

const symbol = document.createElement('div');
symbol.className = 'symbol';
symbol.textContent = "Hello";
element.appendChild(symbol);

const details = document.createElement('div');
details.className = 'details';
details.innerHTML = "Hello" + '<br>' + "Hello";
element.appendChild(details);
element.style.zIndex = 10

const objectCSS = new CSS3DObject(element);
objectCSS.position.x = 0;
objectCSS.position.y = 0;
objectCSS.position.z = 0;
objectCSS.scale.set(globalScale, globalScale, globalScale)
scene.add(objectCSS);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight - 40,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight - 40;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  0.1,
  2000,
);
camera.position.set(10 * globalScale, 1, 0);
RPMcharacter?._model?.position.set(0, -1, 10)
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enabled = false;
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;

// Animate
const clock = new THREE.Clock();
let previousTime = 0;

let nextFlag = false, pgcount = 0;
let prevFlag = false;
let isFirst = true

const tick = () => {
  if (isFirst && RPMcharacter?._model) {
    RPMcharacter?._model?.position.set(10, -1.5, 3)
    isFirst = false
  }
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;


  // Call tick again on the next frame
  window.requestAnimationFrame(tick);

  // Model animation
  if (mixer) mixer.update(deltaTime);

  // Render
  renderer.render(scene, camera);

  let texture

  let vector = new THREE.Vector3().clone();

  let width = renderer.domElement.width;

  if (RPMcharacter._model?.matrixWorld)
    vector.setFromMatrixPosition(RPMcharacter._model?.matrixWorld).clone();
  vector.project(camera);

  let percX = (vector.x + 1) / 2;

  let left = percX * width;

  if (RPMcharacter._model) {
    if (left > window.innerWidth) {
      prevFlag = true
      pgcount--
      left = 0
      RPMcharacter._model.position.set(RPMcharacter._model.position.x, RPMcharacter._model.position.y, -RPMcharacter._model.position.z)
    } else if (left < 0) {
      nextFlag = true
      pgcount++
      RPMcharacter._model.position.set(RPMcharacter._model.position.x, RPMcharacter._model.position.y, -RPMcharacter._model.position.z)
    }
  }

  if (prevFlag) {
    texture = textures[Math.abs(pgcount) % 3]
  } else if (nextFlag) {
    texture = textures[Math.abs(pgcount + 1) % 3]
  }

  if (pgcount === 0) {
    nextFlag = false
    prevFlag = false
    texture = textureMain
  }

  scene.background = texture

  sprite.position.set(RPMcharacter._model?.position.x, RPMcharacter._model?.position.y + 3.6, RPMcharacter._model?.position.z)
  // objectCSS.position.set(RPMcharacter._model?.position.x, RPMcharacter._model?.position.y + 3.6, RPMcharacter._model?.position.z)

  if (RPMcharacter) RPMcharacter.Update(deltaTime);
};

tick();
