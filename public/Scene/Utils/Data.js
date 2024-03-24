import EventEmitter from "./EventEmitter.js"


let instance = null


export default class Data extends EventEmitter {
    constructor() {
        super()

        if (instance) {
            return instance
        }
        instance = this


        this.cameraZDistance = 800
    }
}
