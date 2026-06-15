require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function main() {
  // INSERT：データを追加する
  await pool.query('INSERT INTO practice (name) VALUES ($1)', ['Node.jsから追加']);
  console.log('追加しました');

  // SELECT：作成日時の新しい順・最大5件
  const result = await pool.query(
    'SELECT * FROM practice ORDER BY created_at DESC LIMIT 5'
  );
  console.log(result.rows);

  await pool.end();
}

main();