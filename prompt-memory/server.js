const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(process.env.PROMPT_DB || "prompt-memory.db");

app.use(cors());
app.use(express.json({ limit: "256kb" }));

db.exec(`
CREATE TABLE IF NOT EXISTS prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt TEXT NOT NULL,
  normalized_prompt TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  usage_count INTEGER DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_prompts_usage ON prompts(usage_count DESC);
`);

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\\s+/g, " ");
}

app.get("/api/prompt-memory", (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const rows = db.prepare(`
    SELECT id, prompt, created_at, updated_at, usage_count
    FROM prompts
    ORDER BY usage_count DESC, updated_at DESC
    LIMIT ?
  `).all(limit);

  res.json({ success: true, prompts: rows });
});

app.post("/api/prompt-memory", (req, res) => {
  const prompt = String(req.body?.prompt || "").trim();

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: "prompt is required"
    });
  }

  // Never store secrets accidentally.
  if (/(password|passwd|api[_ -]?key|secret|token|private[_ -]?key)\\s*[:=]/i.test(prompt)) {
    return res.status(400).json({
      success: false,
      error: "Potential secret detected; prompt was not stored."
    });
  }

  const normalized = normalize(prompt);

  const existing = db.prepare(
    "SELECT id FROM prompts WHERE normalized_prompt = ?"
  ).get(normalized);

  if (existing) {
    db.prepare(`
      UPDATE prompts
      SET usage_count = usage_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(existing.id);
  } else {
    db.prepare(`
      INSERT INTO prompts (prompt, normalized_prompt)
      VALUES (?, ?)
    `).run(prompt, normalized);
  }

  const saved = db.prepare(`
    SELECT id, prompt, created_at, updated_at, usage_count
    FROM prompts
    WHERE normalized_prompt = ?
  `).get(normalized);

  res.json({ success: true, prompt: saved });
});

app.delete("/api/prompt-memory/:id", (req, res) => {
  db.prepare("DELETE FROM prompts WHERE id = ?").run(Number(req.params.id));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Prompt Memory API running on port ${PORT}`);
});