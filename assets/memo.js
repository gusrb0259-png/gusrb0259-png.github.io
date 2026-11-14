/* 회원 메모 — 선생님만 (2026-11-12 장동욱 "회원님들 메모 기능, 그 회원님 상태를 까먹을 수도 있으니까")
   저장: 출석 창고 저장소 coach:memo:<회원주소> = [{id, d:"YYYY-MM-DD", t:"내용", tag?, pin?}] (최신이 위)
   coach:* 이름은 선생님 열쇠로만 읽고 쓸 수 있음 → 회원 폰에서는 절대 안 보임.
   쓰는 곳: 선생님 페이지 회원 카드(📝 줄) · 선생님 보기 회원 노트 홈 맨 위 '선생님 메모' 칸(app.js가 이 파일을 불러옴).
   PTMemo.load(slug?) → Promise<{slug: [메모…]}> / PTMemo.open(slug, name, onChange) / PTMemo.line(list) */
(function () {
  "use strict";
  if (window.PTMemo) return;
  var SITE = window.SITE || {};
  var API = window.ATT_API || SITE.att_api || "";
  var TAGS = ["몸 상태", "통증·주의", "목표", "식단", "일정", "기타"];
  var CACHE = {};
  function key() { try { return localStorage.getItem("ptkey") || ""; } catch (e) { return ""; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function md(s) { var m = String(s || "").match(/^\d{4}-(\d{2})-(\d{2})/); return m ? +m[1] + "/" + +m[2] : ""; }
  function post(body, k) {
    body.m = "coach"; body.key = k || key();
    function once() { return fetch(API, { method: "POST", body: JSON.stringify(body) }).then(function (r) { return r.json(); }); }
    return once().catch(function () { return new Promise(function (ok) { setTimeout(ok, 2500); }).then(once); }).then(function (j) {
      if (j && j.ok && k) { try { localStorage.setItem("ptkey", k); } catch (e) {} }
      return j;
    });
  }
  function sortL(list) {
    return (list || []).slice().sort(function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || String(b.d).localeCompare(String(a.d)) || String(b.id).localeCompare(String(a.id)); });
  }
  function load(slug) {
    if (!key() || !API) return Promise.resolve(null);
    var pre = "coach:memo:" + (slug || "");
    return post({ a: "kv_get", prefix: pre }).then(function (j) {
      if (!j || !j.ok || !j.kv) return null;
      var o = {};
      Object.keys(j.kv).forEach(function (k) { var s = k.slice(11); if (!slug || s === slug) o[s] = sortL(j.kv[k]); });
      if (slug && !o[slug]) o[slug] = [];
      Object.keys(o).forEach(function (s) { CACHE[s] = o[s]; });
      return o;
    }).catch(function () { return null; });
  }
  function line(list) {   /* 카드 한 줄 요약: 고정 메모 또는 최신 메모 */
    if (!list || !list.length) return "";
    var x = list[0];
    return (x.pin ? "📌 " : md(x.d) + " · ") + (x.tag ? "[" + x.tag + "] " : "") + String(x.t).split("\n")[0];
  }

  var css = document.createElement("style");
  css.textContent = [
    ".ptm-bg{position:fixed;inset:0;z-index:80;background:rgba(15,15,18,.45);display:flex;align-items:flex-end;justify-content:center;-webkit-tap-highlight-color:transparent}",
    ".ptm{width:100%;max-width:560px;max-height:88vh;overflow:auto;background:#fff;border-radius:22px 22px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));box-sizing:border-box;font-family:inherit;color:#1A1A1E;box-shadow:0 -8px 30px rgba(0,0,0,.18)}",
    ".ptm-h{display:flex;align-items:center;gap:10px;margin-bottom:4px}.ptm-h b{flex:1;font-size:18px;font-weight:900;letter-spacing:-.02em}",
    ".ptm-h button{font:inherit;font-size:14px;font-weight:800;border:0;background:#F2F2F4;color:#1A1A1E;border-radius:99px;padding:8px 14px;cursor:pointer}",
    ".ptm-sub{margin:0 0 12px;font-size:12.5px;color:#7A7A85}",
    ".ptm textarea{width:100%;box-sizing:border-box;font:inherit;font-size:16px;line-height:1.5;border:1.5px solid #E2E2E8;border-radius:12px;padding:10px 12px;resize:vertical;min-height:84px;color:#1A1A1E}",
    ".ptm textarea:focus,.ptm input:focus{outline:none;border-color:#B8862B}",
    ".ptm-tags{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}",
    ".ptm-tags button{font:inherit;font-size:13px;font-weight:700;border:1.5px solid #E2E2E8;background:#fff;color:#5C5C66;border-radius:99px;padding:6px 11px;cursor:pointer}",
    ".ptm-tags button[aria-pressed=true]{border-color:#B8862B;background:#FBF3E2;color:#7A5410}",
    ".ptm-row{display:flex;gap:8px;align-items:center}.ptm-row label{flex:1;display:flex;align-items:center;gap:6px;font-size:13.5px;font-weight:700;color:#5C5C66}",
    ".ptm-row input[type=checkbox]{width:18px;height:18px;accent-color:#B8862B}",
    ".ptm-save{font:inherit;font-size:15px;font-weight:800;border:0;background:#1A1A1E;color:#fff;border-radius:12px;padding:12px 18px;cursor:pointer}",
    ".ptm-save:disabled{opacity:.5}",
    ".ptm-key{display:flex;flex-direction:column;gap:5px;margin-top:8px;font-size:13px;font-weight:800;color:#5C5C66}.ptm-key input{font:inherit;font-size:16px;border:1.5px solid #E2E2E8;border-radius:10px;padding:9px 11px}",
    ".ptm-msg{margin:8px 0 0;font-size:13px;font-weight:700;color:#C62828}.ptm-msg:empty{display:none}",
    ".ptm-list{margin-top:14px;display:flex;flex-direction:column;gap:8px}",
    ".ptm-it{border:1px solid #ECECF0;border-radius:14px;padding:10px 12px;background:#FAFAFB}",
    ".ptm-it.pin{border-color:#E8D3A6;background:#FFFAEF}",
    ".ptm-it .m{display:flex;align-items:center;gap:6px;font-size:12px;color:#8A8A94;font-weight:700}",
    ".ptm-it .m i{font-style:normal;background:#fff;border:1px solid #E2E2E8;border-radius:99px;padding:1px 8px;color:#5C5C66}",
    ".ptm-it .m span{flex:1}",
    ".ptm-it .m button{font:inherit;font-size:12px;font-weight:800;border:0;background:none;color:#7A7A85;padding:4px 6px;cursor:pointer}",
    ".ptm-it .m button.del{color:#C62828}.ptm-it .m button.sure{background:#C62828;color:#fff;border-radius:8px}",
    ".ptm-it p{margin:4px 0 0;font-size:14.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word}",
    ".ptm-empty{font-size:13px;color:#9A9AA4;text-align:center;padding:14px 0}"
  ].join("\n");
  document.head.appendChild(css);

  function open(slug, name, onChange) {
    var list = CACHE[slug] || [], tag = "", keyOk = !!key(), timer = null;
    var bg = document.createElement("div"); bg.className = "ptm-bg";
    bg.innerHTML = '<div class="ptm" role="dialog" aria-modal="true" aria-label="' + esc(name) + ' 회원님 메모">' +
      '<div class="ptm-h"><b>📝 ' + esc(name) + ' 회원님 메모</b><button type="button" data-x>닫기</button></div>' +
      '<p class="ptm-sub">선생님만 보여요 · 회원님 노트에는 절대 안 나와요</p>' +
      '<textarea id="ptmT" maxlength="1000" placeholder="예: 왼쪽 무릎 시큰 — 스쿼트 대신 레그프레스로&#10;다음 주 화·수 출장이라 못 옴"></textarea>' +
      '<div class="ptm-tags">' + TAGS.map(function (t) { return '<button type="button" aria-pressed="false" data-tag="' + t + '">' + t + '</button>'; }).join("") + '</div>' +
      '<div class="ptm-row"><label><input type="checkbox" id="ptmPin">📌 맨 위에 고정</label><button type="button" class="ptm-save" id="ptmSave">메모 저장</button></div>' +
      '<label class="ptm-key" id="ptmKeyW"' + (keyOk ? ' hidden' : '') + '>선생님 열쇠 <input type="password" id="ptmK" autocomplete="off"></label>' +
      '<p class="ptm-msg" id="ptmMsg" role="status"></p><div class="ptm-list" id="ptmL"></div></div>';
    document.body.appendChild(bg);
    var q = function (s) { return bg.querySelector(s); };
    function close() { bg.remove(); document.removeEventListener("keydown", onKey); }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    bg.addEventListener("click", function (e) { if (e.target === bg || e.target.closest("[data-x]")) close(); });
    function draw() {
      list = sortL(list);
      q("#ptmL").innerHTML = list.length ? list.map(function (x) {
        return '<div class="ptm-it' + (x.pin ? ' pin' : '') + '"><div class="m">' + (x.pin ? '📌 ' : '') + md(x.d) + (x.tag ? ' <i>' + esc(x.tag) + '</i>' : '') + '<span></span>' +
          '<button type="button" data-pin="' + esc(x.id) + '">' + (x.pin ? '고정 풀기' : '고정') + '</button><button type="button" class="del" data-del="' + esc(x.id) + '">삭제</button></div><p>' + esc(x.t) + '</p></div>';
      }).join("") : '<div class="ptm-empty">아직 메모가 없어요. 몸 상태·통증·일정 같은 걸 적어 두세요</div>';
    }
    function save(next, done) {
      var k = q("#ptmK").value.trim() || key();
      if (!k) { q("#ptmKeyW").hidden = false; q("#ptmMsg").textContent = "선생님 열쇠를 넣어 주세요"; return Promise.resolve(false); }
      q("#ptmMsg").textContent = "";
      return post({ a: "kv_set", k: "coach:memo:" + slug, v: next.length ? next : null }, k).then(function (j) {
        if (!j || !j.ok) {
          if (j && j.error === "key") { try { localStorage.removeItem("ptkey"); } catch (e) {} q("#ptmKeyW").hidden = false; q("#ptmMsg").textContent = "선생님 열쇠가 맞지 않아요. 다시 넣어 주세요"; }
          else q("#ptmMsg").textContent = "저장하지 못했어요 — 잠깐 뒤 다시 눌러 주세요";
          return false;
        }
        list = next; CACHE[slug] = sortL(next); draw(); if (onChange) onChange(CACHE[slug]); if (done) done(); return true;
      }).catch(function () { q("#ptmMsg").textContent = "저장하지 못했어요 — 인터넷 연결을 확인해 주세요"; return false; });
    }
    q(".ptm-tags").addEventListener("click", function (e) {
      var b = e.target.closest("[data-tag]"); if (!b) return;
      tag = tag === b.getAttribute("data-tag") ? "" : b.getAttribute("data-tag");
      Array.prototype.forEach.call(bg.querySelectorAll("[data-tag]"), function (o) { o.setAttribute("aria-pressed", String(o.getAttribute("data-tag") === tag)); });
    });
    q("#ptmSave").addEventListener("click", function () {
      var t = q("#ptmT").value.trim(); if (!t) { q("#ptmMsg").textContent = "메모 내용을 적어 주세요"; return; }
      var btn = q("#ptmSave"); btn.disabled = true; btn.textContent = "저장 중…";
      var it = { id: Date.now().toString(36), d: today(), t: t }; if (tag) it.tag = tag; if (q("#ptmPin").checked) it.pin = 1;
      save([it].concat(list), function () { q("#ptmT").value = ""; q("#ptmPin").checked = false; tag = ""; Array.prototype.forEach.call(bg.querySelectorAll("[data-tag]"), function (o) { o.setAttribute("aria-pressed", "false"); }); })
        .then(function () { btn.disabled = false; btn.textContent = "메모 저장"; });
    });
    q("#ptmL").addEventListener("click", function (e) {
      var p = e.target.closest("[data-pin]"), d = e.target.closest("[data-del]");
      if (p) { var id = p.getAttribute("data-pin"); save(list.map(function (x) { if (x.id !== id) return x; var y = JSON.parse(JSON.stringify(x)); if (y.pin) delete y.pin; else y.pin = 1; return y; })); }
      if (d) {
        if (!d.classList.contains("sure")) { d.classList.add("sure"); d.textContent = "한 번 더"; clearTimeout(timer); timer = setTimeout(function () { d.classList.remove("sure"); d.textContent = "삭제"; }, 2500); return; }
        var did = d.getAttribute("data-del"); save(list.filter(function (x) { return x.id !== did; }));
      }
    });
    draw();
    if (!CACHE[slug] && keyOk) load(slug).then(function (o) { if (o) { list = o[slug] || []; draw(); } });
    setTimeout(function () { q("#ptmT").focus(); }, 60);
  }
  window.PTMemo = { load: load, open: open, line: line, cache: CACHE };
})();
