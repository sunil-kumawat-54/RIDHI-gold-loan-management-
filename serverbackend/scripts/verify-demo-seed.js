const mysql = require('mysql2/promise');
require('dotenv').config();

if (process.env.DEMO_SEED !== 'true' || process.env.DEMO_DATABASE !== 'vinsupgms' || process.env.DATABASE !== 'vinsupgms') {
  throw new Error('Demo verification requires DEMO_SEED=true, DEMO_DATABASE=vinsupgms, and DATABASE=vinsupgms.');
}

const connectionConfig = {
  host: process.env.HOST || 'localhost',
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
};

const count = async (connection, label, sql, params = []) => {
  const [rows] = await connection.query(sql, params);
  const value = Number(rows[0].count);
  console.log(`${label}: ${value}`);
  if (value === 0) throw new Error(`Verification failed: ${label} is empty.`);
};

const zeroCheck = async (connection, label, sql) => {
  const [rows] = await connection.query(sql);
  const value = Number(rows[0].count);
  console.log(`${label}: ${value}`);
  if (value !== 0) throw new Error(`Verification failed: ${label} found ${value} invalid rows.`);
};

async function verify() {
  const connection = await mysql.createConnection(connectionConfig);
  try {
    await count(connection, 'Demo users', "SELECT COUNT(*) AS count FROM users WHERE email LIKE '%@demo.invalid'");
    await count(connection, 'Demo customers', "SELECT COUNT(*) AS count FROM customer WHERE customer_name LIKE 'Demo Customer%'");
    await count(connection, 'Demo loans', 'SELECT COUNT(*) AS count FROM loanapprovaldetails WHERE loan_id >= 900500 AND loan_id < 900528');
    await count(connection, 'Demo jewel details', 'SELECT COUNT(*) AS count FROM jeweldetail WHERE jewel_id >= 900600 AND jewel_id < 900628');
    await count(connection, 'Demo gold rates', 'SELECT COUNT(*) AS count FROM goldrate WHERE goldrate_id >= 900400 AND goldrate_id < 900430');
    await count(connection, 'Demo balancesheets', 'SELECT COUNT(*) AS count FROM balancesheet WHERE balancesheet_id >= 902050 AND balancesheet_id < 902062');
    await count(connection, 'Demo transfer entries', 'SELECT COUNT(*) AS count FROM transferbankcredit WHERE transferbankcredit_receipt_id >= 902200 AND transferbankcredit_receipt_id < 902206');
    await count(connection, 'Demo employees', "SELECT COUNT(*) AS count FROM employeeregistration WHERE employee_id >= 900300 AND employee_id < 900308");
    await count(connection, 'Demo salary rows', "SELECT COUNT(*) AS count FROM salarydetails WHERE employee_name LIKE 'Demo Employee %'");
    await zeroCheck(connection, 'Duplicate demo salary rows', "SELECT COUNT(*) AS count FROM (SELECT employee_id FROM salarydetails WHERE employee_name LIKE 'Demo Employee %' GROUP BY employee_id HAVING COUNT(*) > 1) duplicates");

    await zeroCheck(connection, 'Duplicate demo phone numbers', "SELECT COUNT(*) AS count FROM (SELECT phone_no FROM users WHERE email LIKE '%@demo.invalid' GROUP BY phone_no HAVING COUNT(*) > 1) duplicates");
    await zeroCheck(connection, 'Duplicate demo emails', "SELECT COUNT(*) AS count FROM (SELECT email FROM users WHERE email LIKE '%@demo.invalid' GROUP BY email HAVING COUNT(*) > 1) duplicates");
    await zeroCheck(connection, 'Orphan loans', 'SELECT COUNT(*) AS count FROM loanapprovaldetails loan LEFT JOIN customer customer ON customer.customer_id = loan.customer_id WHERE loan.loan_id >= 900500 AND customer.customer_id IS NULL');
    await zeroCheck(connection, 'Orphan jewels', 'SELECT COUNT(*) AS count FROM jeweldetail jewel LEFT JOIN loanapprovaldetails loan ON loan.loan_id = jewel.loan_id WHERE jewel.jewel_id >= 900600 AND loan.loan_id IS NULL');
    await zeroCheck(connection, 'Orphan loan values', 'SELECT COUNT(*) AS count FROM totalloanvalue value_row LEFT JOIN loanapprovaldetails loan ON loan.loan_id = value_row.loan_id WHERE value_row.totalloanvalue_id >= 900700 AND loan.loan_id IS NULL');
    await zeroCheck(connection, 'Orphan interest rows', 'SELECT COUNT(*) AS count FROM interest_table interest LEFT JOIN loanapprovaldetails loan ON loan.loan_id = interest.loan_id WHERE interest.interest_id >= 900800 AND loan.loan_id IS NULL');
    await zeroCheck(connection, 'Orphan part payments', 'SELECT COUNT(*) AS count FROM partpayment payment LEFT JOIN loanapprovaldetails loan ON loan.loan_id = payment.loan_id WHERE payment.partpayment_id >= 901000 AND loan.loan_id IS NULL');
    await zeroCheck(connection, 'Orphan settlements', 'SELECT COUNT(*) AS count FROM settlement settlement LEFT JOIN loanapprovaldetails loan ON loan.loan_id = settlement.loan_id WHERE settlement.settlement_id >= 901150 AND loan.loan_id IS NULL');
    await zeroCheck(connection, 'Negative demo loan balances', 'SELECT COUNT(*) AS count FROM loanapprovaldetails WHERE loan_id >= 900500 AND balance < 0');

    console.log('Demo seed verification passed.');
  } finally {
    await connection.end();
  }
}

verify().catch((error) => {
  console.error('Demo seed verification failed:', error.message);
  process.exitCode = 1;
});