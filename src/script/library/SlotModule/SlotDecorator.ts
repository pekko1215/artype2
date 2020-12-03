import { SlotEventEmitter } from "./SlotEventListener";

export function SlotEvent(eventName: string) {
    return (target: SlotEventEmitter, _name: string, descriptor: PropertyDescriptor) => {
        const method = target.eventRegister;//もともとのメソッドを退避しておきます。
        target.eventRegister = function () {
            method.call(this);
            this.on(eventName, descriptor.value.bind(this))
        }
    }
}