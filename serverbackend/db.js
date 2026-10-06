const mysql = require('mysql2');
require('dotenv').config();

const HOST = (process.env.HOST || '127.0.0.1').trim();
const USER = (process.env.USER || 'root').trim();
const PASSWORD = (process.env.PASSWORD || 'sunil').trim();
const DATABASE = (process.env.DATABASE || 'vinsupgms').trim();
const DB_PORT = process.env.DB_PORT || 3306;

const pool = mysql.createPool({
  host: (HOST === 'localhost' || !HOST) ? '127.0.0.1' : HOST,
  port: DB_PORT,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error('Error connecting to database pool: ', err);
    return;
  }
  console.log('Connected to the database pool successfully');
  conn.release();
});

module.exports = pool;
