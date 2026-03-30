const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
  const byStatus = db.prepare(
    'SELECT status, COUNT(*) as count FROM leads GROUP BY status'
  ).all();
  const recentLeads = db.prepare(
    'SELECT * FROM leads ORDER BY created_at DESC LIMIT 5'
  ).all();

  res.json({ total, byStatus, recentLeads });
});

module.exports = router;
