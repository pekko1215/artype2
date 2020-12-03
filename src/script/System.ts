import { SaveData } from ".";
import { BigBonus5 } from "./datas/Bonus";
import { ControlName } from "./datas/Control";
import { colorData, flashData } from "./datas/Flash";
import { LotData, SlotLotBase } from "./datas/Lot";
import { panelData } from "./datas/Panel";
import { DefaultRT, HighRT, RT, RTData } from "./datas/RT";
import { sounder } from "./datas/Sound";
import { yakuData } from "./datas/Yaku";
import { EffectManager } from "./Effect";
import { Lotter } from "./library/Lottery";
import { Flash, Matrix, PanelData, ReelControl, SlotEvent, SlotModule } from "./library/SlotModule";
import { ControlMode, HitYakuData } from "./library/SlotModule/ReelController";
import { SystemStatus } from "./library/SlotModule/Status";
import { Rand, RandomChoice, Sleep } from "./Utilities";

export type GameMode = 'Normal' | 'BIG' | 'REG';
export type BonusFlag = 'BIG1' | 'BIG2' | 'REG' | null;

export class SlotClass extends SlotModule {
  isLoaded = false;
  gameMode: GameMode = 'Normal'
  bonusFlag: BonusFlag = null;
  effectManager: EffectManager = new EffectManager();
  options: {
    isDummyBet: boolean,
    leverEffect: null | '無音'
  } = {
      isDummyBet: false,
      leverEffect: null
    }
  lastBonus: BonusFlag | null = null;
  lotter = new Lotter(...LotData[this.gameMode]);
  static async init() {
    const control = await ReelControl.FromFetchRequest('RCD/control.smr');
    let slot = new SlotClass(panelData, control, flashData.default);
    slot.isLoaded = true;
    slot.emit('loadedControll');
    return slot;
  }
  constructor(panelData: PanelData, control: ReelControl, flash: Flash) {
    super(panelData, control, flash);
    this.slotStatus.RTData = RTData;
    this.eventRegister();
  }
  eventRegister() {

  }
  async onPay({ payCoin, replayFlag, dummyReplayFlag, noSE }: { payCoin: number, replayFlag: boolean, noSE: boolean, dummyReplayFlag: boolean }): Promise<{ isReplay: boolean; }> {        // 払い出しの処理
    // 払い出しがあるかないか、そしてリプレイかどうかで処理を分けている
    let pays = payCoin;
    let loopPaySound = null;
    let payCount = 0;
    let seLoopFlag = false;

    if (dummyReplayFlag) {
      this.options.isDummyBet = true;
      (async () => {
        this.freeze();
        await Promise.race([
          this.once('pressBet'),
          this.once('pressAllmity')
        ])
        await this.onBetCoin(3);
        this.resume();
      })();
      return { isReplay: true }
    }

    if (pays === 0 && !replayFlag) return { isReplay: replayFlag };

    let payTag: string = "pay";

    if (pays <= 4 && pays) payTag = "cherry";
    if (pays >= 14) payTag = "bigpay"
    if (!replayFlag && !noSE && payTag) {
      sounder.playSound(payTag, payTag !== "cherry");
    }

    if (replayFlag) {
      sounder.playSound('replay');
      sounder.playSound('bet')
      await Sleep(500)
    }

    const Segments = this.effectManager.Segments;
    let bonus: BigBonus5 = this.slotStatus.bonusData;
    let startBonusCount = 0;
    if (bonus) {
      startBonusCount = bonus.getBonusPayCount();
    }
    while (pays--) {
      SaveData.coin++;
      payCount++;
      SaveData.outCoin++;
      SaveData.coinLog[SaveData.coinLog.length - 1]++;
      this.effectManager.changeCredit(1);
      Segments.PaySeg.setSegments(payCount);
      if (this.gameMode === 'BIG' || this.gameMode === 'REG') {
        let num = SaveData.getGetCoin();
        if (num < 0) num = 0;
        startBonusCount--;
        if (startBonusCount < 0) startBonusCount = 0;
        Segments.EffectSeg.setSegments(startBonusCount);
      }
      await Sleep(50);
    }
    sounder.stopSound(payTag)
    return { isReplay: replayFlag };
  }
  async onPayEnd({ payCoin, hitYakus }: { payCoin: number, hitYakus: HitYakuData[] }) {
    /**************************
     * ボーナス終了後の処理
     * 払い出し後の演出や、ボーナス終了の処理を記述する。
     * 
     */
    if (this.slotStatus.bonusData) {
      this.slotStatus.bonusData.onPay(payCoin)
      this.setGamemode(this.slotStatus.bonusData.getGameMode());
      if (this.slotStatus.bonusData.isEnd) {
        this.emit('bonusEnd');
      };
    }
    await this.effectManager.onPay(payCoin, hitYakus, this.gameMode, this.bonusFlag);
  }
  async onReelStop(_number: number) {
    sounder.playSound("stop")
  }
  @SlotEvent("bonusEnd")
  async onBonusEnd() {
    /**************************
     * ボーナス終了後の処理
     * 【注意】
     * このイベントは、手動で発火が必要です。
     * slotModule.emit('bonusEnd')
     * と呼び出してください。
     */

    // SaveData.bonusEnd();
    this.setGamemode("Normal");
    this.freeze();
    await Sleep(2000);
    this.resume();
    let currentBonus = this.slotStatus.bonusData;
    this.slotStatus.bonusData = null;
    this.bonusFlag = null;
    RTData.rt = new HighRT;
    SaveData.bonusEnd();

    this.effectManager.onBonusEnd(currentBonus);

  };
  @SlotEvent('leverOn')
  async onLeverOn() {
    SaveData.nextGame(this.slotStatus.betCoin);
    this.effectManager.changeCredit(0)
    if (this.options.leverEffect !== '無音') sounder.playSound("start")
    this.options.leverEffect = null;
  }
  async onHitCheck(hitYakuDatas: HitYakuData[]) {
    /***********************
     * 3リール停止後、SlotModuleから送られてくる成立役を元に、
     * 払い出し枚数、フラッシュ、アクションなどを決定する。
     */
    let noFlash = false;
    let replayFlag = false;
    let payCoin = 0;
    let flashMatrix = Matrix.from<boolean>([
      [false, false, false],
      [false, false, false],
      [false, false, false]
    ]);
    let hitYakus = [];
    let dummyReplayFlag = false
    for (let data of hitYakuDatas) {
      let { index, matrix } = data;
      let yaku = yakuData[index];
      data.yaku = yaku;
      hitYakus.push(yaku);

      let { name, pay } = yaku;
      let p = pay[3 - this.slotStatus.betCoin];

      if (Array.isArray(p)) {
        p = p[this.reelController!.mode];
      }
      if (p === 0) noFlash = true;
      payCoin += p;
      let lineMatrix = yaku.flashLine || matrix;

      // 成立役フラッシュの合成
      lineMatrix.forEach((v, x, y) => {
        flashMatrix.set(y, x, v);
      });
      switch (name) {
        case 'チェリー':
          flashMatrix = flashMatrix.map((v, x, y) => {
            return x === 0 && v;
          })
          break
        case 'リーチ目リプレイ':
          dummyReplayFlag = true;
          replayFlag = true
          noFlash = true;
          break
        case 'リプレイ':
          replayFlag = true
          break
        case '赤7':
        case '青7':
        case 'BAR':
          this.slotStatus.bonusData = new BigBonus5("BIG", 195);
          this.setGamemode("BIG");
          this.bonusFlag = null;
          SaveData.bonusStart('BIG');
          break
        case 'REG':
          this.slotStatus.bonusData = new BigBonus5("REG", 84);
          this.setGamemode('REG');
          this.bonusFlag = null;
          SaveData.bonusStart('REG');
          break
      }


    };
    (this.slotStatus.RTData.rt as RT).hitCheck(hitYakus)
    switch (name) {
      default:
        // 成立役フラッシュ
        (async () => {
          if (noFlash) return;
          while (this.slotStatus.systemStatus !== SystemStatus.Beted) {
            await this.flashController.setFlash(this.flashController.defaultFlash, 20);
            let flash = flashData.default.copy();
            flash.front.replaceByMatrix(flashMatrix, colorData.LINE_F);
            await this.flashController.setFlash(flash, 20)
          }
        })();
    }
    this.effectManager.onPay(payCoin, hitYakuDatas, this.gameMode, this.bonusFlag);
    return { payCoin, replayFlag, hitYakus: hitYakuDatas, dummyReplayFlag };
  }
  async onBet() {
    // ベットボタンを押したときの処理
    // フラッシュをリセットする
    this.flashController.clearFlashReservation();
  }
  async onBetCoin(betCoin: number) {
    // ベットを行うときの処理
    // ベット枚数分音を鳴らしている

    sounder.playSound("bet")
    while (betCoin--) {
      if (!this.options.isDummyBet) {
        SaveData.coin--;
        SaveData.inCoin++;
        this.effectManager.changeCredit(-1);
      }
      await Sleep(70);
    }
    this.options.isDummyBet = false;
    this.effectManager.Segments.PaySeg.reset();
  }
  onLot(): number {
    /**
    * 抽選処理
    * retに制御名を返す
    * Lotterクラスを使うと便利
    * lotdata.jsに各フラグの成立確率を記述しよう
    * フラグから制御への振り分けもココで行う。
    * サンプルだとスイカ1とスイカ2の振り分け
    * window.powerはデバッグの強制フラグ用
    */

    let ret: ControlName | null = null;
    let lot: SlotLotBase = this.lotter.lot() || { name: "はずれ" };

    lot = (this.slotStatus.RTData.rt as RT).onLot(lot) || lot
    this.effectManager.pushOrder = null;
    switch (this.gameMode) {
      case "Normal":
        switch (lot.name) {
          case "リプレイ":
            ret = ControlName.リプレイ
            break;
          case "ベル":
            ret = RandomChoice([
              ControlName["3択子役1"],
              ControlName["3択子役2"],
              ControlName["3択子役3"]
            ])

            if (this.bonusFlag) {
              if (!Rand(3)) {
                ret = ControlName.共通ベル
              } else {
                ret = ControlName[this.bonusFlag]
              }
            }
            break
          case "共通ベル":
          case "スイカ":
          case "強スイカ":
          case "チェリー":
            ret = ControlName[lot.name];
            break;
          case "BIG":
            if (this.bonusFlag === null) {
              ret = RandomChoice([
                ControlName.BIG1,
                ControlName.BIG2,
                ControlName.BIG3,
                ControlName.BIG4,
                ControlName.BIG5,
                ControlName.BIG6
              ])
              this.bonusFlag = [ControlName.BIG1, ControlName.BIG3, ControlName.BIG5].includes(ret) ? "BIG1" : "BIG2";
              if (!Rand(12)) ret = ControlName.リーチ目リプレイ
              if (!Rand(32)) ret = ControlName.スイカ
              if (!Rand(12)) ret = ControlName.強スイカ
              if (!Rand(24)) ret = ControlName.共通ベル
              if (!Rand(24)) ret = ControlName.チェリー
            } else {
              ret = ControlName[this.bonusFlag];
            }
            break;
          case 'REG':
            if (this.bonusFlag === null) {
              this.bonusFlag = "REG"
              ret = ControlName.REG;
              if (Rand(20)) {
                if (!Rand(12)) ret = ControlName.リーチ目リプレイ;
                if (!Rand(24)) ret = ControlName.共通ベル;
                if (!Rand(24)) ret = ControlName.チェリー;
              }
            } else {
              ret = ControlName[this.bonusFlag];
            }
            break
          default:
            ret = ControlName.はずれ
            if (RTData.rt instanceof HighRT) ret = ControlName.リプレイ;
            if (this.bonusFlag != null) {
              ret = RandomChoice([
                ControlName[this.bonusFlag],
                ControlName[this.bonusFlag],
                ControlName.リーチ目リプレイ
              ])
            };
        }
        break;
      case "BIG":
        ret = ControlName.ボーナス小役1
        if (!Rand(4)) {
          ret = ControlName.ボーナス小役2
        }
        break;
      case "REG":
        ret = ControlName.REG小役
        break;
    }

    if (ret === null) throw new Error(`リール制御コードが不正です ${lot.name}=>${ret}`);

    this.effectManager.onLot(lot, ret, this.gameMode, this.bonusFlag);

    console.log(lot?.name, ControlName[ret], this);
    return ret;
  }
  setGamemode(mode: GameMode) {
    console.log(`${this.gameMode} -> ${mode}`);
    switch (mode) {
      case 'Normal':
        this.gameMode = mode;
        this.reelController.mode = ControlMode.NORMAL
        this.slotStatus.maxBet = 3;
        break
      case 'BIG':
        this.gameMode = mode;
        this.reelController.mode = ControlMode.BIG
        this.slotStatus.maxBet = 2;
        this.bonusFlag = null;
        RTData.rt = new DefaultRT;
        break
      case "REG":
        this.gameMode = mode;
        this.reelController.mode = ControlMode.JAC
        this.slotStatus.maxBet = 1;
        this.bonusFlag = null;
        RTData.rt = new DefaultRT;

    }
  }
};