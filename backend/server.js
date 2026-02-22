require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/auth.routes");
const financeRoutes = require("./src/routes/finance.routes");
const empRoutes = require("./src/routes/employees.routes");
const salesRoutes = require("./src/routes/sales.routes");
const marketingRoutes = require("./src/routes/marketing.routes");
const productRoutes = require("./src/routes/product.routes");
const complianceRoutes = require("./src/routes/compliance.routes");
const operationsRoutes = require("./src/routes/operations.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/finance", financeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employees", empRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/marketing", marketingRoutes);
app.use("/api/product", productRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/operations", operationsRoutes);

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.listen(5000, () => {
  console.log("Server started on http://localhost:5000");
});