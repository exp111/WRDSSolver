import {Token} from './tokens';

export function checkWord(dictionary: Set<string>, tokens: Token[], word: string) {
  const tokensReversed = [...tokens].reverse();
  const sanitized = word.toLowerCase().trim();
  const forward = checkWordOneWay(tokens, sanitized);
  const reversed = checkWordOneWay(tokensReversed, sanitized);
  // If both are false, return false
  if (!forward.found && !reversed.found) {
    return false;
  }

  // check word in dictionary
  if (!dictionary.has(sanitized)) {
    return false;
  }

  return Math.max(reversed.points, forward.points); // Return points used
}

function checkWordOneWay(tokens: Token[], word: string) {
  let editedWord = word.toLowerCase().trim();
  if (editedWord.length === 0) {
    return {found: false, points: 0};
  }
  editedWord = editedWord.replace("ß", "ss"); // Replace sharp S with ss

  for (let i = tokens.length; i > 0; i--) {
    let points = 0;

    // build regex for tokens
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
    const isMatch = pattern.test(editedWord);

    if (isMatch) {
      return {found: true, points: points};
    }
  }

  return {found: false, points: 0}; // No match found
}
