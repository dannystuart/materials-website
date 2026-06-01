export type FaqEntry = {
  id: string;
  number: string;
  question: string;
  answer: string;
};

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: "midjourney",
    number: "Q01",
    question: "I can generate these in Midjourney myself.",
    answer:
      "Honestly, yes — you can. The pack is the weekend of prompt-engineering you'd otherwise spend, already done. A consistent style across 160 pieces, no model drift mid-project, and source files you keep when the next Midjourney update changes everything.",
  },
  {
    id: "trust",
    number: "Q02",
    question: "Who's Danny? Is the quality actually real?",
    answer:
      "Fair. The honest answer is the free pack — it's 10 of these same Materials, rated 4.9★ from 8 verified buyers. If that's not the quality you wanted, the paid pack won't be either. Grab the free one first and decide from there.",
  },
  {
    id: "overkill",
    number: "Q03",
    question: "160 is overkill — I'll only use a handful.",
    answer:
      "It's not a checklist — it's 160 starting points. Three for a client deck, two as Midjourney style references, one as a Figma fill, another for next month's pitch. If you only ever use five, that's still under $2 each. Use it like a library, not an inbox.",
  },
];
