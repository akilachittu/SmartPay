const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/smartpay',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function initDB() {
  // Use all-lowercase column names to avoid PostgreSQL case-folding issues
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT,
      name TEXT,
      email TEXT,
      dob TEXT,
      kycstatus TEXT,
      pin TEXT,
      onlinebalance INTEGER,
      offlinebalance INTEGER,
      publickey TEXT,
      linkedbank TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id TEXT PRIMARY KEY,
      userid TEXT,
      bankname TEXT,
      accountno TEXT,
      isprimary BOOLEAN,
      balance INTEGER
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      payerid TEXT,
      payeeid TEXT,
      amount INTEGER,
      nonce TEXT,
      signature TEXT,
      timestamp TIMESTAMP,
      type TEXT
    )
  `);

  // Seed users — ON CONFLICT DO NOTHING preserves balances across restarts
  const uq = `
    INSERT INTO users (id, phone, name, pin, kycstatus, onlinebalance, offlinebalance, publickey)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO NOTHING
  `;
  await pool.query(uq, ['user_1', '9876543210', 'Alice', '1234', 'VERIFIED', 25000, 2000, 'DUMMY_PUB_KEY_1']);
  await pool.query(uq, ['user_2', 'user2phone', 'Bob', '1234', 'VERIFIED', 10000, 1000, 'DUMMY_PUB_KEY_2']);

  // Seed demo transactions
  const tq = `
    INSERT INTO transactions (id, payerid, payeeid, amount, type, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO NOTHING
  `;
  await pool.query(tq, ['txn_demo_1', 'user_1', 'user_2', 500,  'ONLINE',           '2026-03-19T10:30:00']);
  await pool.query(tq, ['txn_demo_2', 'user_2', 'user_1', 200,  'ONLINE',           '2026-03-19T11:45:00']);
  await pool.query(tq, ['txn_demo_3', 'user_1', 'user_2', 100,  'OFFLINE_BLE_SYNC', '2026-03-19T14:20:00']);
  await pool.query(tq, ['txn_demo_4', 'user_1', 'user_2', 50,   'SMS_FALLBACK',     '2026-03-19T16:00:00']);
  await pool.query(tq, ['txn_demo_5', 'user_2', 'user_1', 750,  'ONLINE',           '2026-03-18T09:15:00']);
}
initDB().catch(console.error);

// ─── AUTH ────────────────────────────────────────────────────────────────────

app.post('/api/auth/otp', async (req, res) => {
  if (req.body.otp !== '1234') {
    return res.status(401).json({ error: 'Invalid OTP' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [req.body.phone]);
    const row = result.rows[0];
    if (row) {
      return res.json({ token: 'mock_jwt_token', userId: row.id, isNewUser: false });
    }
    return res.json({ token: 'mock_temp_token', isNewUser: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── REGISTRATION ────────────────────────────────────────────────────────────

app.post('/api/user/register', async (req, res) => {
  const { phone, name, email, dob, pin, publicKey } = req.body;
  const userId = 'user_' + Date.now();
  try {
    await pool.query(
      `INSERT INTO users (id, phone, name, email, dob, pin, kycstatus, onlinebalance, offlinebalance, publickey)
       VALUES ($1, $2, $3, $4, $5, $6, 'VERIFIED', 25000, 2000, $7)`,
      [userId, phone, name, email, dob, pin, publicKey || 'DUMMY_PUB_KEY']
    );
    res.json({ success: true, userId, message: 'Registered Successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration Failed' });
  }
});

// ─── BANK LINK ───────────────────────────────────────────────────────────────

app.post('/api/user/link-bank', async (req, res) => {
  const { userId, bankName, accountNo } = req.body;
  
  // --- Validation Logic ---
    // Bank-Specific Length Validation
    let isValid = false;
    let expectedLength = "";

    if (bankName === 'State Bank of India') {
      isValid = accountNo.length === 11;
      expectedLength = "11 digits";
    } else if (bankName === 'HDFC Bank') {
      isValid = accountNo.length === 14;
      expectedLength = "14 digits";
    } else {
      isValid = accountNo.length >= 10 && accountNo.length <= 18;
      expectedLength = "10-18 digits";
    }

    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        error: `Incorrect Choose Bank: ${bankName} account must be ${expectedLength}.` 
      });
    }

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userRes.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    
    const banksRes = await pool.query('SELECT * FROM bank_accounts WHERE userid = $1', [userId]);
    const existingBanks = banksRes.rows;
    
    if (existingBanks.some(b => b.accountno === accountNo)) {
      return res.status(400).json({ error: 'This account is already linked.' });
    }

    const newBankId = 'bank_' + Date.now();
    const isPrimary = existingBanks.length === 0;
    const balance = 10000 + Math.floor(Math.random() * 90000);

    await pool.query(
      'INSERT INTO bank_accounts (id, userid, bankname, accountno, isprimary, balance) VALUES ($1, $2, $3, $4, $5, $6)',
      [newBankId, userId, bankName, accountNo, isPrimary, balance]
    );

    res.json({ success: true, message: 'Bank Successfully Linked!', bank: {
      id: newBankId,
      bankName,
      accountNo,
      isPrimary,
      balance
    }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/user/banks/:userId', async (req, res) => {
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.userId]);
    if (userRes.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    
    const banksRes = await pool.query('SELECT * FROM bank_accounts WHERE userid = $1', [req.params.userId]);
    
    // Format to camelCase for frontend
    const banks = banksRes.rows.map(b => ({
      id: b.id,
      bankName: b.bankname,
      accountNo: b.accountno,
      isPrimary: b.isprimary,
      balance: b.balance
    }));
    res.json({ banks });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/user/set-primary-bank', async (req, res) => {
  const { userId, bankId } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE bank_accounts SET isprimary = false WHERE userid = $1', [userId]);
    await client.query('UPDATE bank_accounts SET isprimary = true WHERE userid = $1 AND id = $2', [userId, bankId]);
    await client.query('COMMIT');
    res.json({ success: true, message: 'Primary account updated.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
});

// ─── TRANSACTION HISTORY ─────────────────────────────────────────────────────

app.get('/api/history/:userId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id, 
        t.payerid as "payerId", 
        t.payeeid as "payeeId", 
        t.amount, 
        t.type, 
        t.timestamp,
        p1.name as "payerName",
        p2.name as "payeeName"
      FROM transactions t
      LEFT JOIN users p1 ON t.payerid = p1.id
      LEFT JOIN users p2 ON t.payeeid = p2.id
      WHERE t.payerid = $1 OR t.payeeid = $2 
      ORDER BY t.timestamp DESC
    `, [req.params.userId, req.params.userId]);
    res.json({ history: result.rows || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── WALLET BALANCE ──────────────────────────────────────────────────────────

app.get('/api/user/wallet/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT onlinebalance, offlinebalance FROM users WHERE id = $1',
      [req.params.id]
    );
    const row = result.rows[0];
    if (!row) return res.status(404).json({ error: 'User not found' });
    // Normalize to camelCase for frontend compatibility
    res.json({ onlineBalance: row.onlinebalance, offlineBalance: row.offlinebalance });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── VERIFY PIN ──────────────────────────────────────────────────────────────

app.post('/api/user/verify-pin', async (req, res) => {
  const { userId, pin } = req.body;
  try {
    const result = await pool.query('SELECT pin FROM users WHERE id = $1', [userId]);
    const row = result.rows[0];
    if (!row) return res.status(404).json({ error: 'User not found' });
    if (row.pin === pin) return res.json({ success: true });
    res.json({ success: false, error: 'Incorrect PIN' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── SELF TRANSFER (HYBRID WALLET) ───────────────────────────────────────────

app.post('/api/user/wallet/transfer', async (req, res) => {
  const { userId, direction, amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'SELECT onlinebalance, offlinebalance FROM users WHERE id = $1',
      [userId]
    );
    const row = result.rows[0];
    if (!row) throw new Error('User not found');

    if (direction === 'ONLINE_TO_OFFLINE') {
      if (row.onlinebalance < amount) throw new Error('Insufficient online balance');
      await client.query(
        'UPDATE users SET onlinebalance = onlinebalance - $1, offlinebalance = offlinebalance + $2 WHERE id = $3',
        [amount, amount, userId]
      );
    } else if (direction === 'OFFLINE_TO_ONLINE') {
      if (row.offlinebalance < amount) throw new Error('Insufficient offline balance');
      await client.query(
        'UPDATE users SET offlinebalance = offlinebalance - $1, onlinebalance = onlinebalance + $2 WHERE id = $3',
        [amount, amount, userId]
      );
    } else {
      throw new Error('Invalid direction');
    }

    await client.query('COMMIT');
    res.json({ success: true, message: `Transferred ₹${amount} successfully.` });
  } catch (err) {
    await client.query('ROLLBACK');
    const status = err.message === 'User not found' ? 404 : 400;
    res.status(status).json({ error: err.message || 'Transfer Failed' });
  } finally {
    client.release();
  }
});

// ─── ONLINE TRANSFER ─────────────────────────────────────────────────────────

app.post('/api/transfer', async (req, res) => {
  const { payerId, payeeId, amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
  if (payerId === payeeId) return res.status(400).json({ error: 'Cannot transfer to yourself' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'SELECT onlinebalance FROM users WHERE id = $1',
      [payerId]
    );
    const row = result.rows[0];
    if (!row) throw new Error('Payer not found');
    if (row.onlinebalance < amount) throw new Error('Insufficient balance');

    await client.query('UPDATE users SET onlinebalance = onlinebalance - $1 WHERE id = $2', [amount, payerId]);
    await client.query('UPDATE users SET onlinebalance = onlinebalance + $1 WHERE id = $2', [amount, payeeId]);
    await client.query(
      'INSERT INTO transactions (id, payerid, payeeid, amount, type, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
      [`txn_${Date.now()}`, payerId, payeeId, amount, 'ONLINE', new Date().toISOString()]
    );
    await client.query('COMMIT');
    res.json({ success: true, message: `Sent ₹${amount} to ${payeeId}` });
  } catch (err) {
    await client.query('ROLLBACK');
    const status = err.message === 'Payer not found' ? 404 : 400;
    res.status(status).json({ error: err.message || 'Transfer Failed' });
  } finally {
    client.release();
  }
});

// ─── OFFLINE SYNC (BLE / SMS) ─────────────────────────────────────────────────

app.post('/settle', async (req, res) => {
  const { payerId, payeeId, amount, nonce, signature, timestamp, type } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bResult = await client.query('SELECT offlinebalance FROM users WHERE id = $1', [payerId]);
    const bRow = bResult.rows[0];
    if (!bRow) throw new Error('Payer account not found');
    if (bRow.offlinebalance < amount) throw new Error('Insufficient offline balance for this transaction');

    await client.query('UPDATE users SET offlinebalance = offlinebalance - $1 WHERE id = $2', [amount, payerId]);
    await client.query('UPDATE users SET onlinebalance  = onlinebalance  + $1 WHERE id = $2', [amount, payeeId]);
    await client.query(
      'INSERT INTO transactions (id, payerid, payeeid, amount, nonce, signature, timestamp, type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [`off_${Date.now()}`, payerId, payeeId, amount, nonce, signature, timestamp, type || 'OFFLINE_BLE_SYNC']
    );
    await client.query('COMMIT');
    res.json({ success: true, message: 'Offline sync successful.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message || 'Sync Failed' });
  } finally {
    client.release();
  }
});

// ─── PROFILE ─────────────────────────────────────────────────────────────────

app.get('/api/user/profile/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT name, email, phone, dob, kycstatus FROM users WHERE id = $1',
      [req.params.id]
    );
    const row = result.rows[0];
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json({
      name: row.name,
      email: row.email,
      phone: row.phone,
      dob: row.dob,
      kycStatus: row.kycstatus   // normalize back to camelCase for frontend
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/user/profile/:id', async (req, res) => {
  const { name, email, dob } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    await pool.query(
      'UPDATE users SET name = $1, email = $2, dob = $3 WHERE id = $4',
      [name, email, dob, req.params.id]
    );
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ─── USER LOOKUP ─────────────────────────────────────────────────────────────

app.get('/api/user/lookup/:query', async (req, res) => {
  const q = req.params.query;
  try {
    const result = await pool.query(
      'SELECT id, name, phone FROM users WHERE phone = $1 OR id = $2',
      [q, q]
    );
    const row = result.rows[0];
    if (!row) return res.status(404).json({ found: false });
    res.json({ found: true, id: row.id, name: row.name, phone: row.phone });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(3000, () => console.log('Full Stack Settlement Backend on 3000'));
