var kokutid = false;

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
    for (; timing--;) {
        await slotmodule.once('reelstop');
    }
    for (; count--;) {
        sounder.playSound('spstop');
        await sleep(100);
    }
}



const SpStopTable = {
    EffectTable: [
        [[[1, 0, 0]]], //1消灯
        [            //2消灯
            [[1, 1, 0]],
            [[2, 2, 0], [1, 2, 0]]
        ],
        [
            [
                [1, 1, 1],
                [1, 1, 2],
                [1, 2, 2]
            ], [
                [1, 2, 3],
                [2, 2, 3],
            ], [
                [2, 3, 3],
                [1, 1, 3],
                [1, 3, 3],
            ], [
                [0, 1, 1],
                [0, 1, 2],
                [0, 2, 2],
            ], [
                [0, 0, 1],
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
            value: 1 / 12,
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
            value: 2 / 3,
            table: [10, 35, 35, 10, 10]
        }].reverse(),
    }
}

const HiEffectLoopTime = 3.321;

var isHi;
async function effect(lot, orig, { rt, segments, bonusflag }) {
    switch (gamemode) {
        case 'normal':
            switch (lot) {
                case '3択子役1':
                case '3択子役2':
                case '3択子役3':
                    if (rt.mode) EffectUtilities.atEffect(lot);
                    break
                case 'リプレイ':
                    if (orig == null) break;
                case '共通ベル':
                case 'スイカ':
                case 'はずれ':
                case 'リーチ目リプレイ':
                case 'BIG1':
                case 'BIG2':
                case 'BIG3':
                case 'BIG4':
                case 'BIG5':
                case 'BIG6':
                    if (kokutid) break;
                    if (isHi) break;
                    var lotName = lot;
                    if (bonusflag) lotName = 'BIG';
                    var lotTable = SpStopTable.LotTable[lotName]
                    var stop3Flag = false;
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
                                EffectUtilities.spStop(i, v);
                            })
                            if (pattern[2] > 0) stop3Flag = true;
                            return true;
                        }
                    })
                    if (spStopFlag) {
                        if ((bonusflag && !rand(2)) || (!bonusflag && !rand(4))) {
                            sounder.playSound('yokoku')
                        }
                    }
                    if (stop3Flag && !rt.mode) {
                        if (bonusflag) kokutid = true;

                        // 発展
                        if (bonusflag && rand(4)) isHi = true;
                        if (!bonusflag && !rand(4)) isHi = true;
                        if (rt.mode) isHi = false;
                        await slotmodule.once('payend');
                        if (gamemode != 'normal') return;
                        sounder.stopSound('bgm');
                        await sleep(333);
                        slotmodule.freeze();
                        slotmodule.setFlash(flashdata.syoto);
                        sounder.playSound('roulette');
                        var stopCount = 0;
                        setTimeout(async () => {

                        }, 1820);
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
                        
                        var isShuffleEnd = false;
                        var segs = segments.effectseg.randomSeg().slice(1);
                        var shuffle = ()=>{
                            setTimeout(()=>{
                                if(isShuffleEnd) return;
                                segs.forEach(s=>s.next());
                                shuffle();
                            },50)
                        }
                        shuffle();

                        slotmodule.clearFlashReservation();
                        slotmodule.resume();
                        sounder.playSound('hiroulette',true);
                        await slotmodule.once('payend');
                        isShuffleEnd = true;
                        if(gamemode != 'normal') return;
                        slotmodule.freeze();
                        sounder.stopSound('bgm');
                        sounder.playSound('hirouletteend');
                        segments.effectseg.setSegments('000');
                        for(var i = 0;i < 7; i++){
                            sounder.playSound('spstop');
                            if(i % 2 == 1){
                                segments.effectseg.setOnce(2, '' + (i + 1));
                            }else{
                                segments.effectseg.setOnce(1, '' + (i + 1));
                                segments.effectseg.setOnce(3, '' + (i + 1));
                            }
                            await sleep(410)
                        }
                        if(bonusflag){
                            segments.effectseg.setOnce(2, '7');
                            slotmodule.clearFlashReservation();
                            slotmodule.setFlash(flashdata.blue);
                            await sounder.playSound('kokuti');
                            await sleep(1000);
                            slotmodule.resume();
                        }else{
                            await sleep(1000);
                            slotmodule.clearFlashReservation();
                            slotmodule.resume();
                        }
                    }
                    if (!kokutid && bonusflag && !rand(3)) {
                        slotmodule.once('allreelstop', () => {
                            sounder.stopSound('bgm');
                        })
                    }
            }
            slotmodule.once('bet', () => {
                segments.effectseg.reset();
                slotmodule.clearFlashReservation();
            })
            break;
        case 'big':
            kokutid = false;
    }

}