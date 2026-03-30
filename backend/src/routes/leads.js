const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET all leads with optional search/filter
router.get('/', (req, res) => {
  const { status, search } = req.query;
  let query = 'SELECT * FROM leads WHERE 1=1';
  const params = [];

  if (status && status !== 'All') {
    query += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    query += ' AND (customer_name LIKE ? OR phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY created_at DESC, id DESC';

  const leads = db.prepare(query).all(...params);
  res.json(leads);
});

// GET single lead
router.get('/:id', (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const activities = db.prepare('SELECT * FROM activity_logs WHERE lead_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json({ ...lead, activities });
});

// POST create lead
router.post('/', (req, res) => {
  const { customer_name, phone, product_interest, budget, status = 'New', note } = req.body;
  if (!customer_name || !phone || !product_interest)
    return res.status(400).json({ error: 'customer_name, phone, product_interest required' });

  const result = db.prepare(
    'INSERT INTO leads (customer_name, phone, product_interest, budget, status, note) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(customer_name, phone, product_interest, budget || null, status, note || null);

  // Log activity
  db.prepare('INSERT INTO activity_logs (lead_id, action, new_value) VALUES (?, ?, ?)').run(
    result.lastInsertRowid, 'Created lead', `Status: ${status}`
  );

  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(lead);
});

// PUT update lead
router.put('/:id', (req, res) => {
  const { customer_name, phone, product_interest, budget, status, note } = req.body;
  const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lead not found' });

  db.prepare(`
    UPDATE leads SET
      customer_name = ?, phone = ?, product_interest = ?,
      budget = ?, status = ?, note = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    customer_name ?? existing.customer_name,
    phone ?? existing.phone,
    product_interest ?? existing.product_interest,
    budget ?? existing.budget,
    status ?? existing.status,
    note ?? existing.note,
    req.params.id
  );

  // Log changes
  if (status && status !== existing.status) {
    db.prepare('INSERT INTO activity_logs (lead_id, action, old_value, new_value) VALUES (?, ?, ?, ?)').run(
      req.params.id, 'Status changed', existing.status, status
    );
  }
  if (note && note !== existing.note) {
    db.prepare('INSERT INTO activity_logs (lead_id, action, new_value) VALUES (?, ?, ?)').run(
      req.params.id, 'Note updated', note
    );
  }

  const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE lead
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Lead not found' });
  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  res.json({ message: 'Lead deleted' });
});

module.exports = router;
