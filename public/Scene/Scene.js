import Experience from './Experience.js'


const experience = new Experience(document.querySelector('#webgl'))

const msgInputEl = document.querySelector('#message-input')

msgInputEl.addEventListener('keydown', (event) => {
  experience.updateSpeechBubbleText(event.target.value)
})
