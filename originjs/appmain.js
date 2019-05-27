controlRerquest("data/control.smr", main)

function main() {
    window.scrollTo(0, 0);
    window.sbig = false;
    var notplaypaysound = false;
    var jacflag;
    var kokutid;
    var kokuti;
    var lastControl;
    window.ARTStock = 0;
    window.isART = false;
    window.notChangeBonusSegFlag = false;
    window.isHyper = false;
    window.rt = {
        mode:null,
        game:250
    }
    window.renGetCount = null;
    slotmodule.on("allreelstop", function(e) {
        if (e.hits != 0) {
            if (e.hityaku.length == 0) return
            var {name} = e.hityaku[0];
            var matrix = e.hityaku[0].matrix;
            var count = 0;
            slotmodule.once("bet", function() {
                slotmodule.clearFlashReservation()
            })
            notplaypaysound = false;
            if(gamemode == 'normal'){
                if (name.includes("代替リプレイ")||
                    name.includes("リーチ目リプレイ")||
                    name.includes("ボーナス小役")||
                    name.includes("1枚役")){
                        notplaypaysound = true;
                }
            }
            if(!notplaypaysound){
                slotmodule.setFlash(null, 0, function(e) {
                    slotmodule.setFlash(flashdata.default, 20)
                    slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                })
            }
        }
        if (e.hits == 0 && jacflag && gamemode == "big") {
            slotmodule.setFlash(flashdata.syoto)
            slotmodule.once('bet', function() {
                slotmodule.clearFlashReservation()
            })
        }
        if (gamemode == "big") {
            changeBonusSeg()
        }

        if (gamemode == "jac" || gamemode == "reg") {
            bonusdata.jacgamecount--;
            changeBonusSeg()
        }

        replayflag = false;
        var nexter = true;

        e.hityaku.forEach(function(d) {
            var matrix = d.matrix;
            switch (gamemode) {
                case 'normal':
                    switch (d.name) {
                        case "赤7":
                        case "青7":
                        case "BAR":
                            if(isART){
                                isHyper = true;
                            }else{
                                renGetCount = coin;
                            }
                            var bgmData = {
                                "BIG": {
                                    tag: "BIG1",
                                    loopStart: 1.156
                                },
                                "SBIG": {
                                    tag: "SBIG",
                                    loopStart: 0
                                }
                            }
                            sounder.stopSound("bgm");
                            setGamemode('big');
                            $('.nabi').removeClass('on');
                            var currentBig = bgmData[isHyper?'SBIG':'BIG'];
                            sounder.playSound(currentBig.tag, true, null, currentBig.loopStart)
                            bonusdata = {
                                bonusget:240,
                                geted:0
                            }
                            bonusflag = null;
                            changeBonusSeg();
                            clearLamp();
                            jacflag = false
                            kokuti = false;
                            kokutid = false;
                            isART = true;
                            break;
                        case "チェリー":
                            matrix = matrix.map((arr) => {
                                arr[1] = 0;
                                arr[2] = 0;
                                return arr;
                            })
                            slotmodule.setFlash(null, 0, function(e) {
                                slotmodule.setFlash(flashdata.default, 20)
                                slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
                            })
                            replayflag = true;
                            break
                        case "リプレイ":
                        case "代替リプレイ":
                        case "リーチ目リプレイ":
                            replayflag = true;
                            break;
                    }
                    break;
                case 'big':
                switch(d.name){
                    case 'JACIN':
                        setGamemode('jac');
                        bonusdata.jacgetcount = 4;
                        bonusdata.jacgamecount = 4;
                        changeBonusSeg();
                        bonusflag = null;
                        jacflag = false;
                        clearLamp()
                    break
                    case "リプレイ":
                    case "代替リプレイ":
                    case "リーチ目リプレイ":
                        replayflag = true;
                    break;
                }
                break
                case 'reg':
                case 'jac':
                    changeBonusSeg()
                    bonusdata.jacgetcount--;
                    // bonusdata.jacgamecount--;
            }
        })
        if(gamemode == 'normal' && bonusflag == null){
            switch(rt.mode){
                case 'リプレイ高確率':
                    if(/3択子役/.test(lastControl)){
                        if(e.pay == 0){
                            rt.mode = null;
                            rt.game = -1;
                            if(ARTStock == 0){
                                isART = false;
                                sounder.stopSound('bgm');
                            }
                        }
                    }
                break
            }
        }
        if(gamemode != 'normal' && bonusdata.geted + e.pay >= bonusdata.bonusget){
            rt.mode = 'リプレイ高確率';
            setGamemode('normal');
            sounder.stopSound("bgm")
            segments.effectseg.reset();
            isART = true;
            slotmodule.once("payend", function() {
                if(ARTStock == 0){
                    sounder.playSound('RT1',true);
                }else{
                    sounder.playSound('RT2',true);
                }
            })
        }
        if ((gamemode == 'jac'||gamemode == 'reg')  && ( bonusdata.jacgamecount == 0 || bonusdata.jacgetcount == 0)) {
            setGamemode('big')
        }
        if (nexter) {
            e.stopend()
        }
    })


    slotmodule.on("bet", function(e) {
        sounder.playSound("3bet")
        if ("coin" in e) {
            (function(e) {
                var thisf = arguments.callee;
                if (e.coin > 0) {
                    coin--;
                    e.coin--;
                    incoin++;
                    changeCredit(-1);
                    setTimeout(function() {
                        thisf(e)
                    }, 100)
                } else {
                    if(kokuti){
                        slotmodule.freeze();
                        sounder.playSound('kokuti');
                        slotmodule.setFlash(flashdata.blue,200,()=>{
                            slotmodule.resume();
                            slotmodule.clearFlashReservation();
                            slotmodule.setFlash(flashdata.default)
                        });
                        kokutid = true;
                        kokuti = false;
                    }
                    e.betend();
                }
            })(e)
        }
        if (isART) {
            changeARTSeg();
        } else {
            segments.payseg.reset();
        }
    })

    slotmodule.on("pay", function(e) {
        var pays = e.hityaku.pay;
        var arg = arguments;
        if (gamemode != "normal") {
            changeBonusSeg();
        }
        if (!("paycount" in e)) {
            e.paycount = 0
            e.se = "pay";
            if(prevGameMode != "normal"){
                e.se = "cherry"
                if(pays == 15){
                    e.se = "bigpay"
                }
            }
            if(pays <= 4 && pays) e.se = "cherry";
            if(pays >= 14) e.se = "bigpay"
            if(!replayflag && !notplaypaysound){
                sounder.playSound(e.se, e.se != "cherry");
            }
        }
        if (pays == 0) {
            if (replayflag && !notplaypaysound && e.hityaku.hityaku[0].name != "チェリー") {
                sounder.playSound("replay", false, function() {
                    e.replay();
                    slotmodule.emit("bet", e.playingStatus);
                });
            } else {
                if (replayflag) {
                    e.replay();
                    slotmodule.clearFlashReservation()
                } else {
                    e.payend()
                }
                sounder.stopSound(e.se)
            }
        } else {
            e.hityaku.pay--;
            coin++;
            e.paycount++;
            outcoin++;
            if (gamemode != "normal") {
                bonusdata.geted++;
            }
            changeCredit(1);
            segments.payseg.setSegments(e.paycount)
            setTimeout(function() {
                arg.callee(e)
            }, 60)
        }
    })

    var jacflag = false;

    slotmodule.on("lot", function(e) {
        var ret = -1;
        var lot;
        switch (gamemode) {
            case "normal":
                lot = normalLotter.lot().name

                lot = window.power || lot;
                window.power = undefined

                switch (lot) {
                    case "リプレイ":
                        ret = lot
                        break;
                    case "ベル":
                        ret = "3択子役"+(rand(3)+1);
                        if(bonusflag){
                            if(!rand(3)){
                                ret = '共通ベル'
                            }else{
                                ret = bonusflag
                            }
                        }
                        break
                    case "共通ベル":
                    case "スイカ":
                        ret = lot;
                        break;
                    case "BIG":
                        if (bonusflag == null) {
                            var num = rand(6);
                            ret = bonusflag = 'BIG'+(~~(num%2)+1);
                            if(rand(20)){
                                ret = "BIG"+(num+1);
                                if(!rand(6)) ret = "リーチ目リプレイ";
                                if(!rand(24)) ret = "スイカ";
                                if(!rand(24)) ret = "共通ベル";
                            }
                        } else {
                            ret = bonusflag;
                        }
                        break;
                    default:
                        ret = "はずれ"
                        if(rt.mode == 'リプレイ高確率') ret = "リプレイ";
                        if(bonusflag != null) ret = bonusflag;
                }
                break;
            case "big":
                ret = 'ボーナス小役1'
                if(!rand(4)){
                    ret = 'ボーナス小役2'
                }
                break;
            case "reg":
            case "jac":
                ret = "JACGAME"
                break;
        }
        if(ret == 'リプレイ' && bonusflag && !rand(2)) ret = 'リーチ目リプレイ'
        effect(ret,lot,{rt,segments,bonusflag});
        if(bonusflag) rt.mode = null
        lastControl = ret;
        console.log(ret);
        return ret;
    })

    slotmodule.on("reelstop", function() {
        sounder.playSound("stop")
    })

    $("#saveimg").click(function() {
        SaveDataToImage();
    })

    $("#cleardata").click(function() {
        if (confirm("データをリセットします。よろしいですか？")) {
            ClearData();
        }
    })

    $("#loadimg").click(function() {
        $("#dummyfiler").click();
    })

    $("#dummyfiler").change(function(e) {

        var file = this.files[0];

        var image = new Image();
        var reader = new FileReader();
        reader.onload = function(evt) {
            image.onload = function() {
                var canvas = $("<canvas></canvas>")
                canvas[0].width = image.width;
                canvas[0].height = image.height;
                var ctx = canvas[0].getContext('2d');
                ctx.drawImage(image, 0, 0)
                var imageData = ctx.getImageData(0, 0, canvas[0].width, canvas[0].height)
                var loadeddata = SlotCodeOutputer.load(imageData.data);
                if (loadeddata) {
                    parseSaveData(loadeddata)
                    alert("読み込みに成功しました")
                } else {
                    alert("データファイルの読み取りに失敗しました")
                }
            }
            image.src = evt.target.result;
        }
        reader.onerror = function(e) {
            alert("error " + e.target.error.code + " \n\niPhone iOS8 Permissions Error.");
        }
        reader.readAsDataURL(file)
    })

    slotmodule.on("reelstart", function() {
        if (okure) {
            setTimeout(function() {
                sounder.playSound("start")
            }, 300)
        } else {
            if(!muon){
                sounder.playSound("start")
            }
        }
        okure = false;
        muon = false;
    })
    var okure = false;
    var muon = false;

    var normalLotter = new Lotter(lotdata.normal);
    var bigLotter = new Lotter(lotdata.big);
    var jacLotter = new Lotter(lotdata.jac);


    window.gamemode = "normal";
    window.bonusflag = null
    window.coin = 0;

    var bonusdata;
    var replayflag;

    var isCT = false;
    var CTBIG = false;
    var isSBIG;
    var ctdata = {};
    var regstart;

    var afterNotice;
    var bonusSelectIndex;
    var ctNoticed;

    var playcount = 0;
    var allplaycount = 0;

    var incoin = 0;
    var outcoin = 0;

    var bonuscounter = {
        count: {},
        history: []
    };

    slotmodule.on("leveron", function() {

        if (gamemode == "normal") {
            playcount++;
            allplaycount++;
        } else {
            if (playcount != 0) {
                bonuscounter.history.push({
                    bonus: gamemode,
                    game: playcount
                })
                playcount = 0;
            }
        }
        changeCredit(0)
    })

    function stringifySaveData() {
        return {
            coin: coin,
            playcontroldata: slotmodule.getPlayControlData(),
            bonuscounter: bonuscounter,
            incoin: incoin,
            outcoin: outcoin,
            playcount: playcount,
            allplaycount: allplaycount,
            name: "ARType2",
            id: "twinseven"
        }
    }

    function parseSaveData(data) {
        coin = data.coin;
        // slotmodule.setPlayControlData(data.playcontroldata)
        bonuscounter = data.bonuscounter
        incoin = data.incoin;
        outcoin = data.outcoin;
        playcount = data.playcount;
        allplaycount = data.allplaycount
        changeCredit(0)
    }

    window.SaveDataToImage = function() {
        SlotCodeOutputer.save(stringifySaveData())
    }

    window.SaveData = function() {
        if (gamemode != "normal" || isCT) {
            return false;
        }
        var savedata = stringifySaveData()
        localStorage.setItem("savedata", JSON.stringify(savedata))
        return true;
    }

    window.LoadData = function() {
        if (gamemode != "normal" || isCT) {
            return false;
        }
        var savedata = localStorage.getItem("savedata")
        try {
            var data = JSON.parse(savedata)
            parseSaveData(data)
            changeCredit(0)
        } catch (e) {
            return false;
        }
        return true;
    }

    window.ClearData = function() {
        coin = 0;
        bonuscounter = {
            count: {},
            history: []
        };
        incoin = 0;
        outcoin = 0;
        playcount = 0;
        allplaycount = 0;

        SaveData();
        changeCredit(0)
    }

    var prevGameMode = 'normal'
    var setGamemode = function(mode) {
        prevGameMode = mode;
        switch (mode) {
            case 'normal':
                gamemode = 'normal'
                slotmodule.setLotMode(0)
                slotmodule.setMaxbet(3);
                isSBIG = false
                break;
            case 'big':
                gamemode = 'big';
                slotmodule.once("payend", function() {
                    slotmodule.setLotMode(1)
                });
                slotmodule.setMaxbet(2);
                break;
            case 'jac':
                gamemode = 'jac';
                slotmodule.once("payend", function() {
                    slotmodule.setLotMode(2)
                });
                slotmodule.setMaxbet(1);
                break;
        }
    }

    window.segments = {
        creditseg: segInit("#creditSegment", 2),
        payseg: segInit("#paySegment", 2),
        effectseg: segInit("#effectSegment", 4)
    }

    var credit = 50;
    segments.creditseg.setSegments(50);
    segments.creditseg.setOffColor(80, 30, 30);
    segments.payseg.setOffColor(80, 30, 30);
    segments.creditseg.reset();
    segments.payseg.reset();


    var lotgame;

    function changeCredit(delta) {
        credit += delta;
        if (credit < 0) {
            credit = 0;
        }
        if (credit > 50) {
            credit = 50;
        }
        $(".GameData").text("差枚数:" + coin + "枚  ゲーム数:" + playcount + "G  総ゲーム数:" + allplaycount + "G")
        segments.creditseg.setSegments(credit)
    }

    function changeBonusSeg() {
        if(gamemode != 'normal' && !notChangeBonusSegFlag){
            var val = bonusdata.bonusget - bonusdata.geted;
            val = val < 0 ? 0 : val;
            segments.effectseg.setSegments(""+val);
        }

    }

    function changeCTGameSeg() {
        segments.effectseg.setOnColor(230, 0, 0);
        segments.effectseg.setSegments(ctdata.ctgame);
    }

    function changeCTCoinSeg() {
        segments.effectseg.setOnColor(50, 100, 50);
        segments.effectseg.setSegments(200 + ctdata.ctstartcoin - coin);
    }

    var LampInterval = {
        right: -1,
        left: -1,
        counter: {
            right: true,
            left: false
        }
    }

    function setLamp(flags, timer) {
        flags.forEach(function(f, i) {
            if (!f) {
                return
            }
            LampInterval[["left", "right"][i]] = setInterval(function() {
                if (LampInterval.counter[["left", "right"][i]]) {
                    $("#" + ["left", "right"][i] + "neko").css({
                        filter: "brightness(200%)"
                    })
                } else {
                    $("#" + ["left", "right"][i] + "neko").css({
                        filter: "brightness(100%)"
                    })
                }
                LampInterval.counter[["left", "right"][i]] = !LampInterval.counter[["left", "right"][i]];
            }, timer)
        })
    }

    function clearLamp() {
        clearInterval(LampInterval.right);
        clearInterval(LampInterval.left);
        ["left", "right"].forEach(function(i) {
            $("#" + i + "neko").css({
                filter: "brightness(100%)"
            })
        })

    }



    


    $(window).bind("unload", function() {
        SaveData();
    });

    LoadData();
}

function and() {
    return Array.prototype.slice.call(arguments).every(function(f) {
        return f
    })
}

function or() {
    return Array.prototype.slice.call(arguments).some(function(f) {
        return f
    })
}

function rand(m) {
    return Math.floor(Math.random() * m);
}

function replaceMatrix(base, matrix, front, back) {
    var out = JSON.parse(JSON.stringify(base));
    matrix.forEach(function(m, i) {
        m.forEach(function(g, j) {
            if (g == 1) {
                front && (out.front[i][j] = front);
                back && (out.back[i][j] = back);
            }
        })
    })
    return out
}

function flipMatrix(base) {
    var out = JSON.parse(JSON.stringify(base));
    return out.map(function(m) {
        return m.map(function(p) {
            return 1 - p;
        })
    })
}

function segInit(selector, size) {
    var cangvas = $(selector)[0];
    var sc = new SegmentControler(cangvas, size, 0, -3, 79, 46);
    sc.setOffColor(15, 15, 15)
    sc.setOnColor(230, 0, 0)
    sc.reset();
    return sc;
}