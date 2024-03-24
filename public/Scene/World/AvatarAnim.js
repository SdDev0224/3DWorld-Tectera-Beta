import Experience from "../Experience.js"


export default class AvatarAnim {
    constructor(actions) {
        this.experience = new Experience()
        this.resources = this.experience.loaders
        this.time = this.experience.time
        this.scene = this.experience.scene
        this.mixer = this.experience.world.avatar.mixer
        this.actions = actions

        this.mixer.timeScale = 1
        this.activateAllActions()
        this.setAllWeight(0)
    }

    deactivateAllActions() {
        Object.keys(this.actions).forEach((actionKey) => {
            this.actions[actionKey].stop()
        })
    }

    activateAllActions() {
        Object.keys(this.actions).forEach((actionKey) => {
            this.actions[actionKey].play()
        })
    }

    unPauseAllActions() {
        Object.keys(this.actions).forEach((actionKey) => {
            this.actions[actionKey].paused = false
        })
    }

    pauseAllActions() {
        Object.keys(this.actions).forEach((actionKey) => {
            this.actions[actionKey].paused = true
        })
    }

    setAllWeight(weight) {
        Object.keys(this.actions).forEach((actionKey) => {
            this.setWeight(this.actions[actionKey], weight)
        })
    }

    setWeight(action, weight) {
        action.enabled = true
        action.setEffectiveTimeScale(1)
        action.setEffectiveWeight(weight)
    }

    executeCrossFade(startAction, endAction, duration) {
        this.setWeight(endAction, 1)
        endAction.time = 0
        if (startAction) {
            startAction.crossFadeTo(endAction, duration, true)
        }
    }

    synchronizeCrossFade(startAction, endAction, duration) {
        const onLoopFinished = (event) => {
            if (event.action === startAction || !startAction) {
                this.mixer.removeEventListener('loop', onLoopFinished)
                this.executeCrossFade(startAction, endAction, duration)
            }
        }

        if (this.mixer) {
            this.mixer.addEventListener('loop', onLoopFinished)
        }
    }

    prepareCrossFade(startAction, endAction, duration) {
        this.unPauseAllActions()
        this.executeCrossFade(startAction, endAction, duration)
    }

    prepareSyncCrossFade(startAction, endAction, duration) {
        this.unPauseAllActions()
        this.synchronizeCrossFade(startAction, endAction, duration)
    }

    playNewActionOnly(actionKey) {
        const newAction = this.actions[actionKey]
        if (!newAction) {
            return
        }

        if (this.prevAction !== newAction) {
            this.prepareCrossFade(this.prevAction, newAction, 0.1)
            this.prevAction = newAction
        }
    }

    update() {
        if (this.mixer) {
            this.mixer.update(this.time.delta * 0.001)
        }
    }
}
