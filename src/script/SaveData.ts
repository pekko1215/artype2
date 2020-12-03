import { RefreshSlotInfo, SlotLog } from "./UI";

export interface BonusLog {
    name: string;
    hitPlayCount: number;
    hitAllPlayCount: number;
    startCoin: number;
    playCount: number;
    coin: number;
}

export class SaveDataClass {
    #coin = 0;
    #playCount = 0;
    #allPlayCount = 0;
    bonusLog: BonusLog[] = [];
    currentBonus: BonusLog | null = null;
    #inCoin = 0;
    #outCoin = 0;
    coinLog: number[] = [];
    infomations: object = {};

    constructor(init?: Partial<SaveDataClass>) {
        Object.assign(this, init);
    }

    get coin() {
        return this.outCoin - this.inCoin;
    }
    set coin(value: number) {
        this.#coin = value;
        RefreshSlotInfo();
    }

    get playCount() {
        return this.#playCount;
    }
    set playCount(value: number) {
        this.#playCount = value;
        RefreshSlotInfo();
    }

    get allPlayCount() {
        return this.#allPlayCount;
    }
    set allPlayCount(value: number) {
        this.#allPlayCount = value;
        RefreshSlotInfo();
    }

    get inCoin() {
        return this.#inCoin;
    }
    set inCoin(value: number) {
        this.#inCoin = value;
        RefreshSlotInfo();
    }

    get outCoin() {
        return this.#outCoin;
    }
    set outCoin(value: number) {
        this.#outCoin = value;
        RefreshSlotInfo();
    }

    bonusStart(name: string) {
        if (this.currentBonus !== null) this.bonusEnd();

        this.currentBonus = {
            name,
            hitPlayCount: this.playCount,
            hitAllPlayCount: this.allPlayCount,
            startCoin: this.coin,
            playCount: 0,
            coin: 0
        }

        SlotLog(`${name} 開始 ${this.playCount}G(総ゲーム数 ${this.allPlayCount}G)`)
        let e = document.querySelector('#dataCounter')!;
        let tower = document.createElement('div');
        tower.classList.add("tower");
        for (let i = 0; i < this.playCount / 100; i++) {
            let f = document.createElement('div');
            f.classList.add('floor');
            if (name == 'BIG') {
                f.classList.add('red');
            } else {
                f.classList.add('green');
            }
            tower.appendChild(f);
        }

        tower.innerHTML = `
        <div class="type">${name}</div>
        <div class="count">${this.playCount}<div>
        `
        e.appendChild(tower);
    }
    bonusEnd() {
        if (!this.currentBonus) return;
        let geted = this.currentBonus.coin = this.getGetCoin();
        this.bonusLog.push(this.currentBonus);

        SlotLog(`獲得枚数 ${this.currentBonus.coin}枚 ${this.currentBonus.playCount}G`);

        this.playCount = 0;

        this.currentBonus = null;
        return geted;
    }

    getGetCoin() {
        if (this.currentBonus === null) return 0;
        return this.coin - this.currentBonus.startCoin;
    }

    nextGame(betCoin: number) {
        // this.refreshGraph();
        if (this.currentBonus) {
            this.currentBonus.playCount++;
        } else {
            this.playCount++;
        }
        this.allPlayCount++;
        this.coinLog.push(-betCoin);
    }
    load() {
        let d = new SaveDataClass(JSON.parse(localStorage.getItem("savedata") || "{}"));
        Object.assign(this, d);
        return
    }
    save() {
        localStorage.setItem('savedata', JSON.stringify(this));
    }
    clear() {
        this.coin = 0;
        this.playCount = 0;
        this.allPlayCount = 0;
        this.bonusLog = [];
        this.currentBonus = null;
        this.inCoin = 0;
        this.outCoin = 0;
        this.coinLog = [];
        this.infomations = { saisyuLog: [] };
    }
    get percentage() {
        return this.outCoin / this.inCoin * 100;
    }
}