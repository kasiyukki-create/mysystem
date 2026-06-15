# API仕様

## GET /api/tasks
**説明**: タスクの一覧を取得する

**レスポンス**
```json
[
  {
    "id": 1,
    "title": "情報工学概論レポート",
    "deadline": "2026-05-25",
    "completed": false
  },
  {
    "id": 2,
    "title": "Webシステム開発演習課題",
    "deadline": "2026-05-29",
    "completed": false
  }
]