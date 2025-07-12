const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { execSync } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Paths
const DATA_FILE = path.join(__dirname, 'data', 'registrations.csv');
const GIT_REMOTE = process.env.GIT_REMOTE;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Ensure data folder and CSV file exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, 'Timestamp,Name,Email,Department,Year,Message\n');
}

// API endpoint
app.post('/register', (req, res) => {
  const { name, email, department, year, message } = req.body;
  const timestamp = new Date().toISOString();

  const entry = `${timestamp},"${name}","${email}","${department}","${year}","${message}"\n`;

  try {
    fs.appendFileSync(DATA_FILE, entry);
    console.log('✅ Data saved to CSV');

    // Git setup and push
    try {
      execSync(`git config --global user.email "you@example.com"`);
      execSync(`git config --global user.name "praveensundarrajan"`);

      try {
        execSync(`git remote add origin ${GIT_REMOTE}`);
      } catch {
        execSync(`
