const router = require("express").Router();
const db = require("../config/db");

// CREATE
router.post("/", async (req, res) => {
  const { feature_name, type, status, priority, owner } = req.body;

  await db.execute(
    "INSERT INTO product (feature_name,type,status,priority,owner) VALUES (?,?,?,?,?)",
    [feature_name, type, status, priority, owner],
  );

  res.json({ message: "Product item added" });
});

// GET
router.get("/", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM product ORDER BY created_at DESC",
  );
  res.json(rows);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { feature_name, type, status, priority, owner } = req.body;

  await db.execute(
    "UPDATE product SET feature_name=?, type=?, status=?, priority=?, owner=? WHERE id=?",
    [feature_name, type, status, priority, owner, id],
  );

  res.json({ message: "Product updated" });
});

// DELETE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await db.execute("DELETE FROM product WHERE id=?", [id]);

  res.json({ message: "Product deleted" });
});

module.exports = router;
