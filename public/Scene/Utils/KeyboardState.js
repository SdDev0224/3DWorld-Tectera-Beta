import EventEmitter from "./EventEmitter.js";


export default class KeyboardState extends EventEmitter {
    constructor() {
        super()

        this.up = this.down = this.left = this.right = false

        // Keydown event
        window.addEventListener('keydown', (event) => {
            // console.log('KeyboardState#onKeyDown: event: ', event)

            switch (event.key) {
                case 'ArrowUp':
                    this.up = true;
                    break;

                case 'ArrowDown':
                    this.down = true;
                    break;

                case 'ArrowLeft':
                    this.left = true;
                    break;

                case 'ArrowRight':
                    this.right = true;
                    break;

                case 'Shift':
                    this.shift = true;
                    break;
            }

            this.trigger('keyEvent')
        })

        // Keydown event
        window.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    this.up = false;
                    break;

                case 'ArrowDown':
                    this.down = false;
                    break;

                case 'ArrowLeft':
                    this.left = false;
                    break;

                case 'ArrowRight':
                    this.right = false;
                    break;

                case 'Shift':
                    this.shift = false;
                    break;
            }

            this.trigger('keyEvent')
        })
    }
}
