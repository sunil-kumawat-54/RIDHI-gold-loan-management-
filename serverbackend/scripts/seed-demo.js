const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DEMO_PREFIX = 'DEMO-';
const BASE_ID = 900000;

if (process.env.DEMO_SEED !== 'true') {
  throw new Error('Demo seed blocked. Set DEMO_SEED=true explicitly.');
}

if (process.env.NODE_ENV === 'production') {
  throw new Error('Demo seed blocked when NODE_ENV=production.');
}

if (process.env.DEMO_DATABASE !== 'vinsupgms' || process.env.DATABASE !== 'vinsupgms') {
  throw new Error('Demo seed requires DEMO_DATABASE=vinsupgms and DATABASE=vinsupgms.');
}

const connectionConfig = {
  host: process.env.HOST || 'localhost',
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  multipleStatements: false
};

const isoDate = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
};

const dateFromNow = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
};

const makeRows = (count, factory) => Array.from({ length: count }, (_, index) => factory(index));

async function insertRows(connection, table, rows, summary) {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]);
  const placeholders = `(${columns.map(() => '?').join(', ')})`;
  const sql = `INSERT IGNORE INTO \`${table}\` (${columns.map((column) => `\`${column}\``).join(', ')}) VALUES ${rows
    .map(() => placeholders)
    .join(', ')}`;
  const values = rows.flatMap((row) => columns.map((column) => row[column]));
  const [result] = await connection.query(sql, values);
  summary[table] = (summary[table] || 0) + result.affectedRows;
}

function denominationCounts(index) {
  return {
    count500: String(index % 4),
    count200: String((index + 1) % 5),
    count100: String((index + 2) % 8),
    count50: String(index % 3),
    count20: String((index + 2) % 6),
    count10: String((index + 1) % 7),
    count5: String(index % 2),
    count2: String((index + 1) % 3),
    count1: String((index + 2) % 4)
  };
}

async function seed() {
  const connection = await mysql.createConnection(connectionConfig);
  const summary = {};
  const passwordHash = await bcrypt.hash('Demo@12345', 10);

  try {
    await connection.beginTransaction();

    const states = ['Demo State', 'Fictional Pradesh', 'Sample Nadu'];
    const cities = ['Demo City', 'Sample Nagar', 'Testpur', 'Example Valley'];

    await insertRows(
      connection,
      'masterstate',
      states.map((state_name, index) => ({ state_id: BASE_ID + index + 1, state_name, created_at: new Date(), updated_at: new Date() })),
      summary
    );
    await insertRows(
      connection,
      'mastercity',
      cities.map((city_name, index) => ({
        city_id: BASE_ID + index + 1,
        city_name,
        pincode: `9000${index + 1}`,
        status: index === cities.length - 1 ? 0 : 1,
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );
    await insertRows(
      connection,
      'masterrelationship',
      ['Spouse', 'Parent', 'Sibling', 'Guardian'].map((relation_type, index) => ({
        relationship_id: BASE_ID + index + 1,
        relation_type,
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );
    await insertRows(
      connection,
      'masterjeweltype',
      ['Necklace', 'Bangle', 'Ring', 'Earrings', 'Chain'].map((jeweltype_name, index) => ({
        jeweltype_id: BASE_ID + index + 1,
        jeweltype_name,
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );
    await insertRows(
      connection,
      'masterpurity',
      ['18K', '20K', '22K', '24K'].map((master_purity, index) => ({
        masterpurity_id: BASE_ID + index + 1,
        master_purity,
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );
    await insertRows(
      connection,
      'masterloanscheme',
      ['Demo Standard 6M', 'Demo Standard 12M', 'Demo Flex 18M'].map((masterloan_scheme, index) => ({
        masterloanscheme_id: BASE_ID + index + 1,
        masterloan_scheme,
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );

    await insertRows(
      connection,
      'users',
      [
        ['superadmin', 'superadmin@demo.invalid', '9999000001', 'superadmin'],
        ['admin', 'admin@demo.invalid', '9999000002', 'admin'],
        ['branch.operator', 'operator@demo.invalid', '9999000003', 'operator'],
        ['report.viewer', 'viewer@demo.invalid', '9999000004', 'viewer']
      ].map(([user_name, email, phone_no, user_type], index) => ({
        id: BASE_ID + 100 + index,
        user_name,
        email,
        phone_no,
        password: passwordHash,
        flat_no: `${index + 1} Demo Block`,
        address: 'Demo Avenue',
        landmark: 'Fictional Plaza',
        country: 'Demo Country',
        state: states[index % states.length],
        district: cities[index % cities.length],
        user_type,
        branch_code: `DEMO-${String(index + 1).padStart(2, '0')}`,
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );

    const customers = makeRows(36, (index) => ({
      customer_id: BASE_ID + 200 + index,
      customer_image: `demo/customer-${String(index + 1).padStart(3, '0')}.jpg`,
      customer_name: index === 35 ? 'Demo Customer With A Deliberately Long Fictional Name For UI Testing' : `Demo Customer ${String(index + 1).padStart(2, '0')}`,
      date_of_birth: `19${70 + (index % 20)}-${String((index % 9) + 1).padStart(2, '0')}-15`,
      gender: index % 3 === 0 ? 'Female' : 'Male',
      phonenumber: `888800${String(index).padStart(4, '0')}`,
      phonenumber_type: 'Mobile',
      mobile_number: `777700${String(index).padStart(4, '0')}`,
      address_line_one: `${index + 10} Demo Avenue`,
      address_line_two: index === 35 ? 'Long Fictional Neighborhood Name For Overflow Testing' : `Demo Block ${index % 8 + 1}`,
      city: cities[index % cities.length],
      state: states[index % states.length],
      country: 'Demo Country',
      registration_date: isoDate((index * 7) % 420),
      care_of_type: index % 2 ? 'S/O' : 'D/O',
      care_of_name: `Demo Guardian ${index + 1}`,
      nominee_type: 'Nominee',
      nominee_name: `Demo Nominee ${index + 1}`,
      document1: 'Demo Identity Card',
      document_type1: 'Identity',
      document_copy1: `demo/documents/customer-${index + 1}-identity.jpg`,
      expire_date1: dateFromNow(365 + index),
      document_number1: `DEMO-ID-${String(index + 1).padStart(5, '0')}`,
      document2: 'Demo Address Proof',
      document_type2: 'Address',
      document_copy2: `demo/documents/customer-${index + 1}-address.jpg`,
      expire_date2: dateFromNow(500 + index),
      document_number2: `DEMO-ADDR-${String(index + 1).padStart(5, '0')}`,
      verified_by: 'demo.admin',
      created_at: new Date(),
      updated_at: new Date()
    }));
    await insertRows(connection, 'customer', customers, summary);

    const employees = makeRows(8, (index) => ({
      employee_id: BASE_ID + 300 + index,
      employee_name: `Demo Employee ${index + 1}`,
      mobile_no: `666600${String(index).padStart(4, '0')}`,
      date_of_birth: `198${index % 10}-0${(index % 8) + 1}-10`,
      email_id: `employee${index + 1}@demo.invalid`,
      address_line: `${index + 1} Demo Staff Road`,
      city: cities[index % cities.length],
      state: states[index % states.length],
      pincode: `9100${index + 1}`,
      employee_document: 'Demo Employee ID',
      employee_document_type: 'Identity',
      employee_document_copy: `demo/employees/${index + 1}-id.jpg`,
      employee_expire_date: dateFromNow(600),
      employee_document_number: `DEMO-EMP-${index + 1}`,
      company: 'Riddhi Demo Branch',
      date_of_joining: isoDate(index * 90),
      role: index === 0 ? 'Branch Manager' : 'Loan Officer',
      branch: `DEMO-${String(index % 3 + 1).padStart(2, '0')}`,
      employee_photo: `demo/employees/${index + 1}-photo.jpg`,
      institute_name: 'Demo Institute',
      year_of_passing: String(2010 + index),
      degree: 'Demo Commerce Degree',
      employee_attached_document: `demo/employees/${index + 1}-certificate.jpg`,
      created_at: new Date(),
      updated_at: new Date()
    }));
    await insertRows(connection, 'employeeregistration', employees, summary);

    await insertRows(
      connection,
      'goldrate',
      makeRows(30, (index) => ({
        goldrate_id: BASE_ID + 400 + index,
        date: isoDate(index),
        timing: index % 2 ? '10:00 AM' : '4:00 PM',
        carat_22: (6200 + index * 12).toFixed(2),
        carat_24: (6750 + index * 14).toFixed(2)
      })),
      summary
    );
    await insertRows(
      connection,
      'repledgeowner',
      makeRows(4, (index) => ({
        bank_id: BASE_ID + 450 + index,
        bank_name: `Demo Finance Partner ${index + 1}`,
        address: `${index + 1} Demo Bank Road`,
        phone_no: `555500${String(index).padStart(4, '0')}`,
        repledge_date: isoDate(index * 30),
        packet_no: `DEMO-PACKET-${index + 1}`,
        count: String(index + 2),
        total_weight: (45.5 + index * 12.25).toFixed(2),
        interest_rate: (8.5 + index * 0.5).toFixed(2),
        document_copy: `demo/repledge/${index + 1}-document.jpg`,
        remarks: 'Fictional demo repledge record',
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );

    const loans = makeRows(28, (index) => {
      const amount = 25000 + index * 4250;
      const closed = index % 5 === 0;
      const dueDays = index % 3 === 0 ? 90 : index % 3 === 1 ? 180 : 365;
      return {
        loan_id: BASE_ID + 500 + index,
        customer_id: customers[index % customers.length].customer_id,
        scheme: index % 3 === 0 ? 'Demo Standard 6M' : index % 3 === 1 ? 'Demo Standard 12M' : 'Demo Flex 18M',
        date: isoDate(index * 9),
        today_gold_rate: (6200 + index * 12).toFixed(2),
        loan_amount: amount.toFixed(2),
        adjustment_charges: (index % 4) * 150,
        additional_charges: 250 + (index % 5) * 50,
        final_amount: (amount + 250 + (index % 5) * 50 - (index % 4) * 150).toFixed(2),
        due_days: dueDays,
        date_ss: closed ? isoDate(index * 9 - 30) : dateFromNow((index % 4) * 30 - 15),
        care_of_name: customers[index % customers.length].care_of_name,
        address_line_one: customers[index % customers.length].address_line_one,
        address_line_two: customers[index % customers.length].address_line_two,
        mobile_number: customers[index % customers.length].mobile_number,
        balance: closed ? '0.00' : (amount * (0.35 + (index % 4) * 0.1)).toFixed(2),
        payed_date: closed ? isoDate(index * 9 - 30) : null,
        netamount: amount.toFixed(2),
        newamount: amount.toFixed(2),
        last_interest_calculation_date: isoDate(index * 3),
        created_at: new Date(),
        updated_at: new Date()
      };
    });
    await insertRows(connection, 'loanapprovaldetails', loans, summary);

    await insertRows(
      connection,
      'jeweldetail',
      loans.map((loan, index) => ({
        jewel_id: BASE_ID + 600 + index,
        loan_id: loan.loan_id,
        jewel_type: index % 2 ? 'Bangle' : 'Necklace',
        purity: index % 2 ? 22 : 20,
        count: index % 3 + 1,
        gross_weight: (18.5 + index * 1.2).toFixed(2),
        stone: (index % 3 * 0.35).toFixed(2),
        wastage: (index % 4 * 0.45).toFixed(2),
        net_weight: (17.8 + index * 1.1).toFixed(2),
        jewel_photo: `demo/jewels/${index + 1}-main.jpg`,
        jewel_type1: index % 4 === 0 ? 'Ring' : null,
        purity1: index % 4 === 0 ? 22 : null,
        count1: index % 4 === 0 ? 1 : null,
        gross_weight1: index % 4 === 0 ? '4.20' : null,
        stone1: index % 4 === 0 ? '0.10' : null,
        wastage1: index % 4 === 0 ? '0.20' : null,
        net_weight1: index % 4 === 0 ? '3.90' : null,
        jewel_photo1: index % 4 === 0 ? `demo/jewels/${index + 1}-secondary.jpg` : null
      })),
      summary
    );

    await insertRows(
      connection,
      'totalloanvalue',
      loans.map((loan, index) => ({
        totalloanvalue_id: BASE_ID + 700 + index,
        loan_id: loan.loan_id,
        total_amount: loan.loan_amount,
        final_amount: loan.final_amount,
        status: index % 5 === 0 ? 'Closed' : index % 4 === 0 ? 'Pending' : 'Active',
        remark: `${DEMO_PREFIX} loan status fixture`,
        ...Object.fromEntries(Object.entries(denominationCounts(index)).map(([key, value]) => [`l${key}`, value])),
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );

    await insertRows(
      connection,
      'interest_table',
      makeRows(50, (index) => ({
        interest_id: BASE_ID + 800 + index,
        loan_id: loans[index % loans.length].loan_id,
        date: isoDate(index * 3),
        interest_amount: (350 + index * 27.5).toFixed(2),
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );
    await insertRows(
      connection,
      'payments',
      makeRows(30, (index) => ({
        payment_id: BASE_ID + 900 + index,
        loan_id: loans[index % loans.length].loan_id,
        payment_date: isoDate(index * 5),
        payment_amount: (2500 + index * 475).toFixed(2)
      })),
      summary
    );
    await insertRows(
      connection,
      'transactions',
      makeRows(30, (index) => ({
        transaction_id: BASE_ID + 950 + index,
        loan_id: loans[index % loans.length].loan_id,
        transaction_date: isoDate(index * 4),
        amount: (1800 + index * 325).toFixed(2),
        description: `${DEMO_PREFIX} loan ledger transaction ${index + 1}`
      })),
      summary
    );

    await insertRows(
      connection,
      'partpayment',
      makeRows(20, (index) => ({
        partpayment_id: BASE_ID + 1000 + index,
        loan_id: loans[(index + 1) % loans.length].loan_id,
        date1: isoDate(index * 6),
        interest: (320 + index * 15).toFixed(2),
        paid_interest: (250 + index * 12).toFixed(2),
        payment_amount: (1800 + index * 300).toFixed(2),
        totalpayment_amount: (2050 + index * 312).toFixed(2),
        interest_balance: (70 + index * 3).toFixed(2),
        ...denominationCounts(index),
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );
    await insertRows(
      connection,
      'partpaymentinterest',
      makeRows(20, (index) => ({
        partpaymentinterest_id: BASE_ID + 1050 + index,
        loan_id: loans[(index + 1) % loans.length].loan_id,
        date1: isoDate(index * 6),
        interest: (320 + index * 15).toFixed(2),
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );
    await insertRows(
      connection,
      'partpaymentpaymentamount',
      makeRows(20, (index) => ({
        partpaymentpaymentamount_id: BASE_ID + 1100 + index,
        loan_id: loans[(index + 1) % loans.length].loan_id,
        date1: isoDate(index * 6),
        payment_amount: (1800 + index * 300).toFixed(2),
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );

    await insertRows(
      connection,
      'settlement',
      makeRows(6, (index) => ({
        settlement_id: BASE_ID + 1150 + index,
        loan_id: loans[index * 5].loan_id,
        additional_charge: '150.00',
        adjustment_charge: '50.00',
        date: isoDate(index * 20),
        interest1: (900 + index * 125).toFixed(2),
        loanamount: loans[index * 5].loan_amount,
        total_amount: (Number(loans[index * 5].loan_amount) + 1000 + index * 125).toFixed(2),
        s_count500: index + 1,
        s_count200: 2,
        s_count100: 3,
        s_count50: 1,
        s_count20: 2,
        s_count10: 1,
        S_count5: '1',
        S_count2: '0',
        S_count1: '0',
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );

    await insertRows(
      connection,
      'settlementinterest',
      makeRows(6, (index) => ({ settlementinterest_id: BASE_ID + 1160 + index, loan_id: loans[index * 5].loan_id, date: isoDate(index * 20), interest1: (900 + index * 125).toFixed(2), created_at: new Date(), updated_at: new Date() })),
      summary
    );
    await insertRows(
      connection,
      'settlementloanamount',
      makeRows(6, (index) => ({ settlementloanamount_id: BASE_ID + 1170 + index, loan_id: loans[index * 5].loan_id, date: isoDate(index * 20), loanamount: loans[index * 5].loan_amount, created_at: new Date(), updated_at: new Date() })),
      summary
    );
    await insertRows(
      connection,
      'settlementadditionalamount',
      makeRows(6, (index) => ({ settlementadditionalamount_id: BASE_ID + 1180 + index, loan_id: loans[index * 5].loan_id, date: isoDate(index * 20), additional_charge: '150.00', created_at: new Date(), updated_at: new Date() })),
      summary
    );
    await insertRows(
      connection,
      'settlementadjustmentamount',
      makeRows(6, (index) => ({ settlementadjustmentamount_id: BASE_ID + 1190 + index, loan_id: loans[index * 5].loan_id, adjustment_charge: '50.00', date: isoDate(index * 20), created_at: new Date(), updated_at: new Date() })),
      summary
    );

    await insertRows(
      connection,
      'attendancedetails',
      makeRows(40, (index) => ({
        employee_id: employees[index % employees.length].employee_id,
        employee_name: employees[index % employees.length].employee_name,
        employee_role: employees[index % employees.length].role,
        date: isoDate(index),
        check_in: index % 9 === 0 ? 'Leave' : '09:30',
        check_out: index % 9 === 0 ? 'Leave' : index % 7 === 0 ? '15:30' : '18:30'
      })),
      summary
    );
    await connection.query(
      "DELETE FROM salarydetails WHERE employee_id IN (?) AND employee_name LIKE 'Demo Employee %'",
      [employees.map((employee) => String(employee.employee_id))]
    );
    await insertRows(
      connection,
      'salarydetails',
      employees.map((employee, index) => ({
        salarydetail_id: BASE_ID + 1250 + index,
        employee_name: employee.employee_name,
        employee_id: String(employee.employee_id),
        total_working_days: '26',
        total_leave_days: String(index % 4),
        deduction: String(index * 250),
        salary_perday: String(900 + index * 75),
        salary_amount: String(23400 + index * 1700),
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );

    const primaryLedgerConfigs = [
      ['bankcredit', 'bankaccount_credit_receipt_no', 'bankaccount_credit_amount', 'bankaccount_credit_remark', 'bankaccount_credit_date'],
      ['bankdebit', 'bankaccount_debit_receipt_no', 'bankaccount_debit_amount', 'bankaccount_debit_remark', 'bankaccount_debit_date'],
      ['capitalcredit', 'capital_credit_receipt_no', 'capital_credit_amount', 'capital_credit_remark', 'capital_credit_date'],
      ['capitaldebit', 'capital_debit_receipt_no', 'capital_debit_amount', 'capital_debit_remark', 'capital_debit_date'],
      ['cashonhandcredit', 'cash_on_hand_credit_id', 'cashonhand_credit_amount', 'cashonhand_credit_remark', 'cashonhand_credit_date'],
      ['cashonhanddebit', 'cash_on_hand_debit_id', 'cashonhand_debit_amount', 'cashonhand_debit_remark', 'cashonhand_debit_date'],
      ['jewelloancredit', 'jewelloan_credit_receipt_no', 'jewelloan_credit_amount', 'jewelloan_credit_remark', 'jewelloan_credit_date'],
      ['jewelloandebit', 'jewelloan_debit_receipt_no', 'jewelloan_debit_amount', 'jewelloan_debit_remark', 'jewelloan_debit_date'],
      ['profitandlosscredit', 'profitandloss_credit_receipt_no', 'profitandloss_credit_amount', 'profitandloss_credit_remark', 'profitandloss_credit_date'],
      ['profitandlossdebit', 'profitandloss_debit_receipt_id', 'profitandloss_debit_amount', 'profitandloss_debit_remark', 'profitandloss_debit_date'],
      ['expencescredit', 'expences_credit_receipt_id', 'expences_credit_amount', 'expences_credit_remark', 'expences_credit_date'],
      ['expencesdebit', 'expences_debit_receipt_id', 'expences_debit_amount', 'expences_debit_remark', 'expences_debit_date'],
      ['furniturecredit', 'furniture_credit_receipt_no', 'furniture_credit_amount', 'furniture_credit_remark', 'furniture_credit_date'],
      ['furnituredebit', 'furniture_debit_receipt_no', 'furniture_debit_amount', 'furniture_debit_remark', 'furniture_debit_date'],
      ['suspencecredit', 'suspence_credit_recipt_id', 'suspence_credit_amount', 'suspence_credit_remark', 'suspence_credit_date'],
      ['suspencedebit', 'suspence_debit_recipt_id', 'suspence_debit_amount', 'suspence_debit_remark', 'suspence_debit_date']
    ];
    for (const [table, idColumn, amountColumn, remarkColumn, dateColumn] of primaryLedgerConfigs) {
      await insertRows(
        connection,
        table,
        makeRows(8, (index) => ({
          [idColumn]: BASE_ID + 1300 + primaryLedgerConfigs.indexOf(primaryLedgerConfigs.find((config) => config[0] === table)) * 20 + index,
          [amountColumn]: String(5000 + index * 725),
          [remarkColumn]: `${DEMO_PREFIX} ${table}`.slice(0, 30),
          [dateColumn]: isoDate(index * 11),
          created_at: new Date(),
          updated_at: new Date()
        })),
        summary
      );
    }

    const daybookConfigs = [
      ['bankcreditdb', 'bankcreditdb_id', 'bank_credit_date', 'bank_credit_receipt', 'bank_credit_particular', 'bank_credit_amount'],
      ['bankdebitdb', 'bankdebitdb_id', 'bank_debit_date', 'bank_debit_receipt', 'bank_debit_particular', 'bank_debit_amount'],
      ['capitalcreditdb', 'capitalcreditdb_id', 'capital_credit_date', 'capital_credit_receipt', 'capital_credit_particular', 'capital_credit_amount'],
      ['capitaldebitdb', 'capitaldebitdb_id', 'capital_debit_date', 'capital_debit_receipt', 'capital_debit_particular', 'capital_debit_amount'],
      ['expencescreditdb', 'expencescreditdb_id', 'expences_credit_date', 'expences_credit_receipt', 'expences_credit_particular', 'expences_credit_amount'],
      ['expencesdebitdb', 'expencesdebitdb_id', 'expences_debit_date', 'expences_debit_receipt', 'expences_debit_particular', 'expences_debit_amount'],
      ['furniturecreditdb', 'furniturecreditdb_id', 'furniture_credit_date', 'furniture_credit_receipt', 'furniture_credit_particular', 'furniture_credit_amount'],
      ['furnituredebitdb', 'furnituredebitdb_id', 'furniture_debit_date', 'furniture_debit_receipt', 'furniture_debit_particular', 'furniture_debit_amount'],
      ['jewelloancreditdb', 'jewelloancreditdb_id', 'jewelloandb_credit_date', 'jewelloandb_credit_receipt', 'jewelloandb_credit_particular', 'jewelloandb_credit_amount'],
      ['jewelloandebitdb', 'jewelloandebitdb_id', 'jewelloandb_debit_date', 'jewelloandb_debit_receipt', 'jewelloandb_debit_particular', 'jewelloandb_debit_amount'],
      ['profitandlosscreditdb', 'profitandlosscreditdb_id', 'profitandlossdb_credit_date', 'profitandlossdb_credit_receipt', 'profitandlossdb_credit_particular', 'profitandlossdb_credit_amount'],
      ['profitandlossdebitdb', 'profitandlossdebitdb_id', 'profitandlossdb_debit_date', 'profitandlossdb_debit_receipt', 'profitandlossdb_debit_particular', 'profitandlossdb_debit_amount'],
      ['suspencecreditdb', 'suspencecreditdb_id', 'suspence_credit_date', 'suspence_credit_receipt', 'suspence_credit_particular', 'suspence_credit_amount'],
      ['suspencedebitdb', 'suspencedebitdb_id', 'suspence_debit_date', 'suspence_debit_receipt', 'suspence_debit_particular', 'suspence_debit_amount']
    ];
    for (const [table, idColumn, dateColumn, receiptColumn, particularColumn, amountColumn] of daybookConfigs) {
      await insertRows(
        connection,
        table,
        makeRows(8, (index) => ({
          [idColumn]: BASE_ID + 1700 + daybookConfigs.indexOf(daybookConfigs.find((config) => config[0] === table)) * 20 + index,
          [dateColumn]: isoDate(index * 11),
          [receiptColumn]: `D${BASE_ID + index}`,
          [particularColumn]: `${DEMO_PREFIX} entry`.slice(0, 40),
          [amountColumn]: String(5000 + index * 725),
          created_at: new Date(),
          updated_at: new Date()
        })),
        summary
      );
    }

    const transferConfigs = [
      ['transferbankcredit', 'transferbankcredit_receipt_id', 'transferbank_credit_amount', 'transferbank_credit_remark', 'transferbank_credit_date'],
      ['transferbankdebit', 'transferbankdebit_receipt_id', 'transferbank_debit_amount', 'transferbank_debit_remark', 'transferbank_debit_date'],
      ['transfercapitalcredit', 'transfercapitalcredit_receipt_id', 'transfercapital_credit_amount', 'transfercapital_credit_remark', 'transfercapital_credit_date'],
      ['transfercapitaldebit', 'transfercapitaldebit_receipt_id', 'transfercapital_debit_amount', 'transfercapital_debit_remark', 'transfercapital_debit_date'],
      ['transferexpencescredit', 'transferexpencescredit_receipt_id', 'transferexpences_credit_amount', 'transferexpences_credit_remark', 'transferexpences_credit_date', 'transferexpences_credit_particular'],
      ['transferexpencesdebit', 'transferexpencesdebit_receipt_id', 'transferexpences_debit_amount', 'transferexpences_debit_remark', 'transferexpences_debit_date', 'transferexpences_debit_particular'],
      ['transferfurniturecredit', 'transferfurniturecredit_receipt_id', 'transferfurniture_credit_amount', 'transferfurniture_credit_remark', 'transferfurniture_credit_date'],
      ['transferfurnituredebit', 'transferfurnituredebit_receipt_id', 'transferfurniture_debit_amount', 'transferfurniture_debit_remark', 'transferfurniture_debit_date'],
      ['transferjewelloancredit', 'transferjewelloancredit_receipt_id', 'transferjewelloan_credit_amount', 'transferjewelloan_credit_remark', 'transferjewelloan_credit_date'],
      ['transferjewelloandebit', 'transferjewelloandebit_receipt_id', 'transferjewelloan_debit_amount', 'transferjewelloan_debit_remark', 'transferjewelloan_debit_date'],
      ['transferprofitandlosscredit', 'transferprofitandlosscredit_receipt_id', 'transferprofitandloss_credit_amount', 'transferprofitandloss_credit_remark', 'transferprofitandloss_credit_date'],
      ['transferprofitandlossdebit', 'transferprofitandlossdebit_receipt_id', 'transferprofitandloss_debit_amount', 'transferprofitandloss_debit_remark', 'transferprofitandloss_debit_date'],
      ['transfersuspencecredit', 'transfersuspencecredit_receipt_id', 'transfersuspence_credit_amount', 'transfersuspence_credit_remark', 'transfersuspence_credit_date'],
      ['transfersuspencedebit', 'transfersuspencedebit_receipt_id', 'transfersuspence_debit_amount', 'transfersuspence_debit_remark', 'transfersuspence_debit_date']
    ];
    for (const [table, idColumn, amountColumn, remarkColumn, dateColumn, particularColumn] of transferConfigs) {
      await insertRows(
        connection,
        table,
        makeRows(6, (index) => ({
          [idColumn]: BASE_ID + 2200 + transferConfigs.indexOf(transferConfigs.find((config) => config[0] === table)) * 20 + index,
          [amountColumn]: String(3000 + index * 450),
          [remarkColumn]: `${DEMO_PREFIX} transfer`.slice(0, 20),
          [dateColumn]: isoDate(index * 13),
          ...(particularColumn ? { [particularColumn]: 'Demo internal transfer' } : {}),
          created_at: new Date(),
          updated_at: new Date()
        })),
        summary
      );
    }

    await insertRows(
      connection,
      'cashscroll',
      makeRows(12, (index) => ({ cashscroll_id: BASE_ID + 2000 + index, opening_amount: String(100000 + index * 5000), date: isoDate(index * 8), closing_amount: String(105000 + index * 5000), created_at: new Date(), updated_at: new Date() })),
      summary
    );
    await insertRows(
      connection,
      'cashscrolldenomination',
      makeRows(12, (index) => ({ CashScrolldenomination_id: BASE_ID + 2020 + index, csc_count500: String(10 + index), csc_count200: '8', csc_count100: '12', csc_count50: '6', csc_count20: '10', csc_count10: '15', csc_count5: '3', csc_count2: '4', csc_count1: '5', created_at: new Date(), updated_at: new Date() })),
      summary
    );
    await insertRows(
      connection,
      'balancesheet',
      makeRows(12, (index) => ({
        balancesheet_id: BASE_ID + 2050 + index,
        date: isoDate(index * 8),
        capital_balance: String(250000 + index * 8500),
        cash_balance: String(105000 + index * 5000),
        profitloss_balance: String(45000 + index * 2400),
        bank_balance: String(325000 + index * 9000),
        jewel_balance: String(175000 + index * 7000),
        expences_balance: String(22000 + index * 700),
        suspence_balance: String(9000 + index * 300),
        furniture_balance: String(65000 + index * 1000),
        created_at: new Date(),
        updated_at: new Date()
      })),
      summary
    );

    await insertRows(
      connection,
      'userlog',
      makeRows(16, (index) => ({ log_id: BASE_ID + 2100 + index, name: ['superadmin', 'admin', 'branch.operator', 'report.viewer'][index % 4], loginTime: isoDate(index * 2), ip_address: `192.0.2.${index + 1}`, created_at: new Date(), updated_at: new Date() })),
      summary
    );

    await connection.commit();
    console.log('Demo seed completed safely for database:', process.env.DATABASE);
    Object.entries(summary).forEach(([table, count]) => console.log(`${table}: ${count} inserted`));
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

seed().catch((error) => {
  console.error('Demo seed failed:', error.message);
  process.exitCode = 1;
});