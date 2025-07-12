const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 10000;

// Make sure the /data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Path to CSV file
const csvFilePath = path.join(dataDir, 'registrations.csv');

// Create CSV file with headers if not exists
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, 'Timestamp,Name,Email,Department,Year,Message\n');
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Save to CSV route
app.post('/register', (req, res) => {
  const { name, email, department, year, message } = req.body;
  const timestamp = new Date().toISOString();
  const row = `"${timestamp}","${name}","${email}","${department}","${year}","${message}"\n`;

  fs.appendFile(csvFilePath, row, (err) => {
    if (err) {
      console.error('Error saving to CSV:', err);
      return res.status(500).json({ status: 'error', message: 'Failed to save' });
    }
    return res.json({ status: 'success', message: 'Registration saved to CSV' });
  });
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Aspire Club backend running at http://localhost:${PORT}`);
});
