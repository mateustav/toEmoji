import emojis from "emojilib";
import emojiRegex from "emoji-regex";

const emojiRegexp = emojiRegex();
const slackmojiRegexp = /:\w+:/;
const numberRegexp = /\d/;
const wordRegexp = /\w+/gi;
const tokenRegexp = /:\w+:|\d|\w+|\W/g;

function isEmoji(str: string) {
  return emojiRegexp.test(str);
}

function mapToEmoji(word: string, customEmojis: string[]): string {
  const combinedEmojis: Record<string, string[]> = { ...emojis };
  customEmojis.forEach((emoji) => {
    combinedEmojis[emoji] = [emoji];
  });

  const foundMatches = Object.entries(combinedEmojis).filter(([, keywords]) =>
    keywords.includes(word.toLowerCase())
  );

  const randomIndex = Math.floor(Math.random() * foundMatches.length);

  if (foundMatches.length === 0 || !foundMatches[randomIndex]) return word;

  const match = foundMatches[randomIndex][0];

  return isEmoji(match) ? match : `:${match}:`;
}

export function transformMessage(
  message: string,
  customEmojis: string[]
): string {
  if (!message?.trim()) return "";

  const messageArray = message.match(tokenRegexp);
  if (!messageArray) throw new Error("No message found");

  return messageArray
    .map((token) => {
      if (slackmojiRegexp.test(token)) return token;
      const wordMatch = token.match(wordRegexp) || token.match(numberRegexp);
      const word = wordMatch?.[0];
      return word ? mapToEmoji(word, customEmojis) : token;
    })
    .join("");
}
