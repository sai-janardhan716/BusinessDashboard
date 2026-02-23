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

const auth = require("./src/middleware/auth.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// Protected data routes
app.use("/api/finance", auth, financeRoutes);
app.use("/api/employees", auth, empRoutes);
app.use("/api/sales", auth, salesRoutes);
app.use("/api/marketing", auth, marketingRoutes);
app.use("/api/product", auth, productRoutes);
app.use("/api/compliance", auth, complianceRoutes);
app.use("/api/operations", auth, operationsRoutes);

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.listen(5000, () => {
  console.log("Server started on http://localhost:5000");
});