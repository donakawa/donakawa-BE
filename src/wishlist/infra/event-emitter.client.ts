import { EventEmitter } from "node:events";
import { EventType } from "../../enum/event-type.enum";

export class EventEmitterClient {
  emitter: EventEmitter = new EventEmitter();
  constructor() {}
  emit<T>(eventType: EventType, payload: T) {
    this.emitter.emit(eventType, payload);
  }
  on<T>(eventType: EventType, listener: (payload: T) => void): void {
    this.emitter.on(eventType, listener);
  }
  off<T>(eventType: EventType, listener: (payload: T) => void): void {
    this.emitter.off(eventType, listener);
  }
}
