-- ==============================================================================
-- ICT251 Activity 7: Backend Development - Mulungushi University
-- Project: Community Clean Up Requests
-- File: schema.sql
-- Description: Defines the SQLite relational table for community clean up records.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL CHECK (length(title) >= 3 AND length(title) <= 80),
  category TEXT NOT NULL CHECK (length(category) >= 2 AND length(category) <= 40),
  description TEXT NOT NULL CHECK (length(description) >= 5 AND length(description) <= 300),
  status TEXT NOT NULL CHECK (status IN ('Pending', 'In progress', 'Completed'))
);
