/// <reference lib="webworker" />

import {Token} from '../tokens';
import {checkWord} from '../gameUtil';
import {GenerateMessage, GenerateMessageResult, Suggestion} from './app';

addEventListener('message', (ev: MessageEvent<GenerateMessage>) => {
  const result = generateWords(ev.data.dictionary, ev.data.tokens);
  postMessage({words: result} as GenerateMessageResult);
});

function generateWords(dictionary: Set<string>, tokens: Token[]): Suggestion[] {
  // then try every word in dict
  return Array.from(dictionary)
    .map(w => ({word: w, points: checkWord(dictionary, tokens, w)}))
    // sort output + trim
    .filter(w => w.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);
}
