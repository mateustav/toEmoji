import emojis from "emojilib";

function mapToEmoji(word: string): string {
  const foundMatches = Object.entries(emojis).filter(([, keywords]) =>
    keywords.includes(word.toLowerCase())
  );

  const randomIndex = Math.floor(Math.random() * foundMatches.length);

  return foundMatches.length > 0 && foundMatches[randomIndex]
    ? foundMatches[randomIndex][0]
    : word;
}

export function transformMessage(message: string): string {
  if (!message?.trim()) return "";

  const emojiPattern = /:\w+:/;
  const numberPattern = /\d/;
  const wordPattern = /\w+/gi;
  const tokenPattern = /:\w+:|\d|\w+|\W/g;

  const messageArray = message.match(tokenPattern);
  if (!messageArray) throw new Error("No message found");

  return messageArray
    .map((token) => {
      if (emojiPattern.test(token)) return token;
      const wordMatch = token.match(wordPattern) || token.match(numberPattern);
      const word = wordMatch?.[0];
      return word ? mapToEmoji(word) : token;
    })
    .join("");
}
