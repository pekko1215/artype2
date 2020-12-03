export interface SlotEventPayload {
    data: any;
    listener?: SlotEventListener;
}

export class SlotEventListener {
    event: (p: SlotEventPayload) => void;
    name: string;
    once: boolean;
    constructor(name: string, event: (SlotEventPayload: any) => void, once: boolean) {
        this.name = name;
        this.event = event;
        this.once = once;
    }
}
export class SlotEventEmitter {
    events: Map<string, SlotEventListener[]>;
    constructor() {
        this.events = new Map<string, SlotEventListener[]>();
    }
    emit(key: string, payload: SlotEventPayload = { data: null }) {
        if (!this.events.has(key)) return;
        let listenerList = this.events.get(key);
        this.events.set(key, listenerList!.filter((call: SlotEventListener, i: number) => {
            payload.listener = call;
            call.event(payload);
            if (call.once) {
                return false;
            }
            return true;
        }));
    }
    on(key: string, callback: (SlotEventPayload: SlotEventPayload) => void) {
        const listener = new SlotEventListener(key, callback, false);

        this.events.set(key, [...(this.events.get(key) || []), listener]);
    }
    async once(key: string, callback?: (SlotEventPayload: SlotEventPayload) => void): Promise<SlotEventPayload> {
        return new Promise((r) => {
            const listener = new SlotEventListener(key, (payload: SlotEventPayload) => {
                r(payload);
                return callback && callback(payload);
            }, true);
            this.events.set(key, [...(this.events.get(key) || []), listener]);
        })
    }
    eventRegister() {

    }
}
