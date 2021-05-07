import { Flash, PanelData } from "../library/SlotModule";
import { flashData } from "./Flash";

export const panelData = new (class implements PanelData {
  reel = {
    x: 0,
    y: 10,
    blank: 20,
    defaultFlash: flashData.default,
    speed: 38,
    slipSpeed: 38,
  };
  PIXIOptions = {
    width: 625,
    height: 273,
    backgroundColor: 0xcccccc,
  };
})();
