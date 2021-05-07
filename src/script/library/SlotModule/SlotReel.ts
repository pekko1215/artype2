export enum ReelStatus {
  Stop,
  Move,
  Sliping,
}

export class SlotReel {
  chips: number[];
  reelPosition: number;
  reelChipPosition: number;
  status: ReelStatus;
  speed: number;
  chipHeight: number;
  reelHeight: number;
  length: number;
  slipLength: number;
  reelGap: number = 0;
  constructor(arr: number[], chipHeight: number) {
    this.chips = arr;
    this.reelPosition = 0;
    this.reelChipPosition = 0;
    this.status = ReelStatus.Stop;
    this.speed = 0;
    this.chipHeight = chipHeight;
    this.reelHeight = chipHeight * this.chips.length;
    this.length = this.chips.length;
    this.slipLength = 0;
  }
  movePosition(d: number) {
    this.reelPosition -= d;
    if (this.reelPosition < 0) this.reelPosition += this.reelHeight;
    if (this.reelPosition >= this.reelHeight)
      this.reelPosition -= this.reelHeight;

    this.reelChipPosition = Math.floor(this.reelPosition / this.chipHeight);
    this.reelGap = this.reelPosition - this.reelChipPosition * this.chipHeight;
  }
  move(percent: number) {
    let moveSpeed = Math.floor(this.speed * percent * 0.99999999);
    if (this.status === ReelStatus.Stop) return;
    if (this.status === ReelStatus.Sliping) {
      if (this.slipLength < moveSpeed) {
        this.movePosition(this.slipLength);
        this.status = ReelStatus.Stop;
        this.slipLength = 0;
        return;
      } else {
        this.slipLength -= moveSpeed;
      }
    }
    this.movePosition(moveSpeed);
  }
  getCurrentChips(): number[] {
    let chips = [];
    for (let i = 0; i < 3; i++) {
      let idx = this.reelChipPosition + i;
      if (idx >= this.chips.length) idx -= this.chips.length;
      chips.push(this.chips[idx]);
    }
    return chips;
  }
}
