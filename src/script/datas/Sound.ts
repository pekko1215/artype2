import { Sounder } from "../library/Sounder";

export const sounder = new Sounder();

// 使用SE：魔王魂


sounder.addFile("sound/stop.wav", "stop").addTag("se");
sounder.addFile("sound/start.wav", "start").addTag("se");
sounder.addFile("sound/bet.wav", "bet").addTag("se");
sounder.addFile("sound/pay.wav", "pay").addTag("se");
sounder.addFile("sound/replay.wav", "replay").addTag("se");
sounder.addFile("sound/BIG1.mp3", "BIG1").addTag("bgm")
sounder.addFile("sound/SBIG.mp3", "SBIG").addTag("bgm")
sounder.addFile("sound/rt1.mp3", "RT1").addTag("bgm")
sounder.addFile("sound/rt2.mp3", "RT2").addTag("bgm");
sounder.addFile("sound/title.wav", 'title').addTag("se");
sounder.addFile("sound/type.mp3", 'type').addTag("se");
sounder.addFile("sound/yokoku.wav", 'yokoku').addTag("se");
sounder.addFile("sound/kokuti.mp3", 'kokuti').addTag("se");
sounder.addFile("sound/syoto.mp3", "syoto").addTag("se");
sounder.addFile("sound/syotoyokoku.mp3", "syotoyokoku").addTag("se");
sounder.addFile("sound/cherry.mp3", "cherry").addTag("se");
sounder.addFile("sound/bigpay.mp3", "bigpay").addTag("se");
sounder.addFile("sound/spstop.mp3", "spstop").addTag("se");
sounder.addFile("sound/bita.mp3", "bita").addTag("se");
sounder.addFile("sound/roulette.mp3", "roulette").addTag("se");
sounder.addFile("sound/histart.mp3", "histart").addTag("se");
sounder.addFile("sound/hiroulette.mp3", "hiroulette").addTag("bgm");
sounder.addFile("sound/hirouletteend.mp3", "hirouletteend").addTag("bgm");
sounder.addFile("sound/bonuskokuti.mp3", "bonuskokuti").addTag("se");
sounder.addFile("sound/uwanose.mp3", "uwanose").addTag("se");
sounder.addFile("sound/artend.mp3", "artend").addTag("se");
sounder.addFile("sound/nabi.mp3", "nabi").addTag("se");

sounder.setVolume('se', 0.5)
sounder.setVolume('bgm', 0.5)
sounder.setVolume('small', 0.3);

sounder.setMasterVolume(0.5)