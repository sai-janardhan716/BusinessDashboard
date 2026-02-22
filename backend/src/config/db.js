const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "10616914@Gps",
  database: "startup_dashboard"
});

module.exports = pool;