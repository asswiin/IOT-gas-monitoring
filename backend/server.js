require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const newconnectionRoute = require('./routes/newconnection')
const paymentRoute = require('./routes/payment');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/login', loginRoute);
app.use('/api/register', registerRoute);
app.use('/api/newconnection',newconnectionRoute)
app.use('/api/payment', paymentRoute);



// Simple health check
app.get('/', (req, res) => res.send('API running'));

// MongoDB URI from .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mydatabase';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });
