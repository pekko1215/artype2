var kokutid = false;
var bonusTypeKokutiFlag = false;
const EffectUtilities = { atEffect, spStop };

async function sleep(time) {
    return new Promise(r => setTimeout(r, time));
}

function atEffect(idx) {
    idx = parseInt(idx.slice(-1)) - 1;
    $('#nabi' + (1 + idx)).addClass('on');
    slotmodule.once('allreelstop', () => {
        $('.nabi').removeClass('on');
    })
}

async function spStop(timing, count) {
    timing++;
    let v;
    for (; timing--;) {
        v = await slotmodule.once('reelstop');
    }
    if (count) $('.stopLight>.nabi').eq(v.reel).removeClass('on');
    for (; count--;) {
        sounder.playSound('spstop');
        await sleep(100);
    }
}



const SpStopTable = {
    EffectTable: [
        [
            [
                [1, 0, 0]
            ]
        ], //1消灯
        [ //2消灯
            [
                [1, 1, 0]
            ],
            [
                [2, 2, 0],
                [1, 2, 0]
            ]
        ],
        [
            [
                [1, 1, 1],
                [1, 1, 2],
                [1, 2, 2]
            ],
            [
                [1, 2, 3],
                [2, 2, 3],
            ],
            [
                [2, 3, 3],
                [1, 1, 3],
                [1, 3, 3],
            ],
            [
                [0, 1, 1],
                [0, 1, 2],
                [0, 2, 2],
                [1, 0, 1],
                [1, 0, 2],
                [2, 0, 2],
            ],
            [
                [0, 0, 1],
                [2, 0, 3],
                [0, 0, 2],
                [0, 0, 3],
                [0, 3, 3],
                [0, 2, 3],
                [0, 1, 3],
                [3, 3, 3]
            ]
        ]
    ],
    LotTable: {
        はずれ: [{
            value: 0
        }, {
            value: 0
        }, {
            value: 1 / 120,
            table: [80, 20]
        }].reverse(),
        リプレイ: [{
            value: 1 / 6,
            table: [100]
        }, {
            value: 0
        }, {
            value: 0
        }].reverse(),
        共通ベル: [{
            value: 2 / 3,
            table: [100]
        }, {
            value: 0
        }, {
            value: 1 / 16,
            table: [80, 10, 8, 2]
        }].reverse(),
        スイカ: [{
            value: 0
        }, {
            value: 1,
            table: [80, 20]
        }, {
            value: 1 / 3,
            table: [70, 20, 8, 2]
        }].reverse(),
        BIG: [{
            value: 1 / 4,
            table: [100]
        }, {
            value: 1 / 3,
            table: [30, 70]
        }, {
            value: 1 / 3,
            table: [10, 35, 35, 10, 10]
        }].reverse(),
        成立後: [{
            value: 3 / 4,
            table: [100]
        }, {
            value: 3 / 4,
            table: [30, 70]
        }, {
            value: 5 / 6,
            table: [10, 35, 35, 10, 10]
        }].reverse()
    }
}

const HiEffectLoopTime = 3.321;
const ARTBitaTable = {
    GameCount: [1, 2, 3, 5, 10, 30, 50, 101, 102, 103],
    LotValue: [300, 300, 300, 50, 41, 3, 3, 1, 1, 1]
}


