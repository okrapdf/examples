# Validation Status

Last local validation: 2026-06-08.

## Passed locally

```bash
node -e "const fs=require('fs'); for (const f of [
  'examples/webhook-automation/n8n/okrapdf-google-drive-to-sheets.json',
  'examples/webhook-automation/n8n/okrapdf-lifecycle-router.json'
]) JSON.parse(fs.readFileSync(f,'utf8'))"

node --check examples/webhook-automation/node/verify-okrapdf-webhook.mjs

./node_modules/.bin/astro build

cd apps/blog
node tests/blog-shell.test.mjs
node tests/posthog-snippet.test.mjs
```

Also passed:

```bash
node skills/okra-programmatic-seo-content/scripts/audit-article.mjs \
  apps/blog/src/content/blog/n8n-pdf-automation-webhooks.md --mode recipe

node skills/okra-programmatic-seo-content/scripts/audit-article.mjs \
  apps/blog/src/content/blog/trigger-zapier-from-pdf-processing.md --mode recipe
```

## Not reproduced here

- Live n8n import and activation.
- Live `POST /v1/webhooks` subscription from n8n.
- Live Google Drive trigger and Google Sheets write.
- Live Zapier REST Hook trigger.
- Live Webhooks by Zapier Catch Hook.

Those require connected workflow accounts and API credentials. Do not describe
these templates as fully reproduced until a real credentialed run has been
recorded.

## Runtime repro checklist

1. Import `n8n/okrapdf-google-drive-to-sheets.json` into n8n.
2. Replace Google Drive, Google Sheets, and okraPDF credentials.
3. Activate the workflow so n8n exposes a Production Webhook URL.
4. Run the manual registration trigger.
5. Upload a test PDF into the watched Drive folder.
6. Confirm the upload action returns a job ID and output URL.
7. Confirm a `document.processed` event arrives in n8n.
8. Confirm Google Sheets receives one row with job ID, file ID, status, hosted URL, and direct PDF URL.
9. Register `document.failed` and confirm the exception path with a known bad PDF or revoked source.
10. Record the run date, sample PDF class, and destination row URL before marking the sample as runtime-reproduced.
