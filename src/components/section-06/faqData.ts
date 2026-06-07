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
      "Honestly, yes you can! It takes a tonne of experimenting with prompts and image references, but it's possible. I even explain a simple method to do this in the asset pack so you can generate an infinite amount of Materials.",
  },
  {
    id: "trust",
    number: "Q02",
    question: "Is the quality going to be good enough?",
    answer:
      "Fair. The honest answer is the free pack — it's 10 of these same Materials, rated 4.9★ from 8 verified buyers. If that's not the quality you wanted, the paid pack won't be either. Grab the free one first and decide from there.",
  },
  {
    id: "overkill",
    number: "Q03",
    question: "160 is overkill, I'll only use a handful.",
    answer:
      "There is a fairly wide variety in the pack as it has to cater for all types of projects, and different use cases. If you only ever use 10, that's still under $1 each. Remember the Materials are there to help you create even more assets and Materials. It's literally infinite once you get going.",
  },
];
