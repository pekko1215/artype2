
export const KeyConfig = {
    left: 'ArrowLeft',
    center: 'ArrowDown',
    right: 'ArrowRight',
    bet: 'Shift',
    lever: 'Control',
    all: 'ArrowUp'
}

export class KeyListener {
    isDown = false;
    isUp = true;
    press: (() => void) | null = null;
    release: (() => void) | null = null;
    key: string;
    constructor(key: string) {
        this.key = key;
    }
    downHandler(event: KeyboardEvent) {
        if (event.key === this.key) {
            if (this.isUp && this.press) { this.press() }
            this.isDown = true
            this.isUp = false
        }
        event.preventDefault()
    }
    upHandler(event: KeyboardEvent) {
        if (event.key === this.key) {
            if (this.isDown && this.release) { this.release() }
            this.isDown = false
            this.isUp = true
        }
        event.preventDefault()
    }
}

export const KeyBoard = (key: string) => {
    const keyListener = new KeyListener(key);


    //Attach event listeners
    window.addEventListener(
        "keydown", keyListener.downHandler.bind(keyListener), false
    )
    window.addEventListener(
        "keyup", keyListener.upHandler.bind(keyListener), false
    )
    return keyListener
}