// ==============================================================================
// ICT251 Activity 7: Backend Development - Mulungushi University
// Project: Community Clean Up Requests
// File: db.js
// Description: Multi-database driver supporting Render PostgreSQL via DATABASE_URL
//              with transparent fallback to SQLite for local development.
// ==============================================================================

const path = require('path');
const fs = require('fs');

const isPostgres = Boolean(process.env.DATABASE_URL);

let pool = null;
let sqliteDb = null;

// Initial 8 sample records for single-run seeding
const SAMPLE_RECORDS = [
  [
    'Great North Road Litter Sweep',
    'Litter Cleanup',
    'Community volunteers clearing discarded plastic bottles, food wrappers, and cardboard debris along pedestrian walkways near the campus gate.',
    'Completed'
  ],
  [
    'Mulungushi Riverbank Plastic Extraction',
    'Waterway Cleanup',
    'Removing floating plastic containers, discarded polythene bags, and debris along the riverbank to restore aquatic habitats.',
    'In progress'
  ],
  [
    'Kabwe Central Market Drain Unblocking',
    'Drainage Clearance',
    'Unblocking primary storm drainage trenches filled with silt, organic refuse, and packaging waste to prevent monsoon street flooding.',
    'Pending'
  ],
  [
    'Town Centre Public Park Turf Restoration',
    'Park Maintenance',
    'Raking fallen leaves, removing broken tree branches, and emptying overflowing community waste receptacles in the recreation grounds.',
    'Completed'
  ],
  [
    'Old Bus Terminus Rubbish Clearing',
    'Public Transit Zone',
    'Sweeping commuter waiting shelters and collecting discarded beverage tins, paper bags, and litter around loading bays.',
    'Pending'
  ],
  [
    'Community Clinic Perimeter Debris Pick',
    'Health Facility Care',
    'Clearing overgrown brush, weeds, and windblown litter surrounding the perimeter fence of the local health post.',
    'In progress'
  ],
  [
    'Civic Centre Courtyard Tidying Drive',
    'Civic Grounds',
    'Power-sweeping walkway tiles, pruning untamed hedges, and picking litter in the central public square.',
    'Completed'
  ],
  [
    'Railway Reserve Illegal Dump Remediation',
    'Illegal Dumping',
    'Clearing bulk discarded concrete rubble, scrap tires, and household refuse unlawfully dumped near the railway access road.',
    'Pending'
  ]
];

if (isPostgres) {
  // ---------------------------------------------------------------------------
  // PostgreSQL Configuration (Render Cloud Database)
  // ---------------------------------------------------------------------------
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  // Self-initializing schema & single-run seeding for PostgreSQL
  (async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS records (
          id SERIAL PRIMARY KEY,
          title VARCHAR(80) NOT NULL CHECK (length(title) >= 3 AND length(title) <= 80),
          category VARCHAR(40) NOT NULL CHECK (length(category) >= 2 AND length(category) <= 40),
          description VARCHAR(300) NOT NULL CHECK (length(description) >= 5 AND length(description) <= 300),
          status VARCHAR(20) NOT NULL CHECK (status IN ('Pending', 'In progress', 'Completed'))
        );
      `);

      const countRes = await pool.query('SELECT COUNT(*) AS count FROM records');
      const count = parseInt(countRes.rows[0].count, 10);

      if (count === 0) {
        for (const [title, category, description, status] of SAMPLE_RECORDS) {
          await pool.query(
            'INSERT INTO records (title, category, description, status) VALUES ($1, $2, $3, $4)',
            [title, category, description, status]
          );
        }
        console.log('PostgreSQL database initialized and seeded with 8 sample Community Clean Up Requests.');
      } else {
        console.log(`PostgreSQL database connected. Found ${count} existing records (seed skipped).`);
      }
    } catch (err) {
      console.error('Error during PostgreSQL initialization:', err.message);
    }
  })();
} else {
  // ---------------------------------------------------------------------------
  // SQLite Fallback (Local Offline Development)
  // ---------------------------------------------------------------------------
  const { DatabaseSync } = require('node:sqlite');
  const dbPath = process.env.DATABASE_PATH
    ? path.resolve(process.env.DATABASE_PATH)
    : path.join(__dirname, 'cleanup_requests.db');

  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  sqliteDb = new DatabaseSync(dbPath);
  sqliteDb.exec('PRAGMA foreign_keys = ON;');
  sqliteDb.exec('PRAGMA journal_mode = WAL;');

  // Schema creation
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL CHECK (length(title) >= 3 AND length(title) <= 80),
      category TEXT NOT NULL CHECK (length(category) >= 2 AND length(category) <= 40),
      description TEXT NOT NULL CHECK (length(description) >= 5 AND length(description) <= 300),
      status TEXT NOT NULL CHECK (status IN ('Pending', 'In progress', 'Completed'))
    );
  `);

  const countRow = sqliteDb.prepare('SELECT COUNT(*) AS count FROM records').get();
  if (countRow && countRow.count === 0) {
    const insertStmt = sqliteDb.prepare(
      'INSERT INTO records (title, category, description, status) VALUES (?, ?, ?, ?)'
    );
    for (const record of SAMPLE_RECORDS) {
      insertStmt.run(...record);
    }
    console.log('SQLite database initialized and seeded with 8 sample Community Clean Up Requests.');
  } else {
    console.log(`SQLite database connected. Found ${countRow.count} existing records (seed skipped).`);
  }
}

/**
 * Executes a parameterized SQL query returning all matching rows.
 */
async function getAll(sql, params = []) {
  if (isPostgres) {
    const res = await pool.query(sql, params);
    return res.rows;
  } else {
    const sqliteSql = sql.replace(/\$[0-9]+/g, '?');
    const stmt = sqliteDb.prepare(sqliteSql);
    return stmt.all(...params);
  }
}

/**
 * Executes a parameterized SQL query returning a single matching row.
 */
async function getOne(sql, params = []) {
  if (isPostgres) {
    const res = await pool.query(sql, params);
    return res.rows[0] || null;
  } else {
    const sqliteSql = sql.replace(/\$[0-9]+/g, '?');
    const stmt = sqliteDb.prepare(sqliteSql);
    return stmt.get(...params) || null;
  }
}

/**
 * Executes an INSERT, UPDATE, or DELETE statement.
 */
async function run(sql, params = []) {
  if (isPostgres) {
    const res = await pool.query(sql, params);
    return {
      rowCount: res.rowCount,
      rows: res.rows
    };
  } else {
    const sqliteSql = sql.replace(/\$[0-9]+/g, '?');
    const stmt = sqliteDb.prepare(sqliteSql);
    const info = stmt.run(...params);
    return {
      lastID: Number(info.lastInsertRowid),
      changes: Number(info.changes)
    };
  }
}

/**
 * Performs a health verification query against the active database.
 */
async function checkHealth() {
  try {
    if (isPostgres) {
      const res = await pool.query('SELECT 1 AS alive');
      return res && res.rows && res.rows[0].alive === 1;
    } else {
      const row = sqliteDb.prepare('SELECT 1 AS alive').get();
      return Boolean(row && row.alive === 1);
    }
  } catch (err) {
    console.error('Database health check failed:', err.message);
    return false;
  }
}

module.exports = {
  isPostgres,
  getAll,
  getOne,
  run,
  checkHealth,
  pool
};
