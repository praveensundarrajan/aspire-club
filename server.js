const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { execSync } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CSV path
const csvPath = path.join(__dirname, 'data', 'registrations.csv');
const gitRemote = process.env.GIT_REMOTE;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ensure CSV and data folder exists
if (!fs.existsSync(path.dirname(csvPath))) {
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
}
if (!fs.existsSync(csvPath)) {
  fs.writeFileSync(csvPath, 'Timestamp,Name,Email,Department,Year,Message\n');
}

// POST endpoint
app.post('/register', (req, res) => {
  const { name, email, department, year, message } = req.body;
  const timestamp = new Date().toISOString();
  const entry = `${timestamp},"${name}","${email}","${department}","${year}","${message}"\n`;

  try {
    fs.appendFileSync(csvPath, entry);
    console.log('✅ Data saved to CSV');

    // Git operations
    try {
      execSync('git config user.email "you@example.com"');
      execSync('git config user.name "praveensundarrajan"');

      try {
        execSync(`git remote add origin ${gitRemote}`);
      } catch {
        execSync(`git remote set-url origin ${gitRemote}`);
      }

      execSync('git checkout main');

      try {
        execSync('git add .');
        execSync('git commit -m "Auto backup before pull"');
      } catch {}

      execSync('git pull origin main --rebase');
      execSync('git add data/registrations.csv');
      execSync(`git commit -m "New registration at ${timestamp}"`);
      execSync('git push origin main');
      console.log('🚀 CSV pushed to GitHub');
    } catch (gitErr) {
      console.error('❌ Git push failed:', gitErr.message);
    }

    res.status(200).json({ status: 'success', message: 'Registered successfully' });
  } catch (err) {
    console.error('❌ Failed to write CSV:', err.message);
    res.status(500).json({ status: 'error', message: 'Registration failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Aspire Club Backend running at http://localhost:${PORT}`);
});
