const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const CSV_FILE = path.join(__dirname, 'data', 'registrations.csv');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

if (!fs.existsSync('data')) fs.mkdirSync('data');
if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(CSV_FILE, 'Timestamp,Name,Email,Department,Year,Message\n');
}

app.post('/register', (req, res) => {
  const { name, email, department, year, message } = req.body;
  const timestamp = new Date().toISOString();
  const newRow = `"${timestamp}","${name}","${email}","${department}","${year}","${message}"\n`;

  try {
    fs.appendFileSync(CSV_FILE, newRow);
    console.log('✅ Data saved to CSV');

    // Auto Git Push
    const gitRemote = process.env.GIT_REMOTE;
    execSync('git init');
    execSync('git config user.email "aspire@club.com"');
    execSync('git config user.name "Aspire Club Bot"');
    try {
      execSync(`git remote add origin ${gitRemote}`);
    } catch {}
    execSync('git add data/registrations.csv');
    execSync(`git commit -m "New registration on ${timestamp}"`);
    execSync('git push -u origin HEAD');
    console.log('✅ Git push success');

    res.json({ status: 'success' });
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to save data' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Aspire Club Backend is Running on port ${PORT}`);
});
