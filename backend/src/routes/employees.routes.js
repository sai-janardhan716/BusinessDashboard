const router = require("express").Router();
const db = require("../config/db");


router.post("/", async (req, res) => {
  const { name, email, department, role, joined } = req.body;

  await db.execute(
    "INSERT INTO employees (name,email,department,role,joined,company_id) VALUES (?,?,?,?,?,?)",
    [name, email, department, role, joined, req.user.company_id],
  );

  res.json({ message: "Employee added" });
});


router.get("/", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM employees WHERE company_id = ? ORDER BY joined DESC",
    [req.user.company_id]
  );
  res.json(rows);
});
router.put("/:id", async (req, res) => {
  const { name, email, department, role, joined } = req.body;

  await db.execute(
    "UPDATE employees SET name=?, email=?, department=?, role=?, joined=? WHERE id=? AND company_id=?",
    [name, email, department, role, joined, req.params.id, req.user.company_id],
  );

  res.json({ message: "Employee updated" });
});


router.delete("/:id", async (req, res) => {
  await db.execute("DELETE FROM employees WHERE id=? AND company_id=?", [req.params.id, req.user.company_id]);

  res.json({ message: "Employee deleted" });
});
module.exports = router;
