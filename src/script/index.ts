import { SaveDataClass } from "./SaveData";
import { SlotClass } from "./System";
export * from "./System";

export const SaveData = new SaveDataClass
export let Slot!: SlotClass;

(async () => {
    Slot = await SlotClass.init();
})();