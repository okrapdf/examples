# okraPDF n8n Workflow Templates

Import these JSON files into n8n to test okraPDF public lifecycle webhooks.

These examples use the current public surface:

- `POST /v1/upload` to send a PDF into okraPDF.
- `POST /v1/webhooks` to subscribe an n8n Production Webhook URL.
- `document.processed` for the ready handoff.
- `document.failed` for the exception path.

They avoid legacy per-document `webhook_url` examples so the workflow matches
the same event model used by Zapier, Make, and custom HTTPS webhook handlers.

## Workflows

### `okrapdf-google-drive-to-sheets.json` - Google Drive to Sheets

```text
Manual Trigger -> Register n8n webhook with okraPDF

Google Drive Trigger -> Download PDF -> POST /v1/upload

okraPDF document.processed webhook -> Format event -> Google Sheets row
```

Use this when PDFs arrive in a Drive folder and the team needs a row containing
the okraPDF job ID, file ID, hosted URL, direct PDF URL, and processing status.
The upload and ready paths are split on purpose: upload acceptance is not the
same thing as a ready hosted PDF.

### `okrapdf-lifecycle-router.json` - Lifecycle router

```text
Manual Trigger -> Register ready and failed webhooks

okraPDF lifecycle webhook -> Branch ready/failed -> Format -> Google Sheets
```

Use this when PDFs already enter okraPDF from API, Zapier, CLI, the app UI, or a
collection-style intake flow, and n8n only needs to route lifecycle events to
Sheets, Slack, a database, or a support queue.

## Setup

### okraPDF API key

1. Get an API key from `https://okrapdf.com/settings/keys`.
2. In n8n, create an HTTP Header Auth credential:
   - Name: `okraPDF API Key`
   - Header Name: `Authorization`
   - Header Value: `Bearer okra_YOUR_KEY_HERE`
3. Replace each `YOUR_OKRA_CREDENTIAL_ID` placeholder with that credential.

### Register the webhook

Each template includes a manual registration path. Run it after importing the
workflow and activating the Webhook node so n8n has a Production URL.

Equivalent curl:

```bash
curl -X POST https://api.okrapdf.com/v1/webhooks \
  -H "Authorization: Bearer $OKRA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "document.processed",
    "target_url": "https://YOUR_N8N_HOST/webhook/okrapdf-ready",
    "source": "n8n"
  }'
```

Register a second subscription for failures:

```bash
curl -X POST https://api.okrapdf.com/v1/webhooks \
  -H "Authorization: Bearer $OKRA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "document.failed",
    "target_url": "https://YOUR_N8N_HOST/webhook/okrapdf-ready",
    "source": "n8n"
  }'
```

The response includes a webhook `secret`. Store it if you add HMAC verification.

## Webhook Payload

okraPDF delivers an event envelope:

```json
{
  "id": "evt_...",
  "type": "document.processed",
  "created_at": "2026-06-08T18:03:12.818Z",
  "subscription_id": "whk_...",
  "data": {
    "job_id": "job_...",
    "file_id": "file_...",
    "filename": "quarterly-report.pdf",
    "sha256": "...",
    "hosted_url": "https://...",
    "pdf_url": "https://.../pdf",
    "embed_url": "https://.../embed",
    "download_url": "https://.../download",
    "status": "completed"
  }
}
```

Headers include:

- `X-Okra-Event: document.processed`
- `X-Okra-Signature: sha256=<hex>`

## Import into n8n

1. Open n8n.
2. Click **Import from file**.
3. Select one of the JSON workflow files.
4. Replace credential IDs, folder IDs, and spreadsheet IDs.
5. Activate the workflow.
6. Run the manual registration trigger once.
