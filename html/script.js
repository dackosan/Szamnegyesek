const API = "http://localhost:3000";

function tableGame(table) {
  const lastRow = table.length - 1;
  const lastCol = table[0].length - 1;

  const a = table[0][0];
  const b = table[0][lastCol];
  const c = table[lastRow][0];
  const d = table[lastRow][lastCol];

  if (
    a + b != table[0][1] ||
    a + c != table[1][0] ||
    a + b + c + d != table[1][1] ||
    b + d != table[1][2] ||
    c + d != table[lastRow][1]
  ) {
    return [-1];
  }
  return [a, b, c, d];
}

function setMessage(text, type = "info") {
  const msg = document.getElementById("msg");
  msg.textContent = text;
  msg.classList.remove("error", "ok");

  if (type === "error") msg.classList.add("error");
  if (type === "ok") msg.classList.add("ok");
}

function clearTableInputs() {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const el = document.getElementById(`cell-${r}-${c}`);
      if (el) el.value = "";
    }
  }
}

function readTableFromInputs() {
  const table = [];
  for (let r = 0; r < 3; r++) {
    const row = [];
    for (let c = 0; c < 3; c++) {
      const el = document.getElementById(`cell-${r}-${c}`);
      const value = Number(el.value);

      if (el.value.trim() === "" || Number.isNaN(value)) return null;

      row.push(value);
    }
    table.push(row);
  }
  return table;
}

async function fetchAllFours() {
  const res = await fetch(`${API}/fours`);
  if (!res.ok) throw new Error("Nem sikerült lekérni a négyeseket.");
  return await res.json();
}

async function saveFour(values) {
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
  return await res.json();
}

function renderList(items) {
  const ul = document.getElementById("list");

  if (!items || items.length === 0) {
    ul.innerHTML = `<li class="empty">Még nincs mentett számnégyes.</li>`;
    return;
  }

  ul.innerHTML = items
    .map(
      (x) => `
        <li class="listItem">
          <span class="badge">#${x.id}</span>
          <span class="values">[${x.a}, ${x.b}, ${x.c}, ${x.d}]</span>
          <button class="loadBtn" data-id="${x.id}">Betölt</button>
        </li>
      `,
    )
    .join("");
}

async function refreshList() {
  const data = await fetchAllFours();
  renderList(data);
}

async function onSave() {
  setMessage("");

  const table = readTableFromInputs();
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
    clearTableInputs();
    await refreshList();
  } catch (e) {
    setMessage(e.message, "error");
  }
}

function buildTableFromFour(a, b, c, d) {
  return [
    [a, a + b, b],
    [a + c, a + b + c + d, b + d],
    [c, c + d, d],
  ];
}

function fillInputsFromTable(table) {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const el = document.getElementById(`cell-${r}-${c}`);
      if (el) el.value = table[r][c];
    }
  }
}

function loadFourIntoGrid(four) {
  const table = buildTableFromFour(four.a, four.b, four.c, four.d);
  fillInputsFromTable(table);
  setMessage(`Betöltve: [${four.a}, ${four.b}, ${four.c}, ${four.d}]`, "ok");
}

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("saveBtn").addEventListener("click", onSave);
  document.getElementById("clearBtn").addEventListener("click", () => {
    clearTableInputs();
    setMessage("");
  });
  document.getElementById("refreshBtn").addEventListener("click", refreshList);

  try {
    await refreshList();
  } catch (e) {
    setMessage(e.message, "error");
  }
});

document.getElementById("list").addEventListener("click", async (e) => {
  const btn = e.target.closest(".loadBtn");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  if (Number.isNaN(id)) return;

  try {
    const res = await fetch(`${API}/fours/${id}`);
    if (!res.ok) throw new Error("Nem sikerült betölteni az elemet.");

    const four = await res.json();

    loadFourIntoGrid(four);
  } catch (err) {
    setMessage(err.message, "error");
  }
});
