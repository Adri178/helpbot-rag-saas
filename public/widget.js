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

  var style = document.createElement("style");
  style.textContent =
    ".helpbot-bubble{position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;background:#111;color:#fff;border:none;cursor:pointer;font-size:24px;box-shadow:0 2px 8px rgba(0,0,0,.3);z-index:999999}" +
    ".helpbot-window{position:fixed;bottom:88px;right:20px;width:320px;max-width:calc(100vw - 40px);height:440px;max-height:calc(100vh - 120px);background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.2);display:none;flex-direction:column;overflow:hidden;z-index:999999;font-family:system-ui,sans-serif}" +
    ".helpbot-window.open{display:flex}" +
    ".helpbot-header{background:#111;color:#fff;padding:12px 16px;font-weight:600;font-size:14px}" +
    ".helpbot-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}" +
    ".helpbot-msg{max-width:85%;padding:8px 12px;border-radius:10px;font-size:14px;line-height:1.4;white-space:pre-wrap;word-wrap:break-word}" +
    ".helpbot-msg.user{align-self:flex-end;background:#111;color:#fff}" +
    ".helpbot-msg.bot{align-self:flex-start;background:#f1f1f1;color:#111}" +
    ".helpbot-sources{margin-top:6px;font-size:11px;color:#666}" +
    ".helpbot-input-row{display:flex;border-top:1px solid #eee}" +
    ".helpbot-input{flex:1;border:none;padding:10px 12px;font-size:14px;outline:none}" +
    ".helpbot-send{border:none;background:#111;color:#fff;padding:0 16px;cursor:pointer}" +
    ".helpbot-send:disabled{opacity:.5;cursor:default}";
  document.head.appendChild(style);

  var bubble = document.createElement("button");
  bubble.className = "helpbot-bubble";
  bubble.textContent = "💬";
  bubble.setAttribute("aria-label", "Buka chat");

  var win = document.createElement("div");
  win.className = "helpbot-window";
  win.innerHTML =
    '<div class="helpbot-header">Chat</div>' +
    '<div class="helpbot-messages"></div>' +
    '<div class="helpbot-input-row">' +
    '<input class="helpbot-input" type="text" placeholder="Tulis pesan..." />' +
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
      src.textContent =
        "Sumber: " +
        sources
          .map(function (s) {
            return s.content.slice(0, 60) + "...";
          })
          .join(" | ");
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
