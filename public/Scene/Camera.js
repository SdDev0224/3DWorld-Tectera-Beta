import { PerspectiveCamera } from 'three'
import Experience from "./Experience.js"
import { OrbitControls } from './OrbitControls.js'
import Data from './Utils/Data.js'


export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.webglCanvas = this.experience.renderer.instance.domElement
        this.data = new Data()

        this.setInstance()
        // this.setControls()
    }

    setInstance() {
        this.instance = new PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 10000)
        this.instance.position.set(0, 0, this.data.cameraZDistance)
        this.scene.add(this.instance)
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.webglCanvas)

        // this.controls.enableDamping = true
        // this.controls.target.set(0, 0, 0)
        // this.controls.enableZoom = false

        // this.controls.maxAzimuthAngle = Math.PI * 0.4
        // this.controls.minAzimuthAngle = Math.PI * 0.1

        // this.controls.maxPolarAngle = Math.PI * 0.45
        // this.controls.minPolarAngle = Math.PI * 0.3
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update() {
        if (this.controls) {
            this.controls.update()
        }
    }
}
