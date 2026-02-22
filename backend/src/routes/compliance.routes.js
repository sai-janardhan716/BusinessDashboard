const router = require("express").Router();
const db = require("../config/db");


router.post("/", async (req, res) => {
  const { doc_name, type, due_date, status } = req.body;

  await db.execute(
    "INSERT INTO compliance (doc_name,type,due_date,status) VALUES (?,?,?,?)",
    [doc_name, type, due_date, status],
  );

  res.json({ message: "Compliance added" });
});


router.get("/", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM compliance ORDER BY due_date");
  res.json(rows);
});


router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { doc_name, type, due_date, status } = req.body;

  await db.execute(
    "UPDATE compliance SET doc_name=?, type=?, due_date=?, status=? WHERE id=?",
    [doc_name, type, due_date, status, id],
  );

  res.json({ message: "Compliance updated" });
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await db.execute("DELETE FROM compliance WHERE id=?", [id]);

  res.json({ message: "Compliance deleted" });
});

module.exports = router;
