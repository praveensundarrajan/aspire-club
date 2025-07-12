const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { execSync } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const CSV_FILE = path.join(__dirname, 'data', 'registrations.csv');

// GitHub remote URL with token
const GIT_REMOTE = process.env.GIT_REMOTE; // add this in .env

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure CSV file exists
if (!fs.existsSync(CSV_FILE)) {
  fs.mkdirSync(path.dirname(CSV_FILE), { recursive: true });
  fs.writeFileSync(CSV_FILE, 'Timestamp,Name,Email,Department,Year,Message\n');
}

// Registration Route
app.post('/register', (req, res) => {
  const { name, email, department, year, message } = req.body;
  const timestamp = new Date().toISOString();

  const row = `"${timestamp}","${name}","${email}","${department}","${year}","${message}"\n`;
  try {
    fs.appendFileSync(CSV_FILE, row);
    console.log('✅ Data saved to CSV');

    // Git setup and push
    try {
      execSync(`git config --global user.email "you@example.com"`);
      execSync(`git config --global user.name "AspireBot"`);

      try {
        execSync(`git remote add origin ${GIT_REMOTE}`);
      } catch {
        execSync(`git remote set-url origin ${GIT_REMOTE}`);
      }

      try {
        execSync('git checkout -b main');
      } catch {
        execSync('git checkout main');
      }

      execSync('git add data/registrations.csv');
      execSync(`git commit -m "New registration on ${timestamp}"`);
      execSync('git push -u origin main');

      console.log('🚀 Data pushed to GitHub');
    } catch (gitErr) {
      console.error('❌ Git push failed:', gitErr.message);
    }

    res.json({ status: 'success' });
  } catch (err) {
    console.error('❌ Failed to save data:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Aspire Club Backend running at http://localhost:${PORT}`);
});
