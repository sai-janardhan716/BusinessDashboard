const router = require("express").Router();
const db = require("../config/db");

// CREATE
router.post("/", async (req, res) => {
  const { campaign_name, channel, spend, leads, conversions, start_date } =
    req.body;

  await db.execute(
    "INSERT INTO marketing (campaign_name,channel,spend,leads,conversions,start_date) VALUES (?,?,?,?,?,?)",
    [campaign_name, channel, spend, leads, conversions, start_date],
  );

  res.json({ message: "Campaign added" });
});

// GET
router.get("/", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM marketing ORDER BY start_date DESC",
  );
  res.json(rows);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { campaign_name, channel, spend, leads, conversions, start_date } =
    req.body;

  await db.execute(
    "UPDATE marketing SET campaign_name=?, channel=?, spend=?, leads=?, conversions=?, start_date=? WHERE id=?",
    [campaign_name, channel, spend, leads, conversions, start_date, id],
  );

  res.json({ message: "Campaign updated" });
});

// DELETE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await db.execute("DELETE FROM marketing WHERE id=?", [id]);

  res.json({ message: "Campaign deleted" });
});

module.exports = router;
