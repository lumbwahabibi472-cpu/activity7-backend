// ==============================================================================
// ICT251 Activity 7: Backend Development - Mulungushi University
// Project: Community Clean Up Requests
// File: db.js
// Description: Manages the SQLite database connection, applies schema.sql,
//              seeds sample data only once, and provides query helper functions.
// ==============================================================================

const path = require('path');
const fs = require('fs');

// Note on Database Inconsistency:
// Page 3 of the assignment mentions PostgreSQL (pg) and DATABASE_URL, while
// Page 4 explicitly mandates creating an SQLite database.
// This project follows the Page 4 SQLite requirement.
const { DatabaseSync } = require('node:sqlite');

// Determine database file path from environment or default to local directory
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(__dirname, 'cleanup_requests.db');

// Ensure destination directory exists (vital for hosted environments with custom mount paths)
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open or create the SQLite database
const db = new DatabaseSync(dbPath);

// Enable foreign keys and Write-Ahead Logging (WAL) for better concurrency & reliability
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Initialize table schema from schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
} else {
  console.error('schema.sql file not found at:', schemaPath);
}

// Seed the database ONLY ONCE so records are not duplicated on server restart
const countStmt = db.prepare('SELECT COUNT(*) AS count FROM records');
const countResult = countStmt.get();

if (countResult && countResult.count === 0) {
  const seedPath = path.join(__dirname, 'seed.sql');
  if (fs.existsSync(seedPath)) {
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    db.exec(seedSql);
    console.log('Database initialized: Seeded with 8 sample Community Clean Up Requests.');
  }
} else {
  console.log(`Database ready: ${countResult.count} records exist in database (seed skipped).`);
}

/**
 * Executes a parameterized SQL query returning all matching rows.
 * @param {string} sql - Parameterized SQL query
 * @param {Array} params - Array of parameter values to bind
 * @returns {Array} List of record objects
 */
function getAll(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

/**
 * Executes a parameterized SQL query returning a single matching row.
 * @param {string} sql - Parameterized SQL query
 * @param {Array} params - Array of parameter values to bind
 * @returns {Object|null} Matching record object or undefined/null
 */
function getOne(sql, params = []) {
  const stmt = db.prepare(sql);
  const row = stmt.get(...params);
  return row || null;
}

/**
 * Executes a parameterized INSERT, UPDATE, or DELETE SQL statement.
 * @param {string} sql - Parameterized SQL statement
 * @param {Array} params - Array of parameter values to bind
 * @returns {Object} Object containing lastID and changes count
 */
function run(sql, params = []) {
  const stmt = db.prepare(sql);
  const info = stmt.run(...params);
  return {
    lastID: Number(info.lastInsertRowid),
    changes: Number(info.changes)
  };
}

/**
 * Checks database health by executing a simple verification query.
 * @returns {boolean} True if database responds successfully, false otherwise.
 */
function checkHealth() {
  try {
    const result = db.prepare('SELECT 1 AS alive').get();
    return Boolean(result && result.alive === 1);
  } catch (err) {
    console.error('Database health check failed:', err);
    return false;
  }
}

module.exports = {
  db,
  getAll,
  getOne,
  run,
  checkHealth
};
