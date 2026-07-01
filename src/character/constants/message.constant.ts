import { MessageId } from "../enums/message-id.enum";
import { MessagePriority } from "../enums/message-priority.enum";

export const TALK_MESSAGES = {
  [MessageId.DEFAULT]: {
    priority: MessagePriority.HIGH,
    message: "",
  },

  [MessageId.TALK_01]: {
    priority: MessagePriority.HIGH,
    message: "똥 쌌어요...",
  },

  [MessageId.TALK_02]: {
    priority: MessagePriority.LOW,
    message: "{USER_NAME}! 오늘도 좋은 하루(„• ᴗ •„)",
  },

  [MessageId.BUD_01]: {
    priority: MessagePriority.MIDDLE,
    message: "예산 설정 좀 하세요",
  },

  [MessageId.BUD_02]: {
    priority: MessagePriority.MIDDLE,
    message: "점점 지갑이 얇아지고 있어...",
  },

  [MessageId.BUD_03]: {
    priority: MessagePriority.MIDDLE,
    message: "장난해? 이러다가 거지가 되겠어",
  },

  [MessageId.GOAL_01]: {
    priority: MessagePriority.HIGH,
    message: "{GOAL_NAME} 사려고 모으는 거지? 응원할게!",
  },

  [MessageId.GOAL_02]: {
    priority: MessagePriority.HIGH,
    message: "{GOAL_NAME}랑 {DIFF}% 더 가까워졌어! (๑>ᴗ<๑)",
  },

  [MessageId.GOAL_03]: {
    priority: MessagePriority.HIGH,
    message: "거의 다 왔어! {GOAL_NAME}가 코앞이야!",
  },

  [MessageId.SAVE_01]: {
    priority: MessagePriority.LOW,
    message: "흠흠... 카페 한 번 갈 돈을 아꼈구만!",
  },

  [MessageId.SAVE_02]: {
    priority: MessagePriority.LOW,
    message: "{PRICE}마리의 치킨값을 아끼다니 대단해!",
  },

  [MessageId.SAVE_03]: {
    priority: MessagePriority.LOW,
    message: "방금 최소 일하는 시간 1시간은 아꼈어!",
  },
} as const;
