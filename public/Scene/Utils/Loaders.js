import { LoadingManager, TextureLoader } from 'three'
import { DRACOLoader } from '/javascripts/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from '/javascripts/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from '/javascripts/jsm/loaders/FBXLoader.js'
import EventEmitter from "./EventEmitter.js"


export default class Loaders extends EventEmitter {
    constructor(assets) {
        super()

        // Options
        this.assets = assets

        // Setup
        this.items = {}
        this.toLoad = this.assets.length
        this.loaded = 0

        this.setLoaders()
        this.startLoading()
    }

    setLoaders() {
        // const loadingBarElement = document.querySelector('.loading-bar')
        // const loadingLogo = document.querySelector('.logoLoading')

        this.loaders = {}
        this.loaders.loadingManager = new LoadingManager(
            () => {
                setTimeout(() => {
                    // this.trigger('closeOverlay')
                    // loadingBarElement.classList.add('ended')
                    // loadingLogo.classList.add('ended')
                    // loadingBarElement.style.transform = ''
                }, 2000)
            },
            // (itemUrl, itemsLoaded, itemsTotal) => {
            //     const progressRatio = itemsLoaded / itemsTotal
            //     loadingBarElement.style.transform = `scaleX(${progressRatio})`
            // },
        )
        this.loaders.gltfLoader = new GLTFLoader(this.loaders.loadingManager)
        this.loaders.dracoLoader = new DRACOLoader(this.loaders.loadingManager)
        this.loaders.dracoLoader.setDecoderPath('/static/draco/')
        this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader)
        this.loaders.fbxLoader = new FBXLoader(this.loaders.loadingManager)
        this.loaders.textureLoader = new TextureLoader(this.loaders.loadingManager)
    }

    startLoading() {
        for (const asset of this.assets) {
            switch (asset.type) {
                case 'glb':
                    this.loaders.gltfLoader.load(asset.path, (file) => {
                        this.sourceLoaded(asset, file)
                    })
                    break

                case 'fbx':
                    this.loaders.fbxLoader.load(asset.path, (file) => {
                        this.sourceLoaded(asset, file)
                    })
                    break

                case 'texture':
                    this.loaders.textureLoader.load(asset.path, (file) => {
                        this.sourceLoaded(asset, file)
                    })
                    break
            }
        }
    }

    sourceLoaded(asset, file) {
        this.items[asset.name] = file
        this.loaded++
        // console.log('Loaders#sourceLoaded: this.loaded: ', this.loaded)
        // console.log('Loaders#sourceLoaded: this.toLoad: ', this.toLoad)

        if (this.loaded === this.toLoad) {
            this.trigger('ready')
        }
    }
}
