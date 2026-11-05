(function () {
  "use strict";
  var SK = "zunex-ai-v3", OLD = "zunex-ai-history-v1", LG = ZunexLang, AI = ZunexAssistant;
  var $ = function (id) { return document.getElementById(id); };
  var msgs = $("msgs"), inp = $("inp"), att = $("att"), fileIn = $("file"), note = $("note");
  var S = { chats: [], cur: null, set: { lang: "auto", theme: "auto", name: "" } }, pending = [];
  var TEXTX = /\.(txt|md|csv|json|js|py|html|css|log|xml|ya?ml)$/i;

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function navLang() { var l = ((navigator.language || "tr") + "").slice(0, 2).toLowerCase(); return LG.T[l] ? l : "tr"; }
  function cur() { return S.chats.filter(function (c) { return c.id === S.cur; })[0]; }
  function ui() { var l = S.set.lang !== "auto" ? S.set.lang : ((cur() && cur().st && cur().st.lang) || navLang()); return LG.UI[l] || LG.UI.tr; }
  function uiCode() { return S.set.lang !== "auto" ? S.set.lang : ((cur() && cur().st && cur().st.lang) || navLang()); }

  function save() {
    try {
      localStorage.setItem(SK, JSON.stringify({ cur: S.cur, set: S.set, chats: S.chats.slice(0, 50).map(function (c) { return { id: c.id, title: c.title, t: c.t, msgs: c.msgs.slice(-200), st: { lang: c.st && c.st.lang } }; }) }));
    } catch (e) {}
  }
  function load() {
    try { var o = JSON.parse(localStorage.getItem(SK) || "null"); if (o && o.chats) { S.chats = o.chats; S.cur = o.cur; S.set = Object.assign(S.set, o.set); } } catch (e) {}
    if (!S.chats.length) {
      try {
        var h = JSON.parse(localStorage.getItem(OLD) || "[]");
        if (h.length) S.chats.push({ id: uid(), title: (h[0].text || "").slice(0, 32), t: Date.now(), msgs: h, st: {} });
        var os = JSON.parse(localStorage.getItem("zunex-ai-state-v2") || "{}"); if (os.name) S.set.name = os.name;
      } catch (e) {}
    }
    if (!S.chats.length) newChat(true);
    if (!cur()) S.cur = S.chats[0].id;
  }
  function newChat(silent) {
    var c = cur();
    if (c && !c.msgs.length && !silent) { closeDrawer(); inp.focus(); return; }
    var n = { id: uid(), title: "", t: Date.now(), msgs: [], st: {} };
    S.chats.unshift(n); S.cur = n.id;
    if (!silent) { save(); renderAll(); closeDrawer(); inp.focus(); }
  }

  function applyUI() {
    var u = ui(), code = uiCode();
    document.documentElement.lang = code;
    Array.prototype.forEach.call(document.querySelectorAll("[data-i]"), function (e) { var v = u[e.getAttribute("data-i")]; if (v) e.textContent = (e.id === "newc" || e.id === "newc2" ? "＋ " : "") + v; });
    inp.placeholder = u.ph; note.textContent = u.note;
    if (S.set.theme === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", S.set.theme);
  }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function scroll() { msgs.scrollTop = msgs.scrollHeight; }

  function bubble(role, text, extras) {
    var row = el("div", "row " + (role === "user" ? "u" : "a")), b = el("div", "b");
    (extras || []).forEach(function (x) {
      if (x.url) { var im = el("img"); im.src = x.url; im.alt = x.name; b.appendChild(im); } else b.appendChild(el("div", "file", "📄 " + x.name));
    });
    b.appendChild(el("span", null, text)); row.appendChild(b); msgs.appendChild(row); scroll();
  }
  function renderList() {
    var l = $("list"); l.textContent = "";
    if (!S.chats.length) { l.appendChild(el("div", "none", ui().none)); return; }
    S.chats.slice().sort(function (a, b) { return b.t - a.t; }).forEach(function (c) {
      var d = el("div", "ci" + (c.id === S.cur ? " on" : "")); d.appendChild(el("span", null, c.title || ui().newc));
      var x = el("button", null, "✕"); x.title = ui().del;
      x.onclick = function (e) { e.stopPropagation(); S.chats = S.chats.filter(function (k) { return k.id !== c.id; }); if (!S.chats.length) newChat(true); if (!cur()) S.cur = S.chats[0].id; save(); renderAll(); };
      d.onclick = function () { S.cur = c.id; pending = []; renderAtt(); save(); renderAll(); closeDrawer(); };
      d.appendChild(x); l.appendChild(d);
    });
  }
  function renderAll() {
    applyUI(); renderList(); msgs.textContent = "";
    var c = cur(), u = ui();
    if (!c.msgs.length) {
      var e = el("div", "empty"); e.appendChild(el("div", "logo", "Z")); e.appendChild(el("h2", null, u.h2)); e.appendChild(el("div", null, u.intro));
      var ch = el("div", "chips");
      u.chips.forEach(function (s) { var bt = el("button", null, s); bt.onclick = function () { inp.value = s; doSend(); }; ch.appendChild(bt); });
      e.appendChild(ch); msgs.appendChild(e); return;
    }
    c.msgs.forEach(function (m) { bubble(m.role, m.text, (m.files || []).map(function (n) { return { name: n }; })); });
  }
  function renderAtt() {
    att.textContent = "";
    pending.forEach(function (p, i) {
      var d = el("div", "att"); if (p.url) { var im = el("img"); im.src = p.url; d.appendChild(im); }
      d.appendChild(el("span", null, p.name)); var x = el("button", null, "×"); x.onclick = function () { pending.splice(i, 1); renderAtt(); };
      d.appendChild(x); att.appendChild(d);
    });
  }

  $("attach").onclick = function () { fileIn.click(); };
  fileIn.onchange = function () {
    Array.prototype.forEach.call(fileIn.files, function (f) {
      if (f.size > 8 * 1024 * 1024) { note.textContent = "“" + f.name + "” " + ui().big; return; }
      var p = { name: f.name, size: f.size };
      if (f.type.indexOf("image/") === 0) {
        p.kind = "image"; p.url = URL.createObjectURL(f); pending.push(p); renderAtt();
        var im = new Image(); im.onload = function () { p.width = im.naturalWidth; p.height = im.naturalHeight; }; im.src = p.url;
      } else if (f.type.indexOf("text/") === 0 || TEXTX.test(f.name)) {
        var r = new FileReader();
        r.onload = function () { var s = String(r.result); p.kind = "text"; p.truncated = s.length > 30000; p.text = s.slice(0, 30000); pending.push(p); renderAtt(); };
        r.readAsText(f);
      } else { p.kind = "binary"; pending.push(p); renderAtt(); }
    });
    fileIn.value = "";
  };
  inp.addEventListener("input", function () { inp.style.height = "auto"; inp.style.height = Math.min(inp.scrollHeight, 140) + "px"; });
  inp.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); } });
  $("send").onclick = doSend;
  $("newc").onclick = $("newc2").onclick = function () { newChat(); };

  function doSend() {
    var text = inp.value.trim(); if (!text && !pending.length) return;
    var c = cur(), files = pending.slice(); pending = []; renderAtt();
    inp.value = ""; inp.style.height = "auto"; note.textContent = ui().note;
    var first = !c.msgs.length; if (first) msgs.textContent = "";
    var shown = text || ui().file;
    c.msgs.push({ role: "user", text: shown, files: files.map(function (f) { return f.name; }) });
    if (!c.title) c.title = shown.slice(0, 32); c.t = Date.now();
    bubble("user", shown, files.map(function (f) { return { name: f.name, url: f.url }; }));
    c.st = c.st || {}; c.st.name = S.set.name;
    var out;
    try { out = AI.reply(text, { state: c.st, files: files, lang: S.set.lang === "auto" ? undefined : S.set.lang, uiLang: navLang() }); }
    catch (err) { out = "⚠ " + (err && err.message || "error"); }
    S.set.name = c.st.name || "";
    c.msgs.push({ role: "assistant", text: out }); bubble("assistant", out);
    save(); renderList(); applyUI(); inp.focus();
  }

  /* Çekmece (mobil) ve ayarlar */
  function closeDrawer() { $("side").classList.remove("open"); $("scrim").classList.remove("on"); }
  $("menu").onclick = function () { $("side").classList.add("open"); $("scrim").classList.add("on"); };
  $("scrim").onclick = closeDrawer;
  function openSettings() {
    var u = ui(), sl = $("sLang"), st = $("sTheme"); sl.textContent = st.textContent = "";
    [["auto", u.auto], ["az", LG.NAMES.az], ["tr", LG.NAMES.tr], ["en", LG.NAMES.en], ["ru", LG.NAMES.ru]].forEach(function (o) { var op = el("option", null, o[1]); op.value = o[0]; sl.appendChild(op); });
    [["auto", u.sys], ["light", u.light], ["dark", u.dark]].forEach(function (o) { var op = el("option", null, o[1]); op.value = o[0]; st.appendChild(op); });
    sl.value = S.set.lang; st.value = S.set.theme; $("sName").value = S.set.name; $("modal").hidden = false;
  }
  $("cfg").onclick = openSettings;
  $("sClose").onclick = function () { $("modal").hidden = true; };
  $("modal").addEventListener("click", function (e) { if (e.target === $("modal")) $("modal").hidden = true; });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") $("modal").hidden = true; });
  $("sSave").onclick = function () {
    S.set.lang = $("sLang").value; S.set.theme = $("sTheme").value; S.set.name = $("sName").value.trim().slice(0, 40);
    save(); $("modal").hidden = true; renderAll();
  };
  $("sDel").onclick = function () {
    if (!window.confirm(ui().confirm)) return;
    S.chats = []; S.set.name = ""; pending = []; renderAtt(); newChat(true); save(); $("modal").hidden = true; renderAll();
  };

  load(); renderAll();
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) navigator.serviceWorker.register("sw.js").catch(function () {});
})();
