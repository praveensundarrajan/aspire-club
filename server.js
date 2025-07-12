const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Replace with your actual Google Script URL
const formURL = 'https://script.google.com/macros/s/AKfycbyWSLa6a8F-hoacEF99_66IG-WC0rokDXMwCuH802d4cQPTemklOqyzI6syq8E4QEbi/exec';

app.post('/register', async (req, res) => {
  try {
    const response = await fetch(formURL, {
      method: 'POST',
      body: JSON.stringify(req.body),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Submission failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
