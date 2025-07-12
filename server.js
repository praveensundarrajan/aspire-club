// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const CSV_FILE = path.join(__dirname, "submissions.csv");

app.use(cors());
app.use(express.json());

app.post("/api/register", (req, res) => {
  const { name, email, department, year, message } = req.body;

  if (!name || !email || !department || !year) {
    return res.status(400).json({ status: "error", message: "Missing required fields" });
  }

  const csvLine = `"${name}","${email}","${department}","${year}","${message || ''}"\n`;

  fs.appendFile(CSV_FILE, csvLine, (err) => {
    if (err) {
      console.error("❌ Error saving to CSV:", err);
      return res.status(500).json({ status: "error", message: "Server Error" });
    }
    console.log("✅ Data saved:", req.body);
    res.json({ status: "success" });
  });
});

app.get("/", (req, res) => {
  res.send("Aspire Club Backend is Running ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
