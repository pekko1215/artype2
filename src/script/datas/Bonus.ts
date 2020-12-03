import { GameMode } from "..";

export abstract class Bonus {
    abstract getGameMode(): GameMode
    isEnd!: boolean;
    name!: GameMode;
    gameCount!: number;
    payCount!: number;

    abstract onPay(payCoin: number): void;
    abstract getBonusSeg(): string;
}

export class BigBonus5 implements Bonus {
    maxPay: number;
    payd: number;
    jacName!: GameMode;
    isJacin!: boolean;
    isEnd: boolean;
    name: GameMode;
    gameCount!: number;
    payCount!: number;
    constructor(name: GameMode, pay: number) {
        this.maxPay = pay;
        this.name = name;
        this.payd = 0;
        this.isEnd = false;
    }
    jacIn(name: GameMode, gameCount: number, payCount: number) {
        this.jacName = name;
        this.gameCount = gameCount + 1;
        this.payCount = payCount;
        this.isJacin = true;
    }
    getGameMode(): GameMode {
        if (this.isEnd) return "Normal"
        if (this.isJacin) return this.jacName;
        return this.name;
    }
    onPay(payCoin: number) {
        this.payd += payCoin;
        if (this.payd >= this.maxPay) {
            this.isEnd = true;
            return true;
        }
        if (this.isJacin) {
            this.gameCount--;
            if (payCoin >= 1) this.payCount--;
            if (this.gameCount <= 0 || this.payCount <= 0) {
                this.isJacin = false;
                return false;
            }
        }
        if (!this.isJacin) return false;
    }
    getBonusSeg() {
        var tmp = this.maxPay - this.payd
        return "" + (tmp < 0 ? 0 : tmp);
    }
    getBonusPayCount() {
        let c = this.maxPay - this.payd;
        return c < 0 ? 0 : c;
    }
}

export class RegularBonus5 implements Bonus {
    name: GameMode;
    isEnd: boolean;
    gameCount: number;
    payCount: number;
    constructor(name: GameMode, gameCount: number, payCount: number) {
        this.name = name;
        this.gameCount = gameCount + 1;
        this.payCount = payCount + 1;
        this.isEnd = false;
    }
    getGameMode() {
        if (this.isEnd) return 'Normal'
        return this.name;
    }
    onPay(payCoin: number) {
        this.gameCount--;
        if (payCoin >= 1) this.payCount--;
        if (this.gameCount <= 0 || this.payCount <= 0) {
            this.isEnd = true;
            return false;
        }
    }
    getBonusSeg() {
        return `${this.gameCount}`;
    }
}

class BigBonus4 implements Bonus {
    bonusGameCount: number;
    jacInCount: number;
    name: GameMode;
    payd: number;
    isEnd: boolean;
    isFirstPay: boolean;
    jacName!: GameMode;
    gameCount!: number;
    payCount!: number;
    isJacin!: boolean;
    constructor(name: GameMode, bonusGameCount: number, jacInCount: number) {
        this.bonusGameCount = bonusGameCount;
        this.jacInCount = jacInCount;
        this.name = name;
        this.payd = 0;
        this.isEnd = false;
        this.isFirstPay = true;
    }
    jacIn(name: GameMode, gameCount: number, payCount: number) {
        this.jacName = name;
        this.gameCount = gameCount + 1;
        this.payCount = payCount;
        this.isJacin = true;
        this.bonusGameCount--;
        this.isFirstPay = true
    }
    getGameMode() {
        if (this.isEnd) return 'Normal'
        if (this.isJacin) return this.jacName;
        return this.name;
    }
    onPay(payCoin: number) {
        if (this.isFirstPay) return this.isFirstPay = false;
        this.payd += payCoin;
        if (!this.isJacin) {
            this.bonusGameCount--;
            if (this.bonusGameCount === 0) {
                this.isEnd = true;
                return false;
            }
        } else {
            this.gameCount--;
            if (payCoin >= 1) this.payCount--;
            if (this.gameCount <= 0 || this.payCount <= 0) {
                this.isJacin = false;
                this.jacInCount--;
                if (this.jacInCount === 0 || this.bonusGameCount === 0) {
                    this.isEnd = true;
                }
                return false;
            }
            return false;
        }
    }
    getBonusSeg() {
        if (!this.isJacin) {
            return ("   " + (this.bonusGameCount)).slice(-3);
        } else {
            return `${this.jacInCount}-${Math.min(this.gameCount, this.payCount)}`
        }
    }
}
export class RegularBonus4 implements Bonus {
    name: GameMode;
    gameCount: number;
    payCount: number;
    isEnd: boolean;
    constructor(name: GameMode, gameCount: number, payCount: number) {
        this.name = name;
        this.gameCount = gameCount;
        this.payCount = payCount;
        this.isEnd = false;
    }
    getGameMode() {
        if (this.isEnd) return 'Normal'
        return this.name;
    }
    onPay(payCoin: number) {
        this.gameCount--;
        if (payCoin >= 1) this.payCount--;
        if (this.gameCount < 0 || this.payCount < 0) {
            this.isEnd = true;
            return false;
        }
    }
    getBonusSeg() {
        return `${1}-${Math.min(this.gameCount, this.payCount) + 1}`
    }
}