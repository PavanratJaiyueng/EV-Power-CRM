const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/crm.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    product_interest TEXT NOT NULL CHECK(product_interest IN ('Solar','EV','Battery','Other')),
    budget REAL,
    status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New','Contacted','Quotation','Won','Lost')),
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
  );
`);

// Seed default admin user
const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!existingUser) {
  const hashed = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hashed);
  console.log('Default user created: admin / admin123');
}

// Seed sample leads
const leadCount = db.prepare('SELECT COUNT(*) as count FROM leads').get();
if (leadCount.count === 0) {
  const leads = [
    ['สมชาย ใจดี', '081-234-5678', 'Solar', 150000, 'New', 'สนใจติดตั้งโซลาร์เซลล์'],
    ['วิภา รักษ์โลก', '089-876-5432', 'EV', 300000, 'Contacted', 'ต้องการรถ EV สำหรับครอบครัว'],
    ['ประยุทธ์ มั่งมี', '062-111-2233', 'Battery', 80000, 'Quotation', 'ต้องการแบตเตอรี่สำรอง'],
    ['นารี สุขสันต์', '095-555-7777', 'Solar', 200000, 'Won', 'ตกลงซื้อแล้ว'],
    ['มานะ ขยันดี', '088-999-1111', 'Other', 50000, 'Lost', 'ราคาสูงเกินไป'],
  ];
  const insertLead = db.prepare(
    'INSERT INTO leads (customer_name, phone, product_interest, budget, status, note) VALUES (?, ?, ?, ?, ?, ?)'
  );
  leads.forEach(l => insertLead.run(...l));
}

module.exports = db;
