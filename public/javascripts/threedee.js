// 3D code

// Sprite
var sx0 = 0;
var sy0 = 0;
var rotationy = 0;
var ay = 0;
var jump = 0;

// Sprites
var right;
var sx1 = 0;
var px = 0;
var py = 0;
var opx = 0;
var opy = 0;
var rx = 0;

// Mouse
var mx = 0;
var my = 0;
var omx = 0;
var omy = 0;
var mousedown;

// Texture
const loader = new THREE.TextureLoader();
const texture = loader.load('images/cube.png');

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF);
const geometry = new THREE.BufferGeometry();

// Run
function main3D() {
  // Get canvas
  const canvas = document.querySelector('#c');
  if (!canvas) return;

  // Create renderer
  const renderer = new THREE.WebGLRenderer({canvas});

  // Create camera
  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 10;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 3;

  // Create light
  const color = 0xFFFFFF;
  const intensity = 2;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

  // Sprite
  var width = 1.5;
  const vertices = [
    // Front
    { pos: [-width, -1,  1], norm: [ 0,  0,  1], uv: [0, 0], },
    { pos: [ width, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
    { pos: [-width,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], },

    { pos: [-width,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], },
    { pos: [ width, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
    { pos: [ width,  1,  1], norm: [ 0,  0,  1], uv: [1, 1], },
  ];
  const positions = [];
  const normals = [];
  const uvs = [];
  for (const vertex of vertices) {
    positions.push(...vertex.pos);
    normals.push(...vertex.norm);
    uvs.push(...vertex.uv);
  }
  const positionNumComponents = 3;
  const normalNumComponents = 3;
  const uvNumComponents = 2;
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
  geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));

  // Create sprites
  sprites = [ createSprite(geometry, 0xFFFFFF, -100) ];

  // Create speech bubbles for each sprite
  speechBubbles = [ createSpeechBubble("", 0, 0, 0) ];

  // Render
  function render(time) {

/*    // Position
    sx0 = mx / 100;
    sy0 = my / 100 - 8;
    //sprites[0].position.x = sx0;
    //sprites[0].position.z = sy0;

    // Jump
    ay += Math.abs(my - omy) / 100;
    ay += jump;
    jump *= 0.8;
    ay *= 0.9;
    if (ay < 0) ay = 0;
    if (ay > 10) ay = 10;
//    sprites[0].position.y = ay;

    // Rotation
    if (omx == 0) omx = mx;
    if (omy == 0) omy = my;
    rotationy += (mx - omx) / 1000;
//    sprites[0].rotation.y = rotationy;
    if (!mousedown) rotationy *= 0.98;

    // Position sprites
    if (right) sx1 += 0.02;
    else       sx1 -= 0.02;
    if (sx1 >  2) right = false;
    if (sx1 < -2) right = true;
//    sprites[1].position.x = sx1;
//    sprites[1].position.y = 0;
//    sprites[1].position.z = -4;

    // Rotation
    px = sx1;
    if (opx == 0) opx = px;
    rx += (px - opx) / 1;
    //sprites[1].rotation.y = rx;
    rx *= 0.9;
    opx = px;
*/

    // Update speech bubble positions
    for (i = 0; i < sprites.length && i < speechBubbles.length; i++)
      speechBubbles[i].position.set(sprites[i].position.x, sprites[i].position.y + 1.5, sprites[i].position.z + 1);

    // Mouse
    omx = mx;
    omy = my;

    // Camera
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // Render
    renderer.render(scene, camera);

    // Next
    requestAnimationFrame(render);
  }

  // Render
  requestAnimationFrame(render);

  // Mouse
  window.onmousemove = function(event) { 
    mx = event.clientX;
    my = event.clientY;
  }
  window.onmousedown = function(event) {
    jump += 0.5;
    mousedown = true;
  }
  window.onmouseup = function(event) {
    jump -= 0.1;
    mousedown = false;
  }

  // Resize
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) renderer.setSize(width, height, false);
    return needResize;
  }
}

// Create sprite
function createSprite(geometry, color, x) {
  const material = new THREE.MeshPhongMaterial({color, map: texture});
  const sprite = new THREE.Mesh(geometry, material);
  scene.add(sprite);
  sprite.position.x = x;
  return sprite;
}

// Create a speech bubble
function createSpeechBubble(text, x, y, z) {
  const texture = createTextTexture(text);
  const material = new THREE.SpriteMaterial({map: texture});
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y, z);
  sprite.scale.set(texture.image.width / 200, texture.image.height / 200, 1);
  scene.add(sprite);
  return sprite;
}

// Update a speech bubble
function updateSpeechBubble(speechBubble, newText, sprite) {
  const texture = createTextTexture(newText);
  speechBubble.material.map.dispose();
  speechBubble.material.map = texture;
  speechBubble.material.needsUpdate = true;
  speechBubble.scale.set(texture.image.width / 200, texture.image.height / 200, 1);
  speechBubble.position.set(sprite.position.x, sprite.position.y + 1.5, sprite.position.z);
}

// Create a text texture for speech bubbles
function createTextTexture(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontSize = 70;
  ctx.font = `${fontSize}px Arial`;
  const textWidth = ctx.measureText(text).width;
  const padding = fontSize;
  const borderRadius = fontSize / 2;
  const triangleSize = fontSize / 2;
  canvas.width = textWidth * 2 + padding * 2;
  canvas.height = fontSize * 2.5 + triangleSize;
  ctx.font = `${fontSize}px Arial`;

  // Draw oval background
  ctx.fillStyle = '#fafada';
  ctx.beginPath();
  ctx.ellipse(
    canvas.width / 2,
    borderRadius + padding / 2,
    canvas.width / 2 - padding / 2,
    borderRadius * 1,
    0,
    0,
    2 * Math.PI
  );
  ctx.fill();

  // Draw triangle
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - triangleSize / 2, fontSize * 1.5 - triangleSize / 2);
  ctx.lineTo(canvas.width / 2 + triangleSize / 2, fontSize * 1.5 - triangleSize / 2);
  ctx.lineTo(canvas.width / 2, fontSize * 1.5 + triangleSize / 2);
  ctx.closePath();
  ctx.fill();

  // Draw text
  ctx.fillStyle = 'black';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, padding, borderRadius + padding / 2);

  // Return
  return new THREE.CanvasTexture(canvas);
}

// Run
$(function() {
  main3D();
});
