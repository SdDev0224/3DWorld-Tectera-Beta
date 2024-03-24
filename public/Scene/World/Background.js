import Experience from '../Experience.js'


const backgroundKeyArr = ['background1', 'background2', 'background3']


export default class Background {
    constructor() {
        this.experience = new Experience()
        this.resources = this.experience.loaders
        this.scene = this.experience.scene
        this.backgroundKey = 0

        this.resources.on('ready', () => {
            this.scene.background = this.resources.items[backgroundKeyArr[this.backgroundKey]]
        })
    }

    prev() {
        const prevKey = (backgroundKeyArr.length + this.backgroundKey - 1) % backgroundKeyArr.length
        // console.log('Background#prev: prevKey: ', prevKey)
        this.backgroundKey = prevKey
        this.scene.background = this.resources.items[backgroundKeyArr[prevKey]]
    }

    next() {
        const nextKey = (this.backgroundKey + 1) % backgroundKeyArr.length
        // console.log('Background#next: nextKey: ', nextKey)
        this.backgroundKey = nextKey
        this.scene.background = this.resources.items[backgroundKeyArr[nextKey]]
    }
}
