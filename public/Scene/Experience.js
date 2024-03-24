import {
    Scene,
    AxesHelper,
} from 'three'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Lights from './Lights.js'
import Loaders from './Utils/Loaders.js'
import assets from './assets.js'
import Background from './World/Background.js'
import CSSRenderer from './CSSRenderer.js'


let instance = null


export default class Experience {
    constructor() {
        this.webglEl = document.querySelector('#webgl')
        this.cssEl = document.querySelector('#css')
        if (instance || !this.webglEl || !this.cssEl) {
            return instance
        }
        instance = this

        this.loaders = new Loaders(assets)
        // console.log('Experience: this.loaders.items: ', this.loaders.items)
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new Scene()
        this.lights = new Lights()
        this.background = new Background()
        this.renderer = new Renderer()
        this.cssRenderer = new CSSRenderer()
        this.camera = new Camera()
        this.world = new World()

        // this.scene.add(new AxesHelper(10))

        this.sizes.on('resize', () => {
            this.resize()
        })

        this.time.on('tick', () => {
            this.update()
        })
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
        this.cssRenderer.resize()
    }

    update() {
        this.camera.update()
        this.world.update()
        this.renderer.update()
        this.cssRenderer.update()
    }

    updateSpeechBubbleText(text) {
        this.world.speechBubble.updateText(text)
    }
}
