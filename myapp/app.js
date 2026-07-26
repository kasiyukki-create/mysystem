require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(express.static("frontend/dist"));   // 本番用のReact画面を配信

// データベース接続の設定
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// 接続テスト
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ DB接続失敗:', err.message);
  } else {
    console.log('✅ DB接続成功！', res.rows[0]);
  }
});

console.log('使用中のDB:', process.env.DB_NAME);

// GET メッセージ取得
app.get('/api/messages', async (req, res) => {
  try {
    console.log('📡 /api/messages リクエスト受信');

    const result = await pool.query(`
      SELECT id, username, text, created_at 
      FROM messages 
      ORDER BY created_at ASC
    `);

    const messages = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      text: row.text,
      created_at: row.created_at 
        ? new Date(row.created_at).toLocaleString('ja-JP') 
        : ''
    }));

    console.log(`✅ 取得メッセージ数: ${messages.length}`);
    res.json(messages);

  } catch (err) {
    console.error('❌ メッセージ取得エラー詳細:', err.message);
    res.status(500).json({ 
      error: 'サーバーエラー', 
      message: err.message 
    });
  }
});

// POST メッセージ保存
app.post('/api/messages', async (req, res) => {
  const { username, text } = req.body;   // React側に合わせて username に変更

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'メッセージの内容が空です' });
  }

  try {
    console.log('📤 メッセージ保存リクエスト受信:', { username, text: text.substring(0, 50) });

    const result = await pool.query(
      'INSERT INTO messages (username, text) VALUES ($1, $2) RETURNING *',
      [username || '匿名', text.trim()]
    );

    const savedMsg = result.rows[0];

    console.log(`✅ メッセージ保存成功: ID=${savedMsg.id}`);

    res.status(201).json({
      id: savedMsg.id,
      username: savedMsg.username,
      text: savedMsg.text,
      created_at: savedMsg.created_at 
        ? new Date(savedMsg.created_at).toLocaleString('ja-JP') 
        : new Date().toLocaleString('ja-JP')
    });

  } catch (err) {
    console.error('❌ メッセージ保存エラー詳細:', err.message);
    res.status(500).json({ 
      error: 'サーバーエラー', 
      message: 'メッセージの保存に失敗しました' 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});