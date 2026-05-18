export function wordsWithVisibleChars(phrase: string, typedCount: number) {
  const words = phrase.split(" ");
  let remaining = typedCount;
  return words.map((word, i) => {
    if (i > 0) {
      if (remaining <= 0) {
        return { word, shown: "" };
      }
      remaining -= 1;
    }
    const shownLen = Math.max(0, Math.min(word.length, remaining));
    remaining = Math.max(0, remaining - word.length);
    return { word, shown: word.slice(0, shownLen) };
  });
}
