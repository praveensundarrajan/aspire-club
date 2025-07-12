const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

const csvPath = path.join(__dirname, "data", "registrations.csv");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Ensure CSV directory and file exist
if (!fs.existsSync(csvPath)) {
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  fs.writeFileSync(csvPath, "Name,Email,Department,Year,Message\n");
}

// API to handle registration
app.post("/register", (req, res) => {
  const { name, email, department, year, message } = req.body;
  const entry = `"${name}","${email}","${department}","${year}","${message}"\n`;

  fs.appendFile(csvPath, entry, (err) => {
    if (err) {
      console.error("❌ Error writing to CSV:", err);
      return res.status(500).json({ status: "error", message: "CSV write failed" });
    }

    console.log("✅ Data saved to CSV");
    res.json({ status: "success", message: "Registration saved" });

    // Git commands to commit and push to GitHub
    const gitCommands = `
      git config user.name "praveensundarrajan" &&
      git config user.email "youremail@example.com" &&
      git add ${csvPath} &&
      git commit -m "New registration on ${new Date().toISOString()}" &&
      git push origin main
    `;

    exec(gitCommands, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Git push failed:", stderr);
      } else {
        console.log("🚀 Git push successful:\n", stdout);
      }
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Aspire Club Backend running at http://localhost:${PORT}`);
});
