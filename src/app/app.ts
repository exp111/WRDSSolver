import {Component, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {all_tokens, Token} from '../tokens';
import {checkWord} from '../gameUtil';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  httpClient = inject(HttpClient);

  dictLoaded = false;
  dictionary!: Set<string>;

  letter1 = "";
  letter2 = "";
  letter3 = "";
  letter4 = "";

  constructor() {
    (window as any).app = this;
  }

  ngOnInit(): void {
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
    return this.dictLoaded && this.letter1 && this.letter2 && this.letter3 && this.letter4;
  }

  generate() {
    // get tokens from letters
    let tokens = this.generateTokens();
    if (!tokens) {
      return;
    }
    // then try every word in dict
    let words = Object.values(this.dictionary).map(w => checkWord(this.dictionary, tokens, w))
      .filter(w => w !== false)
      .sort();
    // sort output + trim
    console.log(words);
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
      this.findToken(this.letter1),
      this.findToken(this.letter2),
      this.findToken(this.letter3),
      this.findToken(this.letter4),
    ];
    if (tokens.includes(null)) {
      return null;
    }
    return tokens as Token[];
  }

  findToken(letter: string) {
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
