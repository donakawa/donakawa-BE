import { EventType } from "aws-sdk/clients/budgets";
import { off } from "node:cluster";
import { EventEmitter } from "node:events";

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
