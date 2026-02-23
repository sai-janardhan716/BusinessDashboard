const router = require("express").Router();
const db = require("../config/db");


router.post("/", async (req, res) => {
  const { feature_name, type, status, priority, owner } = req.body;

  await db.execute(
    "INSERT INTO product (feature_name,type,status,priority,owner,company_id) VALUES (?,?,?,?,?,?)",
    [feature_name, type, status, priority, owner, req.user.company_id],
  );

  res.json({ message: "Product item added" });
});


router.get("/", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM product WHERE company_id = ? ORDER BY created_at DESC",
    [req.user.company_id]
  );
  res.json(rows);
});


router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { feature_name, type, status, priority, owner } = req.body;

  await db.execute(
    "UPDATE product SET feature_name=?, type=?, status=?, priority=?, owner=? WHERE id=? AND company_id=?",
    [feature_name, type, status, priority, owner, id, req.user.company_id],
  );

  res.json({ message: "Product updated" });
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await db.execute("DELETE FROM product WHERE id=? AND company_id=?", [id, req.user.company_id]);

  res.json({ message: "Product deleted" });
});

module.exports = router;
