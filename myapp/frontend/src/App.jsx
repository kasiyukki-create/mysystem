import { useState, useEffect } from 'react'

function App() {
  const [messages, setMessages] = useState([])
  const [username, setUsername] = useState('ふっ ちぃ')
  const [text, setText] = useState('')

  // メッセージ取得（初回のみ）
  useEffect(() => {
    fetch('api/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error('取得エラー:', err))
  }, [])

  // メッセージ送信
  const sendMessage = (e) => {
    e.preventDefault()
    if (!text.trim()) return

    fetch('api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        text: text
      })
    })
      .then(res => res.json())
      .then(newMessage => {
        // 送信成功したら、一覧に追加
        setMessages([...messages, newMessage])
        setText('')
      })
      .catch(err => console.error('送信エラー:', err))
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ background: '#00d4ff', color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
        チャット 6/15
      </h1>

      <div style={{ 
        height: '400px', 
        overflowY: 'scroll', 
        border: '1px solid #ddd', 
        padding: '15px', 
        marginBottom: '15px',
        background: '#f9f9f9'
      }}>
        {messages.map(m => (
          <div key={m.id} style={{ marginBottom: '12px' }}>
            <strong>{m.username}:</strong> {m.text || m.message}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="名前" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '10px', width: '150px' }}
        />
        <input 
          type="text" 
          placeholder="メッセージを入力..." 
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: '10px', flex: 1 }}
          required 
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#00d4ff', color: 'white', border: 'none', borderRadius: '4px' }}>
          送信
        </button>
      </form>
    </div>
  )
}

export default App