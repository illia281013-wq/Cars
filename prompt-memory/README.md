# Prompt Memory Tool

Persistent memory layer for reusable user prompts.

## API

### Save or update a prompt

POST /api/prompt-memory

```json
{
  "prompt": "Создавай мои сайты всегда в одном HTML-файле."
}
```

The API normalizes prompts and prevents exact duplicates. Repeated prompts increase `usage_count`.

### Read stored prompts

GET /api/prompt-memory?limit=20

### Delete a prompt

DELETE /api/prompt-memory/:id

## Run locally

```bash
cd prompt-memory
npm install
npm start
```

The API defaults to port 3000.

## Important

GitHub Pages only serves static files. It cannot run this SQLite/Express server itself. Deploy the `prompt-memory` folder to a Node-compatible server if persistent cross-device storage is required.

The frontend also contains a localStorage fallback, so the feature can work on a static GitHub Pages deployment without a backend.