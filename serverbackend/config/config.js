require('dotenv').config();

const host = process.env.HOST || '127.0.0.1';
const user = process.env.USER || 'root';
const password = process.env.PASSWORD || 'sunil';
const database = process.env.DATABASE || 'vinsupgms';
const port = process.env.DB_PORT || 3306;

module.exports = {
  jwtSecret: 'ABCD',
  database: {
    host: (host.trim() === 'localhost' || !host.trim()) ? '127.0.0.1' : host.trim(),
    port: port,
    user: user.trim(),
    password: password.trim(),
    database: database.trim(),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  }
};