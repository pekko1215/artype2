import { ControlName } from "./datas/Control";
import { SegmentControler } from "./library/SegmentControler";
import { LotBase } from "./library/Lottery";
import { HighRT, RTData } from "./datas/RT";
import { Bonus } from "./datas/Bonus";
import { BonusFlag, GameMode, SaveData, Slot } from "./index";
import { HitYakuData } from "./library/SlotModule/ReelController";
import { sounder } from "./datas/Sound";
import { ArrayLot, Rand, RandomChoice, Sleep } from "./Utilities";
import { LotName, SlotLotBase } from "./datas/Lot";
import { flashData } from "./datas/Flash";


abstract class Effect {
    effectManager: EffectManager;

    constructor(effectManager: EffectManager) {
        this.effectManager = effectManager;
    }
    async abstract onLot(lot: LotBase | null, control: ControlName, gameMode: GameMode, bonusFlag: BonusFlag): Promise<void>;
    async abstract payEffect(payCoin: number, hitYakus: HitYakuData[], gameMode: GameMode, bonusFlag: BonusFlag): Promise<void>;
    async onPay(payCoin: number, hitYakus: HitYakuData[], gameMode: GameMode, bonusFlag: BonusFlag) {
        await this.payEffect(payCoin, hitYakus, gameMode, bonusFlag);
    }
    async abstract onBonusEnd(bonusData: Bonus): Promise<void>;
}

function segInit(canvas: HTMLCanvasElement, size: number) {
    let sc = new SegmentControler(canvas, size, 0, -3, 50, 30);
    sc.setOffColor(120, 120, 120)
    sc.setOnColor(230, 0, 0)
    sc.reset();
    return sc;
}
export class EffectManager {
    credit = 50;
    dummyRTGameCount: number = -1;
    downEffectLevel: number = 3;
    Segments = {
        PaySeg: segInit(document.querySelector('#paySegment') as HTMLCanvasElement, 2),
        EffectSeg: segInit(document.querySelector('#effectSegment') as HTMLCanvasElement, 3),
        CreditSeg: segInit(document.querySelector('#creditSegment') as HTMLCanvasElement, 2)
    }
    pushOrder: number[] | null = null;
    currentEffect: Effect = new NormalEffect(this);
    shortFreezed: boolean = false;
    typeWritterd: boolean = false;
    onLot(lot: LotBase | null, control: ControlName, gameMode: GameMode, bonusFlag: BonusFlag) {

        return this.currentEffect.onLot(lot, control, gameMode, bonusFlag);
    }
    async onPay(payCoin: number, hitYakus: HitYakuData[], gameMode: GameMode, bonusFlag: BonusFlag) {
        await this.currentEffect.onPay(payCoin, hitYakus, gameMode, bonusFlag);
    }
    constructor() {
        this.Segments.CreditSeg.setSegments(50);
        this.Segments.CreditSeg.setOffColor(80, 30, 30);
        this.Segments.PaySeg.setOffColor(80, 30, 30);
        this.Segments.EffectSeg.setOffColor(5, 5, 5);
        this.Segments.CreditSeg.reset();
        this.Segments.PaySeg.reset();
        this.Segments.EffectSeg.reset();
    }
    changeCredit(delta: number) {
        this.credit += delta;
        if (this.credit < 0) {
            this.credit = 0;
        }
        if (this.credit > 50) {
            this.credit = 50;
        }
        this.Segments.CreditSeg.setSegments(this.credit)
    }
    async onBonusEnd(bonusData: Bonus) {
        this.dummyRTGameCount = RTData.rt.rt;
        await this.currentEffect.onBonusEnd(bonusData);
        this.shortFreezed = false;
        this.typeWritterd = false;
        this.downEffectLevel = 0;
        // for (let i = 0; i <= this.dummyRTGameCount; i++) {
        //     this.Segments.DekaSeg.setSegments(i);
        //     await Sleep(countTime / this.dummyRTGameCount);
        // }
    }
}

interface EffectLotData {
    value: number,
    table: number[]
}

