const express = require('express');
const router = express.Router();
const db = require('../db');
const fs = require('fs');
const path = require('path');

router.post('/register', (req, res) => {
  const { name, email, department, year, message } = req.body;

  // Save to MySQL
  const sql = 'INSERT INTO members (name, email, department, year, message) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, email, department, year, message], (err, result) => {
    if (err) {
      console.error('❌ Insert error:', err.message);
      return res.status(500).json({ status: 'error', message: 'Database error' });
    }

    // Save to CSV
    const csvLine = `"${name}","${email}","${department}","${year}","${message.replace(/"/g, '""')}"\n`;
    const filePath = path.join(__dirname, '../submissions.csv');

    // Check if file exists — if not, add header
    if (!fs.existsSync(filePath)) {
      const header = `"Name","Email","Department","Year","Message"\n`;
      fs.writeFileSync(filePath, header);
    }

    // Append new data row
    fs.appendFile(filePath, csvLine, (err) => {
      if (err) console.error('⚠️ CSV Write Error:', err.message);
    });

    res.json({ status: 'success', message: 'Member registered & saved to CSV!' });
  });
});

module.exports = router;
