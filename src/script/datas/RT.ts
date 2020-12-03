import { LotBase } from "../library/Lottery";
import { YakuData } from "../library/SlotModule";
import { LotName } from "./Lot";

export abstract class RT {
    rt: number = -1;
    countGame(): void {
    }
    abstract hitCheck(hitYakus: YakuData[]): void;
    onHit(hitYakus: YakuData[]): void {
        this.hitCheck(hitYakus);
        this.countGame();
    }
    abstract onLot(lot: LotBase): LotBase;
}

export class DefaultRT extends RT {
    constructor() {
        super();
        console.log(this.constructor.name + 'へ以降');
    }
    hitCheck(_hitYakus: YakuData[]): void {
    }
    onLot(lot: LotBase): LotBase {
        return lot;
    }
}

export class HighRT extends RT {
    public checkGame = false;
    constructor() {
        super();
        console.log(this.constructor.name + 'へ以降');
    }
    hitCheck(hitYakus: YakuData[]) {
        if (this.checkGame && hitYakus.length === 0) {
            RTData.rt = new DefaultRT;
        }
        this.checkGame = false;
    }
    onLot(lot: LotBase): LotBase {
        if ((["ベル"] as LotName[]).includes(lot.name)) {
            this.checkGame = true;
        }
        if ((["BIG", "REG"] as LotName[]).includes(lot.name)) {
            RTData.rt = new DefaultRT;
        }
        return lot;
    }
}


export const RTData: { rt: RT } = {
    rt: new DefaultRT

}