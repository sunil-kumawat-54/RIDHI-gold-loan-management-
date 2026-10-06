const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./app/routes/apiRoutes');
const authRoutes = require('./app/routes/authRoutes');
const schedule = require('node-schedule');
require('dotenv').config();
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const app = express();
const PORT = process.env.PORT;
const HOSTNAME = /your_host_name/i.test(process.env.HOSTNAME || '') ? 'localhost' : (process.env.HOSTNAME || 'localhost');

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', apiRoutes);
app.use('/auth', authRoutes);

const localBuildPath = path.join(__dirname, 'build');
const frontendBuildPath = path.join(__dirname, '..', 'GMSfrontend', 'build');
const buildPath = fs.existsSync(path.join(localBuildPath, 'index.html')) ? localBuildPath : frontendBuildPath;

// Serve static files
app.use(express.static(buildPath));
app.use('/vinsupgms', express.static(buildPath));

// Handle client-side routing by returning index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const db = require('./db');
// Start server
app.listen(PORT, HOSTNAME, () => {
  console.log(`Server is running at http://${HOSTNAME}:${PORT}`);
});
