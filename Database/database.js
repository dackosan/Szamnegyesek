import Database from "better-sqlite3";

const db = new Database("./Database/database.sqlite");

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS fours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  a INTEGER NOT NULL,
  b INTEGER NOT NULL,
  c INTEGER NOT NULL,
  d INTEGER NOT NULL,
  UNIQUE(a, b, c, d)
);
  `,
).run();

export const getAllFours = () => db.prepare("SELECT * FROM fours").all();

export const getFoursById = (id) =>
  db.prepare("SELECT * FROM fours WHERE id = ?").get(id);

export const saveFours = (a, b, c, d) => {
  const info = db
    .prepare("INSERT INTO fours (a,b,c,d) VALUES (?,?,?,?)")
    .run(a, b, c, d);
  return db
    .prepare("SELECT * FROM fours WHERE id = ?")
    .get(info.lastInsertRowid);
};

export const deleteFours = (id) =>
  db.prepare("DELETE FROM fours WHERE id = ? ").run(id);

export default db;
