import { SaveData, Slot } from ".";

const $SlotData = document.querySelector('#slotLogs')!;
const SL: string[] = [];

export function SlotLog(text: string) {
    SL.unshift(text);
    $SlotData.innerHTML = SL.join('<br>');
}

document.querySelector("#cleardata")!.addEventListener('click', () => {
    if (confirm("データをリセットします。よろしいですか？")) {
        ClearData();
    }
})
document.querySelector('#slot')!.addEventListener('click', (e) => {
    Slot.pushEvent!.almighty()
    e.preventDefault();
})

document.querySelector('body')!.addEventListener('touchstart', (e) => {
    Slot.pushEvent!.almighty()
    e.preventDefault();
})

document.querySelector('#auto')!.addEventListener('click', (ev) => {
    let e = setInterval(Slot.pushEvent!.almighty, 300);
    ev.stopPropagation();
    document.body.addEventListener('click', () => {
        console.log(e);
        clearInterval(e)
    })
})

window.addEventListener("unload", () => {
    Save();
});


let lastTouch = 0;
document.addEventListener('touchend', event => {
    const now = window.performance.now();
    if (now - lastTouch <= 500) {
        event.preventDefault();
    }
    lastTouch = now;
}, true);

export function ClearData() {
    SaveData.clear();
}
export function Load() {
    SaveData.load();
}

export function Save() {
    SaveData.save();
}

export function RefreshSlotInfo() {
    document.querySelector('#GameData')!.innerHTML = `
        差枚数:${SaveData.coin}枚<br>
        ゲーム数:${SaveData.playCount}G<br>
        総ゲーム数:${SaveData.allPlayCount}G<br>
        機械割:${('' + SaveData.percentage).slice(0, 5)}%<br>
    `
}
