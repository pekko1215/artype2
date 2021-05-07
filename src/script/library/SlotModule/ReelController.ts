import { Matrix } from "./Matrix";
import { SlotModule } from "./SlotModule";
import { ReelControl } from "./ReelControl";
import { ReelStatus, SlotReel } from "./SlotReel";
import { SlotStatus, SystemStatus } from "./Status";

export enum ControlMode {
  NORMAL,
  BIG,
  JAC,
}

export interface YakuData {
  noEffectable?: boolean;
  name: string;
  pay: number[];
  flashLine?: Matrix<boolean>;
}

export interface HitYakuData {
  line: number;
  matrix: Matrix<boolean>;
  index: number;
  yaku?: YakuData;
}

export class SlotReelController {
  slotModule: SlotModule;
  reelControl: ReelControl;
  slotStatus: SlotStatus;
  reels: SlotReel[];
  mode: ControlMode = ControlMode.NORMAL;
  constructor(slotModule: SlotModule) {
    this.slotModule = slotModule;
    this.reelControl = this.slotModule.reelControl;
    this.slotStatus = slotModule.slotStatus;
    this.reels = this.reelControl.controlData.reelArray.map((arr: number[]) => {
      return new SlotReel(arr, slotModule.viewController!.reelChipData!.height);
    });
  }
  getHitYakus(): HitYakuData[] {
    let hitYaku: HitYakuData[] = [];
    let { controlData } = this.reelControl;
    let { betLine, yakuList } = controlData;
    betLine.forEach((line, idx) => {
      const matrix = new Matrix<boolean>(3, 3);

      const ReelMatrix = this.getReelMatrix();
      if (betLine[idx][3] > this.slotStatus.betCoin) {
        return;
      }

      const LineChars = [0, 0, 0].map((e, i) => {
        matrix.set(line[i], i, true);
        return ReelMatrix.get(line[i], i);
      });
      yakuList.forEach((d, j) => {
        let p = [];
        let flag = true;
        p.push(d & 0xf);
        flag = flag && ((d & 0xf) === LineChars[0] || (d & 0xf) === 0xf);
        d = d >> 4;
        p.push(d & 0xf);
        flag = flag && ((d & 0xf) === LineChars[1] || (d & 0xf) === 0xf);
        d = d >> 4;
        p.push(d & 0xf);
        flag = flag && ((d & 0xf) === LineChars[2] || (d & 0xf) === 0xf);
        d = d >> 4;
        p.push(d & 0xf);
        let mode = d & 0xf;
        if ((mode & (1 << this.mode)) == 0) return;
        if (!flag) return;

        hitYaku.push(
          new (class implements HitYakuData {
            line = idx;
            matrix = matrix;
            index = j;
          })()
        );
      });
    });
    return hitYaku;
  }
  getReelMatrix(): Matrix<number> {
    let arr = this.reels.map((reel) => reel.getCurrentChips());
    let matrix = new Matrix<number>(3, 3);
    arr.forEach((reel, i) => {
      reel.forEach((chip, j) => {
        matrix.set(j, i, chip);
      });
    });
    return matrix;
  }
  next(percent: number) {
    this.reels.forEach((reel) => {
      reel.move(percent);
    });
  }
  getMoveingCount(): number {
    return this.reels.filter(
      (reel) =>
        reel.status === ReelStatus.Move || reel.status === ReelStatus.Sliping
    ).length;
  }
  stopReel(idx: number): boolean {
    let reel = this.reels[idx];
    let { slotModule } = this;
    let { slotStatus } = slotModule;
    if (slotModule.freezeFlag) return false;
    if (reel.status != ReelStatus.Move) return false;
    if (this.reels.some((reel) => [ReelStatus.Sliping].includes(reel.status)))
      return false;
    // if (reel.reelChipPosition != 0) return
    let { reelChipPosition } = reel;
    let slip = reelChipPosition - this.getReelSlip(idx, reelChipPosition);
    if (slip < 0) slip = this.reels[idx].length + slip;
    this.reelSlipStart(idx, slip);
    this.slotModule.slotStatus.systemStatus = SystemStatus.SlipStart;
    this.slotModule.emit("reelStop", {
      data: {
        count: this.getMoveingCount(),
        idx,
        slip,
      },
    });
    slotStatus.stopOrder.push(idx);
    reel.status = ReelStatus.Sliping;
    return true;
  }
  getReelSlip(reel: number, pos: number) {
    switch (this.getMoveingCount()) {
      case 3:
        return this.reelControl.getStopPos1st(
          this.slotModule.slotStatus.controlCode,
          reel,
          pos
        );
        break;
      case 2:
        return this.reelControl.getStopPos2nd(reel, pos);
        break;
      case 1:
        return this.reelControl.getStopPos3rd(reel, pos);
        break;
    }
    throw new Error("ReelMoveCountException");
  }
  reelSlipStart(reelIndex: number, slips: number) {
    if (this.slotModule.viewController === null) return;
    let reel = this.reels[reelIndex];
    reel.slipLength =
      this.slotModule.viewController.reelChipData!.height * slips +
      reel.reelGap;
    if (reel.slipLength < 0) {
      reel.slipLength +=
        this.slotModule.viewController.reelChipData!.height * slips;
    }
  }
  reelMove(reel: number, speed: number) {
    this.reels[reel].speed = speed;
  }
  startReel() {
    this.reels.forEach((reel) => {
      reel.status = ReelStatus.Move;
      reel.speed = this.slotModule.panelData.reel.speed;
    });
  }
  isReelSliping(): boolean {
    return !!this.reels.find((reel) => reel.status === ReelStatus.Sliping);
  }
}
