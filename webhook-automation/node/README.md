# okraPDF Webhook Adapter

Small adapter examples for teams that use Zapier, n8n, Make, Slack, or a custom
internal workflow and need one thin HTTPS endpoint between okraPDF and the
destination.

Use this when no-code tools can catch a webhook, but you still want engineering
controls such as HMAC verification, idempotency, payload shaping, and secret
storage outside the no-code workflow.

## Public lifecycle events

okraPDF sends these public lifecycle events through `/v1/webhooks`:

| Event | Use when |
|---|---|
| `document.created` | Intake log only. The upload was accepted. |
| `document.processed` | Route a hosted PDF URL to Sheets, Slack, Airtable, CRM, or your app. |
| `document.failed` | Open an exception, page an operator, or retry with a safer path. |
| `document.deleted` | Mirror deletion downstream. |

## Subscribe an endpoint

```bash
curl -X POST https://api.okrapdf.com/v1/webhooks \
  -H "Authorization: Bearer $OKRA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "document.processed",
    "target_url": "https://YOUR_ENDPOINT.example.com/okrapdf/webhook",
    "source": "api"
  }'
```

The response includes a `secret`. Store it as `OKRA_WEBHOOK_SECRET` for the
adapter below.

## Verify and route to Slack

```bash
export OKRA_WEBHOOK_SECRET="secret_from_subscription_response"
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
node examples/webhook-automation/node/verify-okrapdf-webhook.mjs
```

Expose the process through your normal deployment target. For local testing,
use a temporary HTTPS tunnel and subscribe the tunnel URL.

The adapter:

1. Reads the raw request body.
2. Verifies `X-Okra-Signature`.
3. Parses the event envelope.
4. Posts a compact message to Slack for `document.processed` and
   `document.failed`.
5. Returns 2xx only after the route succeeds.

## Event shape

```json
{
  "id": "evt_...",
  "type": "document.processed",
  "created_at": "2026-06-08T18:03:12.818Z",
  "subscription_id": "whk_...",
  "data": {
    "job_id": "job_...",
    "file_id": "file_...",
    "filename": "invoice-1042.pdf",
    "hosted_url": "https://...",
    "pdf_url": "https://.../pdf",
    "status": "completed"
  }
}
```

## Production checklist

- Verify HMAC before doing any downstream write.
- Upsert on `event.id`, or on `data.file_id + type` if your destination lacks an
  event table.
- Keep Slack, Zapier, and n8n webhook URLs private.
- Subscribe `document.failed` before production launch.
- Store the hosted URL in the destination even when later extraction fails.
