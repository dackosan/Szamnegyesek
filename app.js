import express from "express";
import {
  getAllFours,
  getFoursById,
  saveFours,
  deleteFours,
} from "./Database/database.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

function parseFour(body) {
  if (Array.isArray(body?.values)) {
    if (body.values.length !== 4) return null;

    const nums = body.values.map(Number);
    if (nums.some((n) => Number.isNaN(n))) return null;

    return { a: nums[0], b: nums[1], c: nums[2], d: nums[3] };
  }

  const { a, b, c, d } = body ?? {};
  const nums = [a, b, c, d].map(Number);

  if (nums.length !== 4) return null;

  if (nums.some((n) => Number.isNaN(n))) return null;

  return { a: nums[0], b: nums[1], c: nums[2], d: nums[3] };
}

app.get("/fours", (req, res) => {
  const rows = getAllFours();
  return res.status(200).json(rows);
});

app.get("/fours/:id", (req, res) => {
  const row = getFoursById(+req.params.id);
  if (!row) return res.status(404).json({ message: "Fours not found!" });
  return res.status(200).json(row);
});

app.post("/fours", (req, res) => {
  const four = parseFour(req.body);
  if (!four) return res.status(400).send("Invalid data");

  try {
    const newRow = saveFours(four.a, four.b, four.c, four.d);
    return res.status(201).json(newRow);
  } catch (e) {
    if (String(e).includes("UNIQUE"))
      return res.status(409).json({ message: "Already exists" });
    return res.status(500).json({ message: "Server error" });
  }
});

app.delete("/fours/:id", (req, res) => {
  const row = getFoursById(+req.params.id);
  if (!row) return res.status(404).json({ message: "Fours not found!" });

  deleteFours(row.id);
  return res.status(200).json({ message: "Fours deleted!" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
