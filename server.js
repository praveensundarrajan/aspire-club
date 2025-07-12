const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const csvPath = path.join(__dirname, "data", "registrations.csv");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Create CSV if it doesn't exist
if (!fs.existsSync(csvPath)) {
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  fs.writeFileSync(csvPath, "Name,Email,Department,Year,Message\n");
}

// POST endpoint
app.post("/register", (req, res) => {
  console.log("Received registration:", req.body);

  const { name, email, department, year, message } = req.body;
  const entry = `"${name}","${email}","${department}","${year}","${message}"\n`;

  fs.appendFile(csvPath, entry, (err) => {
    if (err) {
      console.error("❌ Error writing to CSV:", err);
      return res.status(500).json({ status: "error" });
    }

    console.log("✅ Data saved to CSV");
    return res.json({ status: "success" });
  });
});

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 Aspire Club Backend running at http://localhost:${PORT}`);
});
