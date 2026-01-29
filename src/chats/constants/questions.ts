export const QUESTIONS = [
  {
    step: 1,
    question: "비슷한 아이템이 이미 있나요?",
    options: [
      { id: 1, label: "전혀 없다" },
      { id: 2, label: "비슷한 게 있다" },
      { id: 3, label: "이미 충분하다" },
    ],
  },
  {
    step: 2,
    question: "이 아이템을 자주 사용할 것 같나요?",
    options: [
      { id: 1, label: "자주 사용할 것 같다" },
      { id: 2, label: "가끔 사용할 것 같다" },
      { id: 3, label: "거의 안 쓸 것 같다" },
    ],
  },
  {
    step: 3,
    question: "이번 달 안에 꼭 필요한가요?",
    options: [
      { id: 1, label: "꼭 필요하다" },
      { id: 2, label: "있으면 좋다" },
      { id: 3, label: "지금은 아니다" },
    ],
  },
] as const;
