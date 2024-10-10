import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { initializeApp } from "firebase/app";
import * as XLSX from "xlsx/xlsx.mjs";
import * as FileSaver from "file-saver";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  data: any = [];
  pokemons: any[] = [];
  rows: any[] = [];
  showTable = false;
  worker: Worker | undefined;
  timeSpentInApp: any = "0";

  constructor(private http: HttpClient) {
    this.fetchData();
  }

  firebaseConfig = {
    // ...
  };

  app = initializeApp(this.firebaseConfig);

  navigateToNewPage() {
    this.showTable = !this.showTable;

    if (this.showTable) {
      this.rows = []; // Clear previous data to prevent duplication

      const requests = [];
      for (let i = 1; i <= 200; i++) {
        const randomNum = Math.floor(Math.random() * 500) + 1;
        requests.push(
          this.http.get(`https://pokeapi.co/api/v2/pokemon/${randomNum}`)
        );
      }

      forkJoin(requests).subscribe((responses: any[]) => {
        this.rows = responses.map((response) => ({
          name: response.name,
          height: response.height,
          weight: response.weight,
          rank: response.id,
        }));
      });
    }
  }

  download() {
    const ws = XLSX.utils.json_to_sheet(this.rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    FileSaver.saveAs(blob, "pokemons.csv");
  }

  ngOnInit() {
    if (typeof Worker !== "undefined") {
      this.worker = new Worker(
        new URL("./utils/timer.worker", import.meta.url)
      );
      this.worker.postMessage("start");
      this.worker.onmessage = ({ data }) => {
        this.timeSpentInApp = data;
      };
    } else {
      console.warn("Web Workers are not supported in your browser.");
    }
  }

  ngOnDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
  }

  onActivate(event) {
    console.log("Activate Event", event);
    if (event.type == "click") {
      this.http
        .get(`https://pokeapi.co/api/v2/pokemon/${event.row.rank}`)
        .subscribe((response: any) => {
          console.log("Pokemon Details", response);
          let moves = response.moves.map((move) => {
            return move.move.name;
          });

          alert(`Moves:\n ${moves.join(", \n")}`);
        });
    }
  }

  fetchData() {
    this.http
      .get("https://jsonplaceholder.typicode.com/posts")
      .subscribe((response) => {
        this.data = response;
      });
  }
}
