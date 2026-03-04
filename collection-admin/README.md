# Collection Admin

Browse an OkraPDF document collection — view page thumbnails, chat with any document, inspect audit logs.

Built with [react-admin](https://marmelab.com/react-admin/) + [okrapdf](https://github.com/okrapdf/okrapdf-sdk).

## Setup

```bash
npm install
cp .env.example .env
# Fill in VITE_OKRA_API_KEY and VITE_COLLECTION_ID
npm run dev
```

Or enter your API key and collection ID in the browser at runtime.

Get an API key at [app.okrapdf.com/sign-up](https://app.okrapdf.com/sign-up).

## What It Shows

- **Document list** — thumbnails, phase status, page count, node count
- **Document detail** — cover image, metadata, chat, audit logs
- **Chat** — OpenAI-compatible streaming completions per document
- **Logs** — cryptographic audit trail (hash chain)

## Deploy

Static SPA — deploy anywhere. Works with Cloudflare Pages, Netlify, etc:

```bash
npm run build   # outputs to dist/
```

## License

MIT
