// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (HTML/CSS/JS)
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const csvPath = path.join(__dirname, 'data', 'registrations.csv');

// Ensure 'data' folder exists
if (!fs.existsSync(path.dirname(csvPath))) {
    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
}

// Ensure CSV file exists with header
if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, 'Timestamp,Name,Email,Department,Year,Message\n');
}

// Handle registration form submission
app.post('/register', (req, res) => {
    const { name, email, department, year, message } = req.body;
    const timestamp = new Date().toISOString();

    const entry = `"${timestamp}","${name}","${email}","${department}","${year}","${message}"\n`;

    // Append data to CSV
    fs.appendFileSync(csvPath, entry, 'utf8');
    console.log('✅ Data saved to CSV');

    // Push to GitHub
    gitPush();

    res.json({ status: 'success', message: 'Registration successful!' });
});

// Git push function
function gitPush() {
    exec(`
        git remote set-url origin ${process.env.GIT_REMOTE} &&
        git add data/registrations.csv &&
        git commit -m "New registration on ${new Date().toISOString()}" &&
        git push origin HEAD
    `, (error, stdout, stderr) => {
        if (error) {
            console.error("❌ Git push failed:", error.message);
            return;
        }
        console.log("🚀 CSV pushed to GitHub!");
        console.log(stdout);
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Aspire Club Backend running at http://localhost:${PORT}`);
});
