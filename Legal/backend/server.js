const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Legal Backend API is running!' });
});

// Legal routes
app.use('/api/legal', require('./routes/legal'));

// Start server
app.listen(PORT, () => {
  console.log(`Legal backend server is running on port ${PORT}`);
});