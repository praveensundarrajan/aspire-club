const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

// Ensure /data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Path to CSV file
const csvFilePath = path.join(dataDir, 'registrations.csv');

// Ensure CSV file has headers
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, 'Timestamp,Name,Email,Department,Year,Message\n');
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Register route
app.post('/register', (req, res) => {
  const { name, email, department, year, message } = req.body;
  const timestamp = new Date().toISOString();
  const row = `"${timestamp}","${name}","${email}","${department}","${year}","${message}"\n`;

  fs.appendFile(csvFilePath, row, (err) => {
    if (err) {
      console.error('❌ Error saving to CSV:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to save' });
    }

    console.log('✅ Registration saved.');

    // Push to GitHub
    gitPush();

    return res.json({ status: 'success', message: 'Registration successful & pushed to GitHub' });
  });
});

// Git push function
function gitPush() {
  exec(`
    git add data/registrations.csv &&
    git commit -m "New registration added at ${new Date().toISOString()}" &&
    git push
  `, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Git error: ${error.message}`);
      return;
    }
    console.log('✅ CSV pushed to GitHub');
    console.log(stdout);
  });
}

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Aspire Club backend running at http://localhost:${PORT}`);
});
