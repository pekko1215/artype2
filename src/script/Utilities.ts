// 便利な関数たち

export const Sleep = async(t:number):Promise<void> => {
    return new Promise(r => {
        setTimeout(r, t);
    })
}

export const ArrayLot = (list:Array<any>):number => {
    let sum = list.reduce((a, b) => a + b);
    let r = Rand(sum);
    return list.findIndex(n => {
        return (r -= n) < 0;
    })
}

export const ContinueLot = (r:number):number => {
    let p = 0;
    while (Math.random() < r) p++;
    return p;
}

export const Rand = (m:number, n:number = 0) => {
    return Math.floor(Math.random() * m) + n;
}

export const RandomChoice = <T>(arr:T[]):T => {
    return arr[Math.floor(Math.random() * arr.length)];
}