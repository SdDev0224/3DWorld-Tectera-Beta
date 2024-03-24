import {
    Object3D,
    MeshPhongMaterial,
    NoBlending,
    ShapeGeometry,
    Shape,
    Mesh,
} from 'three'
import Experience from "../Experience.js"
import { CSS3DObject } from '/javascripts/jsm/renderers/CSS3DRenderer.js'


export default class SpeechBubble {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.loaders

        this.resources.on('ready', () => {
            this.avatarModel = this.experience.world.avatar.model

            this.instance = makeElementObject('div', 380, 320)
            this.instance.css3dObject.element.textContent = ''
            this.instance.css3dObject.element.setAttribute('contenteditable', '')
            this.instance.css3dObject.element.style.opacity = "1"
            this.instance.css3dObject.element.style.padding = '30px'
            this.instance.css3dObject.element.style.fontSize = '30px'
            this.instance.css3dObject.element.style.color = '#000000'
            this.instance.css3dObject.element.style.width = '380px'
            this.instance.css3dObject.element.style.height = '300px'
            this.instance.css3dObject.element.style.backgroundColor = '#71c13e'
            this.scene.add(this.instance)
        })
    }

    update() {
        if (this.avatarModel) {
            this.instance.position.set(
                this.avatarModel.position.x - 150,
                this.avatarModel.position.y + 740,
                this.avatarModel.position.z,
            )
        }
    }

    updateText(text) {
        this.instance.css3dObject.element.textContent = text
    }
}


function makeElementObject(type, width, height) {
    const obj = new Object3D

    const element = document.createElement(type)
    element.style.width = width + 'px'
    element.style.height = height + 'px'

    var css3dObject = new CSS3DObject(element)
    obj.css3dObject = css3dObject
    obj.add(css3dObject)

    const x = -width / 2.0, y = -height / 2.0 + 65, radius = 50;

    const heartShape = new Shape();

    heartShape.moveTo(x, y + radius);
    heartShape.lineTo(x, y + height - 85 - radius);
    heartShape.quadraticCurveTo(x, y + height - 85, x + radius, y + height - 85);
    heartShape.lineTo(x + width - radius, y + height - 85);
    heartShape.quadraticCurveTo(x + width, y + height - 85, x + width, y + height - 85 - radius);
    heartShape.lineTo(x + width, y + radius);
    heartShape.quadraticCurveTo(x + width, y, x + width - radius, y);
    heartShape.lineTo(x + 330, y);
    heartShape.lineTo(x + 320, y - 50);
    heartShape.lineTo(x + 280, y);
    heartShape.lineTo(x + radius, y);
    heartShape.quadraticCurveTo(x, y, x, y + radius);

    const geometry = new ShapeGeometry(heartShape);
    const material = new MeshPhongMaterial({
        color: 0x000000,
        opacity: 0,
        blending: NoBlending,
        transparent: true,
    });
    const mesh = new Mesh(geometry, material);
    obj.lightShadowMesh = mesh
    obj.add(mesh)

    return obj
}
