import { Filter } from "bad-words";

const filter = new Filter({
  placeHolder: "*",
});

// You can tweak the list for a PG rating:
filter.addWords(
  "arse",
  "arsehead",
  "arsehole",
  "bastard",
  "bloody",
  "bollocks",
  "bugger",
  "brotherfucker",
  "bullshit",
  "child-fucker",
  "crap",
  "cunt",
  "dammit",
  "damn",
  "damned",
  "dick-head",
  "dogshit",
  "dog shit",
  "dumb-ass",
  "father-fucker",
  "fatherfucker",
  "goddammit",
  "goddamned",
  "goddamnit",
  "godsdamn",
  "horseshit",
  "jack-ass",
  "knobhead",
  "lickme",
  "mother-fucker",
  "nigra",
  "pigfucker",
  "piss",
  "piss off",
  "prick",
  "screwyou",
  "shite",
  "sisterfuck",
  "sisterfucker",
  "sod",
  "sod off",
  "spastic",
  "tranny",
  "twat",
  "wanker",
);
filter
  .removeWords
  // remove mild words you’re OK with
  ();

export const isProfane = (text: string): boolean => {
  return filter.isProfane(text);
};

export const cleanText = (text: string): string => {
  return filter.clean(text);
};
