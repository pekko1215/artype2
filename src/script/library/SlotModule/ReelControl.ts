

export interface ControlData {
    reelLength: number;
    yakuCount: number;
    maxLine: number;
    reelArray: number[][];
    yakuList: number[];
    betLine: number[][];
    slideTableSize: number;
    slideTable: number[];
    tableNum1: number[];
    tableNum2: number[];
    tableNum3: number[];
    typeCount: number;
    controlCount: number;
    tableSize: number;

}

export class ReelControl {
    rcc: number = -1;
    stopCount: number = 0;
    stopPos: number[] = [];
    reelStopPos: number[] = [];
    controlData: ControlData
    stopPattern: number = -1;

    constructor(controlData: ControlData) {
        this.controlData = controlData;
    }
    static async FromFetchRequest(path: string): Promise<ReelControl> {
        let arrayBuffer = await (await fetch(path)).arrayBuffer();

        const uUint8array = new Uint8Array(arrayBuffer)
        const data_view = new DataView(uUint8array.buffer);

        let _index = 0;

        const lpeek = () => {
            return read(4);
        }
        const wpeek = () => {
            return read(2);
        }
        const peek = () => {
            return read(1);
        }
        const read = (byte: number, opt = true) => {//引数バイト読み込む
            let methodname = `get${opt ? "Ui" : "I"}nt${byte * 8}`;
            let ret = (data_view as unknown as { [key: string]: (index: number, endian: boolean) => number })[methodname](_index, true);
            _index += byte
            return ret;
        }

        lpeek()
        const controlCount = lpeek();
        peek()
        const reelLength = peek();
        const yakuCount = peek();
        const maxLine = peek();

        const tableSize = reelLength * 3
        const reelArray: number[][] = []
        for (let i = 0; i < 3; i++) {
            let arr = [];
            for (let j = 0; j < reelLength; j++) {
                arr.push(peek())
            }
            reelArray.push(arr);
        }

        const yakuList = []

        for (let i = 0; i < yakuCount; i++) {
            let v = wpeek()
            for (let j = 0; j < 3; j++) {
                if ((v >> j * 4 & 0x0F) == 0x0F) {
                    v += (0xF0000 << j * 4)
                }
            }
            yakuList.push(v);
        }

        const betLine: number[][] = []

        for (let i = 0; i < maxLine; i++) {
            let arr = [];
            for (let j = 0; j < 4; j++) {
                arr.push(peek())
            }
            betLine.push(arr)
        }

        const slideTableSize = wpeek();
        const slideTable: number[] = Array(slideTableSize * reelLength).fill(0).map(() => {
            return peek();
        });

        const tableNum1: number[] = Array(controlCount * 3 * 2).fill(0).map(() => {
            return peek();
        })

        const tableNum2: number[] = Array(controlCount * 6 * reelLength * 2).fill(0).map(() => {
            return peek()
        })

        const tableNum3: number[] = Array(controlCount * 6 * reelLength * reelLength * 2).fill(0).map(() => {
            return peek()
        })

        const typeCount = Math.max(...reelArray.flat()) + 1;

        return new ReelControl({
            reelLength,
            yakuCount,
            maxLine,
            reelArray,
            yakuList,
            betLine,
            slideTableSize,
            slideTable,
            tableNum1,
            tableNum2,
            tableNum3,
            typeCount,
            controlCount,
            tableSize
        })
    }
    readData(b: number[], idx: number, isShort: boolean) {
        if (isShort) {
            return ((b[idx * 2] & 0xFF) << 8) | (b[idx * 2 + 1] & 0xFF);
        }
        return b[idx] & 0xFF;
    }

    getStopPos1st(controlNum: number, reel: number, pos: number) {
        this.setReelControlCode(controlNum);
        return this.reelStop(reel, pos);
    }
    getStopPos2nd(reel: number, pos: number) {
        return this.reelStop(reel, pos);
    }
    getStopPos3rd(reel: number, pos: number) {
        return this.reelStop(reel, pos);
    }

    getTableNum(prm1: number) {
        let ret = 0;
        let idx = 0;
        switch (this.stopCount) {
            case 0:
                ret = wpeek(this.controlData.tableNum1, (this.rcc * 3 + prm1) * 2)
                this.stopPattern = prm1 * 3
                break
            case 1:
                this.stopPattern += prm1 - 1
                if (this.stopPattern > 3) {
                    this.stopPattern--
                }
                idx = this.rcc * 6 * this.controlData.reelLength
                idx += this.stopPattern * this.controlData.reelLength
                idx += this.stopPos[0]
                ret = wpeek(this.controlData.tableNum2, idx * 2)
                break
            case 2:
                idx = this.rcc * 6 * this.controlData.reelLength * this.controlData.reelLength
                idx += this.stopPattern * this.controlData.reelLength * this.controlData.reelLength
                idx += this.stopPos[0] * this.controlData.reelLength
                idx += this.stopPos[1]
                ret = wpeek(this.controlData.tableNum3, (idx) * 2)
                break
        }
        return ret
    }
    setReelControlCode(prm1: number) {
        this.rcc = prm1
        if (this.rcc < 0) {
            throw "リール制御コードがおかしいぞ"
        }
    }
    reelStop(reel: number, pos: number) {
        let slide: number;
        let num = this.getTableNum(reel)
        slide = peek(this.controlData.slideTable, this.controlData.reelLength * num + pos)
        this.stopPos[this.stopCount] = (pos - slide + this.controlData.reelLength) % this.controlData.reelLength
        this.reelStopPos[reel] = this.stopPos[this.stopCount]
        let ret = this.stopPos[this.stopCount];
        this.stopCount = this.stopCount + 1 == 3 ? 0 : this.stopCount + 1;
        return ret
    }

}

function wpeek(arr: number[], idx: number) {
    let ret = 0;
    for (let i = 0; i < 2; i++) {
        // ret = (ret << 8) + arr[idx + i]
        ret += arr[idx + i] << (i * 8)
        // console.log(arr)
    }
    return ret;
}

function peek(arr: number[], idx: number) {
    return arr[idx];
}