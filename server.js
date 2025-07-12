const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const CSV_FILE = path.join(__dirname, "submissions.csv");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Ensure CSV file has headers
if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, "Name,Email,Department,Year,Message,DateTime\n");
}

app.post("/api/register", (req, res) => {
    const { name, email, department, year, message } = req.body;
    const datetime = new Date().toLocaleString();

    const row = `"${name}","${email}","${department}","${year}","${message}","${datetime}"\n`;

    fs.appendFile(CSV_FILE, row, (err) => {
        if (err) {
            console.error("Error saving data:", err);
            return res.status(500).json({ status: "error", message: "Failed to save data" });
        }
        res.json({ status: "success", message: "Registered successfully" });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
