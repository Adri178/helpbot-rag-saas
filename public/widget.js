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
  var DEFAULT_ACCENT = "#0B7A6E";

  var fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
  document.head.appendChild(fontLink);

  function buildStyle(accent, side) {
    return (
      ".helpbot-bubble{position:fixed;bottom:20px;" + side + ":20px;width:56px;height:56px;border-radius:50%;background:#111;color:#fff;border:none;cursor:pointer;font-size:22px;box-shadow:0 2px 8px rgba(0,0,0,.3);z-index:999999;display:flex;align-items:center;justify-content:center}" +
      ".helpbot-window{position:fixed;bottom:88px;" + side + ":20px;width:320px;max-width:calc(100vw - 40px);height:440px;max-height:calc(100vh - 120px);background:#fff;border-radius:12px;border:1px solid #E7E7E4;box-shadow:0 4px 24px rgba(0,0,0,.2);display:none;flex-direction:column;overflow:hidden;z-index:999999;font-family:'Instrument Sans',system-ui,sans-serif}" +
      ".helpbot-window.open{display:flex}" +
      ".helpbot-header{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #F0F0EE;background:" + accent + "}" +
      ".helpbot-header-avatar{width:26px;height:26px;border-radius:8px;background:rgba(255,255,255,.2);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}" +
      ".helpbot-header-title{font-size:14px;font-weight:600;color:#fff}" +
      ".helpbot-header-subtitle{font-size:12px;color:rgba(255,255,255,.75);font-weight:500}" +
      ".helpbot-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}" +
      ".helpbot-msg{max-width:85%;padding:10px 14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}" +
      ".helpbot-msg.user{align-self:flex-end;background:" + accent + ";color:#fff;border-radius:14px 14px 4px 14px}" +
      ".helpbot-msg.bot{align-self:flex-start;background:#F4F4F3;color:#18181B;border-radius:14px 14px 14px 4px}" +
      ".helpbot-sources{margin-top:8px;display:flex;align-items:center;gap:8px;padding:7px 10px;border:1px solid #E7E7E4;border-radius:9px;background:#fff}" +
      ".helpbot-sources-dot{width:6px;height:6px;border-radius:99px;background:" + accent + ";flex-shrink:0}" +
      ".helpbot-sources-text{font-family:'JetBrains Mono',monospace;font-size:11px;color:#52525B;overflow:hidden;text-overflow:ellipsis}" +
      ".helpbot-input-row{display:flex;gap:8px;padding:12px;border-top:1px solid #F0F0EE}" +
      ".helpbot-input{flex:1;min-width:0;border:1px solid #E7E7E4;border-radius:9px;padding:10px 12px;font-size:14px;font-family:inherit;outline:none}" +
      ".helpbot-input:focus{border-color:" + accent + "}" +
      ".helpbot-send{border:none;border-radius:9px;background:#111;color:#fff;padding:0 16px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer}" +
      ".helpbot-send:disabled{opacity:.5;cursor:default}"
    );
  }

  function init(settings) {
    var accent = (settings && settings.accentColor) || DEFAULT_ACCENT;
    var side = settings && settings.position === "left" ? "left" : "right";
    var botName = (settings && settings.name) || "HelpBot";
    var greeting = settings && settings.greeting;
    var showSources = !settings || settings.showSources !== false;

    var style = document.createElement("style");
    style.textContent = buildStyle(accent, side);
    document.head.appendChild(style);

    var bubble = document.createElement("button");
    bubble.className = "helpbot-bubble";
    bubble.textContent = "💬";
    bubble.setAttribute("aria-label", "Buka chat");

    var win = document.createElement("div");
    win.className = "helpbot-window";
    win.innerHTML =
      '<div class="helpbot-header">' +
      '<span class="helpbot-header-avatar">' + botName.charAt(0).toUpperCase() + "</span>" +
      '<div style="display:flex;flex-direction:column">' +
      '<span class="helpbot-header-title">' + escapeHtml(botName) + "</span>" +
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

    if (greeting) {
      addMessage(messagesEl, "bot", greeting, null);
    }

    bubble.addEventListener("click", function () {
      win.classList.toggle("open");
    });

    function send() {
      var question = inputEl.value.trim();
      if (!question) return;
      inputEl.value = "";
      addMessage(messagesEl, "user", question, null);
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
            addMessage(messagesEl, "bot", result.data.error || "Terjadi kesalahan.", null);
            return;
          }
          conversationId = result.data.conversationId;
          addMessage(
            messagesEl,
            "bot",
            result.data.answer,
            showSources ? result.data.sources : null
          );
        })
        .catch(function () {
          addMessage(messagesEl, "bot", "Gagal terhubung ke server.", null);
        })
        .finally(function () {
          sendEl.disabled = false;
        });
    }

    sendEl.addEventListener("click", send);
    inputEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") send();
    });
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function addMessage(messagesEl, role, content, sources) {
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

  fetch(apiBase + "/api/public-chatbot-info?chatbotId=" + encodeURIComponent(chatbotId))
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (settings) {
      init(settings);
    })
    .catch(function () {
      init(null);
    });
})();
