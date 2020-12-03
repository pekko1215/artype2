/**
 * Created by pekko1215 on 2017/07/15.
 */

import { Matrix, YakuData } from "../library/SlotModule";

const X = true, _ = false;

const BellPay = 9;

const DummyFlash = {
    "中段": Matrix.from([
        [_, _, _],
        [X, X, X],
        [_, _, _]
    ]),
    "上段": Matrix.from([
        [X, X, X],
        [_, _, _],
        [_, _, _]
    ]),
    "下段": Matrix.from([
        [_, _, _],
        [_, _, _],
        [X, X, X]
    ]),
    "右下がり": Matrix.from([
        [X, _, _],
        [_, X, _],
        [_, _, X]
    ]),
    "右上がり": Matrix.from([
        [_, _, X],
        [_, X, _],
        [X, _, _]
    ]),
    "なし": Matrix.from([
        [_, _, _],
        [_, _, _],
        [_, _, _]
    ]),
    "小V": Matrix.from([
        [X, _, X],
        [_, X, _],
        [_, _, _]
    ]),
    "小山": Matrix.from([
        [_, _, _],
        [_, X, _],
        [X, _, X]
    ])
}

export const yakuData: YakuData[] = [
    {
        name: "リプレイ",
        pay: [0, 0, 0]
    },
    {
        name: "6枚役",
        pay: [BellPay, 15, 15]
    },
    {
        name: "6枚役",
        pay: [BellPay, 15, 15]
    },
    {
        name: "6枚役",
        pay: [BellPay, 15, 15]
    },
    {
        name: "リーチ目リプレイ",
        pay: [0, 0, 0]
    },
    {
        name: "リーチ目リプレイ",
        pay: [0, 0, 0]
    },
    {
        name: "ボーナス小役",
        pay: [0, 15, 0]
    },
    {
        name: "スイカ",
        pay: [6, 15, 15]
    },
    {
        name: '赤7',
        pay: [0, 0, 0]
    },
    {
        name: '青7',
        pay: [0, 0, 0]
    },
    {
        name: 'BAR',
        pay: [0, 0, 0]
    },
    {
        name: '1枚役A',
        pay: [1, 0, 0]
    },
    {
        name: "ボーナス小役",
        pay: [0, 15, 0]
    },
    {
        name: '1枚役B',
        pay: [1, 0, 0]
    },
    {
        name: "ボーナス小役",
        pay: [0, 14, 12]
    },
    {
        name: "ボーナス小役",
        pay: [0, 14, 12]
    },
    {
        name: "チェリー",
        pay: [2, 0, 12]
    }, {
        name: 'REG',
        pay: [0, 0, 0]
    }, {
        name: 'REG小役',
        pay: [0, 0, 12]
    },
    {
        name: "リーチ目リプレイ",
        pay: [0, 0, 0]
    }
]