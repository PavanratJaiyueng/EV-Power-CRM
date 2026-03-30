const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const activities = db.prepare(`
    SELECT a.*, l.customer_name
    FROM activity_logs a
    JOIN leads l ON a.lead_id = l.id
    ORDER BY a.created_at DESC
    LIMIT 50
  `).all();
  res.json(activities);
});

module.exports = router;
