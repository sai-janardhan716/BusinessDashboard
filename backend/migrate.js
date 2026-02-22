const mysql = require("mysql2/promise");

(async () => {
  const pool = await mysql.createPool({
    host: "localhost",
    user: "root",
    password: "10616914@Gps",
    database: "startup_dashboard",
  });


  const [cols] = await pool.execute(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='startup_dashboard' AND TABLE_NAME='users'"
  );
  const colNames = cols.map((c) => c.COLUMN_NAME);
  console.log("Before migration:", colNames.join(", "));


  if (colNames.includes("password_hash") && !colNames.includes("password")) {
    await pool.execute("ALTER TABLE users CHANGE COLUMN password_hash password VARCHAR(255) NOT NULL");
    console.log("✓ Renamed password_hash → password");
  } else if (colNames.includes("password")) {
    console.log("• password column already exists");
  }


  if (!colNames.includes("role")) {
    await pool.execute("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'Founder'");
    console.log("✓ Added role column");

    if (colNames.includes("role_id")) {
      try {
        await pool.execute("UPDATE users u JOIN roles r ON r.id = u.role_id SET u.role = r.name");
        console.log("✓ Populated role from roles table");
      } catch (e) {
        console.log("⚠ Could not populate role:", e.message);
      }
    }
  } else {
    console.log("• role column already exists");
  }


  if (!colNames.includes("requires_reset")) {
    await pool.execute("ALTER TABLE users ADD COLUMN requires_reset BOOLEAN DEFAULT false");
    console.log("✓ Added requires_reset column");

    if (colNames.includes("status")) {
      await pool.execute("UPDATE users SET requires_reset = 1 WHERE status = 'pending_reset'");
      await pool.execute("UPDATE users SET requires_reset = 0 WHERE status != 'pending_reset' OR status IS NULL");
      console.log("✓ Migrated status → requires_reset");
    }
  } else {
    console.log("• requires_reset column already exists");
  }


  if (!colNames.includes("company_id")) {
    await pool.execute("ALTER TABLE users ADD COLUMN company_id INT DEFAULT NULL");
    console.log("✓ Added company_id");
    try {
      await pool.execute("ALTER TABLE users ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL");
      console.log("✓ Added FK constraint");
    } catch (e) {
      console.log("• FK constraint may already exist");
    }
  } else {
    console.log("• company_id column already exists");
  }


  const [tables] = await pool.execute(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='startup_dashboard' AND TABLE_NAME='companies'"
  );
  if (tables.length === 0) {
    await pool.execute(
      "CREATE TABLE companies (id INT NOT NULL AUTO_INCREMENT, name VARCHAR(200) NOT NULL, founded_date DATE DEFAULT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id))"
    );
    console.log("✓ Created companies table");
  } else {
    console.log("• companies table already exists");
  }


  const [finalCols] = await pool.execute(
    "SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='startup_dashboard' AND TABLE_NAME='users' ORDER BY ORDINAL_POSITION"
  );
  console.log("\n=== FINAL USERS COLUMNS ===");
  finalCols.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.COLUMN_TYPE})`));

  console.log("\n✅ Migration complete!");
  await pool.end();
})().catch((e) => {
  console.error("Migration error:", e.message);
  process.exit(1);
});