class NormalEffect extends Effect {
    isNabi: boolean = false;
    isPenalty: boolean = false;
    isKokutid: boolean = false;
    isBonusTypeKokutid: boolean = false;
    isART = false;
    isHatten = false;
    ARTStock = 0;
    ExtraART = false;
    ExtraARTLot = 0;
    stop3Flag = false;
    renStartCoin: number = -1;
    SpStopTable = {
        EffectTable: [
            [
                [
                    [1, 0, 0]
                ]
            ], //1消灯
            [ //2消灯
                [
                    [1, 1, 0]
                ],
                [
                    [2, 2, 0],
                    [1, 2, 0]
                ]
            ],
            [
                [
                    [1, 1, 1],
                    [1, 1, 2],
                    [1, 2, 2]
                ],
                [
                    [1, 2, 3],
                    [2, 2, 3],
                ],
                [
                    [2, 3, 3],
                    [1, 1, 3],
                    [1, 3, 3],
                ],
                [
                    [0, 1, 1],
                    [0, 1, 2],
                    [0, 2, 2],
                    [1, 0, 1],
                    [1, 0, 2],
                    [2, 0, 2],
                ],
                [
                    [0, 0, 1],
                    [2, 0, 3],
                    [0, 0, 2],
                    [0, 0, 3],
                    [0, 3, 3],
                    [0, 2, 3],
                    [0, 1, 3],
                    [3, 3, 3]
                ]
            ]
        ],
        LotTable: {
            はずれ: [{
                value: 0,
                table: []
            }, {
                value: 0,
                table: []
            }, {
                value: 1 / 120,
                table: [80, 20]
            }].reverse(),
            リプレイ: [{
                value: 1 / 6,
                table: [100]
            }, {
                value: 0,
                table: []
            }, {
                value: 0,
                table: []
            }].reverse(),
            共通ベル: [{
                value: 2 / 3,
                table: [100]
            }, {
                value: 0,
                table: []
            }, {
                value: 1 / 16,
                table: [80, 10, 8, 2]
            }].reverse(),
            スイカ: [{
                value: 0,
                table: []
            }, {
                value: 1,
                table: [80, 20]
            }, {
                value: 1 / 3,
                table: [70, 20, 8, 2]
            }].reverse(),
            強スイカ: [{
                value: 0,
                table: []
            }, {
                value: 1,
                table: [80, 20]
            }, {
                value: 2 / 3,
                table: [70, 20, 8, 2]
            }].reverse(),
            BIG: [{
                value: 1 / 4,
                table: [100]
            }, {
                value: 1 / 3,
                table: [30, 70]
            }, {
                value: 1 / 3,
                table: [10, 35, 35, 10, 10]
            }].reverse(),
            成立後: [{
                value: 3 / 4,
                table: [100]
            }, {
                value: 3 / 4,
                table: [30, 70]
            }, {
                value: 5 / 6,
                table: [10, 35, 35, 10, 10]
            }].reverse()
        } as { [key in (LotName | "成立後")]?: EffectLotData[] }
    }
    ARTBitaTable = {
        GameCount: [1, 2, 3, 5, 10, 30, 50, 101, 102, 103],
        LotValue: [300, 300, 300, 50, 41, 3, 3, 1, 1, 1]
    }
    nabiElements = Array.from(document.querySelectorAll('#nabi1,#nabi2,#nabi3'))
    stopLightElements = Array.from(document.querySelectorAll("#stop1,#stop2,#stop3"))
    startCoin: number = 0;
    isHyper = false;
    ExtraARTGame: number = 0;
    static ExtraARTGameBase = 7;
    isShuffleEnd: boolean = false;
    constructor(effectManager: EffectManager) {
        super(effectManager);
    }
    setNabi(flags: (boolean | null)[]) {
        this.nabiElements.forEach((e, i) => {
            if (flags[i] === true) {
                e.classList.add('on');
            }
            if (flags[i] === false) {
                e.classList.remove('on')
            }
        })
    }
    setLight(flags: (boolean | null)[]) {
        this.stopLightElements.forEach((e, i) => {
            if (flags[i] === true) {
                e.classList.add('on');
            }
            if (flags[i] === false) {
                e.classList.remove('on')
            }
        })
    }
    atEffect(control: ControlName) {
        let v = [ControlName['3択子役1'], ControlName['3択子役2'], ControlName['3択子役3']].map(v => v === control);
        if (!v.includes(true)) return;
        this.setNabi(v);
        Slot.once('allReelStop', () => {
            this.setNabi([false, false, false]);
        })
    }
    changeARTSeg() {
        let str = ("00" + this.ARTStock).slice(-2);
        this.effectManager.Segments.PaySeg.setSegments(str);
    }
    async spStop(timing: number, count: number) {
        timing++;
        let v;
        for (; timing--;) {
            v = await Slot.once('reelStop');
        }
        if (count) {
            this.setLight([
                v?.data.idx === 0 ? false : null,
                v?.data.idx === 1 ? false : null,
                v?.data.idx === 2 ? false : null
            ])
        }
        for (; count--;) {
            sounder.playSound('spstop');
            await Sleep(100);
        }
    }

