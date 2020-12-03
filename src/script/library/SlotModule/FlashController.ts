import { Flash, FlashReservation } from "./FlashReservation";
import { SlotModule } from "./SlotModule";
import * as PIXI from "pixi.js";
import { flashData } from "../../datas/Flash";


export class SlotFlashController {
    flashReservations: FlashReservation[] = [];
    slotModule: SlotModule;
    defaultFlash: Flash;
    backGraphics: PIXI.Graphics | null = null;
    constructor(slotModule: SlotModule, defaultFlash: Flash) {
        this.slotModule = slotModule
        this.defaultFlash = defaultFlash;
    }
    init() {
        this.backGraphics = new PIXI.Graphics();
        this.slotModule.viewController!.stage.addChildAt(this.backGraphics, 0);
        this.setFlash(this.defaultFlash, 1)
    }
    draw() {
        if (this.flashReservations.length === 0) {
            return;
        }
        if (!this.backGraphics) return;
        let { backGraphics } = this;
        let { reelController, reelControl, viewController } = this.slotModule;
        if (!viewController) return;
        if (!reelController) return;
        let { reelChipData, reelChips } = viewController;
        if (!reelChips) return;
        this.backGraphics.clear();
        let reservation = this.flashReservations[0]!;
        let { back } = reservation.flash;

        reelController.reels.forEach((reel, x) => {
            if (!viewController) return;
            if (!reelChips) return;
            let charIndex = reel.reelChipPosition;
            let yIndex = 0;
            for (let y = 0; y < 3; y++) {

                backGraphics.beginFill(back.get(x, y)!.color, back.get(x, y)!.alpha);
                let xsize = reelChipData!.width;
                let ysize = reelChipData!.height;

                if (y == 2) ysize = viewController.height - reelChipData!.height * 2;
                backGraphics.drawRect(xsize * x + (x > 0 ? reelChipData!.blank * x : 0), yIndex, xsize, ysize);

                yIndex += ysize;
                if (y == 0) {
                    if (reelChips[x][charIndex].tint == 0xFFFFFF) {
                        reelChips[x][(charIndex + 4) % reelControl.controlData.reelLength].tint = 0xFFFFFF;
                    }
                }
                reelChips[x][(charIndex + y) % reel.length].tint = reservation.flash.front.get(x, y)!.color;
            }
        })
        if (reservation.timer === -1) return;
        reservation.timer--;
        if (reservation.timer < 0) {
            reservation.onFlashEnd();
            this.flashReservations.shift();
        }
    }
    setFlash(flash: Flash, timer = -1) {
        return new Promise(r => {
            if (timer === -1) this.clearFlashReservation();
            this.flashReservations.push(new FlashReservation(
                flash,
                timer,
                r
            ))
        })
    }
    clearFlashReservation() {
        this.flashReservations = [];
        this.setFlash(this.defaultFlash, 0);
        this.draw();
    }
}