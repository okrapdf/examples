/**
 * OkraPDF Chat Widget — drop-in PDF chatbot for any website.
 *
 * Usage:
 *   <script src="https://typebot-chatpdf.pages.dev/widget.js"
 *           data-doc="YOUR_DOC_ID"
 *           data-key="YOUR_PUBLISHABLE_KEY"></script>
 */
(function () {
  const script = document.currentScript;
  const DOC = script?.dataset.doc;
  const KEY = script?.dataset.key;
  if (!DOC || !KEY) return console.warn('[OkraPDF] Missing data-doc or data-key');

  const API = `https://api.okrapdf.com/v1/documents/${DOC}/chat/completions`;
  const history = [];
  let busy = false;
  let open = false;

  // --- Styles ---
  const css = document.createElement('style');
  css.textContent = `
    #okra-bubble{position:fixed;bottom:20px;right:20px;z-index:99999;width:52px;height:52px;border-radius:50%;background:#ea580c;color:#fff;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;transition:transform .15s}
    #okra-bubble:hover{transform:scale(1.08)}
    #okra-bubble svg{width:24px;height:24px}
    #okra-panel{position:fixed;bottom:84px;right:20px;z-index:99998;width:380px;max-width:calc(100vw - 40px);height:520px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.12);display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
    #okra-panel.open{display:flex}
    .okra-hdr{padding:10px 14px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:6px}
    .okra-hdr .dot{width:8px;height:8px;border-radius:50%;background:#22c55e}
    .okra-hdr span{font-size:14px;font-weight:600}
    .okra-hdr button{margin-left:auto;background:none;border:none;cursor:pointer;color:#9ca3af;font-size:18px}
    .okra-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
    .okra-m{max-width:85%;padding:8px 12px;border-radius:14px;font-size:14px;line-height:1.5;animation:okraIn .2s ease-out}
    @keyframes okraIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
    .okra-m.b{background:#f3f4f6;color:#1a1a1a;border-bottom-left-radius:4px;align-self:flex-start}
    .okra-m.u{background:#ea580c;color:#fff;border-bottom-right-radius:4px;align-self:flex-end}
    .okra-m.t{color:#9ca3af}
    .okra-inp{display:flex;gap:6px;padding:10px 12px;border-top:1px solid #f3f4f6}
    .okra-inp input{flex:1;border:1px solid #e5e7eb;border-radius:999px;padding:6px 12px;font-size:14px;outline:none}
    .okra-inp input:focus{border-color:#ea580c}
    .okra-inp button{background:#ea580c;color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center}
    .okra-inp button:disabled{background:#d4d4d8}
  `;
  document.head.appendChild(css);

  // --- DOM ---
  const bubble = document.createElement('button');
  bubble.id = 'okra-bubble';
  bubble.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  bubble.onclick = () => { open = !open; panel.classList.toggle('open', open); if (open) inp.focus(); };

  const panel = document.createElement('div');
  panel.id = 'okra-panel';
  panel.innerHTML = `
    <div class="okra-hdr"><div class="dot"></div><span>OkraPDF</span><button onclick="document.getElementById('okra-panel').classList.remove('open')">&times;</button></div>
    <div class="okra-msgs" id="okra-msgs"><div class="okra-m b">Hi! Ask me anything about this document.</div></div>
    <div class="okra-inp"><input id="okra-inp" placeholder="Ask a question..." /><button id="okra-send"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg></button></div>
  `;

  document.body.appendChild(panel);
  document.body.appendChild(bubble);

  const msgs = document.getElementById('okra-msgs');
  const inp = document.getElementById('okra-inp');
  const sendBtn = document.getElementById('okra-send');

  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
  sendBtn.addEventListener('click', send);

  function addMsg(cls, text) {
    const el = document.createElement('div');
    el.className = 'okra-m ' + cls;
    el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  async function send() {
    const text = inp.value.trim();
    if (!text || busy) return;
    busy = true;
    inp.value = '';
    sendBtn.disabled = true;

    addMsg('u', text);
    history.push({ role: 'user', content: text });
    const typing = addMsg('b t', 'Thinking...');

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'moonshotai/kimi-k2.5', messages: history, stream: true }),
      });
      typing.textContent = '';
      typing.classList.remove('t');
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value, { stream: true }).split('\n')) {
          if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
          try {
            const delta = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content;
            if (delta) { full += delta; typing.textContent = full; }
          } catch {}
        }
        msgs.scrollTop = msgs.scrollHeight;
      }
      history.push({ role: 'assistant', content: full });
    } catch {
      typing.textContent = 'Something went wrong. Try again.';
      typing.classList.remove('t');
    }
    busy = false;
    sendBtn.disabled = false;
  }
})();
