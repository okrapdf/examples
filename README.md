# OkraPDF Examples

Deployable example apps built with [okrapdf](https://github.com/okrapdf/okrapdf-sdk).

## Examples

| Example | Description | Stack |
|---------|-------------|-------|
| [collection-admin](./collection-admin) | Browse a document collection — thumbnails, chat, audit logs | React, react-admin, Vite |
| [chatpdf-widget](./chatpdf-widget) | Embeddable PDF chat widget — one script tag, streaming, works with Typebot/Botpress | Vanilla JS, SSE |
| [webhook-automation](./webhook-automation) | n8n, Zapier fallback, lifecycle webhooks, HMAC verification, and Slack/Sheets routing samples | n8n JSON, Node.js, Zapier Webhooks |

## Getting Started

Each example is a standalone project. `cd` into the directory and follow its README.

```bash
cd collection-admin
npm install
cp .env.example .env
npm run dev
```

Get an API key at [app.okrapdf.com/sign-up](https://app.okrapdf.com/sign-up).

## License

MIT
