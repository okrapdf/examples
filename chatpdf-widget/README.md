# OkraPDF + Typebot – Embeddable PDF Chatbot

Chat with any PDF on any website. OkraPDF does the understanding, Typebot does the UI.

## How it works

```
Your Site  →  Typebot Widget  →  OkraPDF API  →  AI reads the PDF  →  Answer
```

OkraPDF's completions API is OpenAI-compatible, so Typebot's HTTP Request block can call it directly.

## Quick start

### 1. Upload a PDF

```bash
npx okrapdf upload invoice.pdf
# → Document ID: ocr-abc123
```

### 2. Create the Typebot flow

In [typebot.io](https://typebot.io):

1. Add a **Text** bubble: "Hi! Ask me about this document."
2. Add a **Text Input** block → save to variable `userQuestion`
3. Add an **HTTP Request** block:
   - URL: `https://api.okrapdf.com/v1/documents/YOUR_DOC_ID/chat/completions`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_OKRA_API_KEY`
   - Body: `{"model":"moonshotai/kimi-k2.5","messages":[{"role":"user","content":"{{userQuestion}}"}]}`
   - Response mapping: `choices[0].message.content` → variable `aiResponse`
4. Add a **Text** bubble: `{{aiResponse}}`
5. Connect back to step 2 (loop)
6. Publish

### 3. Embed on your site

```html
<script type="module">
  import { initBubble } from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.9/dist/web.js'
  initBubble({
    typebot: 'your-typebot-slug',
    theme: { button: { backgroundColor: '#ea580c' } },
    previewMessage: { message: 'Ask me about this PDF!', autoShowDelay: 3000 },
  })
</script>
```

## Live demo

- Landing page: https://typebot-chatpdf.okrapdf.pages.dev
- Typebot direct: https://typebot.io/okrapdf-chatpdf

## Also works with

Any platform that supports custom OpenAI endpoints:

| Platform | Config |
|----------|--------|
| Typebot | HTTP Request block (this example) |
| Botpress | Custom AI provider → base URL |
| Voiceflow | API step → POST |
| Flowwise | ChatOpenAI node → base URL |
| Python `openai` | `OpenAI(base_url="https://api.okrapdf.com/v1/documents/DOC_ID")` |

The API is OpenAI-compatible. If the tool supports `base_url`, it works.
