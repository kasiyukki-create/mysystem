require('dotenv').config();

console.log('=== 環境変数確認 ===');
console.log('DB_NAME:', process.env.DB_NAME);

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function main() {
    try {
        console.log('接続試行中...');
        const client = await pool.connect();
        console.log('✅ chat_db に接続成功しました！');
        client.release();
        await pool.end();
    } catch (err) {
        console.error('❌ 接続エラー:', err.message);
        console.error('詳細:', err);
    }
}

main();