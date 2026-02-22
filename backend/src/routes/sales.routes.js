const router = require("express").Router();
const db = require("../config/db");


// CREATE DEAL
router.post("/", async (req, res) => {
  const { client_name, deal_value, status, close_date } = req.body;

  await db.execute(
    "INSERT INTO sales (client_name, deal_value, status, close_date) VALUES (?,?,?,?)",
    [client_name, deal_value, status, close_date]
  );

  res.json({ message: "Deal added" });
});


// GET ALL DEALS
router.get("/", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM sales ORDER BY close_date DESC"
  );
  res.json(rows);
});


// UPDATE DEAL
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { client_name, deal_value, status, close_date } = req.body;

  await db.execute(
    "UPDATE sales SET client_name=?, deal_value=?, status=?, close_date=? WHERE id=?",
    [client_name, deal_value, status, close_date, id]
  );

  res.json({ message: "Deal updated" });
});


// DELETE DEAL
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await db.execute(
    "DELETE FROM sales WHERE id=?",
    [id]
  );

  res.json({ message: "Deal deleted" });
});


module.exports = router;