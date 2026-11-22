// ==============================================================================
// ICT251 Activity 7: Backend Development - Mulungushi University
// Project: Community Clean Up Requests
// File: routes/records.js
// Description: Express Router implementing RESTful CRUD endpoints for records
//              with strict input validation and parameterized SQL queries.
// ==============================================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

// Allowed status values per Activity 6 & 7 data agreement
const ALLOWED_STATUSES = ['Pending', 'In progress', 'Completed'];

/**
 * Validates that an ID parameter is a positive whole number.
 * @param {string} idParam - Route parameter from req.params.id
 * @returns {number|null} Valid integer ID or null if invalid
 */
function validatePositiveIntegerId(idParam) {
  if (typeof idParam !== 'string') return null;
  const trimmed = idParam.trim();
  // Ensure digits only, no leading negative signs or decimal dots
  if (!/^\d+$/.test(trimmed)) return null;
  const num = parseInt(trimmed, 10);
  if (!Number.isSafeInteger(num) || num <= 0) return null;
  return num;
}

/**
 * Validates the four editable fields of a Community Clean Up Request.
 * Enforces string checks before trimming, length bounds, and exact status values.
 * Ignores any client-supplied id.
 *
 * @param {Object} body - Request body
 * @returns {{ error: string|null, value: Object|null }}
 */
function validateRecordPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a valid JSON object.', value: null };
  }

  const { title, category, description, status } = body;

  // 1. Ensure all four fields are present
  if (title === undefined || category === undefined || description === undefined || status === undefined) {
    return {
      error: 'Missing required fields. All four fields (title, category, description, status) are required.',
      value: null
    };
  }

  // 2. Ensure each field is a string before trimming
  if (
    typeof title !== 'string' ||
    typeof category !== 'string' ||
    typeof description !== 'string' ||
    typeof status !== 'string'
  ) {
    return {
      error: 'Invalid field types. title, category, description, and status must all be strings.',
      value: null
    };
  }

  // 3. Trim values
  const trimmedTitle = title.trim();
  const trimmedCategory = category.trim();
  const trimmedDescription = description.trim();
  const trimmedStatus = status.trim();

  // 4. Reject empty or whitespace-only strings
  if (!trimmedTitle) {
    return { error: 'Title cannot be empty or contain only spaces.', value: null };
  }
  if (!trimmedCategory) {
    return { error: 'Category cannot be empty or contain only spaces.', value: null };
  }
  if (!trimmedDescription) {
    return { error: 'Description cannot be empty or contain only spaces.', value: null };
  }
  if (!trimmedStatus) {
    return { error: 'Status cannot be empty or contain only spaces.', value: null };
  }

  // 5. Length validations
  if (trimmedTitle.length < 3 || trimmedTitle.length > 80) {
    return { error: 'Title must have 3 to 80 characters.', value: null };
  }
  if (trimmedCategory.length < 2 || trimmedCategory.length > 40) {
    return { error: 'Category must have 2 to 40 characters.', value: null };
  }
  if (trimmedDescription.length < 5 || trimmedDescription.length > 300) {
    return { error: 'Description must have 5 to 300 characters.', value: null };
  }

  // 6. Status enumeration validation
  if (!ALLOWED_STATUSES.includes(trimmedStatus)) {
    return {
      error: `Invalid status '${trimmedStatus}'. Allowed values are exactly: ${ALLOWED_STATUSES.join(', ')}.`,
      value: null
    };
  }

  return {
    error: null,
    value: {
      title: trimmedTitle,
      category: trimmedCategory,
      description: trimmedDescription,
      status: trimmedStatus
    }
  };
}

// -----------------------------------------------------------------------------
// GET /api/records - Retrieve all records ordered by id
// -----------------------------------------------------------------------------
router.get('/', (req, res, next) => {
  try {
    const records = db.getAll(
      'SELECT id, title, category, description, status FROM records ORDER BY id ASC'
    );
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
});

// -----------------------------------------------------------------------------
// GET /api/records/:id - Retrieve a single record by positive integer id
// -----------------------------------------------------------------------------
router.get('/:id', (req, res, next) => {
  try {
    const id = validatePositiveIntegerId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Invalid ID. ID must be a positive whole number.' });
    }

    const record = db.getOne(
      'SELECT id, title, category, description, status FROM records WHERE id = ?',
      [id]
    );

    if (!record) {
      return res.status(404).json({ message: `Record not found with ID ${id}.` });
    }

    res.status(200).json(record);
  } catch (error) {
    next(error);
  }
});

// -----------------------------------------------------------------------------
// POST /api/records - Create a new record (client id is ignored)
// -----------------------------------------------------------------------------
router.post('/', (req, res, next) => {
  try {
    const { error, value } = validateRecordPayload(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const result = db.run(
      'INSERT INTO records (title, category, description, status) VALUES (?, ?, ?, ?)',
      [value.title, value.category, value.description, value.status]
    );

    const newRecord = db.getOne(
      'SELECT id, title, category, description, status FROM records WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json(newRecord);
  } catch (error) {
    next(error);
  }
});

// -----------------------------------------------------------------------------
// PUT /api/records/:id - Replace all four editable fields of an existing record
// Does not create a missing record (returns 404 if record does not exist)
// -----------------------------------------------------------------------------
router.put('/:id', (req, res, next) => {
  try {
    const id = validatePositiveIntegerId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Invalid ID. ID must be a positive whole number.' });
    }

    const { error, value } = validateRecordPayload(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    // Check if the record exists first
    const existing = db.getOne('SELECT id FROM records WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: `Cannot update. Record not found with ID ${id}.` });
    }

    // Replace all four editable fields
    db.run(
      'UPDATE records SET title = ?, category = ?, description = ?, status = ? WHERE id = ?',
      [value.title, value.category, value.description, value.status, id]
    );

    const updatedRecord = db.getOne(
      'SELECT id, title, category, description, status FROM records WHERE id = ?',
      [id]
    );

    res.status(200).json(updatedRecord);
  } catch (error) {
    next(error);
  }
});

// -----------------------------------------------------------------------------
// DELETE /api/records/:id - Delete a record by id
// -----------------------------------------------------------------------------
router.delete('/:id', (req, res, next) => {
  try {
    const id = validatePositiveIntegerId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Invalid ID. ID must be a positive whole number.' });
    }

    // Check if the record exists before deletion
    const existing = db.getOne('SELECT id FROM records WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: `Cannot delete. Record not found with ID ${id}.` });
    }

    db.run('DELETE FROM records WHERE id = ?', [id]);

    res.status(200).json({ message: 'Record deleted.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
