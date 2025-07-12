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

// Ensure CSV file exists
if (!fs.existsSync(csvPath)) {
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  fs.writeFileSync(csvPath, "Name,Email,Department,Year,Message\n");
}

// API to save registration
app.post("/register", (req, res) => {
  const { name, email, department, year, message } = req.body;

  console.log("📥 Received registration:", req.body);

  const entry = `"${name}","${email}","${department}","${year}","${message}"\n`;
  fs.appendFile(csvPath, entry, (err) => {
    if (err) {
      console.error("❌ Error writing to CSV:", err);
      return res.status(500).json({ status: "error", message: "CSV write failed" });
    }

    console.log("✅ Data saved to CSV");

    // Git push logic
    const pushCommand = `
      git add data/registrations.csv &&
      git commit -m "New registration on ${new Date().toISOString()}" &&
      git push origin main
    `;

    exec(pushCommand, (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Git push failed:", stderr);
        return res.status(200).json({
          status: "warning",
          message: "Saved to CSV, but GitHub push failed"
        });
      }
      console.log("🚀 GitHub Push Successful");
      return res.json({ status: "success", message: "Registered & pushed to GitHub" });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Aspire Club Backend running at http://localhost:${PORT}`);
});