    async ARTEndEffect() {
        let num = (SaveData.coin - this.startCoin);
        if (num < 0) num = 0;
        this.effectManager.Segments.EffectSeg.setSegments(num)
        Slot.freeze();
        Slot.flashController.setFlash(flashData.syoto);
        await sounder.playSound('artend');
        Slot.flashController.clearFlashReservation();
        Slot.resume();
        this.isART = false;
    }
    async onLot(lot: SlotLotBase, control: ControlName, gameMode: GameMode, bonusFlag: BonusFlag) {
        if (!this.isBonusTypeKokutid) this.setNabi([false, false, false]);
        this.setLight([true, true, true]);
        this.stop3Flag = false;
        if (this.ExtraART) {
            this.effectManager.Segments.EffectSeg.setSegments(`-${this.ExtraARTGame}-`);
        } else {
        }

        switch (gameMode) {
            case 'Normal':
                let after = bonusFlag !== null;
                if (!this.ExtraART && this.isART && this.ARTStock >= 0) {
                    this.effectManager.Segments.EffectSeg.setSegments(`${this.ARTStock}`);
                }
                if (this.isKokutid && !this.isBonusTypeKokutid && gameMode === 'Normal') {
                    this.isBonusTypeKokutid = true;
                    sounder.playSound('bonuskokuti');
                    this.setNabi([false, false, false]);
                    await Slot.once('bet');
                    if (Slot.gameMode !== 'Normal') return;
                    sounder.playSound('yokoku');
                    switch (bonusFlag) {
                        case 'BIG1':
                            this.setNabi([true, true, false]);
                            break
                        case 'BIG2':
                            this.setNabi([false, false, true]);
                            break
                        case 'REG':
                            this.setNabi([true, false, true]);
                    }
                }
                switch (control) {
                    case ControlName.チェリー:
                        sounder.playSound('yokoku')
                        break
                    case ControlName["3択子役1"]:
                    case ControlName["3択子役2"]:
                    case ControlName["3択子役3"]:
                        if (this.isART || this.ExtraART || !Rand(64)) {
                            if (!this.isART || this.ARTStock > 0 || this.ExtraART) {
                                this.atEffect(control);
                                this.changeARTSeg();
                                this.ARTStock--;
                            }
                            Slot.freeze();
                            await sounder.playSound('nabi')
                            Slot.resume();
                        }
                        break
                    case ControlName['リプレイ']:
                        if (lot.name !== "リプレイ") break;
                    case ControlName['共通ベル']:
                    case ControlName['スイカ']:
                    case ControlName['強スイカ']:
                    case ControlName['はずれ']:
                    case ControlName['リーチ目リプレイ']:
                    case ControlName['BIG3']:
                    case ControlName['BIG4']:
                    case ControlName['BIG1']:
                    case ControlName['BIG2']:
                    case ControlName['BIG5']:
                    case ControlName['BIG6']:
                    case ControlName['REG']:
                        if (this.isKokutid) break;
                        if (this.isHatten) break;
                        let lotName: LotName | "成立後" = lot.name;
                        if (bonusFlag) lotName = 'BIG';
                        if (after) lotName = '成立後'

                        if (bonusFlag && !Rand(8)) {
                            let dummyLot = RandomChoice([
                                ControlName["3択子役1"],
                                ControlName["3択子役2"]
                            ]);
                            if (bonusFlag == 'BIG2') {
                                dummyLot = ControlName["3択子役3"];
                            }
                            this.atEffect(dummyLot);
                            Slot.freeze();
                            await sounder.playSound('nabi');
                            Slot.resume();

                            break
                        }
                        let lotTable: EffectLotData[] = [];
                        if (lotName in this.SpStopTable.LotTable) {
                            lotTable = this.SpStopTable.LotTable[lotName]!;
                        }
                        this.stop3Flag = false;
                        let spStopStack: number[] = [];
                        let spStopFlag = lotTable.some((data, i) => {
                            let r = Math.random();
                            if (r < data.value) {
                                r = Rand(100);
                                let idx = data.table.findIndex(v => {
                                    r -= v;
                                    return r < 0;
                                });
                                let arr = this.SpStopTable.EffectTable[2 - i][idx];
                                let pattern = arr[Rand(arr.length)];
                                pattern.forEach((v) => {
                                    spStopStack.push(v);
                                })
                                if (pattern[2] > 0) this.stop3Flag = true;
                                return true;
                            }
                        })
                        if ((this.stop3Flag && !Rand(4)) || (bonusFlag && this.stop3Flag && !Rand(3))) {
                            this.stop3Flag = false;
                            spStopStack = [];
                            Slot.freeze();
                            sounder.playSound('yokoku2');
                            await this.WaveSeg(4);
                            Slot.resume();
                            for (let i = 0; i < 3; i++) {
                                let e = await Slot.once('reelStop');
                                let slip = e.data.slip;
                                this.WaveSeg(slip);
                            }
                            break
                        }


                        if (this.stop3Flag && (!this.isART || bonusFlag)) {
                            // 発展フラグ
                            if (bonusFlag && Rand(4)) this.isHatten = true;
                            if (!bonusFlag && !Rand(4)) this.isHatten = true;
                            if (bonusFlag && !lot.name.includes('BIG')) this.isHatten = true;
                            if (this.isART) this.isHatten = false;

                            let skipFlag = false;
                            if (this.isHatten) {
                                if (bonusFlag && !Rand(6)) skipFlag = true;
                                if (!bonusFlag && !Rand(16)) skipFlag = true;
                            }

                            if (!skipFlag) {
                                if (spStopFlag) {
                                    if ((bonusFlag && !Rand(2)) || (!bonusFlag && !Rand(4))) {
                                        sounder.playSound('yokoku')
                                    }
                                }
                                spStopStack.forEach((v, i) => {
                                    this.spStop(i, v);
                                })
                            }
                            //発展演出

                        } else {
                            spStopStack.forEach((v, i) => {
                                this.spStop(i, v);
                            })
                        }
                        let bgmStopFlag = false;

                        if (!this.isKokutid && this.isART && bonusFlag) {
                            if (lot.name.includes('BIG')) {
                                bgmStopFlag = true;
                            } else {
                                if (!Rand(3)) bgmStopFlag = true;
                            }
                        }
                        if (bgmStopFlag) {
                            Slot.once('allReelStop', () => {
                                if (gameMode == 'Normal')
                                    sounder.stopSound('BGM');
                            })
                        }
                }
                Slot.once('bet', () => {
                    this.effectManager.Segments.EffectSeg.reset();
                    Slot.flashController.clearFlashReservation();
                })
                break;
            case 'REG':
                this.isKokutid = false;
                this.isBonusTypeKokutid = false;
                this.isHatten = false;
                this.ARTStock += !Rand(4) ? 1 : 0;
                break
            case 'BIG':
                this.isKokutid = false;
                this.isBonusTypeKokutid = false;
                this.isHatten = false;
                if (control === ControlName.ボーナス小役1) return;
                let segs = this.effectManager.Segments.EffectSeg.randomSeg().slice(0, 3);
                this.effectManager.Segments.EffectSeg.setSegment(1, '-')
                this.effectManager.Segments.EffectSeg.setSegment(3, '-')
                this.isShuffleEnd = false;
                let shuffle = () => {
                    setTimeout(() => {
                        if (this.isShuffleEnd) return;
                        segs.forEach(s => s.next());
                        shuffle();
                    }, 50)
                }
                shuffle();
                sounder.playSound('yokoku');
                let event = await Slot.once('reelStop');
                let bitaMiss = false;
                if (event.data.idx !== 1 || Slot.reelController.reels[1].reelChipPosition !== 0) {
                    this.isShuffleEnd = true;
                    this.effectManager.Segments.EffectSeg.reset();
                    bitaMiss = true
                } else {
                    sounder.playSound('bita');
                }
                console.log(bitaMiss, this)
                if (bitaMiss && !this.isHyper) return;
                await Slot.once('allReelStop');
                Slot.flashController.clearFlashReservation();
                Slot.flashController.setFlash(flashData.syoto);
                this.isShuffleEnd = true;

                let r = Rand(1000);
                let index = this.ARTBitaTable.LotValue.findIndex(v => {
                    r -= v;
                    return r < 0;
                });

                let appendGameCount = this.ARTBitaTable.GameCount[index];

                // if (bitaMiss) appendGameCount = 1;

                this.ARTStock += appendGameCount;
                sounder.playSound('uwanose')
                if (appendGameCount > 100) appendGameCount -= 100;
                let str = ("  " + appendGameCount).slice(-2);
                let blinkFlag = false;
                this.effectManager.Segments.EffectSeg.setSegment(1, '-')
                this.effectManager.Segments.EffectSeg.setSegment(3, '-')
                let blinker = (f: boolean) => {
                    setTimeout(() => {
                        if (blinkFlag) return;
                        this.effectManager.Segments.EffectSeg.reset();
                        if (f) {
                            this.effectManager.Segments.EffectSeg.setSegment(2, str[0]);
                            this.effectManager.Segments.EffectSeg.setSegment(3, str[1]);
                        } else {
                            this.effectManager.Segments.EffectSeg.setSegment(2, " ");
                            this.effectManager.Segments.EffectSeg.setSegment(3, " ");
                        }
                        blinker(!f);
                    }, 20)
                }
                blinker(true);
                await Slot.once('bet');
                Slot.flashController.clearFlashReservation();
                blinkFlag = true;
                this.effectManager.Segments.EffectSeg.reset();

        }

    }
    ARTStart() {
        sounder.stopSound('BGM')
        if (this.ARTStock > 0) {
            sounder.playSound('RT2', true);
        } else {
            sounder.playSound('RT1', true);
        }
    }
    async payEffect(payCoin: number, hitYakuDatas: HitYakuData[], gameMode: GameMode, bonusFlag: BonusFlag): Promise<void> {
        switch (gameMode) {
            case "Normal":
                if (this.isART) {
                    if (this.ExtraART) {
                        this.ExtraARTGame--;
                        if (this.ExtraARTGame === 0) {
                            if (Math.random() < this.ExtraARTLot) {
                                this.ExtraARTGame = NormalEffect.ExtraARTGameBase;
                                sounder.playSound('bita');
                            } else {
                                this.ExtraART = false;
                                this.ARTStart();
                            }
                        }
                    } else {
                        if (this.ARTStock === 0) {
                            this.ARTStock = -1;
                            sounder.stopSound('BGM');
                            if (RTData.rt instanceof HighRT || bonusFlag) {
                                sounder.playSound('RT1', true);
                            } else {
                                this.ARTEndEffect();
                            }
                        }
                        if (!(RTData.rt instanceof HighRT) && !bonusFlag) {
                            sounder.stopSound('BGM');
                            this.ARTEndEffect();
                        }
                    }
                }

                if (this.stop3Flag) {
                    if (!(!this.isART || bonusFlag)) return;
                    if (gameMode !== 'Normal') return;
                    sounder.stopSound('BGM');
                    await Sleep(333);
                    Slot.freeze();
                    Slot.flashController.setFlash(flashData.syoto);
                    sounder.playSound('roulette');
                    let stopCount = 0;

                    let shuffle = () => {
                        setTimeout(() => {
                            if (stopCount == 3) return;
                            for (let i = 2; i >= stopCount; i--) {
                                this.effectManager.Segments.EffectSeg.setSegment(i + 1, '' + Rand(10));
                            }
                            shuffle();
                        }, 10)
                    }
                    shuffle();

                    await Sleep(1820);
                    sounder.playSound('spstop');
                    stopCount++;
                    this.effectManager.Segments.EffectSeg.setSegment(1, '7');
                    await Sleep(333);
                    sounder.playSound('spstop');
                    stopCount++;
                    this.effectManager.Segments.EffectSeg.setSegment(2, '7');
                    await Sleep(333);
                    sounder.playSound('spstop');
                    stopCount++;

                    if (!this.isHatten) {
                        if (bonusFlag) {
                            this.isKokutid = true;
                            if (!Rand(8)) {
                                this.effectManager.Segments.EffectSeg.setSegment(3, '6');
                            } else {
                                this.effectManager.Segments.EffectSeg.setSegment(3, '7');
                            }
                            await Sleep(1000);
                            Slot.flashController.clearFlashReservation();
                            this.effectManager.Segments.EffectSeg.setSegment(3, '7');
                            Slot.flashController.setFlash(flashData.BlueFlash);
                            await sounder.playSound('kokuti');
                            Slot.resume();
                            Slot.flashController.clearFlashReservation();
                        } else {
                            this.effectManager.Segments.EffectSeg.setSegment(3, '6');
                            await Sleep(1000);
                            Slot.flashController.clearFlashReservation();
                            Slot.resume();
                        }
                        return;
                    } else {
                        this.effectManager.Segments.EffectSeg.setSegment(3, 'H');

                        sounder.playSound('histart')
                        await Sleep(1000);

                        this.isShuffleEnd = false;
                        let segs = this.effectManager.Segments.EffectSeg.randomSeg();
                        let shuffle = () => {
                            setTimeout(() => {
                                if (this.isShuffleEnd) return;
                                segs.forEach(s => s.next());
                                shuffle();
                            }, 50)
                        }
                        shuffle();

                        Slot.flashController.clearFlashReservation();
                        Slot.resume();
                        sounder.playSound('hiroulette', true);
                    }
                } else {
                    if (this.isHatten) {
                        this.isShuffleEnd = true;
                        if (gameMode !== 'Normal') return;
                        Slot.freeze();
                        sounder.stopSound('BGM');
                        sounder.playSound('hirouletteend');
                        this.effectManager.Segments.EffectSeg.setSegments('000');
                        for (let i = 0; i < 7; i++) {
                            sounder.playSound('spstop');
                            if (i % 2 == 1) {
                                this.effectManager.Segments.EffectSeg.setSegment(2, '' + (i + 1));
                            } else {
                                this.effectManager.Segments.EffectSeg.setSegment(1, '' + (i + 1));
                                this.effectManager.Segments.EffectSeg.setSegment(3, '' + (i + 1));
                            }
                            await Sleep(410)
                        }
                        if (bonusFlag) {
                            this.isKokutid = true;
                            this.effectManager.Segments.EffectSeg.setSegment(2, '7');
                            Slot.flashController.clearFlashReservation();
                            Slot.flashController.setFlash(flashData.BlueFlash);
                            await sounder.playSound('kokuti');
                            await Sleep(1000);
                            Slot.resume();
                            Slot.flashController.clearFlashReservation();
                        } else {
                            await Sleep(1000);
                            Slot.flashController.clearFlashReservation();
                            Slot.resume();
                        }
                        this.isHatten = false;
                    }
                }
                break
            case 'BIG':
            case 'REG':
                for (let yaku of hitYakuDatas) {
                    switch (yaku.yaku?.name) {
                        case "赤7":
                        case "青7":
                        case "BAR":
                            this.isShuffleEnd = true;
                            sounder.stopSound('BGM');
                            if (this.isART) {
                                this.isHyper = true;
                            } else {
                                this.isHyper = false;
                                this.renStartCoin = SaveData.coin;
                            }
                            this.isART = true;
                            this.ExtraART = false;
                            let bgmData;
                            if (!this.isHyper) {
                                bgmData = {
                                    tag: "BIG1"
                                };
                            } else {
                                bgmData = {
                                    tag: "SBIG"
                                }
                            }
                            this.setNabi([false, false, false]);
                            sounder.stopSound("BGM");
                            sounder.playSound(bgmData.tag, true);

                            break
                        case 'REG':
                            this.isShuffleEnd = true;
                            sounder.stopSound('BGM');
                            this.isART = true;
                    }
                }
                break

        }

    }
    async lotEffect() {

    }
    async onBonusEnd(bonusData: Bonus) {
        sounder.stopSound('BGM')
        this.isART = true;
        if (bonusData.name.includes('BIG')) {
            this.ARTStart()
        } else {
            if (!Rand(3)) {
                Slot.flashController.setFlash(flashData.RedFlash);
                await sounder.playSound("bita");
                let r = [0.50, 0.75, 0.88, 1.00][ArrayLot([25, 30, 30, 15])];
                this.ExtraART = true;
                this.ExtraARTLot = r;
                this.ExtraARTGame = NormalEffect.ExtraARTGameBase;
                sounder.playSound('RT3', true);
            } else {
                this.ExtraART = false;
                this.ARTStart();
            }
        }
    }
    LotExtraARTHitGame() {
        return ArrayLot([5, 5, 5, 10, 5, 10, 60])
    }
    async WaveSeg(level: number, wait: number = 50) {
        /**
         * Level:0 
         * 〇〇〇　〇〇〇　〇〇〇
         * 〇　〇　〇　〇　〇　〇
         * ◉◉◉　◉◉◉　◉◉◉
         * 〇　〇　〇　〇　〇　〇
         * 〇〇〇　〇〇〇　〇〇〇　
         * Level:1 
         * ◉◉◉　〇〇〇　◉◉◉
         * 〇　◉　〇　〇　◉　〇
         * 〇〇◉　〇　〇　◉　〇
         * 〇　◉　〇　〇　◉　〇
         * 〇〇◉　◉◉◉　◉〇〇
         * Level:2
         * ◉◉◉　◉〇〇　〇〇〇
         * ◉　〇　◉　〇　〇　〇
         * ◉〇〇　◉◉◉　〇〇◉
         * 〇　〇　〇　◉　〇　◉
         * 〇〇〇　〇〇◉　◉◉◉　
         * Level:3
         * ◉◉◉　〇〇〇　〇〇〇
         * ◉　◉　〇　〇　〇　〇
         * ◉〇◉　◉◉◉　◉〇◉
         * 〇　〇　〇　〇　◉　◉
         * 〇〇〇　〇〇〇　◉◉◉　
         * Level:4
         * ◉◉◉　〇〇〇　◉◉◉
         * ◉　◉　〇　〇　◉　◉
         * ◉〇◉　〇　〇　◉〇◉
         * ◉　◉　〇　〇　◉　◉
         * ◉〇◉　◉◉◉　◉〇◉　
         */
        let PulseTable = [
            ['g', 'g', 'g'],
            ['abc', 'd', 'ef'],
            ['fa', 'fgc', 'dc'],
            ['fab', 'g', 'edc'],
            ['efabc', 'd', 'efabc']
        ]
        for (let [idx, st] of PulseTable[level].entries()) {
            if (!st) return;
            for (let s of st) {
                await this.effectManager.Segments.EffectSeg.segments[idx].draw({ [s]: 1 })
                await Sleep(wait);
                await this.effectManager.Segments.EffectSeg.reset();
            }
        }
    }
}