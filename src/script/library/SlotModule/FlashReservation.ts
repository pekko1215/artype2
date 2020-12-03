import { Matrix } from "./Matrix";

export interface FlashColor {
    color: number,
    alpha: number
}

export class Flash {
    back!: Matrix<FlashColor>;
    front!: Matrix<FlashColor>;
    constructor(init?: Partial<Flash>) {
        Object.assign(this, init);
    }
    copy() {
        return new Flash({
            front: this.front.copy(),
            back: this.back.copy()
        });
    }
}

export class FlashReservation {
    flash: Flash;
    timer: number;
    callback = () => { };
    constructor(flash: Flash, timer: number, callback = () => { }) {
        this.flash = flash;
        this.timer = timer;
        this.callback = callback;
    }
    onFlash() {

    }
    onFlashStart() { }
    onFlashEnd() {
        this.callback();
    }
}