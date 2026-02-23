const router = require("express").Router();
const db = require("../config/db");



router.post("/", async (req, res) => {
  const { item_name, category, status, owner } = req.body;

  await db.execute(
    "INSERT INTO operations (item_name,category,status,owner,company_id) VALUES (?,?,?,?,?)",
    [item_name, category, status, owner, req.user.company_id]
  );

  res.json({ message: "Operation added" });
});



router.get("/", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM operations WHERE company_id = ? ORDER BY created_at DESC",
    [req.user.company_id]
  );
  res.json(rows);
});



router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { item_name, category, status, owner } = req.body;

  await db.execute(
    "UPDATE operations SET item_name=?, category=?, status=?, owner=? WHERE id=? AND company_id=?",
    [item_name, category, status, owner, id, req.user.company_id]
  );

  res.json({ message: "Operation updated" });
});



router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await db.execute(
    "DELETE FROM operations WHERE id=? AND company_id=?",
    [id, req.user.company_id]
  );

  res.json({ message: "Operation deleted" });
});

module.exports = router;