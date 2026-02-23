const router = require("express").Router();
const db = require("../config/db");


router.post("/", async (req, res) => {
  const { campaign_name, channel, spend, leads, conversions, start_date } =
    req.body;

  await db.execute(
    "INSERT INTO marketing (campaign_name,channel,spend,leads,conversions,start_date,company_id) VALUES (?,?,?,?,?,?,?)",
    [campaign_name, channel, spend, leads, conversions, start_date, req.user.company_id],
  );

  res.json({ message: "Campaign added" });
});


router.get("/", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM marketing WHERE company_id = ? ORDER BY start_date DESC",
    [req.user.company_id]
  );
  res.json(rows);
});


router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { campaign_name, channel, spend, leads, conversions, start_date } =
    req.body;

  await db.execute(
    "UPDATE marketing SET campaign_name=?, channel=?, spend=?, leads=?, conversions=?, start_date=? WHERE id=? AND company_id=?",
    [campaign_name, channel, spend, leads, conversions, start_date, id, req.user.company_id],
  );

  res.json({ message: "Campaign updated" });
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await db.execute("DELETE FROM marketing WHERE id=? AND company_id=?", [id, req.user.company_id]);

  res.json({ message: "Campaign deleted" });
});

module.exports = router;
