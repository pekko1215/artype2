import { GameMode } from "..";
import { LotBase } from "../library/Lottery";

export type LotName =
    "リプレイ" |
    "ベル" |
    "スイカ" |
    "強スイカ" |
    "BIG" |
    '共通ベル' |
    'チェリー' |
    'REG' |
    "JACIN" |
    "JACGAME"

export interface SlotLotBase extends LotBase {
    name: LotName;
}


export const LotData: { [key in GameMode]: SlotLotBase[] } = {
    Normal: [{
        name: "リプレイ",
        value: 1 / 7.7
    },
    {
        name: "ベル",
        value: 1 / 7.3
    },
    {
        name: "スイカ",
        value: 1 / 64
    },
    {
        name: "強スイカ",
        value: 1 / 512
    },
    {
        name: "BIG",
        value: 1 / 288
    },
    {
        name: '共通ベル',
        value: 1 / 128
    },
    {
        name: 'チェリー',
        value: 1 / 192
    }, {
        name: 'REG',
        value: 1 / 320
    }

    ],
    "BIG": [{
        name: "JACIN",
        value: 1 / 7.7
    }],
    "REG": [{
        name: "JACGAME",
        value: 1
    }]
}