import { useEffect, useState } from "react";
import "./App.css";
import type { Fours } from "./types/Fours";
import apiClient from "./apiClient/apiClient";
import { toast } from "react-toastify";

function App() {
  const [fours, setFours] = useState<Array<Fours>>([]);

  useEffect(() => {
    apiClient
      .get("/fours")
      .then((res) => setFours(res.data))
      .catch(() => toast.error("Sikertelen betöltés!"));
  }, []);

  return (
    <>
      <body>
        <header className="topbar">
          <h1>Számnégyesek</h1>
        </header>

        <main className="layout">
          <section className="panel leftPanel">
            <h2>Új tábla felvitele</h2>

            <div className="grid" aria-label="3x3 tábla">
              <input id="cell-0-0" type="number" inputMode="numeric" />
              <input id="cell-0-1" type="number" inputMode="numeric" />
              <input id="cell-0-2" type="number" inputMode="numeric" />

              <input id="cell-1-0" type="number" inputMode="numeric" />
              <input id="cell-1-1" type="number" inputMode="numeric" />
              <input id="cell-1-2" type="number" inputMode="numeric" />

              <input id="cell-2-0" type="number" inputMode="numeric" />
              <input id="cell-2-1" type="number" inputMode="numeric" />
              <input id="cell-2-2" type="number" inputMode="numeric" />
            </div>

            <div className="actions">
              <button id="saveBtn">Mentés</button>
              <button id="clearBtn" type="button">
                Nullázás
              </button>
            </div>

            <p id="msg" className="msg" role="status"></p>
          </section>

          <section className="panel">
            <div className="panelHead">
              <h2>Mentett számnégyesek</h2>
              <button id="refreshBtn" className="ghost" type="button">
                Frissítés
              </button>
            </div>

            <div id="listWrap" className="listWrap">
              <ul id="list" className="list"></ul>
            </div>
          </section>
        </main>
      </body>
    </>
  );
}

export default App;
