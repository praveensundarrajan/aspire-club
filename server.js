const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { execSync } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const csvFilePath = path.join(__dirname, 'data', 'registrations.csv');

// Ensure data folder and CSV file exist
if (!fs.existsSync(path.dirname(csvFilePath))) {
    fs.mkdirSync(path.dirname(csvFilePath), { recursive: true });
}
if (!fs.existsSync(csvFilePath)) {
    fs.writeFileSync(csvFilePath, 'Timestamp,Name,Email,Department,Year,Message\n', 'utf8');
}

app.post('/register', (req, res) => {
    const { name, email, department, year, message } = req.body;

    if (!name || !email || !department || !year) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const timestamp = new Date().toISOString();
    const csvRow = `"${timestamp}","${name}","${email}","${department}","${year}","${message || ''}"\n`;

    try {
        fs.appendFileSync(csvFilePath, csvRow, 'utf8');
        console.log('✅ Data saved to CSV');

        // GitHub push
        const GIT_REMOTE = process.env.GIT_REMOTE;

        execSync('git init');
        execSync('git config user.email "aspire@club.com"');
        execSync('git config user.name "Aspire Club Bot"');

        try {
            execSync(`git remote add origin ${GIT_REMOTE}`);
        } catch {
            execSync(`git remote set-url origin ${GIT_REMOTE}`);
        }

        execSync('git checkout -b main || git checkout main');
        execSync('git add data/registrations.csv');
        execSync(`git commit -m "New registration on ${timestamp}"`);
        execSync('git push -u origin main');

        console.log('🚀 CSV pushed to GitHub');
        res.status(200).json({ status: 'success' });
    } catch (err) {
        console.error('❌ Git push failed:', err.message);
        res.status(500).json({ status: 'error', message: 'Git push failed' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Aspire Club Backend is running on port ${PORT}`);
});
