import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://localhost:3000";

type Grid = string[][];

type FourRow = {
  id: number;
  a: number;
  b: number;
  c: number;
  d: number;
};

type MsgType = "info" | "ok" | "error";

function emptyGrid(): Grid {
  return Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => ""));
}

function tableGame(table: number[][]): number[] {
  const lastRow = table.length - 1;
  const lastCol = table[0].length - 1;

  const a = table[0][0];
  const b = table[0][lastCol];
  const c = table[lastRow][0];
  const d = table[lastRow][lastCol];

  if (
    a + b !== table[0][1] ||
    a + c !== table[1][0] ||
    a + b + c + d !== table[1][1] ||
    b + d !== table[1][2] ||
    c + d !== table[lastRow][1]
  ) {
    return [-1];
  }

  return [a, b, c, d];
}

function buildTableFromFour(
  a: number,
  b: number,
  c: number,
  d: number,
): number[][] {
  return [
    [a, a + b, b],
    [a + c, a + b + c + d, b + d],
    [c, c + d, d],
  ];
}

function inc2x2(table: number[][], block: "A" | "B" | "C" | "D"): number[][] {
  const t = table.map((r) => r.slice());

  const cells: Array<[number, number]> =
    block === "A"
      ? [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ]
      : block === "B"
        ? [
            [0, 1],
            [0, 2],
            [1, 1],
            [1, 2],
          ]
        : block === "C"
          ? [
              [1, 0],
              [1, 1],
              [2, 0],
              [2, 1],
            ]
          : [
              [1, 1],
              [1, 2],
              [2, 1],
              [2, 2],
            ];

  for (const [r, c] of cells) t[r][c] = t[r][c] + 1;
  return t;
}

