export const QUESTIONS = [
  {
    step: 1,
    question: "비슷한 역할을 하는 아이템이 정말 없어?",
    options: [
      { id: 1, label: "정말 없어 믿어줘" },
      { id: 2, label: "비슷한 게 있긴 한데.. 대체 불가능" },
      { id: 3, label: "대체 할 수 있는 게 있긴 해" },
    ],
  },
  {
    step: 2,
    question: "이 아이템을 자주 사용할 것 같아?",
    options: [
      { id: 1, label: "매우 자주 사용할 것 같아" },
      { id: 2, label: "가끔 사용할 것 같아" },
      { id: 3, label: "솔직히 거의 안 쓸 듯" },
    ],
  },
  {
    step: 3,
    question: "대략 한 달 이내에 위시템을 사용할 구체적인 계획이 있어?",
    options: [
      { id: 1, label: "확실하게 쓸 계획을 세워 두었어" },
      { id: 2, label: "이번 달 안에는 쓸 것 같아" },
      { id: 3, label: "언젠가는 쓸 걸?" },
    ],
  },
] as const;
