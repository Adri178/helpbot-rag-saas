(function () {
  var script = document.currentScript;
  var chatbotId = script.getAttribute("data-chatbot-id");
  if (!chatbotId) {
    console.error("[HelpBot widget] data-chatbot-id is required on the <script> tag.");
    return;
  }
  var apiBase = new URL(script.src).origin;

  var STORAGE_KEY = "helpbot_visitor_id";
  var visitorId = localStorage.getItem(STORAGE_KEY);
  if (!visitorId) {
    visitorId = "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, visitorId);
  }

  var conversationId = null;
  var ACCENT = "#0B7A6E";

  var fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
  document.head.appendChild(fontLink);

  var style = document.createElement("style");
  style.textContent =
    ".helpbot-bubble{position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;background:#111;color:#fff;border:none;cursor:pointer;font-size:22px;box-shadow:0 2px 8px rgba(0,0,0,.3);z-index:999999;display:flex;align-items:center;justify-content:center}" +
    ".helpbot-window{position:fixed;bottom:88px;right:20px;width:320px;max-width:calc(100vw - 40px);height:440px;max-height:calc(100vh - 120px);background:#fff;border-radius:12px;border:1px solid #E7E7E4;box-shadow:0 4px 24px rgba(0,0,0,.2);display:none;flex-direction:column;overflow:hidden;z-index:999999;font-family:'Instrument Sans',system-ui,sans-serif}" +
    ".helpbot-window.open{display:flex}" +
    ".helpbot-header{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #F0F0EE}" +
    ".helpbot-header-avatar{width:26px;height:26px;border-radius:8px;background:" + ACCENT + ";color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}" +
    ".helpbot-header-title{font-size:14px;font-weight:600;color:#0A0A0A}" +
    ".helpbot-header-subtitle{font-size:12px;color:" + ACCENT + ";font-weight:500}" +
    ".helpbot-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}" +
    ".helpbot-msg{max-width:85%;padding:10px 14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}" +
    ".helpbot-msg.user{align-self:flex-end;background:#111;color:#fff;border-radius:14px 14px 4px 14px}" +
    ".helpbot-msg.bot{align-self:flex-start;background:#F4F4F3;color:#18181B;border-radius:14px 14px 14px 4px}" +
    ".helpbot-sources{margin-top:8px;display:flex;align-items:center;gap:8px;padding:7px 10px;border:1px solid #E7E7E4;border-radius:9px;background:#fff}" +
    ".helpbot-sources-dot{width:6px;height:6px;border-radius:99px;background:" + ACCENT + ";flex-shrink:0}" +
    ".helpbot-sources-text{font-family:'JetBrains Mono',monospace;font-size:11px;color:#52525B;overflow:hidden;text-overflow:ellipsis}" +
    ".helpbot-input-row{display:flex;gap:8px;padding:12px;border-top:1px solid #F0F0EE}" +
    ".helpbot-input{flex:1;min-width:0;border:1px solid #E7E7E4;border-radius:9px;padding:10px 12px;font-size:14px;font-family:inherit;outline:none}" +
    ".helpbot-input:focus{border-color:" + ACCENT + "}" +
    ".helpbot-send{border:none;border-radius:9px;background:#111;color:#fff;padding:0 16px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer}" +
    ".helpbot-send:disabled{opacity:.5;cursor:default}";
  document.head.appendChild(style);

  var bubble = document.createElement("button");
  bubble.className = "helpbot-bubble";
  bubble.textContent = "💬";
  bubble.setAttribute("aria-label", "Buka chat");

  var win = document.createElement("div");
  win.className = "helpbot-window";
  win.innerHTML =
    '<div class="helpbot-header">' +
    '<span class="helpbot-header-avatar">H</span>' +
    '<div style="display:flex;flex-direction:column">' +
    '<span class="helpbot-header-title">HelpBot</span>' +
    '<span class="helpbot-header-subtitle">Online · jawab dari dokumen</span>' +
    "</div>" +
    "</div>" +
    '<div class="helpbot-messages"></div>' +
    '<div class="helpbot-input-row">' +
    '<input class="helpbot-input" type="text" placeholder="Tanya sesuatu…" />' +
    '<button class="helpbot-send">Kirim</button>' +
    "</div>";

  document.body.appendChild(bubble);
  document.body.appendChild(win);

  var messagesEl = win.querySelector(".helpbot-messages");
  var inputEl = win.querySelector(".helpbot-input");
  var sendEl = win.querySelector(".helpbot-send");

  bubble.addEventListener("click", function () {
    win.classList.toggle("open");
  });

  function addMessage(role, content, sources) {
    var el = document.createElement("div");
    el.className = "helpbot-msg " + (role === "user" ? "user" : "bot");
    el.textContent = content;
    if (sources && sources.length) {
      var src = document.createElement("div");
      src.className = "helpbot-sources";
      var dot = document.createElement("span");
      dot.className = "helpbot-sources-dot";
      var text = document.createElement("span");
      text.className = "helpbot-sources-text";
      text.textContent =
        "Sumber: " +
        sources
          .map(function (s) {
            return s.content.slice(0, 60) + "...";
          })
          .join(" | ");
      src.appendChild(dot);
      src.appendChild(text);
      el.appendChild(src);
    }
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function send() {
    var question = inputEl.value.trim();
    if (!question) return;
    inputEl.value = "";
    addMessage("user", question);
    sendEl.disabled = true;

    fetch(apiBase + "/api/public-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatbotId: chatbotId,
        visitorId: visitorId,
        conversationId: conversationId,
        question: question,
      }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          addMessage("bot", result.data.error || "Terjadi kesalahan.");
          return;
        }
        conversationId = result.data.conversationId;
        addMessage("bot", result.data.answer, result.data.sources);
      })
      .catch(function () {
        addMessage("bot", "Gagal terhubung ke server.");
      })
      .finally(function () {
        sendEl.disabled = false;
      });
  }

  sendEl.addEventListener("click", send);
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") send();
  });
})();
