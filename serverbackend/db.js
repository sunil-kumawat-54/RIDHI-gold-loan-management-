const mysql = require('mysql2');
require('dotenv').config();

const HOST = process.env.HOST;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const DATABASE = process.env.DATABASE;
const DB_PORT = process.env.DB_PORT || 3306;

const connection = mysql.createConnection({
  host: HOST,
  port: DB_PORT,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ', err);
    return;
  }
  console.log('Connected to the database');
});

module.exports = connection;
