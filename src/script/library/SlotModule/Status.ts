import { SlotModule } from "./SlotModule";


export enum SystemStatus {
    BetWait,
    Beted,
    Started,
    LeverOn,
    LeverWait,
    Wait,
    SlipStart,
    Sliping,
    ReelStop,
    AllReelStop,
    AllReelStopWait,
    Pay,
    PayEnd,
    Beting
}

export class SlotStatus {
    slotModule: SlotModule;
    reelSpeed: number[] = [0, 0, 0];
    controlCode: number = 0;
    maxBet: number = 3;
    minBet: number = 1;
    systemStatus: SystemStatus = SystemStatus.BetWait;
    betCoin: number = 3;
    flashReservations: any[] = [];
    wait: number = 0;
    oldTime: Date = new Date();
    waitTime: number;
    stopOrder: number[] = [];
    isReplay: boolean = false;
    bonusData?: any;
    RTData?: any;

    constructor(slotModule: SlotModule, waitTime = 0) {
        this.slotModule = slotModule;
        this.waitTime = waitTime;
    }
}