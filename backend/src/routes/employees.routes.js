const router = require("express").Router();
const db = require("../config/db");

// add employee
router.post("/", async (req, res) => {
  const { name, email, department, role, joined } = req.body;

  await db.execute(
    "INSERT INTO employees (name,email,department,role,joined) VALUES (?,?,?,?,?)",
    [name, email, department, role, joined],
  );

  res.json({ message: "Employee added" });
});

// list
router.get("/", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM employees ORDER BY joined DESC",
  );
  res.json(rows);
});
router.put("/:id", async (req, res) => {
  const { name, email, department, role, joined } = req.body;

  await db.execute(
    "UPDATE employees SET name=?, email=?, department=?, role=?, joined=? WHERE id=?",
    [name, email, department, role, joined, req.params.id],
  );

  res.json({ message: "Employee updated" });
});

// DELETE EMPLOYEE
router.delete("/:id", async (req, res) => {
  await db.execute("DELETE FROM employees WHERE id=?", [req.params.id]);

  res.json({ message: "Employee deleted" });
});
module.exports = router;
