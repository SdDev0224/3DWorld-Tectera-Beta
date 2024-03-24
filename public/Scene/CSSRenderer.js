import Experience from "./Experience.js"
import { CSS3DRenderer } from '/javascripts/jsm/renderers/CSS3DRenderer.js'


export default class CSSRenderer {
    constructor() {
        this.experience = new Experience()
        this.cssEl = this.experience.cssEl
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene

        this.setInstance()
    }

    setInstance() {
        this.instance = new CSS3DRenderer()
        this.instance.domElement.style.position = 'absolute';
        this.instance.domElement.style.top = 0;
        this.cssEl.appendChild(this.instance.domElement)
        this.resize()
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height)
    }

    update() {
        if (this.experience.camera) {
            this.instance.render(this.scene, this.experience.camera.instance)
        }
    }
}
