import {Component, inject, OnInit, signal} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {all_tokens, allowedLetters, Token} from '../tokens';
import {checkWord} from '../gameUtil';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  httpClient = inject(HttpClient);

  dictLoaded = false;
  dictionary!: Set<string>;

  suggestedWords: {word: string, points: number}[] = [];
  enteredLetters: string = "";

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
      && this.form.valid
      && this.form.value.letter1
      && this.form.value.letter2
      && this.form.value.letter3
      && this.form.value.letter4;
  }

  generate() {
    // get tokens from letters
    let tokens = this.generateTokens();
    if (!tokens) {
      return;
    }
    // then try every word in dict
    let words = Array.from(this.dictionary)
      .map(w => ({word: w, points: checkWord(this.dictionary, tokens, w)}))
      .filter(w => w.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
    // sort output + trim
    console.log(words);
    this.suggestedWords = words;
    this.enteredLetters = tokens.map(t => t.letter).join("");
    // clear input
    this.form.reset();
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
