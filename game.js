async function loadDict() {
    const response = await fetch("./assets/dictionary-de.txt");
    if (!response.ok) throw new Error('Network response was not ok');
    
    const text = await response.text();
    const words = text.split("\n").map(w => w.trim().toLowerCase());
    
    dictionary = new Set(words);
    console.log("dict loaded");
}

async function checkWord(tokens, word) {
    const tokensReversed = [...tokens].reverse();
    const checkWordOneWayResultForward = checkWordOneWay(tokens, word);
    let checkWordOneWayResultReversed = checkWordOneWay(tokensReversed, word);
    checkWordOneWayResultReversed = checkWordOneWayResultReversed && [checkWordOneWayResultReversed[0], -checkWordOneWayResultReversed[1]]; // Negate the used tokens for reversed


    // If both are false, return false
    if (!checkWordOneWayResultForward && !checkWordOneWayResultReversed) return false;

    let pointsAndUsedTokens;
    if (checkWordOneWayResultForward && checkWordOneWayResultReversed) {
        // Compare usedTokens to choose the better one
        pointsAndUsedTokens = checkWordOneWayResultReversed[0] > checkWordOneWayResultForward[0] ? checkWordOneWayResultReversed : checkWordOneWayResultForward;
    } else {
        // Only one is valid
        pointsAndUsedTokens = checkWordOneWayResultForward || checkWordOneWayResultReversed;
    }

    word = word.toLowerCase();
    word = word.trim();

    wordCheck = dictionary.has(word);

    if (wordCheck) {
        logout("The word matches the pattern and is in the dictionary.");
        return pointsAndUsedTokens; // Return points and the number of tokens used
    }
    
    return false;
}

function checkWordOneWay(tokens, word) {
    word = word.toLowerCase();
    word = word.trim();

    if (word.length === 0) return false;

    word = word.replace("ß", "ss"); // Replace sharp S with ss

    logout("Checking word:", word);

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
        logout("Generated regex:", regex);
        
        const pattern = new RegExp(regex);
        const isMatch = pattern.test(word);
        logout("Does the word match the pattern?", isMatch);
        
        if (isMatch) return [points, i]; // Return points and the number of tokens used
    }

    return false; // No match found
}