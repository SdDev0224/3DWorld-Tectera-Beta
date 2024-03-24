import { CineonToneMapping, WebGLRenderer, PCFSoftShadowMap } from 'three'
import Experience from "./Experience.js"


export default class Renderer {
    constructor() {
        this.experience = new Experience()
        this.webglEl = this.experience.webglEl
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene

        this.setInstance()
    }

    setInstance() {
        this.instance = new WebGLRenderer({
            alpha: true,
            antialias: true
        })

        this.instance.toneMapping = CineonToneMapping
        this.instance.setClearColor(0x000000, 0)
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = PCFSoftShadowMap;
        this.webglEl.appendChild(this.instance.domElement)
        this.resize()
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
    }

    update() {
        if (this.experience.camera) {
            this.instance.render(this.scene, this.experience.camera.instance)
        }
    }
}
