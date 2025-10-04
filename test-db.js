const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'marsa_fyi',
  password: 'postgres',
  port: 5432,
});

async function testDatabase() {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', ['test@example.com']);
    console.log('Users found:', result.rows);
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

testDatabase();