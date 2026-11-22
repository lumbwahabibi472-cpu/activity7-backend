// ==============================================================================
// ICT251 Activity 7: Backend Development - Mulungushi University
// Project: Community Clean Up Requests
// File: server.js
// Description: Main entry point. Configures Express, CORS, JSON parsing,
//              API documentation guide (/), health check (/health),
//              records router (/api/records), and centralized error handling.
// ==============================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const recordsRouter = require('./routes/records');

const app = express();

// Configure CORS
const allowedOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);

if (allowedOrigins.length > 0) {
  app.use(cors({ origin: allowedOrigins }));
} else {
  // Allow all origins when CLIENT_ORIGINS is not restricted
  app.use(cors());
}

// Parse JSON request bodies
app.use(express.json());

// Middleware to catch malformed JSON syntax errors in request bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'Malformed JSON payload. Please verify your request syntax.'
    });
  }
  next(err);
});

// -----------------------------------------------------------------------------
// GET / - Marker API Guide (Responsive, readable HTML documentation)
// -----------------------------------------------------------------------------
app.get('/', (req, res) => {
  const protocol = req.protocol;
  const host = req.get('host') || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Community Clean Up Requests API - ICT251 Activity 7</title>
  <style>
    :root {
      --primary: #10b981;
      --primary-dark: #047857;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #1e293b;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --code-bg: #0f172a;
      --code-text: #f8fafc;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 24px 16px;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
    }
    header {
      background: linear-gradient(135deg, var(--primary-dark), var(--primary));
      color: white;
      padding: 32px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      margin-bottom: 24px;
    }
    header h1 { font-size: 1.85rem; margin-bottom: 8px; font-weight: 700; }
    header p { font-size: 1rem; opacity: 0.95; }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.85rem;
      margin-top: 10px;
      font-weight: 600;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    h2 { font-size: 1.35rem; margin-bottom: 16px; color: var(--primary-dark); border-bottom: 2px solid var(--border); padding-bottom: 8px; }
    h3 { font-size: 1.1rem; margin: 16px 0 8px; }
    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    .btn-link {
      display: block;
      background: #ecfdf5;
      color: var(--primary-dark);
      text-decoration: none;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid #a7f3d0;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-link:hover {
      background: #d1fae5;
      border-color: var(--primary);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 0.95rem;
    }
    th, td {
      border: 1px solid var(--border);
      padding: 10px 12px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #334155;
    }
    tr:nth-child(even) { background: #fcfcfc; }
    .method {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.8rem;
      color: white;
    }
    .method.get { background: #0284c7; }
    .method.post { background: #16a34a; }
    .method.put { background: #d97706; }
    .method.delete { background: #dc2626; }
    pre {
      background: var(--code-bg);
      color: var(--code-text);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 0.9rem;
      margin: 12px 0;
    }
    .note-box {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      border-radius: 4px;
      margin-top: 16px;
      font-size: 0.95rem;
    }
    footer {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-top: 32px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🌱 Community Clean Up Requests API</h1>
      <p>Mulungushi University | School of Engineering and Technology | Department of Computer Science</p>
      <p>Course: <strong>ICT251 Introduction to Web Technologies</strong> &mdash; Activity 7: Backend Development</p>
      <div class="badge">Student Number: 202508259</div>
    </header>

    <div class="card">
      <h2>Project Overview & Quick Links</h2>
      <p>
        This RESTful backend API provides complete CRUD (Create, Read, Update, Delete) management for
        <strong>Community Clean Up Requests</strong>. It functions independently, stores data in an SQLite database,
        validates all inputs, prevents SQL injection using parameterized queries, and handles errors with clear JSON messages.
      </p>
      <div style="margin-top: 12px; font-weight: 600;">
        Base URL: <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${baseUrl}</code>
      </div>
      <div class="links-grid">
        <a class="btn-link" href="${baseUrl}/health" target="_blank">🩺 Check System Health (/health) &rarr;</a>
        <a class="btn-link" href="${baseUrl}/api/records" target="_blank">📋 View All Records (/api/records) &rarr;</a>
      </div>
    </div>

    <div class="card">
      <h2>API Routes Reference</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Endpoint</th>
            <th>Description</th>
            <th>Expected Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="method get">GET</span></td>
            <td><code>/</code></td>
            <td>Marker API Documentation & Usage Guide</td>
            <td>200 OK</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td><code>/health</code></td>
            <td>Verifies server uptime and database connectivity</td>
            <td>200 OK (503 if DB fails)</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td><code>/api/records</code></td>
            <td>Returns all clean-up requests ordered by ID ascending</td>
            <td>200 OK</td>
          </tr>
          <tr>
            <td><span class="method get">GET</span></td>
            <td><code>/api/records/:id</code></td>
            <td>Returns a single clean-up request by positive integer ID</td>
            <td>200 OK / 404 Not Found</td>
          </tr>
          <tr>
            <td><span class="method post">POST</span></td>
            <td><code>/api/records</code></td>
            <td>Creates a new clean-up request (auto-generates ID)</td>
            <td>201 Created / 400 Bad Request</td>
          </tr>
          <tr>
            <td><span class="method put">PUT</span></td>
            <td><code>/api/records/:id</code></td>
            <td>Replaces all 4 editable fields (does not create missing records)</td>
            <td>200 OK / 400 Bad / 404 Not Found</td>
          </tr>
          <tr>
            <td><span class="method delete">DELETE</span></td>
            <td><code>/api/records/:id</code></td>
            <td>Permanently deletes a clean-up request by ID</td>
            <td>200 OK / 404 Not Found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2>Shared Data Agreement & Validation Rules</h2>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Length / Values</th>
            <th>Description & Rules</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>id</code></td>
            <td>Integer</td>
            <td>Positive whole number</td>
            <td>Auto-generated primary key. Client cannot provide or alter it.</td>
          </tr>
          <tr>
            <td><code>title</code></td>
            <td>String</td>
            <td>3 to 80 characters</td>
            <td>Short name of the clean-up request or proposal. Must not be empty.</td>
          </tr>
          <tr>
            <td><code>category</code></td>
            <td>String</td>
            <td>2 to 40 characters</td>
            <td>Category suited for cleanups (e.g., Litter Cleanup, Waterway, Drainage).</td>
          </tr>
          <tr>
            <td><code>description</code></td>
            <td>String</td>
            <td>5 to 300 characters</td>
            <td>Clear explanation of the environmental clean-up effort needed.</td>
          </tr>
          <tr>
            <td><code>status</code></td>
            <td>String</td>
            <td>Pending | In progress | Completed</td>
            <td>Strictly restricted to one of these three exact values.</td>
          </tr>
        </tbody>
      </table>

      <h3>Sample POST / PUT Request Payload (JSON)</h3>
      <pre><code>{
  "title": "Town Market Drainage Unblocking",
  "category": "Drainage Clearance",
  "description": "Removing silt and plastic waste clogging storm drainage channels near the market.",
  "status": "Pending"
}</code></pre>
    </div>

    <div class="card">
      <h2>HTTP Status Codes Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Meaning</th>
            <th>When It Is Returned</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>200 OK</strong></td><td>Success</td><td>Successful GET, PUT, and DELETE operations.</td></tr>
          <tr><td><strong>201 Created</strong></td><td>Created</td><td>Successful POST operation returning the newly created record.</td></tr>
          <tr><td><strong>400 Bad Request</strong></td><td>Client Error</td><td>Invalid field lengths, missing fields, invalid status, malformed JSON, or non-numeric ID.</td></tr>
          <tr><td><strong>404 Not Found</strong></td><td>Not Found</td><td>Record ID does not exist, or requested API endpoint does not exist.</td></tr>
          <tr><td><strong>500 Server Error</strong></td><td>Internal Error</td><td>Unexpected backend failure (details logged on server).</td></tr>
          <tr><td><strong>503 Service Unavailable</strong></td><td>Database Error</td><td>Database health check failed during /health inspection.</td></tr>
        </tbody>
      </table>

      <div class="note-box">
        ⚠️ <strong>Note on Free-Tier Hosting Startup Delays (Cold Starts):</strong><br>
        When hosted on free cloud services (such as Render Free Web Service), the server spins down automatically
        after 15 minutes of inactivity. The initial incoming request may take 30 to 60 seconds to wake up the service.
        Subsequent requests respond instantaneously.
      </div>
    </div>

    <footer>
      ICT251 Activity 7 Backend Development &bull; Mulungushi University &bull; Academic Year 2026
    </footer>
  </div>
</body>
</html>`;

  res.status(200).send(html);
});

// -----------------------------------------------------------------------------
// GET /health - Server and Database Connectivity Check
// -----------------------------------------------------------------------------
app.get('/health', (req, res) => {
  const isDbHealthy = db.checkHealth();

  if (isDbHealthy) {
    return res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } else {
    return res.status(503).json({
      status: 'error',
      message: 'Database health check failed.',
      database: 'disconnected'
    });
  }
});

// Mount the records router
app.use('/api/records', recordsRouter);

// -----------------------------------------------------------------------------
// 404 Unknown Route Handler (Returns JSON error message)
// -----------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl}. Route not found.`
  });
});

// -----------------------------------------------------------------------------
// Centralized 500 Error Handler
// -----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: 'Internal server error occurred.'
  });
});

// -----------------------------------------------------------------------------
// Start Server
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT} (0.0.0.0:${PORT})`);
  console.log(`Local Access URL: http://localhost:${PORT}`);
});

module.exports = app;
