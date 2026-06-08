# okraPDF Webhook Automation Samples

Public workflow samples for routing PDF lifecycle events into Zapier, n8n,
Slack, Google Sheets, and custom HTTPS adapters.

These samples are organized like an integration sample pack:

```text
webhook-automation/
  README.md
  VALIDATION.md
  n8n/
    README.md
    okrapdf-google-drive-to-sheets.json
    okrapdf-lifecycle-router.json
  node/
    README.md
    verify-okrapdf-webhook.mjs
  zapier/
    README.md
```

## What is covered

| Path | Use case | Status |
|---|---|---|
| `n8n/okrapdf-google-drive-to-sheets.json` | Google Drive PDF folder -> okraPDF upload -> `document.processed` webhook -> Google Sheets row | Static validation passed |
| `n8n/okrapdf-lifecycle-router.json` | Receive `document.processed` and `document.failed` events and route normalized rows | Static validation passed |
| `node/verify-okrapdf-webhook.mjs` | Verify `X-Okra-Signature`, parse the event envelope, optionally post to Slack | Syntax validation passed |
| `zapier/README.md` | Native Zapier app and Webhooks by Zapier fallback setup | Docs-only until public Zapier approval |

## Public API surface

The samples use the current public lifecycle surface:

- `POST /v1/upload` uploads a PDF and creates a job.
- `POST /v1/webhooks` subscribes a target URL.
- `document.processed` means the hosted PDF URL is ready for downstream routing.
- `document.failed` means the upload or hosting path reached a terminal failure.

The generic lifecycle event is intentionally not a per-field extraction event.
Use workflow-specific extraction endpoints for invoice/table/schema outputs, and
use lifecycle events as the durable handoff into automation tools.

## Reproduction status

See `VALIDATION.md`.

Short version: JSON parsing, Node syntax checks, article audits, and the Astro
blog build passed locally. A live n8n/Zapier run with real OAuth/API credentials
was not executed in this environment, so these are marked as sample templates,
not verified production Zaps.

## Links

- Blog: `/blog/n8n-pdf-automation-webhooks`
- Blog: `/blog/trigger-zapier-from-pdf-processing`
- Native Zapier app source in the meta-repo: `integrations/zapier`
