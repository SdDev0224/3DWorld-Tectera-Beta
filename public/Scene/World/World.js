import Experience from "../Experience.js"
import Avatar from "./Avatar.js"
import SpeechBubble from "./SpeechBubble.js"


export default class World {
    constructor() {
        this.experience = new Experience()
        this.resources = this.experience.loaders
        this.scene = this.experience.scene
        this.avatar = new Avatar()
        this.speechBubble = new SpeechBubble()
    }

    update() {
        this.avatar.update()
        this.speechBubble.update()
    }
}
