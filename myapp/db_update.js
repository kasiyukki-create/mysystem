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
  // 更新前のデータを確認
  const before = await pool.query('SELECT * FROM practice ORDER BY id');
  console.log('更新前:', before.rows);

  // UPDATE：id=1 の name を変更する
  await pool.query(
    'UPDATE practice SET name = $1 WHERE id = $2',
    ['更新後のデータ', 1]
  );
  console.log('更新しました');

  // DELETE：id=2 を削除する
  await pool.query('DELETE FROM practice WHERE id = $1', [2]);
  console.log('削除しました');

  // 更新後のデータを確認
  const after = await pool.query('SELECT * FROM practice ORDER BY id');
  console.log('更新後:', after.rows);

  await pool.end();
}

main();