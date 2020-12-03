/**
 * Created by pekko1215 on 2017/07/16.
 */

import { Flash, Matrix } from "../library/SlotModule"

export interface FlashColor {
    color: number;
    alpha: number;
}

export const colorData: { [key: string]: FlashColor } = {
    DEFAULT_B: {
        color: 0xFFFFFF,
        alpha: 0
    },
    DEFAULT_F: {
        color: 0xffffff,
        alpha: 0
    },
    RED_B: {
        color: 0xff0000,
        alpha: 0.3
    },
    LINE_F: {
        color: 0xcccccc,
        alpha: 0.5
    },
    SYOTO_B: {
        color: 0x222222,
        alpha: 0.5
    },
    SYOTO_F: {
        color: 0x888888,
        alpha: 0.9
    },
    Orange: {
        color: 0xFFA500,
        alpha: 0.8
    },
    Aqua: {
        color: 0x00FFFF,
        alpha: 0.8
    },
    Yellow: {
        color: 0xFFF100,
        alpha: 0.3
    }
}

export const flashData: { [key: string]: Flash } = {
    default: new Flash({
        back: Matrix.from(Array(3).fill(Array(3).fill(colorData.DEFAULT_B))),
        front: Matrix.from(Array(3).fill(Array(3).fill(colorData.DEFAULT_F)))
    }),
    redtest: new Flash({
        back: Matrix.from(Array(3).fill(Array(3).fill(colorData.RED_B))),
        front: Matrix.from(Array(3).fill(Array(3).fill(colorData.RED_B)))
    }),
    syoto: new Flash({
        back: Matrix.from([
            [colorData.SYOTO_B, colorData.SYOTO_B, colorData.SYOTO_B],
            [colorData.SYOTO_B, colorData.SYOTO_B, colorData.SYOTO_B],
            [colorData.SYOTO_B, colorData.SYOTO_B, colorData.SYOTO_B]
        ]),
        front: Matrix.from(Array(3).fill(Array(3).fill(colorData.SYOTO_F)))
    }),
    BlueFlash: new Flash({
        back: Matrix.from(Array(3).fill(Array(3).fill({ color: 0x0000ff, alpha: 0.4 }))),
        front: Matrix.from(Array(3).fill(Array(3).fill(colorData.SYOTO_F)))
    })
}

const SyotoRank = 3;

for (let i = 1; i <= SyotoRank; i++) {
    flashData["SyotoLevel" + i] = new Flash({
        back: flashData.default.back,
        front: new Matrix(3, 3).map(() => {
            return {
                color: 0x555555,
                alpha: 0.8 + (0.2 / (SyotoRank) * (i - 1))
            }
        })
    })
}