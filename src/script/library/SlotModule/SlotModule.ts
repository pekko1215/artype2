import { SlotFlashController } from "./FlashController";
import { Flash } from "./FlashReservation";
import { KeyBoard, KeyConfig } from "./KeyBoard";
import { PanelData } from "./PanelData";
import { ReelControl } from "./ReelControl";
import { HitYakuData, SlotReelController } from "./ReelController";
import { SlotEventEmitter, SlotEventListener, SlotEventPayload } from "./SlotEventListener";
import { SlotStatus, SystemStatus } from "./Status";
import { SlotViewController } from "./ViewController";

export abstract class SlotModule extends SlotEventEmitter {
    events = new Map<string, SlotEventListener[]>();
    panelData: PanelData;
    reelControl: ReelControl;
    slotStatus: SlotStatus;
    flashController: SlotFlashController;
    viewController: SlotViewController;
    reelController!: SlotReelController;
    zyunjo: number[] | null = null;
    pushEvent: { almighty: () => void; left: () => void; center: () => void; right: () => void; lever: () => void; bet: () => void; } | null = null;
    freezeFlag: boolean = false;
    constructor(panelData: PanelData, reelControl: ReelControl, defaultFlash: Flash) {
        super();
        this.panelData = panelData;
        this.reelControl = reelControl;
        this.slotStatus = new SlotStatus(this);
        this.flashController = new SlotFlashController(this, defaultFlash);
        this.viewController = new SlotViewController(this, document.getElementById("pixiview")!);

        this.init()

        // ステージを作る
        this.registerKeyControl()
    }
    async init() {

        await this.viewController.loadReelChip();
        this.reelController = new SlotReelController(this);
        this.viewController.draw();
    }
    registerKeyControl() {
        let leftKeyListener = KeyBoard(KeyConfig.left);
        let centerKeyListener = KeyBoard(KeyConfig.center);
        let rightkeyListener = KeyBoard(KeyConfig.right);
        let betKeyListener = KeyBoard(KeyConfig.bet);
        let leverKeyListener = KeyBoard(KeyConfig.lever);
        let allKeyListener = KeyBoard(KeyConfig.all);


        let stopButtonSmart = function (e: TouchEvent) {
            let rect = (<Element>e.target).getBoundingClientRect();
            pushScreen({
                x: e.changedTouches[0].clientX - rect.left,
                y: e.changedTouches[0].clientY - rect.top
            })
        }
        let stopButtonPC = function (e: MouseEvent) {
            pushScreen({
                x: e.clientX - (<Element>e.target).getBoundingClientRect().left,
                y: e.clientY - (<Element>e.target).getBoundingClientRect().top
            })
        }

        let pushScreen = (pos: { x: any; y?: number; }) => {
            if (this.reelController === null) return;
            if (this.viewController === null) return;
            if (allKeyListener.press === null) return;
            switch (this.slotStatus.systemStatus) {
                case SystemStatus.Started:
                    this.reelController.stopReel(Math.floor(pos.x / (this.viewController.width / 3)))
                    break;
                default:
                    allKeyListener.press();
            }
        }

        // this.viewController!.app.view.addEventListener('touchstart', stopButtonSmart)
        // this.viewController!.app.view.addEventListener('mousedown', stopButtonPC)


        leftKeyListener.press = () => {
            if (this.reelController === null) return;
            this.reelController.stopReel(0);
            this.emit('pressStop');
            this.emit('pressStop1');
            this.emit('pressAny');
        }
        centerKeyListener.press = () => {
            if (this.reelController === null) return;
            this.emit('pressStop');
            this.emit('pressStop2');
            this.emit('pressAny');
            this.reelController.stopReel(1);
        }
        rightkeyListener.press = () => {
            if (this.reelController === null) return;
            this.emit('pressStop');
            this.emit('pressStop3');
            this.emit('pressAny');
            this.reelController.stopReel(2);
        }
        allKeyListener.press = () => {
            if (this.reelController === null) return;
            this.emit("pressAllmity")
            this.emit('pressAny');
            let zyunjo = this.zyunjo || [1, 2, 3]
            zyunjo = [...zyunjo]
            for (let i = 0; i < 3; i++) {
                this.emit('pressStop');
                if (this.reelController.stopReel(zyunjo[i] - 1)) {
                    if (i == 2) {
                        this.zyunjo = null
                    }
                    return;
                }
            }
            if (this.slotStatus.systemStatus != SystemStatus.Beted) {
                this.emit("pressBet")
                this.betCoin(3);
                return;
            }
            if (this.slotStatus.systemStatus == SystemStatus.Beted) {
                this.emit("pressLever")
                this.leverON()
                return;
            }
        }
        leverKeyListener.press = () => {
            this.emit("pressLever")
            this.emit('pressAny');
            this.leverON()
        }
        betKeyListener.press = () => {
            this.emit("pressBet")
            this.emit('pressAny');
            this.betCoin(3)
        }

        this.pushEvent = {
            almighty: allKeyListener.press,
            left: leftKeyListener.press,
            center: centerKeyListener.press,
            right: rightkeyListener.press,
            lever: leverKeyListener.press,
            bet: betKeyListener.press
        };

    }
    async update() {
        let { slotStatus } = this;
        if (this.reelController === null) return;
        if (slotStatus.wait > 0) {
            let deltaTime = new Date().getTime() - slotStatus.oldTime.getTime();
            slotStatus.wait -= deltaTime;
            if (slotStatus.wait < 0)
                slotStatus.wait = 0;
            slotStatus.oldTime = new Date()
        }
        if (this.freezeFlag) { return }
        switch (slotStatus.systemStatus) {
            case SystemStatus.BetWait:
                break;
            case SystemStatus.Beted:
                break;
            case SystemStatus.LeverOn:
                break;
            case SystemStatus.LeverWait:
                break
            case SystemStatus.Wait:
                if (slotStatus.wait == 0) {
                    this.reelController.startReel();
                    slotStatus.stopOrder = [];
                    slotStatus.systemStatus = SystemStatus.Started
                    slotStatus.wait = slotStatus.waitTime;
                    this.emit("reelStart");
                }
                break;
            case SystemStatus.Started:
                break
            case SystemStatus.SlipStart:
                let count = 4 - this.reelController.getMoveingCount()
                await this.onReelStop(count);
                slotStatus.systemStatus = SystemStatus.Sliping
                break;
            case SystemStatus.Sliping:
                if (!this.reelController.isReelSliping()) slotStatus.systemStatus = SystemStatus.ReelStop;
                break
            case SystemStatus.ReelStop:
                if (this.reelController.getMoveingCount() == 0) {
                    slotStatus.systemStatus = SystemStatus.AllReelStop
                } else {
                    slotStatus.systemStatus = SystemStatus.Started;
                }
                break
            case SystemStatus.AllReelStop:
                slotStatus.systemStatus = SystemStatus.AllReelStopWait;
                let hitYaku = this.reelController.getHitYakus()
                let payData: any = await this.onHitCheck(hitYaku);
                this.emit("allReelStop", new class implements SlotEventPayload {
                    data = payData;
                    listener?: SlotEventListener;
                });


                slotStatus.systemStatus = SystemStatus.Pay;
                let { isReplay } = await this.onPay(payData);
                slotStatus.isReplay = isReplay;
                await this.onPayEnd(payData);
                this.slotStatus.systemStatus = SystemStatus.BetWait;
                this.emit("payEnd")
                if (isReplay) {
                    await this.onReplay();
                } else {
                    await this.onBetReset();
                }
        }
    }
    abstract async onPay(any: any): Promise<{ isReplay: boolean }>;
    abstract async onPayEnd(any: any): Promise<void>;
    async onBetReset() {
        this.slotStatus.betCoin = 0
    }
    async onReplay() {
        this.emit("payEnd")
        await this.onBet();
        this.slotStatus.systemStatus = SystemStatus.Beted
    }
    abstract async onReelStop(number: number): Promise<void>;
    abstract async onHitCheck(hitYakuDatas: HitYakuData[]): Promise<any>;
    abstract async onBet(): Promise<void>;
    abstract async onBetCoin(coin: any): Promise<void>;
    async betCoin(coin: number): Promise<boolean> {
        if (this.freezeFlag) { return false }
        if (this.slotStatus.systemStatus !== SystemStatus.BetWait) {
            if (this.slotStatus.systemStatus != SystemStatus.Beted || this.slotStatus.betCoin == this.slotStatus.maxBet) {
                return false;
            }
        }
        this.slotStatus.betCoin = this.slotStatus.betCoin + coin;
        if (this.slotStatus.betCoin > this.slotStatus.maxBet) {
            coin += this.slotStatus.maxBet - this.slotStatus.betCoin;
            this.slotStatus.betCoin = this.slotStatus.maxBet
        }
        if (this.slotStatus.betCoin >= this.slotStatus.minBet) {
            this.slotStatus.systemStatus = SystemStatus.Beting;
            this.emit("bet", { data: coin });
            await this.onBet();
            await this.onBetCoin(coin)
            this.slotStatus.systemStatus = SystemStatus.Beted;
        }
        return true;
    }
    async leverON() {
        if (this.freezeFlag) { return }
        if (this.slotStatus.systemStatus != SystemStatus.Beted) {
            return false;
        }
        this.slotStatus.systemStatus = SystemStatus.LeverWait
        this.slotStatus.controlCode = await this.onLot();
        this.slotStatus.systemStatus = SystemStatus.Wait;
        this.emit("leverOn");
        return true;
    }
    abstract onLot(): number;

    resume() {
        this.freezeFlag = false;
    }
    freeze() {
        this.freezeFlag = true;
    }
}