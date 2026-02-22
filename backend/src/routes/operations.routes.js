const router = require("express").Router();
const db = require("../config/db");


// CREATE
router.post("/", async (req, res) => {
  const { item_name, category, status, owner } = req.body;

  await db.execute(
    "INSERT INTO operations (item_name,category,status,owner) VALUES (?,?,?,?)",
    [item_name, category, status, owner]
  );

  res.json({ message: "Operation added" });
});


// GET
router.get("/", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM operations ORDER BY created_at DESC"
  );
  res.json(rows);
});


// UPDATE
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { item_name, category, status, owner } = req.body;

  await db.execute(
    "UPDATE operations SET item_name=?, category=?, status=?, owner=? WHERE id=?",
    [item_name, category, status, owner, id]
  );

  res.json({ message: "Operation updated" });
});


// DELETE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await db.execute(
    "DELETE FROM operations WHERE id=?",
    [id]
  );

  res.json({ message: "Operation deleted" });
});

module.exports = router;