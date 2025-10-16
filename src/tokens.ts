export interface Token {
  letter: string;
  value: number;
  number: number;
  difficulty: number;
}

export const all_tokens: Token[] = [
  {"letter": "n", "value": 2, "number": 8, difficulty: 1},
  {"letter": "r", "value": 2, "number": 8, difficulty: 1},
  {"letter": "t", "value": 2, "number": 8, difficulty: 1},
  {"letter": "s", "value": 2, "number": 8, difficulty: 1},

  {"letter": "l", "value": 3, "number": 7, difficulty: 2},
  {"letter": "g", "value": 3, "number": 6, difficulty: 2},
  {"letter": "m", "value": 3, "number": 5, difficulty: 2},
  {"letter": "b", "value": 3, "number": 4, difficulty: 2},

  {"letter": "d", "value": 4, "number": 4, difficulty: 3},
  {"letter": "f", "value": 4, "number": 3, difficulty: 3},
  {"letter": "k", "value": 4, "number": 2, difficulty: 3},
  {"letter": "ck", "value": 4, "number": 2, difficulty: 3}, // replaced tokens

  {"letter": "st", "value": 4, "number": 2, difficulty: 3},
  {"letter": "ch", "value": 4, "number": 1, difficulty: 3},
  {"letter": "sch", "value": 4, "number": 1, difficulty: 3},

  {"letter": "p", "value": 5, "number": 2, difficulty: 4},
  {"letter": "z", "value": 5, "number": 1, difficulty: 4},
  {"letter": "w", "value": 5, "number": 1, difficulty: 4},
  {"letter": "v", "value": 5, "number": 1, difficulty: 4},

  {"letter": "*", "value": 1, "number": 1, difficulty: 0}, // reduced to only 1 as its value is random from 1-5
];
