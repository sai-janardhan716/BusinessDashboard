const router = require("express").Router();
const db = require("../config/db");


router.post("/", async (req, res) => {
  const { type, amount, description, date } = req.body;

  await db.execute(
    "INSERT INTO finance_transactions (type, amount, description, date, company_id) VALUES (?,?,?,?,?)",
    [type, amount, description, date, req.user.company_id],
  );

  res.json({ message: "Saved" });
});


router.get("/", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM finance_transactions WHERE company_id = ? ORDER BY date DESC",
    [req.user.company_id]
  );
  res.json(rows);
});


router.put("/:id", async (req, res) => {
  const { type, amount, date, description } = req.body;

  await db.execute(
    "UPDATE finance_transactions SET type=?, amount=?, date=?, description=? WHERE id=? AND company_id=?",
    [type, amount, date, description, req.params.id, req.user.company_id],
  );

  res.json({ message: "Updated" });
});


router.delete("/:id", async (req, res) => {
  await db.execute("DELETE FROM finance_transactions WHERE id=? AND company_id=?", [req.params.id, req.user.company_id]);

  res.json({ message: "Deleted" });
});

module.exports = router;
