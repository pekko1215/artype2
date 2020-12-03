/**
 * Created by yuto-note on 2017/07/21.
 */

export class SoundData {
    loaded: boolean;
    tags: any[];
    filename: any;
    volume: number;
    loopStart: number;
    gain: any;
    buffer: any;
    startTime: number;
    constructor(filename: any, tags: string[] = [], loopStart = 0, startTime = 0) {
        this.loaded = false;
        this.tags = tags;
        this.filename = filename;
        this.volume = 1;
        this.loopStart = loopStart;
        this.startTime = startTime;
    }
    addTag(tag: string) {
        this.tags.push(tag);
        return this;
    }
    setVolume(volume: number) {
        this.volume = volume;
        if (this.gain) this.gain.gain.value = volume;
        return this;
    }
    async loadFile(context: AudioContext, masterGain: GainNode) {
        if (this.loaded) return;
        return new Promise((r, e) => {
            let request = new XMLHttpRequest();
            request.open("GET", this.filename, true);
            request.responseType = "arraybuffer";

            request.onload = () => {
                context.decodeAudioData(request.response, (buffer: any) => {
                    this.gain = context.createGain();
                    this.gain.gain.value = this.volume;
                    this.gain.connect(masterGain);
                    this.buffer = buffer;
                    r();
                }, (error: any) => {
                    console.error(error);
                    e();
                })
            }
            request.send();
        })
    }
}

export class Sounder {
    soundDatas: SoundData[];
    context: AudioContext | null;
    playingBuffers: {
        sources: AudioBufferSourceNode[];
        soundDatas: SoundData[];
    }[];
    loaderElements: { [key: string]: Element };
    loaded: boolean;
    masterVolume: number;
    loadEvent: () => Promise<void>;
    masterGain!: GainNode;
    constructor() {
        this.soundDatas = [];
        this.context = null;
        this.playingBuffers = [];
        this.loaderElements = {};
        this.loaded = false;
        this.masterVolume = 1;
        let $cover = document.createElement('div');
        $cover.style.textAlign = 'center';
        $cover.style.position = 'fixed';
        $cover.style.width = '100%';
        $cover.style.height = '100%';
        $cover.style.left = '0px';
        $cover.style.top = '0px';
        $cover.style.fontSize = '20pt'
        $cover.style.backgroundColor = 'black';
        $cover.style.color = 'white';
        $cover.style.zIndex = '999999';
        let $h1 = document.createElement('h1');
        this.loadEvent = () => this.startLoad()
        $cover.addEventListener('click', this.loadEvent);
        $cover.addEventListener('touchstart', this.loadEvent);
        $h1.innerText = 'クリックしてロード開始';
        document.body.appendChild($cover);
        $cover.appendChild($h1);
        this.loaderElements = { $h1, $cover };
    }

    async startLoad() {
        if (this.loaded) return;
        console.log('Sound Load Start')
        this.context = new window.AudioContext();
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = this.masterVolume;
        this.masterGain.connect(this.context.destination);

        this.loaderElements.$cover.removeEventListener('click', this.loadEvent);
        this.loaderElements.$cover.removeEventListener('touchstart', this.loadEvent);

        let loadCount = 0;



        let updateLoading = () => {
            this.loaderElements.$h1.textContent = `音声データ 読込中... (${loadCount}/${this.soundDatas.length})`;
        }

        updateLoading();
        await Promise.all(this.soundDatas.map(async data => {
            await data.loadFile(this.context!, this.masterGain);
            loadCount++;
            updateLoading();
        }));

        this.loaderElements.$cover.parentNode!.removeChild(this.loaderElements.$cover);
        this.loaded = true;
    }

    addFile(file: string, tag: string, loopStart?: number | undefined) {
        let obj = new SoundData(file, [tag], loopStart);
        this.soundDatas.push(obj);
        return obj;
    }

    setVolume(tag: string, value: number) {
        this.soundDatas.forEach(data => {
            if (data.tags.includes(tag)) {
                data.setVolume(value);
            }
        })
    }

    setMasterVolume(value: number) {
        this.masterVolume = value;
        if (this.masterGain) this.masterGain.gain.value = value;
    }

    getSoundDatasByTag(tag: any, isLoaded = false) {
        return this.soundDatas.filter(data => {
            return data.tags.includes(tag) && (isLoaded ? data.loaded : true)
        });
    }

    playSound(tag: string, isLoop = false, callback = () => { }) {
        if (!this.loaded) return;
        let playingData: {
            sources: AudioBufferSourceNode[],
            soundDatas: SoundData[]
        } = {
            sources: [],
            soundDatas: []
        };
        return new Promise(r => {
            let arr = this.getSoundDatasByTag(tag);
            playingData.soundDatas = arr;
            if (arr.length == 0) {
                console.error(`Sounder Error tag:${tag} is NOTFOUND.`)
                r();
                return;
            }
            for (let data of arr) {
                let source = this.context!.createBufferSource();
                source.buffer = data.buffer;
                source.loop = isLoop;
                if (isLoop) {
                    source.loopStart = data.loopStart;
                    source.loopEnd = data.buffer.duration;
                }
                source.onended = r;
                source.connect(data.gain);
                playingData.sources.push(source);
                source.start(data.startTime || 0);
            }
            this.playingBuffers.push(playingData);
        }).then(() => {
            playingData.sources.forEach(source => source.stop());
            this.playingBuffers = this.playingBuffers.filter(data => data !== playingData);
            callback();
        })
    }

    stopSound(tag: string) {
        let arr = this.playingBuffers.filter(data => data.soundDatas.find(sd => sd.tags.includes(tag)));
        arr.forEach(({ sources }) => sources.forEach(source => {
            // source.stop();
            if (source.onended) source.onended(new Event('NeutralStop'));
        }));
    }
}