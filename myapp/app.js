require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// データベース接続の設定 (すでにある.env設定を利用)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// 接続テスト（起動時に実行）
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ DB接続失敗:', err.message);
  } else {
    console.log('✅ DB接続成功！', res.rows[0]);
  }
});

console.log('使用中のDB:', process.env.DB_NAME);

/*

// 2. メッセージ取得API (GET)
app.get('/api/messages', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM messages ORDER BY id ASC');
        // chat.htmlのフロントエンドが期待する形式（user, text）に合わせる
        const messages = result.rows.map(row => ({
            id: row.id,
            username: row.username,
            text: row.text,
            created_at: row.created_at ? new Date(row.created_at).toLocaleString('ja-JP') : ''
        }));
        res.json(messages);
    } catch (err) {
        console.error('データ取得エラー:', err);
        res.status(500).json({ error: 'データの読み込みに失敗しました' });
    }
});

*/

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
    console.error('エラー全体:', err);
    res.status(500).json({ 
      error: 'サーバーエラー', 
      message: err.message 
    });
  }
});

/*
// 3. メッセージ保存API (POST)
app.post('/api/messages', async (req, res) => {
    const { user, text } = req.body;
    if (!text) return res.status(400).json({ error: '内容が空です' });

    try {
        const result = await pool.query(
            'INSERT INTO messages (username, text) VALUES ($1, $2) RETURNING *',
            [user || '匿名', text]
        );
        const savedMsg = result.rows[0];
        res.status(201).json({
            id: savedMsg.id,
            user: savedMsg.username,
            text: savedMsg.text,
            time: new Date(savedMsg.created_at).toLocaleString('ja-JP')
        });
    } catch (err) {
        console.error('データ保存エラー:', err);
        res.status(500).json({ error: 'メッセージの保存に失敗しました' });
    }
});
*/

// 3. メッセージ保存API (POST) - 修正版
app.post('/api/messages', async (req, res) => {
    const { user, text } = req.body;   // フロントエンドから送られてくる想定

    // バリデーション
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'メッセージの内容が空です' });
    }

    try {
        console.log('📤 メッセージ保存リクエスト受信:', { user, text: text.substring(0, 50) });

        const result = await pool.query(
            'INSERT INTO messages (username, text) VALUES ($1, $2) RETURNING *',
            [user || '匿名', text.trim()]
        );

        const savedMsg = result.rows[0];

        console.log(`✅ メッセージ保存成功: ID=${savedMsg.id}`);

        // フロントエンドとGET APIに合わせたレスポンス形式
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
        console.error('エラー全体:', err);
        
        // 権限エラーなどの場合にわかりやすいメッセージを返す
        if (err.code === '42501') {
            res.status(500).json({ 
                error: '権限エラー', 
                message: 'テーブルへの書き込み権限がありません' 
            });
        } else {
            res.status(500).json({ 
                error: 'サーバーエラー', 
                message: 'メッセージの保存に失敗しました' 
            });
        }
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
