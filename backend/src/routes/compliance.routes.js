const router = require("express").Router();
const db = require("../config/db");


router.post("/", async (req, res) => {
  const { doc_name, type, due_date, status } = req.body;

  await db.execute(
    "INSERT INTO compliance (doc_name,type,due_date,status,company_id) VALUES (?,?,?,?,?)",
    [doc_name, type, due_date, status, req.user.company_id],
  );

  res.json({ message: "Compliance added" });
});


router.get("/", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM compliance WHERE company_id = ? ORDER BY due_date", [req.user.company_id]);
  res.json(rows);
});


router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { doc_name, type, due_date, status } = req.body;

  await db.execute(
    "UPDATE compliance SET doc_name=?, type=?, due_date=?, status=? WHERE id=? AND company_id=?",
    [doc_name, type, due_date, status, id, req.user.company_id],
  );

  res.json({ message: "Compliance updated" });
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await db.execute("DELETE FROM compliance WHERE id=? AND company_id=?", [id, req.user.company_id]);

  res.json({ message: "Compliance deleted" });
});

module.exports = router;
