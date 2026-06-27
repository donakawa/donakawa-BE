import { MessagePriority } from "../enums/message-priority.enum";

export const MESSAGE_PRIORITY = {
  HIGH: MessagePriority.HIGH,
  MIDDLE: MessagePriority.MIDDLE,
  LOW: MessagePriority.LOW,
} as const;
