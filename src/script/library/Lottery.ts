export interface LotBase {
    value?: number,
    name: any
}

export class Lotter {
    lots: LotBase[] = [];
    constructor(...list: LotBase[]) {
        this.add(...list)
    }
    add(...list: LotBase[]) {
        this.lots.push(...list);
    }
    lot() {
        let ret = null;
        let p = Math.random();
        let lotSum = this.lots.reduce((num, v) => {
            return num + v.value;
        }, 0);
        if (lotSum > 1) {
            p *= lotSum;
        }
        return this.lots.find(v => {
            p -= v.value;
            return p < 0;
        }) || null
    }
}