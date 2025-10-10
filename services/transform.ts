const emojis = ["lorem", "not", "five", "aldus", "industry", "desktop"];

export function transformMessage(message: string): string {
  const messageArray = message.match(/:\w+:|\w+|\W/g);
  if (!messageArray) throw new Error("No message found");

  return messageArray.reduce((acc, currentValue) => {
    const alreadyAnEmoji = currentValue.match(/:\w+:/);
    const matchedWord = currentValue.toLowerCase().match(/\w+/);
    const emojiExists = matchedWord && emojis.includes(matchedWord[0]);
    const transformedValue =
      !alreadyAnEmoji && matchedWord && emojiExists
        ? `:${matchedWord[0]}:`
        : currentValue;
    return acc + transformedValue;
  }, "");
}