var isHi;
async function effect(lot, orig, { rt, segments, bonusflag }) {
    $('.stopLight>.nabi').addClass('on');
    switch (gamemode) {
        case 'normal':
            if (kokutid && !bonusTypeKokutiFlag) {
                bonusTypeKokutiFlag = true;
                sounder.playSound('bonuskokuti');
                $('.nabi').addClass('on');
                await slotmodule.once('bet');
                if (gamemode != 'normal') return;
                sounder.playSound('yokoku');
                switch (bonusflag) {
                    case 'BIG1':
                        $('#nabi3').removeClass('on');
                        break
                    case 'BIG2':
                        $('#nabi1').removeClass('on');
                        $('#nabi2').removeClass('on');
                        break
                    case 'REG':
                        $('#nabi2').removeClass('on');
                }
            }
            var after = false
            switch (lot) {
                case 'チェリー':
                    sounder.playSound('yokoku')
                    break
                case '3択子役1':
                case '3択子役2':
                case '3択子役3':
                    if (isART || !rand(64)) {
                        if (!(isART && !ARTStock)) {
                            EffectUtilities.atEffect(lot);
                        }
                        slotmodule.freeze();
                        await sounder.playSound('nabi')
                        slotmodule.resume();
                        if (ARTStock > 0) {
                            EffectUtilities.atEffect(lot);
                            changeARTSeg();
                            slotmodule.once('payend', () => {
                                ARTStock--;
                                if (ARTStock == 0) {
                                    sounder.stopSound('bgm');
                                    if (rt.mode) {
                                        sounder.playSound('RT1', true);
                                    } else {
                                        ARTEndEffect();
                                    }
                                }
                            })

                        } else {
                            if (!isART) break;
                            slotmodule.once('payend', () => {
                                if (!rt.mode) {
                                    sounder.stopSound('bgm');
                                    ARTEndEffect();
                                }
                            })
                        }
                    }
                    break
                case 'リプレイ':
                    if (orig == null) break;
                case '共通ベル':
                case 'スイカ':
                case 'はずれ':
                case 'リーチ目リプレイ':
                case 'BIG3':
                case 'BIG4':
                    var after = bonusflag;
                case 'BIG1':
                case 'BIG2':
                case 'BIG5':
                case 'BIG6':
                case 'REG':
                    if (kokutid) break;
                    if (isHi) break;
                    var lotName = lot;
                    if (bonusflag) lotName = 'BIG';
                    if (after) lotName = '成立後'

                    if (bonusflag && !rand(8)) {
                        let dummyLot = ['3択子役1', '3択子役2'][rand(2)];
                        if (bonusflag == 'BIG2') {
                            dummyLot = '3択子役3';
                        }
                        EffectUtilities.atEffect(dummyLot);
                        slotmodule.freeze();
                        await sounder.playSound('nabi');
                        slotmodule.resume();

                        slotmodule.once('payend', () => {

                            sounder.stopSound('bgm');
                        })
                        break
                    }
                    var lotTable = SpStopTable.LotTable[lotName]
                    var stop3Flag = false;
                    var spStopStack = [];
                    var spStopFlag = lotTable.some((data, _i) => {
                        var i = 2 - _i;
                        var r = Math.random();
                        if (r < data.value) {
                            r = rand(100);
                            var idx = data.table.findIndex(v => {
                                r -= v;
                                return r < 0;
                            });
                            var arr = SpStopTable.EffectTable[i][idx];
                            var pattern = arr[rand(arr.length)];
                            pattern.forEach((v, i) => {
                                spStopStack.push(v);
                            })
                            if (pattern[2] > 0) stop3Flag = true;
                            return true;
                        }
                    })


                    if (stop3Flag && (!isART || bonusflag)) {

                        // 発展フラグ
                        if (bonusflag && rand(4)) isHi = true;
                        if (!bonusflag && !rand(4)) isHi = true;
                        if (bonusflag && !lot.includes('BIG')) isHi = true;
                        if (isART) isHi = false;

                        var skipFlag = false;
                        if (isHi) {
                            if (bonusflag && !rand(6)) skipFlag = true;
                            if (!bonusflag && !rand(16)) skipFlag = true;
                        }

                        if (!skipFlag) {
                            if (spStopFlag) {
                                if ((bonusflag && !rand(2)) || (!bonusflag && !rand(4))) {
                                    sounder.playSound('yokoku')
                                }
                            }
                            spStopStack.forEach((v, i) => {
                                EffectUtilities.spStop(i, v);
                            })
                            await slotmodule.once('payend');
                            if (gamemode != 'normal') return;
                            sounder.stopSound('bgm');
                            await sleep(333);
                            slotmodule.freeze();
                            slotmodule.setFlash(flashdata.syoto);
                            sounder.playSound('roulette');
                            var stopCount = 0;

                            var shuffle = () => {
                                setTimeout(() => {
                                    if (stopCount == 3) return;
                                    for (var i = 2; i >= stopCount; i--) {
                                        segments.effectseg.setOnce(i + 1, '' + rand(10));
                                    }
                                    shuffle();
                                }, 10)
                            }
                            shuffle();

                            await sleep(1820);
                            sounder.playSound('spstop');
                            stopCount++;
                            segments.effectseg.setOnce(1, '7');
                            await sleep(333);
                            sounder.playSound('spstop');
                            stopCount++;
                            segments.effectseg.setOnce(2, '7');
                            await sleep(333);
                            sounder.playSound('spstop');
                            stopCount++;

                            if (!isHi) {
                                if (bonusflag) {
                                    kokutid = true;
                                    if (!rand(8)) {
                                        segments.effectseg.setOnce(3, '6');
                                    } else {
                                        segments.effectseg.setOnce(3, '7');
                                    }
                                    await sleep(1000);
                                    slotmodule.clearFlashReservation();
                                    segments.effectseg.setOnce(3, '7');
                                    slotmodule.setFlash(flashdata.blue);
                                    await sounder.playSound('kokuti');
                                    slotmodule.resume();
                                    slotmodule.clearFlashReservation();
                                } else {
                                    segments.effectseg.setOnce(3, '6');
                                    await sleep(1000);
                                    slotmodule.clearFlashReservation();
                                    slotmodule.resume();
                                }
                                return;
                            }
                            segments.effectseg.setOnce(3, 'H');

                            sounder.playSound('histart')
                            await sleep(1000);
                        }
                        //発展演出

                        var isShuffleEnd = false;
                        var segs = segments.effectseg.randomSeg().slice(1);
                        var shuffle = () => {
                            setTimeout(() => {
                                if (isShuffleEnd) return;
                                segs.forEach(s => s.next());
                                shuffle();
                            }, 50)
                        }
                        shuffle();

                        slotmodule.clearFlashReservation();
                        slotmodule.resume();
                        sounder.playSound('hiroulette', true);
                        await slotmodule.once('payend');
                        isShuffleEnd = true;
                        if (gamemode != 'normal') return;
                        slotmodule.freeze();
                        sounder.stopSound('bgm');
                        sounder.playSound('hirouletteend');
                        segments.effectseg.setSegments('000');
                        for (var i = 0; i < 7; i++) {
                            sounder.playSound('spstop');
                            if (i % 2 == 1) {
                                segments.effectseg.setOnce(2, '' + (i + 1));
                            } else {
                                segments.effectseg.setOnce(1, '' + (i + 1));
                                segments.effectseg.setOnce(3, '' + (i + 1));
                            }
                            await sleep(410)
                        }
                        if (bonusflag) {
                            kokutid = true;
                            segments.effectseg.setOnce(2, '7');
                            slotmodule.clearFlashReservation();
                            slotmodule.setFlash(flashdata.blue);
                            await sounder.playSound('kokuti');
                            await sleep(1000);
                            slotmodule.resume();
                            slotmodule.clearFlashReservation();
                        } else {
                            await sleep(1000);
                            slotmodule.clearFlashReservation();
                            slotmodule.resume();
                        }
                        isHi = false;
                    } else {
                        spStopStack.forEach((v, i) => {
                            EffectUtilities.spStop(i, v);
                        })
                    }
                    var bgmStopFlag = false;

                    if (!kokutid && isART && bonusflag) {
                        if (orig && orig.includes('BIG') && lot.includes('BIG')) bgmStopFlag = true;
                        if (!orig && lot.includes('BIG') && rand(3)) bgmStopFlag = true;
                    }
                    if (bgmStopFlag) {
                        slotmodule.once('allreelstop', () => {
                            if (gamemode == 'normal')
                                sounder.stopSound('bgm');
                        })
                    }
            }
            slotmodule.once('bet', () => {
                segments.effectseg.reset();
                slotmodule.clearFlashReservation();
            })
            break;
        case 'reg':
            kokutid = false;
            bonusTypeKokutiFlag = false;
            isHi = false;
            ARTStock += !rand(4) && 1;
            break
        case 'big':
            kokutid = false;
            bonusTypeKokutiFlag = false;
            isHi = false;
            if (lot == 'ボーナス小役1') return;
            var segs = segments.effectseg.randomSeg().slice(1, 3);
            segments.effectseg.setOnce(0, '-')
            segments.effectseg.setOnce(3, '-')
            var isShuffleEnd = false;
            var shuffle = () => {
                setTimeout(() => {
                    if (isShuffleEnd) return;
                    segs.forEach(s => s.next());
                    shuffle();
                }, 50)
            }
            shuffle();
            sounder.playSound('yokoku');
            var event = await slotmodule.once('reelstop');
            var bitaMiss = false;
            if (event.reel != 1 || slotmodule.getReelPos(1) != 0) {
                isShuffleEnd = true;
                segments.effectseg.reset();
                bitaMiss = true
            } else {
                sounder.playSound('bita');
            }

            if (bitaMiss && !isHyper) return;
            notChangeBonusSegFlag = true;
            await slotmodule.once('allreelstop');
            slotmodule.clearFlashReservation();
            slotmodule.setFlash(flashdata.syoto);
            isShuffleEnd = true;

            var r = rand(1000);
            var index = ARTBitaTable.LotValue.findIndex(v => {
                r -= v;
                return r < 0;
            });

            var appendGameCount = ARTBitaTable.GameCount[index];

            // if (bitaMiss) appendGameCount = 1;

            ARTStock += appendGameCount;
            sounder.playSound('uwanose')
            if (appendGameCount > 100) appendGameCount -= 100;
            var str = ("  " + appendGameCount).slice(-2);
            var blinkFlag = false;
            segments.effectseg.setOnce(0, '-')
            segments.effectseg.setOnce(3, '-')
            var blinker = (f) => {
                setTimeout(() => {
                    if (blinkFlag) return;
                    if (f) {
                        segments.effectseg.setOnce(1, str[0]);
                        segments.effectseg.setOnce(2, str[1]);
                    } else {
                        segments.effectseg.setOnce(1, " ");
                        segments.effectseg.setOnce(2, " ");
                    }
                    blinker(!f);
                }, 20)
            }
            blinker(true);
            await slotmodule.once('bet');
            slotmodule.clearFlashReservation();
            blinkFlag = true;
            segments.effectseg.reset();
            notChangeBonusSegFlag = false;

    }

}


function changeARTSeg() {
    var str = ("00" + ARTStock).slice(-2);
    segments.payseg.setSegments(str);
}

async function ARTEndEffect() {
    var num = (coin - renGetCount);
    if (num < 0) num = 0;
    segments.effectseg.setSegments(num)
    slotmodule.freeze();
    slotmodule.setFlash(flashdata.syoto);
    // await sounder.playSound('artend');
    slotmodule.clearFlashReservation();
    slotmodule.resume();
    isART = false;
}