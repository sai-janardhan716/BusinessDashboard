const router = require("express").Router();
const db = require("../config/db");

// add transaction
router.post("/", async (req, res) => {
  const { type, amount, description, date } = req.body;

  await db.execute(
    "INSERT INTO finance_transactions (type, amount, description, date) VALUES (?,?,?,?)",
    [type, amount, description, date],
  );

  res.json({ message: "Saved" });
});

// get all
router.get("/", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM finance_transactions ORDER BY date DESC",
  );
  res.json(rows);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const { type, amount, date, description } = req.body;

  await db.execute(
    "UPDATE finance_transactions SET type=?, amount=?, date=?, description=? WHERE id=?",
    [type, amount, date, description, req.params.id],
  );

  res.json({ message: "Updated" });
});

// DELETE
router.delete("/:id", async (req, res) => {
  await db.execute("DELETE FROM finance_transactions WHERE id=?", [req.params.id]);

  res.json({ message: "Deleted" });
});

module.exports = router;
