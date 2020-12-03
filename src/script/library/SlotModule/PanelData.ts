import { Flash } from "./FlashReservation";

export interface PanelData {
    reel:{
        x:number,
        y:number,
        blank:number,
        defaultFlash:Flash,
        speed:number,
        slipSpeed:number
    },
    PIXIOptions:{
        width:number,
        height:number,
        backgroundColor:number
    },
}