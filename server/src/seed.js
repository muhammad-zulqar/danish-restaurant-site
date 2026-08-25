const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();
const { pool } = require('./db');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await client.query(sql);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@danishrestaurant.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await client.query(
      `INSERT INTO admins (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email)
       DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [adminEmail, passwordHash],
    );

    await client.query('COMMIT');
    console.log('Database initialized and seeded successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to seed database:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
