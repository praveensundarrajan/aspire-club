const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Backend route
const registerRoute = require('./routes/register');
app.use('/api', registerRoute);

// ✅ Optional: welcome route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
