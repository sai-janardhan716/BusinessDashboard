const router = require("express").Router();
const db = require("../config/db");



router.post("/", async (req, res) => {
  const { client_name, deal_value, status, close_date } = req.body;

  await db.execute(
    "INSERT INTO sales (client_name, deal_value, status, close_date, company_id) VALUES (?,?,?,?,?)",
    [client_name, deal_value, status, close_date, req.user.company_id]
  );

  res.json({ message: "Deal added" });
});



router.get("/", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM sales WHERE company_id = ? ORDER BY close_date DESC",
    [req.user.company_id]
  );
  res.json(rows);
});



router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { client_name, deal_value, status, close_date } = req.body;

  await db.execute(
    "UPDATE sales SET client_name=?, deal_value=?, status=?, close_date=? WHERE id=? AND company_id=?",
    [client_name, deal_value, status, close_date, id, req.user.company_id]
  );

  res.json({ message: "Deal updated" });
});



router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await db.execute(
    "DELETE FROM sales WHERE id=? AND company_id=?",
    [id, req.user.company_id]
  );

  res.json({ message: "Deal deleted" });
});


module.exports = router;