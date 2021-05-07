import { Sounder } from "../library/Sounder";

export const sounder = new Sounder();

// 使用SE：魔王魂


sounder.addFile("sound/stop.wav", "stop").addTag("SE");
sounder.addFile("sound/start.wav", "start").addTag("SE");
sounder.addFile("sound/bet.wav", "bet").addTag("SE");
sounder.addFile("sound/pay.wav", "pay").addTag("SE");
sounder.addFile("sound/replay.wav", "replay").addTag("SE");
sounder.addFile("sound/BIG1.mp3", "BIG1", 1.156).addTag("BGM")
sounder.addFile("sound/SBIG.mp3", "SBIG").addTag("BGM")
sounder.addFile("sound/rt1.mp3", "RT1").addTag("BGM").addTag("RT")
sounder.addFile("sound/rt2.mp3", "RT2").addTag("BGM").addTag("RT");
sounder.addFile("sound/rt3.mp3", "RT3").addTag("BGM").addTag("RT");
sounder.addFile("sound/title.wav", 'title').addTag("SE");
sounder.addFile("sound/type.mp3", 'type').addTag("SE");
sounder.addFile("sound/yokoku.wav", 'yokoku').addTag("SE");
sounder.addFile("sound/yokoku2.mp3", 'yokoku2').addTag("SE");
sounder.addFile("sound/kokuti.mp3", 'kokuti').addTag("SE");
sounder.addFile("sound/syoto.mp3", "syoto").addTag("SE");
sounder.addFile("sound/syotoyokoku.mp3", "syotoyokoku").addTag("SE");
sounder.addFile("sound/cherry.mp3", "cherry").addTag("SE");
sounder.addFile("sound/bigpay.mp3", "bigpay").addTag("SE");
sounder.addFile("sound/spstop.mp3", "spstop").addTag("SE");
sounder.addFile("sound/bita.mp3", "bita").addTag("SE");
sounder.addFile("sound/roulette.mp3", "roulette").addTag("SE");
sounder.addFile("sound/histart.mp3", "histart").addTag("SE");
sounder.addFile("sound/hiroulette.mp3", "hiroulette").addTag("BGM");
sounder.addFile("sound/hirouletteend.mp3", "hirouletteend").addTag("BGM");
sounder.addFile("sound/bonuskokuti.mp3", "bonuskokuti").addTag("SE");
sounder.addFile("sound/uwanose.mp3", "uwanose").addTag("SE");
sounder.addFile("sound/artend.mp3", "artend").addTag("SE");
sounder.addFile("sound/nabi.mp3", "nabi").addTag("SE");

sounder.setVolume('SE', 0.5)
sounder.setVolume('BGM', 0.5)
sounder.setVolume('small', 0.3);

sounder.setMasterVolume(0.5)