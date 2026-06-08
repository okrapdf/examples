import { createHmac, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';

const port = Number(process.env.PORT || 8787);
const okraSecret = process.env.OKRA_WEBHOOK_SECRET || '';
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || '';

if (!okraSecret) {
  throw new Error('Set OKRA_WEBHOOK_SECRET to the secret returned by /v1/webhooks.');
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

function verifySignature(rawBody, signatureHeader) {
  const expected = createHmac('sha256', okraSecret).update(rawBody).digest('hex');
  const received = String(signatureHeader || '').replace(/^sha256=/, '');
  if (!/^[a-f0-9]{64}$/i.test(received)) return false;

  const expectedBytes = Buffer.from(expected, 'hex');
  const receivedBytes = Buffer.from(received, 'hex');
  return expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
}

async function postToSlack(event) {
  if (!slackWebhookUrl) return;

  const data = event.data || {};
  const isFailure = event.type === 'document.failed';
  const text = isFailure
    ? `PDF failed: ${data.filename || data.file_id || 'unknown file'}\nJob: ${data.job_id || 'unknown'}\nError: ${data.error || 'No error message'}`
    : `PDF ready: ${data.filename || data.file_id || 'unknown file'}\nOpen: ${data.hosted_url || data.pdf_url || 'No URL in payload'}\nJob: ${data.job_id || 'unknown'}`;

  const response = await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Slack returned HTTP ${response.status}: ${await response.text()}`);
  }
}

const server = createServer(async (request, response) => {
  if (request.method !== 'POST' || request.url !== '/okrapdf/webhook') {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'not_found' }));
    return;
  }

  try {
    const rawBody = await readBody(request);
    if (!verifySignature(rawBody, request.headers['x-okra-signature'])) {
      response.writeHead(401, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'invalid_signature' }));
      return;
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    if (event.type === 'document.processed' || event.type === 'document.failed') {
      await postToSlack(event);
    }

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ ok: true, event_id: event.id, type: event.type }));
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'unknown_error' }));
  }
});

server.listen(port, () => {
  console.log(`Listening on http://127.0.0.1:${port}/okrapdf/webhook`);
});
