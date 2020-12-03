export class Matrix<T> {
    width: number;
    height: number;
    raw: Array<Array<T | null>>;
    constructor(width = 3, height = 3) {
        this.width = width;
        this.height = height;
        this.raw = [
            ...Array(height).fill(null).map(() => [
                ...Array(width).fill(null)
            ])
        ];
    }
    copy(): Matrix<T> {
        let n = new Matrix<T>(this.width, this.height);
        for (let y of this.raw.keys()) {
            for (let x of this.raw[y].keys()) {
                n.set(x, y, this.get(x, y));
            }
        }
        return n;
    }

    forEach(fn: (v: T | null, x: number, y: number) => void): void {
        for (let [y, arr] of this.raw.entries()) {
            for (let [x, v] of arr.entries()) {
                fn(v, x, y);
            }
        }
    }

    set(x: number, y: number, v: T | null): void {
        this.raw[y][x] = v;
    }

    get(x: number, y: number): T | null {
        return this.raw[y][x];
    }

    map<U>(fn: (v: T | null, x: number, y: number) => U | null): Matrix<U> {
        let n = new Matrix<U>(this.width, this.height);
        this.forEach((v, x, y) => {
            n.set(x, y, fn(v, x, y));
        })
        return n;
    }
    replaceByMatrix(matrix: Matrix<boolean>, to: T | null): void {
        this.raw = this.map((v, x, y) => {
            if (matrix.get(x, y)) {
                return to;
            } else {
                return v
            }
        }).raw;
    }

    flip(): void {
        this.raw = this.map(v => v ? null : v).raw;
    }
    static from<T>(mat: T[][]) {
        return new Matrix<T>(mat.length, mat[0].length).map((v, x, y) => {
            return mat[x][y];
        })
    }

    toString() {
        let str = `Matrix[${this.width}x${this.height}] = {\n`;
        for (let arr of this.raw) {
            str += "  "
            for (let v of arr) {
                str += v + ", "
            }
            str += "\n"
        }

        str += "}"

        return str;
    }
}