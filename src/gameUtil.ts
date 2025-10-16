import {Token} from './tokens';

export function checkWord(dictionary: Set<string>, tokens: Token[], word: string) {
  const tokensReversed = [...tokens].reverse();
  const checkWordOneWayResultForward = checkWordOneWay(tokens, word);
  let checkWordOneWayResultReversed = checkWordOneWay(tokensReversed, word);

  // If both are false, return false
  if (!checkWordOneWayResultForward.found && !checkWordOneWayResultReversed.found) return false;

  word = word.toLowerCase();
  word = word.trim();

  // check word in dictionary
  if (!dictionary.has(word)) {
    return false;
  }

  return Math.max(checkWordOneWayResultReversed.points, checkWordOneWayResultForward.points); // Return points used
}

function checkWordOneWay(tokens: Token[], word: string) {
  word = word.toLowerCase();
  word = word.trim();

  if (word.length === 0) return {found: false, points: 0};

  word = word.replace("ß", "ss"); // Replace sharp S with ss

  for (let i = tokens.length; i > 0; i--) {
    let points = 0;

    let regex = "^";
    let numberOfCapturingGroups = 1;
    for (let j = 0; j < i; j++) {
      let token = tokens[j];
      let tokenLetter = token.letter;
      points += token.value;

      if (tokenLetter === "*") {
        regex += "(?:sch|ch|st|ck|([bcdfghjklmnpqrstvwxyz])\\" + numberOfCapturingGroups + "*)";
        numberOfCapturingGroups++;
      } else {
        regex += "(?:" + tokenLetter + ")";
        if (tokenLetter.length == 1) regex += "+";
      }
      regex += "(:?[aeiouäöü]*)"; // Allow vowels between consonants
      numberOfCapturingGroups++;
    }
    regex += "$";

    const pattern = new RegExp(regex);
    const isMatch = pattern.test(word);

    if (isMatch) return {found: true, points: points}; // Return points and the number of tokens used
  }

  return {found: false, points: 0}; // No match found
}
