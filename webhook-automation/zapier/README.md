# okraPDF Zapier Samples

Zapier has two paths:

1. Native okraPDF Zapier app.
2. Webhooks by Zapier fallback.

## Native app path

The native app source currently lives in the meta-repo at `integrations/zapier`.
It uses Zapier REST Hook subscribe/unsubscribe calls against `/v1/webhooks`.

Current status:

- Private build exists.
- OAuth2/Bearer-token implementation exists.
- Public Zapier approval and public template URLs are still pending.

Use the native app when the okraPDF app is available in your Zapier account.

## Webhooks by Zapier fallback

Use this when the native app is not available yet.

1. Create a Zap.
2. Trigger: Webhooks by Zapier -> Catch Hook.
3. Copy the Catch Hook URL.
4. Register it with okraPDF:

```bash
curl -X POST https://api.okrapdf.com/v1/webhooks \
  -H "Authorization: Bearer $OKRA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "document.processed",
    "target_url": "https://hooks.zapier.com/hooks/catch/...",
    "source": "zapier"
  }'
```

5. Add an action such as Google Sheets, Airtable, Slack, Gmail, or a custom webhook.
6. Map `data.job_id`, `data.file_id`, `data.filename`, `data.hosted_url`, and `data.pdf_url`.

Register `document.failed` as a second Zap before using this in production.

## What not to claim yet

Do not claim the public native Zapier template has been reproduced until there
is a recorded run through Zapier with a real connected account and the approved
public app/template URL.
