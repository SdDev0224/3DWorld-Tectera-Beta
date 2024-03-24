import {
    AmbientLight,
    DirectionalLight,
    HemisphereLight,
} from 'three'
import Experience from "./Experience.js"


export default class Lights {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene

        this.setAmbient()
        this.setDirection()
        this.setHemisphere()
    }

    setAmbient() {
        this.ambient = new AmbientLight(0x404040, 2)
        this.scene.add(this.ambient)
    }

    setDirection() {
        this.direction = new DirectionalLight(0x404040, 0.1)
        this.direction.position.set(0, 10, 0)
        this.direction.castShadow = true
        this.direction.shadow.camera.top = 2
        this.direction.shadow.camera.bottom = -2
        this.direction.shadow.camera.left = -2
        this.direction.shadow.camera.right = 2
        this.direction.shadow.camera.near = 0.1
        this.scene.add(this.direction)
    }

    setHemisphere() {
        this.hemisphere = new HemisphereLight(0x404040, 2)
        this.hemisphere.position.set(0, 500, 0)
        this.scene.add(this.hemisphere)
    }
}
