import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {all_tokens, allowedLetters, Token} from '../tokens';
import {checkWord} from '../gameUtil';

export type GenerateMessage = {
  tokens: Token[],
  dictionary: Set<string>
};

export type GenerateMessageResult = {
  words: Suggestion[]
};

export type Suggestion = {
  word: string,
  points: number
};

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  httpClient = inject(HttpClient);
  changeDetector = inject(ChangeDetectorRef);

  dictLoaded = false;
  dictionary!: Set<string>;

  suggestedWords: Suggestion[] = [];
  enteredLetters: string = "";

  generating = false;
  worker: Worker | undefined;

  letterValidator = (c: AbstractControl) => {
    return !c.value || allowedLetters.includes(c.value?.toLowerCase()) ? null : {invalidLetter: c.value};
  }

  form = new FormGroup({
    letter1: new FormControl("", this.letterValidator),
    letter2: new FormControl("", this.letterValidator),
    letter3: new FormControl("", this.letterValidator),
    letter4: new FormControl("", this.letterValidator),
  });

  constructor() {
    (window as any).app = this;
  }

  ngOnInit() {
    this.loadDictionary();
  }

  loadDictionary() {
    this.httpClient.get("dictionary-de.txt", {responseType: 'text'}).subscribe({
      next: dict => {
        this.dictLoaded = true;
        const words = dict.split("\n").map(w => w.trim().toLowerCase());

        this.dictionary = new Set(words);
        console.log("dict loaded");
      },
      error: err => {
        this.dictLoaded = false;
        console.error("Could not load dictionary");
        console.error(err);
      }
    });
  }

  canGenerate() {
    return this.dictLoaded
      && !this.generating
      && this.form.valid
      && this.form.value.letter1
      && this.form.value.letter2
      && this.form.value.letter3
      && this.form.value.letter4;
  }

  async generate() {
    // get tokens from letters
    let tokens = this.generateTokens();
    if (!tokens) {
      return;
    }

    this.generating = true;
    // create worker
    this.worker = new Worker(new URL("generate.worker", import.meta.url));
    // result handler
    this.worker.onmessage = (ev: MessageEvent<GenerateMessageResult>) => {
      this.generating = false;
      // save results
      console.log(ev.data.words);
      this.suggestedWords = ev.data.words;
      this.enteredLetters = tokens.map(t => t.letter).join("");
      // clear input
      this.form.reset();
    }
    // send job to worker
    this.worker.postMessage({ dictionary: this.dictionary, tokens: tokens });
  }

  checkWord(word: string) {
    let tokens = this.generateTokens();
    if (!tokens) {
      return -1;
    }
    return checkWord(this.dictionary, tokens, word);
  }

  // get tokens from letters
  generateTokens() {
    let tokens = [
      this.findToken(this.form.value.letter1),
      this.findToken(this.form.value.letter2),
      this.findToken(this.form.value.letter3),
      this.findToken(this.form.value.letter4),
    ];
    if (tokens.includes(null)) {
      return null;
    }
    return tokens as Token[];
  }

  findToken(letter: string | null | undefined) {
    if (!letter) {
      return null;
    }
    let lowercaseLetter = letter.toLowerCase();
    for (let token of all_tokens) {
      if (token.letter == lowercaseLetter) {
        return token;
      }
    }
    console.error(`No token found for letter ${letter}`);
    return null;
  }
}