export default function App() {
  const [grid, setGrid] = useState<Grid>(emptyGrid());
  const [items, setItems] = useState<FourRow[]>([]);
  const [msg, setMsg] = useState<{ text: string; type: MsgType }>({
    text: "",
    type: "info",
  });
  const [loading, setLoading] = useState<boolean>(false);

  const canSave = useMemo(
    () => grid.flat().every((v) => v.trim() !== ""),
    [grid],
  );

  function setMessage(text: string, type: MsgType = "info") {
    setMsg({ text, type });
  }

  function clearGrid() {
    setGrid(emptyGrid());
    setMessage("");
  }

  function onIncBlock(block: "A" | "B" | "C" | "D") {
    setMessage("");

    setGrid((prev) => {
      const numTable: number[][] = prev.map((row) =>
        row.map((v) => {
          const s = v.trim();
          if (s === "") return 0;
          const n = Number(s);
          return Number.isNaN(n) ? 0 : n;
        }),
      );

      const next = inc2x2(numTable, block);

      return next.map((row) => row.map((n) => String(n)));
    });
  }

  function updateCell(r: number, c: number, value: string) {
    setGrid((prev) => {
      const copy = prev.map((row) => row.slice());
      copy[r][c] = value;
      return copy;
    });
  }

  function parseGridToNumbersOrNull(): number[][] | null {
    const table: number[][] = [];
    for (let r = 0; r < 3; r++) {
      const row: number[] = [];
      for (let c = 0; c < 3; c++) {
        const raw = grid[r][c];
        if (raw.trim() === "") return null;

        const n = Number(raw);
        if (Number.isNaN(n)) return null;

        row.push(n);
      }
      table.push(row);
    }
    return table;
  }

  async function fetchAllFours(): Promise<FourRow[]> {
    const res = await fetch(`${API}/fours`);
    if (!res.ok) throw new Error("Nem sikerült lekérni a négyeseket.");
    return (await res.json()) as FourRow[];
  }

  async function fetchFourById(id: number): Promise<FourRow> {
    const res = await fetch(`${API}/fours/${id}`);
    if (!res.ok) throw new Error("Nem sikerült betölteni az elemet.");
    return (await res.json()) as FourRow;
  }

  async function saveFour(values: number[]): Promise<FourRow> {
    const res = await fetch(`${API}/fours`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    });

    if (res.status === 400) {
      const text = await res.text();
      throw new Error(text || "Invalid data");
    }

    if (res.status === 409) {
      throw new Error("Ez a számnégyes már létezik!");
    }

    if (!res.ok) {
      throw new Error("Szerver hiba mentés közben.");
    }

    return (await res.json()) as FourRow;
  }

  async function refreshList() {
    setLoading(true);
    try {
      const data = await fetchAllFours();
      setItems(data);
    } catch (e) {
      setMessage((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function onSave() {
    setMessage("");

    const table = parseGridToNumbersOrNull();
    if (!table) {
      setMessage("Minden mezőt tölts ki számokkal.", "error");
      return;
    }

    const result = tableGame(table);
    if (result.length === 1 && result[0] === -1) {
      setMessage("Csalni akarsz (a tábla nem konzisztens).", "error");
      return;
    }

    try {
      await saveFour(result);
      setMessage(`Mentve: [${result.join(", ")}]`, "ok");
      clearGrid();
      await refreshList();
    } catch (e) {
      setMessage((e as Error).message, "error");
    }
  }

  async function onLoad(id: number) {
    try {
      const four = await fetchFourById(id);
      const table = buildTableFromFour(four.a, four.b, four.c, four.d);

      setGrid(table.map((row) => row.map((n) => String(n))));
      setMessage(
        `Betöltve: [${four.a}, ${four.b}, ${four.c}, ${four.d}]`,
        "ok",
      );
    } catch (e) {
      setMessage((e as Error).message, "error");
    }
  }

  useEffect(() => {
    refreshList();
  }, []);

  return (
    <div className="page">
      <header className="topbar">
        <h1>Számnégyesek</h1>
      </header>

      <main className="layout">
        {/* BAL */}
        <section className="panel panelCenter">
          <h2>Új számnégyes felvitele</h2>

          <div className="grid" aria-label="3x3 tábla">
            {grid.map((row, r) =>
              row.map((val, c) => (
                <input
                  key={`${r}-${c}`}
                  type="number"
                  value={val}
                  onChange={(e) => updateCell(r, c, e.target.value)}
                  inputMode="numeric"
                />
              )),
            )}
          </div>

          <div className="actions">
            <button onClick={onSave} disabled={!canSave}>
              Mentés
            </button>
            <button className="ghost" onClick={clearGrid} type="button">
              Nullázás
            </button>
          </div>
          <div className="blockButtons">
            <button
              className="ghost"
              type="button"
              onClick={() => onIncBlock("A")}
            >
              A
            </button>
            <button
              className="ghost"
              type="button"
              onClick={() => onIncBlock("B")}
            >
              B
            </button>
            <button
              className="ghost"
              type="button"
              onClick={() => onIncBlock("C")}
            >
              C
            </button>
            <button
              className="ghost"
              type="button"
              onClick={() => onIncBlock("D")}
            >
              D
            </button>
          </div>

          <p className={`msg ${msg.type}`} role="status">
            {msg.text}
          </p>
        </section>

        {/* JOBB */}
        <section className="panel">
          <div className="panelHead">
            <h2>Mentett számnégyesek</h2>
            <button className="ghost" onClick={refreshList} type="button">
              Frissítés
            </button>
          </div>

          <div className="listWrap">
            {loading ? (
              <div className="empty">Betöltés…</div>
            ) : items.length === 0 ? (
              <div className="empty">Még nincs mentett számnégyes.</div>
            ) : (
              <ul className="list">
                {items.map((x) => (
                  <li className="listItem" key={x.id}>
                    <span className="badge">#{x.id}</span>
                    <span className="values">
                      [{x.a}, {x.b}, {x.c}, {x.d}]
                    </span>
                    <button
                      className="loadBtn"
                      onClick={() => onLoad(x.id)}
                      type="button"
                    >
                      Betölt
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
