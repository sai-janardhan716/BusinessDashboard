-- ============================================================
--  StartupOps — Full Database Schema
--  Database: startup_dashboard
-- ============================================================

CREATE DATABASE IF NOT EXISTS startup_dashboard
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE startup_dashboard;

-- ─────────────────────────────────────────────────────────────
-- 1. ROLES
--    1=Founder  2=Finance  3=HR  4=Marketing
--    5=Sales    6=Tech     7=Compliance
-- ─────────────────────────────────────────────────────────────
CREATE TABLE roles (
  id   INT          NOT NULL AUTO_INCREMENT,
  name VARCHAR(50)  NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO roles (id, name) VALUES
  (1, 'Founder'),
  (2, 'Finance'),
  (3, 'HR'),
  (4, 'Marketing'),
  (5, 'Sales'),
  (6, 'Tech'),
  (7, 'Compliance');

-- ─────────────────────────────────────────────────────────────
-- 2. USERS
--    status: 'active' | 'pending_reset' | 'disabled'
-- ─────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            INT           NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role_id       INT           NOT NULL,
  sector        VARCHAR(50)   DEFAULT NULL,
  status        ENUM('active', 'pending_reset', 'disabled') NOT NULL DEFAULT 'active',
  PRIMARY KEY (id),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id)
);

-- ─────────────────────────────────────────────────────────────
-- 3. EMPLOYEES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE employees (
  id         INT           NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL,
  department VARCHAR(100)  DEFAULT NULL,
  role       VARCHAR(100)  DEFAULT NULL,
  joined     DATE          DEFAULT NULL,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────────────────────
-- 4. FINANCE TRANSACTIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE finance_transactions (
  id          INT             NOT NULL AUTO_INCREMENT,
  type        VARCHAR(50)     NOT NULL,
  amount      DECIMAL(15, 2)  NOT NULL,
  description TEXT            DEFAULT NULL,
  date        DATE            DEFAULT NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────────────────────
-- 5. MARKETING
-- ─────────────────────────────────────────────────────────────
CREATE TABLE marketing (
  id            INT             NOT NULL AUTO_INCREMENT,
  campaign_name VARCHAR(150)    NOT NULL,
  channel       VARCHAR(100)    DEFAULT NULL,
  spend         DECIMAL(15, 2)  DEFAULT 0.00,
  leads         INT             DEFAULT 0,
  conversions   INT             DEFAULT 0,
  start_date    DATE            DEFAULT NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────────────────────
-- 6. OPERATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE operations (
  id         INT          NOT NULL AUTO_INCREMENT,
  item_name  VARCHAR(150) NOT NULL,
  category   VARCHAR(100) DEFAULT NULL,
  status     VARCHAR(50)  DEFAULT NULL,
  owner      VARCHAR(100) DEFAULT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────────────────────
-- 7. PRODUCT
-- ─────────────────────────────────────────────────────────────
CREATE TABLE product (
  id           INT          NOT NULL AUTO_INCREMENT,
  feature_name VARCHAR(150) NOT NULL,
  type         VARCHAR(100) DEFAULT NULL,
  status       VARCHAR(50)  DEFAULT NULL,
  priority     VARCHAR(50)  DEFAULT NULL,
  owner        VARCHAR(100) DEFAULT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────────────────────
-- 8. SALES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE sales (
  id          INT             NOT NULL AUTO_INCREMENT,
  client_name VARCHAR(150)    NOT NULL,
  deal_value  DECIMAL(15, 2)  DEFAULT 0.00,
  status      VARCHAR(50)     DEFAULT NULL,
  close_date  DATE            DEFAULT NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────────────────────
-- 9. COMPLIANCE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE compliance (
  id         INT          NOT NULL AUTO_INCREMENT,
  doc_name   VARCHAR(150) NOT NULL,
  type       VARCHAR(100) DEFAULT NULL,
  due_date   DATE         DEFAULT NULL,
  status     VARCHAR(50)  DEFAULT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
