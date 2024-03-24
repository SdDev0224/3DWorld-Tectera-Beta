import {
    Vector3,
    Quaternion,
    AnimationMixer,
    AxesHelper,
} from 'three'
import Experience from "../Experience.js"
import AvatarAnim from './AvatarAnim.js'
import KeyboardState from '../Utils/KeyboardState.js'
import Data from '../Utils/Data.js'


export default class Avatar {
    constructor() {
        this.experience = new Experience()
        this.resources = this.experience.loaders
        this.time = this.experience.time
        this.scene = this.experience.scene
        this.background = this.experience.background
        this.renderer = this.experience.renderer
        this.camera = this.experience.camera
        this.keyboardState = new KeyboardState()
        this.data = new Data()

        this._decceleration = new Vector3(-0.0005, -0.0001, -5 * this.data.cameraZDistance)
        this._acceleration = new Vector3(1, 0.25, 50 * this.data.cameraZDistance)
        this._velocity = new Vector3()

        this.setModel()
        this.setAnimation()
    }

    setModel() {
        this.resources.on('ready', () => {
            this.model = this.resources.items.avatar.scene
            const avatarScale = this.data.cameraZDistance / 2.5
            this.model.scale.set(avatarScale, avatarScale, avatarScale)
            this.model.position.set(-this.data.cameraZDistance, -this.data.cameraZDistance * 0.5, 0)
            this.model.rotation.set(0, Math.PI / 2, 0)
            // this.model.add(new AxesHelper(10))
            this.scene.add(this.model)

            this.mixer = new AnimationMixer(this.model)
        })
    }

    setAnimation() {
        this.resources.on('ready', () => {
            const actions = {}
            const animKeyArr = ['idle', 'jump', 'run', 'walk', 'walkback']
            animKeyArr.forEach(animKey => {
                actions[animKey] = this.mixer.clipAction(this.resources.items[animKey].animations[0])
            })
            this.avatarAnim = new AvatarAnim(actions)
            this.avatarAnim.playNewActionOnly('idle')

            this.keyboardState.on('keyEvent', () => {
                if (this.keyboardState.up) {
                    if (this.keyboardState.shift) {
                        this.avatarAnim.playNewActionOnly('run')
                    } else {
                        this.avatarAnim.playNewActionOnly('walk')
                    }
                } else if (this.keyboardState.down) {
                    this.avatarAnim.playNewActionOnly('walkback')
                } else {
                    this.avatarAnim.playNewActionOnly('idle')
                }
            })
        })
    }

    update() {
        if (this.avatarAnim) {
            this.avatarAnim.update()
        }

        if (this.model) {
            const tolerance = this.data.cameraZDistance * 0.05

            // Move & Rotate
            const diff = this.time.delta * 0.001
            const velocity = this._velocity;
            const frameDecceleration = new Vector3(
                velocity.x * this._decceleration.x,
                velocity.y * this._decceleration.y,
                velocity.z * this._decceleration.z
            );
            frameDecceleration.multiplyScalar(diff);
            frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));
            velocity.add(frameDecceleration);
            const _Q = new Quaternion();
            const _A = new Vector3();
            const _R = this.model.quaternion.clone();
            const acc = this._acceleration.clone();

            if (this.keyboardState.shift && this.keyboardState.up) {
                acc.multiplyScalar(2.5);
            }
            if (this.keyboardState.down) {
                velocity.z += acc.z * diff;
            }
            if (this.keyboardState.up) {
                velocity.z -= acc.z * diff;
            }

            if (this.keyboardState.left) {
                _A.set(0, 1, 0);
                _Q.setFromAxisAngle(
                    _A,
                    4.0 * Math.PI * diff * this._acceleration.y
                );
                _R.multiply(_Q);
            }

            if (this.keyboardState.right) {
                _A.set(0, 1, 0);
                _Q.setFromAxisAngle(
                    _A,
                    4.0 * -Math.PI * diff * this._acceleration.y
                );
                _R.multiply(_Q);
            }

            this.model.quaternion.copy(_R);

            if (this.model.position.z + tolerance * 9 >= this.data.cameraZDistance) {
                this.model.position.setZ(this.model.position.z - tolerance)
                return
            }

            const forward = new Vector3(0, 0, -1);
            forward.applyQuaternion(this.model.quaternion);
            forward.normalize();
            forward.multiplyScalar(velocity.z * diff);
            this.model.position.add(forward);

            const sideways = new Vector3(1, 0, 0);
            sideways.applyQuaternion(this.model.quaternion);
            sideways.normalize();
            sideways.multiplyScalar(velocity.x * diff);
            this.model.position.add(sideways);

            // Calculate avatar 2d project position
            const vec3 = new Vector3()
            const width = this.renderer.instance.domElement.width
            vec3.setFromMatrixPosition(this.model.matrixWorld);
            vec3.project(this.camera.instance)

            if (vec3.x <= -1) {
                this.model.position.setX(-this.model.position.x - tolerance)
                this.background.prev()
            }

            if (vec3.x >= 1) {
                this.model.position.setX(-this.model.position.x + tolerance)
                this.background.next()
            }
        }
    }
}
