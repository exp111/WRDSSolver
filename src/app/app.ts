import {Component, inject, OnInit, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('WRDSSolver');
  httpClient = inject(HttpClient);

  dictLoaded = false;
  dictionary: Set<string> | null = null;

  letter1 = "";
  letter2 = "";
  letter3 = "";
  letter4 = "";

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
}
