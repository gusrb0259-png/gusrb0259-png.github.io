/* PT 노트 회원 홈페이지 — window.MEMBER(data.js)를 읽어 화면을 그림 */
(function () {
  "use strict";
  var M = window.MEMBER;
  if (!M) return;
  /* 선생님이 폰에서 고친 회원 정보 (2026-11-12 "항목들 내가 수정할 수 있게") — 창고 저장소 pub:m:<주소>:info {goal, start, next_class}
     이 폰에 기억(ptnote:<주소>:info)해 두고 화면을 그리기 전에 data.js 위에 덮어씀. 창고에서 새 값이 오면 기억 바꾸고 다시 그림 */
  var INFO_SLUG = window.ATT_SLUG || (location.pathname.match(/\/m\/([^\/]+)\//) || [, M.name])[1];
  var INFO_LS = "ptnote:" + INFO_SLUG + ":info", INFO_ORIG = { goal: M.goal, journey: M.journey, next_class: M.next_class };
  function infoApply(o) {
    M.goal = INFO_ORIG.goal; M.journey = INFO_ORIG.journey; M.next_class = INFO_ORIG.next_class;
    if (!o || typeof o !== "object") return;
    if (typeof o.goal === "string" && o.goal) M.goal = o.goal;
    if (typeof o.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.start)) {
      var j = {}, src = INFO_ORIG.journey || {}; for (var k in src) j[k] = src[k]; j.start = o.start; M.journey = j;
    }
    if ("next_class" in o) M.next_class = o.next_class || null;
  }
  try { infoApply(JSON.parse(localStorage.getItem(INFO_LS) || "null")); } catch (e) {}
  /* 선생님이 폰에서 고친 식단 (2026-11-12 "식단도 터치해서 고치기") — 창고 pub:m:<주소>:diet {base, diet?, text?}
     base = data.js 식단의 기준(updated 또는 글 앞부분). data.js 식단이 새로 올라오면 기준이 달라져서 폰에서 고친 식단은 꺼지고 data.js가 이김(루틴과 같은 규칙) */
  var DIET_ORIG = M.diet, DIET_LS = "ptnote:" + INFO_SLUG + ":diet";
  function dietBase(d) { return d && typeof d === "object" ? "o|" + (d.updated || "") : "s|" + String(d || "").slice(0, 60); }
  var DIET_BASE = dietBase(DIET_ORIG);
  function dietApply(o) {
    M.diet = DIET_ORIG;
    if (!o || typeof o !== "object" || o.base !== DIET_BASE) return false;
    if (o.diet && typeof o.diet === "object") M.diet = o.diet;
    else if (typeof o.text === "string") M.diet = o.text ? '<div class="panel" style="white-space:pre-line;font-size:15px;line-height:1.7">' + String(o.text).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }) + '</div>' : null;
    return true;
  }
  var DIET_REC = null;
  try { DIET_REC = JSON.parse(localStorage.getItem(DIET_LS) || "null"); if (!dietApply(DIET_REC)) DIET_REC = null; } catch (e) {}
  /* 선생님이 폰으로 올린 복습지 사진·영상 (2026-11-12) — 창고 pub:m:<주소>:fmedia {복습지id: [{id, t:"img"|"vid", cap, at}]}
     + 사진·영상만으로 만든 간단 복습지 pub:m:<주소>:fx [{id, exercise, part, note, date}] → M.forms 맨 앞에 끼움(simple) */
  var FM_LS = "ptnote:" + INFO_SLUG + ":fm", FX_LS = "ptnote:" + INFO_SLUG + ":fx", FORMS_ORIG = (M.forms || []).slice(), FMEDIA = {}, FX = [];
  function fxApply(fx) {
    FX = Array.isArray(fx) ? fx : [];
    M.forms = FX.map(function (x) { var o = {}; for (var k in x) o[k] = x[k]; o.simple = true; o.targets = []; return o; }).concat(FORMS_ORIG);
  }
  try { FMEDIA = JSON.parse(localStorage.getItem(FM_LS) || "{}") || {}; fxApply(JSON.parse(localStorage.getItem(FX_LS) || "null")); } catch (e) { fxApply(null); }
  var SCRIPT = document.currentScript;
  var BASE = SCRIPT ? SCRIPT.src.replace(/app\.js(\?.*)?$/, "") : "../../assets/";
  /* 옛 화면 자동 새로고침 (2026-11-21 팀장 "안 바뀌잖아") — GitHub Pages가 index.html을 10분까지 붙잡고 있어서 고친 걸 바로 못 봄.
     열 때 assets/ver.txt(캐시 안 씀)를 확인해 지금 불러온 ?v= 보다 새것이면 한 번만 새로고침(같은 버전으로 두 번은 안 함). */
  (function () {
    var cur = SCRIPT && (SCRIPT.src.match(/[?&]v=(\w+)/) || [])[1];
    if (!cur || !window.fetch) return;
    document.addEventListener("visibilitychange", function () { if (!document.hidden) chk(); });
    chk(); function chk() { fetch(BASE + "ver.txt?t=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.ok ? r.text() : ""; }).then(function (v) {
      v = (v || "").trim();
      if (!/^\d{10}$/.test(v) || v <= cur) return;
      var k = "ptver:" + v; try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, "1"); } catch (e) { return; }
      location.reload();
    }).catch(function () {}); }
  })();
  var THEME = M.sex === "F" ? "F" : "M";
  /* 사이트 기본 정보 (assets/site.js — 없으면 아래 기본값) */
  var SITE = window.SITE || {};
  /* 담당 선생님 이름 (2026-11-12 선생님 여러 명) — data.js trainer / 창고 pub:m:<주소>:trainer(팀장이 담당 바꾸면) / 없으면 site.js 트레이너 */
  var TRN_LS = "ptnote:" + INFO_SLUG + ":trainer";
  try { var trnC = localStorage.getItem(TRN_LS); if (trnC) M.trainer = trnC; } catch (e) {}
  var TRN = M.trainer || SITE.trainer || "OOO", TRL = function () { return TRN === SITE.trainer && SITE.role ? SITE.role : "트레이너"; }, BRAND = SITE.brand || "", BRANCH = SITE.branch || "", BRN = (BRAND + (BRANCH ? " " + BRANCH : "")).trim();   /* 2026-11-21 팀장 "짐토스 싹다 빼" — site.js brand·branch 비움 */
  /* 루틴 고치기 (2026-11-10): 선생님이 폰에서 고친 루틴은 출석 창고(시트 "루틴")에 저장되고,
     회원 휴대폰에는 ptnote:<주소>:routine 으로 기억해 둠 → 열자마자 고친 루틴으로 보임.
     기준(base) = data.js 루틴의 version|updated. data.js 루틴이 새로 올라오면(기준이 달라지면) data.js가 이김 */
  var RT_SLUG = window.ATT_SLUG || (location.pathname.match(/\/m\/([^\/]+)\//) || [, M.name])[1];
  var RT_LS = "ptnote:" + RT_SLUG + ":routine";
  function rtBase(r) { return r ? String(r.version || "") + "|" + String(r.updated || "") : ""; }
  function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
  var RT_ORIG = clone(M.routine || null), RT_BASE = rtBase(M.routine), NT_ORIG = (M.notices || []).slice();
  var RT_REC = null;   /* 지금 쓰고 있는 '폰에서 고친 루틴' 기록 {base, routine, notice?, at} */
  /* 전체 공지 (2026-11-11): 선생님 페이지에서 쓴 공지 — 출석 창고 "전체공지" 탭 → 모든 회원 노트 공지에 같이 나옴. 휴대폰엔 ptnote:bn */
  var BN = [];
  try { BN = JSON.parse(localStorage.getItem("ptnote:bn") || "[]") || []; } catch (e) { BN = []; }
  function nYmd(n) { var m = String(n.date || "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/); return m ? +m[1] * 10000 + +m[2] * 100 + +m[3] : 0; }
  function nBuild() {   /* data.js 공지 + 전체 공지 + 폰에서 고친 루틴 공지 → 날짜 최신순(같은 날은 원래 순서) */
    var extra = BN.map(function (b) { return { date: b.date, title: b.title, body: b.body, link: b.link || "", all: 1 }; });
    var nt = RT_REC && RT_REC.notice;
    if (nt && nt.title) extra.push(nt);
    var list = NT_ORIG.slice();
    extra.forEach(function (x) {
      if (list.some(function (n) { return n.date === x.date && n.title === x.title; })) return;
      var at = 0; while (at < list.length && nYmd(list[at]) > nYmd(x)) at++;
      list.splice(at, 0, x);
    });
    M.notices = list;
  }
  function rtUse(rec) {
    RT_REC = rec && rec.routine && rec.base === RT_BASE ? rec : null;
    M.routine = RT_REC ? clone(RT_REC.routine) : clone(RT_ORIG);
    nBuild();
  }
  nBuild();
  try { var rtc = JSON.parse(localStorage.getItem(RT_LS) || "null"); if (rtc) rtUse(rtc); } catch (e) {}
  /* 종목 이름 → 루틴일지 아이콘 (data.js에서 icon을 따로 주면 그게 우선) */
  var ICON_BY_NAME = {
    "플랫 덤벨프레스": "db_bench_press", "덤벨 벤치프레스": "db_bench_press", "바벨 벤치프레스": "bench_press", "벤치프레스": "bench_press",
    "인클라인 덤벨 프레스": "incline_db_press", "스미스 인클라인 프레스": "smith_incline_press", "인클라인 프레스 머신": "incline_machine_press", "머신 인클라인 프레스": "incline_machine_press",
    "체스트 프레스": "chest_press", "뉴텍 체스트 프레스 머신": "lying_chest_press", "뉴텍 체스트프레스 머신": "lying_chest_press", "펙덱 플라이": "pec_deck", "펙덱": "pec_deck", "케이블 푸쉬다운": "cable_pushdown",
    "오버헤드 익스텐션": "overhead_ext", "랫풀다운": "lat_pulldown", "패럴렐 그립 랫풀다운": "lat_pulldown", "벤트오버 덤벨 로우": "one_arm_row", "클로즈그립 랫풀다운": "close_grip_pulldown", "와이드 풀다운": "wide_pulldown", "언더그립 랫풀다운": "underhand_pulldown",
    "스트레이트 암 풀다운": "straight_arm_pulldown", "뉴텍 시티드 로우 머신": "seated_row_machine", "뉴텍 엠토처 시티드 로우": "mtorture_row", "엠토처 시티드 로우": "mtorture_row", "시티드 로우 머신": "seated_row_machine", "시티드 로우": "seated_row_machine",
    "케이블 시티드 로우": "cable_seated_row", "롱풀": "cable_seated_row", "언더그립 시티드 로우": "underhand_seated_row", "원암 덤벨 로우": "one_arm_row",
    "해머스트렝스 로우로우": "low_row", "로우로우": "low_row", "하이 로우": "high_row", "뉴텍 버티컬 풀다운": "vertical_pulldown", "버티컬 풀다운": "vertical_pulldown", "버티컬 풀다운 머신": "vertical_pulldown", "버티컬 풀다운": "vertical_pulldown",
    "케이블 풀오버": "cable_pullover", "시티드 페이스풀": "face_pull", "페이스풀": "standing_face_pull", "페이스 풀": "standing_face_pull", "티바로우 머신": "tbar_row", "프론트 로우 머신": "front_row", "리버스 펙덱": "reverse_pec_deck", "리버스 플라이 머신": "reverse_pec_deck", "리버스 펙덱 플라이": "reverse_pec_deck", "케이블 체스트 프레스": "cable_chest_press",
    "어시스트 친업": "assisted_chin_up", "어시스티드 친업": "assisted_chin_up", "어시스트 풀업": "assisted_chin_up", "해머 로우로우": "low_row",
    "레그 익스텐션": "leg_extension", "이너타이": "inner_thigh", "아웃타이 머신": "outer_thigh_pin", "플레이트 아웃타이": "outer_thigh_plate",
    "아웃타이": "outer_thigh", "고블릿 스쿼트": "goblet_squat", "불가리안 스플릿 스쿼트": "goblet_squat", "스플릿 스쿼트": "goblet_squat", "핵스쿼트": "hack_squat", "스미스 스쿼트": "smith_squat",
    "레그프레스": "leg_press", "파워 레그프레스": "leg_press", "파워레그프레스": "leg_press", "스탠딩 아웃타이": "outer_thigh_pin", "스탠딩아웃타이": "outer_thigh_pin", "라잉 레그컬": "lying_leg_curl", "힙쓰러스트": "hip_thrust", "덤벨 RDL": "db_rdl", "덤벨 컨벤셔널 데드리프트": "db_rdl", "덤벨 데드리프트": "db_rdl",
    "핵프레스": "hack_press",
    "백 익스텐션": "back_extension", "사이드 레터럴 레이즈": "lateral_raise", "레터럴 레이즈": "lateral_raise",
    "사이드 레터럴 레이즈 머신": "lateral_raise_standing", "레터럴 레이즈 머신": "lateral_raise_standing", "머신 레터럴 레이즈": "lateral_raise_standing",
    "스탠딩 사이드 레터럴 레이즈 머신": "lateral_raise_standing", "시티드 레터럴 레이즈": "seated_lateral_raise", "시티드 사이드 레터럴 레이즈": "seated_lateral_raise", "숄더 프레스 머신": "shoulder_press", "머신 비하인드 넥 프레스": "shoulder_press", "비하인드 넥 프레스": "shoulder_press", "숄더 프레스": "shoulder_press",
    "덤벨 컬": "db_curl", "머신 암 컬": "db_curl", "암 컬 머신": "db_curl", "머신 암컬": "db_curl", "해머 컬": "db_curl", "덤벨 슈러그": "shrug", "플랭크": "plank",
    "스미스 벤치프레스": "smith_bench_press", "스미스 클로즈그립 벤치프레스": "smith_bench_press",
    "스미스 벤트오버 로우": "smith_row", "티바 로우": "tbar_row", "와이드 풀다운": "wide_pulldown", "레터럴 로우 머신": "seated_row_machine", "레터럴 로우": "seated_row_machine", "Y 레이즈": "lateral_raise", "Y레이즈": "lateral_raise", "케이블 Y 레이즈": "lateral_raise", "티바로우": "tbar_row", "티바 로우 머신": "tbar_row", "스미스 숄더 프레스": "smith_shoulder_press", "덤벨 오버헤드 익스텐션": "overhead_ext",
    "스미스 슈러그": "smith_shrug", "인클라인 덤벨 컬": "incline_db_curl", "스파이더 컬": "spider_curl", "프리처 컬 머신": "preacher_curl_machine", "프리쳐컬 머신": "preacher_curl_machine", "덤벨 숄더 프레스": "shoulder_press", "스탠딩 덤벨 숄더 프레스": "shoulder_press", "스탠딩 숄더 프레스": "shoulder_press", "랙 밴드 푸쉬업": "band_push_up",
    "체스트 프레스 머신": "chest_press", "플랫 벤치프레스 머신": "lying_chest_press", "플랫 벤치 프레스 머신": "lying_chest_press", "힙쓰러스트 머신": "hip_thrust", "몬스터 글루트": "hip_thrust", "몬스터글루트": "hip_thrust", "케이블 힙 킥백": "cable_kickback", "힙 익스텐션": "back_extension"
  };
  function icv() { return THM ? THEME : THEME === "F" ? "W" : "N"; }   /* 기본 테마 그림: 여 W(애프리콧·플럼·모브) · 남 N(블랙·세룰리언·네온 로즈, 2026-11-24) */   /* 2026-11-24 여성 기본 테마(애프리콧·플럼·모브) 그림 = W, 회원 테마(pinkcheck·chihuahua)는 예전 F */
  function iconSrc(key) { return BASE + "icons/" + icv() + "/" + key + ".png"; }
  function iconOf(it) {
    if (it.icon) return it.icon;
    var n = it.name || "";
    return ICON_BY_NAME[n] || ICON_BY_NAME[n.replace(/\s*\(.*\)\s*$/, "")] || "dumbbell";
  }
  function mainItem(d) {
    var its = d.items || [];
    for (var i = 0; i < its.length; i++) if (its[i].tag === "메인") return its[i];
    return its[0] || { name: "" };
  }
  function dayIcon(d) { return !d || d.rest ? "rest" : d.cardio_only ? "treadmill" : d.pick ? "dumbbell" : iconOf(mainItem(d)); }
  /* 운동 아이콘: assets/exicons.js(움직이는 SVG, 2026-11-10)에 있는 종목은 그걸로, 없으면 예전 PNG. still = 멈춘 그림(작은 칸용) */
  function img(key, cls, still) {
    if (window.EXI && EXI.has(key)) return EXI.svg(key, { sex: THM === "pinkcheck" ? "P" : THM === "chihuahua" ? "C" : icv(), cls: cls || "icn", still: !!still });
    return '<img class="' + (cls || "icn") + '" src="' + iconSrc(key) + '" alt="" loading="lazy">';
  }
  document.documentElement.setAttribute("data-sex", M.sex === "F" ? "F" : "M");
  /* 회원별 테마 (2026-11-13) — pinkcheck = 이다혜(분홍 체크 + 아기 토끼 보니) / chihuahua = 채와와(트레이너가 준 성난 치와와 그림 — 베이지 + 발바닥·뼈다귀) */
  var THM = M.theme === "pinkcheck" || M.theme === "chihuahua" ? M.theme : "";
  var PINK = THM === "pinkcheck";
  if (THM) document.documentElement.setAttribute("data-theme", THM);
  function mascot() { return THM === "pinkcheck" ? bunny() : THM === "chihuahua" ? wawa() : ""; }
  /* 보니: 직접 디자인한 아기 토끼(긴 귀·헤어밴드·작은 덤벨) */
  function bunny() {
    return '<svg class="mascot bunny" viewBox="0 0 100 100" aria-hidden="true">' +
      '<g class="bn-ear"><path d="M34 46C26 30 26 10 33 6c7-3 11 16 10 38z" fill="#FFFFFF" stroke="#7A4636" stroke-width="2.2"/><path d="M35 40c-4-11-4-24 0-27 3-1 5 12 4 26z" fill="#FFC2D6"/></g>' +
      '<g class="bn-ear r"><path d="M58 44c0-22 6-40 13-37 7 4 5 24-4 40z" fill="#FFFFFF" stroke="#7A4636" stroke-width="2.2"/><path d="M62 39c1-14 4-25 7-24 3 2 1 14-4 26z" fill="#FFC2D6"/></g>' +
      '<path d="M30 45q20-10 40 0" fill="none" stroke="#FFD86B" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="70" cy="44" r="4" fill="#FFD86B" stroke="#7A4636" stroke-width="1.6"/>' +
      '<ellipse cx="50" cy="66" rx="27" ry="23" fill="#FFFFFF" stroke="#7A4636" stroke-width="2.2"/>' +
      '<ellipse cx="41" cy="63" rx="2.6" ry="3.4" fill="#4A2A1F"/><ellipse cx="59" cy="63" rx="2.6" ry="3.4" fill="#4A2A1F"/>' +
      '<circle cx="42" cy="61.6" r=".9" fill="#fff"/><circle cx="60" cy="61.6" r=".9" fill="#fff"/>' +
      '<ellipse cx="34" cy="71" rx="4.6" ry="3" fill="#FF9DBD" opacity=".75"/><ellipse cx="66" cy="71" rx="4.6" ry="3" fill="#FF9DBD" opacity=".75"/>' +
      '<path d="M47 69q3 2.4 6 0" fill="none" stroke="#4A2A1F" stroke-width="1.6" stroke-linecap="round"/><path d="M50 69v3" stroke="#4A2A1F" stroke-width="1.4"/>' +
      '<path d="M46.5 72.5q3.5 3 7 0" fill="none" stroke="#4A2A1F" stroke-width="1.5" stroke-linecap="round"/>' +
      '<g transform="translate(70 80) rotate(-18)"><rect x="-12" y="-1.6" width="24" height="3.2" rx="1.6" fill="#B9A3AE"/><rect x="-15" y="-6" width="6" height="12" rx="2.4" fill="#EE86A8" stroke="#7A4636" stroke-width="1.4"/><rect x="9" y="-6" width="6" height="12" rx="2.4" fill="#EE86A8" stroke="#7A4636" stroke-width="1.4"/></g>' +
      '<ellipse cx="66" cy="81" rx="5" ry="4" fill="#FFFFFF" stroke="#7A4636" stroke-width="1.8"/>' +
      '</svg>';
  }
  /* 와와: 트레이너가 준 성난 치와와 그림(2026-11-13) — assets/theme/chihuahua/face.webp(얼굴 동그라미)·splash.webp(시작 화면 통째) */
  function wawa() {
    var puff = '<svg viewBox="0 0 40 30"><path d="M10 26c-6 0-8-7-3-9-2-6 6-10 10-6 2-6 12-5 12 1 6-1 9 7 3 9 1 5-6 7-9 4-3 3-9 3-11 0z" fill="#FFFDF9" stroke="#7A5A48" stroke-width="2"/></svg>';
    return '<span class="mascot wawa"><img src="' + BASE + 'theme/chihuahua/face.webp" alt="">' +
      '<i class="ww-mad"><svg viewBox="-10 -10 20 20"><path d="M-7-2q4 0 5-5M2-7q1 5 5 5M7 2q-4 0-5 5M-2 7q-1-5-5-5" fill="none" stroke="#C0392B" stroke-width="2.8" stroke-linecap="round"/></svg></i>' +
      '<i class="ww-puff a">' + puff + '</i><i class="ww-puff b">' + puff + '</i><i class="ww-bark">왈!</i></span>';
  }
  /* 2026-11-13 회원별 테마 스킨 (data.js skin: "bunny" — 김지수님 토롱이). 기능은 그대로, 글꼴·색·꾸밈 그림만 얹음 */
  var SKIN = String(M.skin || "");
  if (SKIN) {
    document.documentElement.setAttribute("data-skin", SKIN);
    if (!document.getElementById("skinFont")) {
      var sfl = document.createElement("link"); sfl.id = "skinFont"; sfl.rel = "stylesheet";
      sfl.href = "https://fonts.googleapis.com/css2?family=Jua&display=swap"; document.head.appendChild(sfl);
    }
  }
  /* 2026-11-16 돌아다니는 고양이 (data.js pet: "cat" — 우유정님 "귀여운 고양이 돌아다니게"). 아래 탭 바로 위를 걸어다니다 앉아서 쉼.
     오리지널 그림(크림색 고양이 + 분홍 리본), 화면 위에 따로 떠 있는 칸(.petwalk)이라 본문(.view)엔 효과 없음 · pointer-events none · 폭 안 넓어짐(overflow hidden) */
  (function () {
    /* 2026-11-19 팀장 "모든 회원님한테 캐릭터 — 남자는 멋있는 동물, 여자는 귀여운 동물, 랜덤 / 누르면 오늘 하루 고생했다 감성 글귀"
       data.js pet 이 없으면 회원 주소로 정해지는 랜덤(한 번 정해지면 그대로): 남 = 늑대·흑표범·도베르만 / 여 = 고양이·토끼·강아지. pet:"none" = 안 보임.
       늑대·도베르만·강아지는 강아지(dog) 그림, 흑표범은 고양이(cat) 그림을 색만 바꿔 씀(PCOL). 이름은 pet_name 또는 PNAME. */
    if (M.pet === "none" || document.querySelector(".petwalk")) return;
    var PPOOL = M.sex === "F" ? ["cat", "bunny", "puppy"] : ["wolf", "panther", "doberman"], PH = 0;
    var PSL = window.ATT_SLUG || (location.pathname.match(/\/m\/([^\/]+)\//) || [, M.name || "x"])[1];   /* SLUG은 아래에서 정해져서 여기선 직접 */
    for (var pi = 0; pi < PSL.length; pi++) PH = (PH * 31 + PSL.charCodeAt(pi)) % 9973;
    var PVAR = M.pet || PPOOL[PH % 3], PET = { wolf: "dog", doberman: "dog", puppy: "dog", panther: "cat" }[PVAR] || PVAR;
    if (PET !== "cat" && PET !== "bunny" && PET !== "dog" && PET !== "hamster") return;
    var PNAME = { hamster: "햄찌", wolf: "로키", panther: "팬텀", doberman: "듀크", cat: "모모", bunny: "토롱이", puppy: "몽이", dog: "멍멍이" };
    var PCOL = {
      wolf: [["#2A2630", "#6E737C"], ["#C98A4B", "#A9AEB6"], ["#FBF7F1", "#F2F3F5"], ["#E9A9A0", "#C9CDD3"]],
      doberman: [["#2A2630", "#1C1A1F"], ["#C98A4B", "#B5652B"], ["#FBF7F1", "#C27A3E"], ["#E9A9A0", "#8A4A26"]],
      puppy: [["#2A2630", "#E2BC8E"], ["#C98A4B", "#C98A4B"], ["#FBF7F1", "#FFFDF8"]],
      panther: [["#FFF3E2", "#26232B"], ["#F3D9B8", "#3A3640"], ["#EBCBA4", "#1C1A20"], ["#3A2E2E", "#E3B341"], ["#F7B6C6", "#4A4550"], ["#F9B9C8", "#26232B"], ["#E98AA2", "#4A4550"], ["#D6204F", "#26232B"], ["#B8173F", "#26232B"]]
    };
    document.documentElement.setAttribute("data-pet", PET);   /* bunny = 김지수님 토롱이가 깡충깡충(2026-11-16) — 테마 그림 base.svg 그대로, 탭 위 빼꼼 그림은 숨김 */
    var wrap = document.createElement("div"); wrap.className = "petwalk"; wrap.setAttribute("aria-hidden", "true");
    if (PET === "bunny") wrap.innerHTML = '<div class="pet hop sit"><svg class="b-all" viewBox="0 -6 64 68" width="48" height="51"><g class="b-body"><circle cx="11" cy="44" r="5.2" fill="#fff" stroke="#B8325A" stroke-width="1.5"/><ellipse class="b-foot" cx="20" cy="56" rx="9" ry="3.8" fill="#FFE8EE" stroke="#B8325A" stroke-width="1.5"/><ellipse cx="25" cy="45" rx="14.5" ry="11.5" fill="#FFE8EE" stroke="#B8325A" stroke-width="1.5"/><ellipse class="b-paw" cx="38" cy="56" rx="4.6" ry="3.4" fill="#FFE8EE" stroke="#B8325A" stroke-width="1.5"/></g><g class="b-ears"><g transform="translate(11.2 1.2) scale(.48)"><ellipse cx="45" cy="17" rx="9" ry="20" transform="rotate(-12 45 17)" fill="#FFE8EE" stroke="#B8325A" stroke-width="3"/><ellipse cx="45" cy="19" rx="4" ry="13" transform="rotate(-12 45 19)" fill="#F7A9BC"/><path d="M68 36 C66 20 72 5 81 6 C90 7 106 16 104 27 C102 34 92 31 84 27 C81 31 79 35 77 37 Z" fill="#FFE8EE" stroke="#B8325A" stroke-width="3" stroke-linejoin="round"/><path d="M74 30 C73 20 77 12 82 12 C88 13 97 19 97 24 C93 25 87 22 82 20 C79 23 77 27 76 31 Z" fill="#F7A9BC"/></g></g><g class="b-head"><g transform="translate(11.2 1.2) scale(.48)"><ellipse cx="60" cy="60" rx="34" ry="30" fill="#FFE8EE" stroke="#B8325A" stroke-width="3"/><path d="M27 50 Q60 34 93 50 L92 58 Q60 43 28 58 Z" fill="#D6204F" stroke="#B8325A" stroke-width="2" stroke-linejoin="round"/><g class="b-eyes"><ellipse cx="47" cy="65" rx="5.4" ry="7" fill="#4A2030"/><circle cx="49" cy="62" r="2.1" fill="#fff"/><circle cx="45.4" cy="67.6" r="1" fill="#fff"/><ellipse cx="73" cy="65" rx="5.4" ry="7" fill="#4A2030"/><circle cx="75" cy="62" r="2.1" fill="#fff"/><circle cx="71.4" cy="67.6" r="1" fill="#fff"/></g><g class="b-happy"><path d="M41 67q6-8 12 0M67 67q6-8 12 0" fill="none" stroke="#4A2030" stroke-width="3.4" stroke-linecap="round"/></g><ellipse cx="37" cy="76" rx="6.5" ry="4" fill="#FF8FA8" opacity=".8"/><ellipse cx="83" cy="76" rx="6.5" ry="4" fill="#FF8FA8" opacity=".8"/><path d="M56 73 Q58 76 60 73 Q62 76 64 73" fill="none" stroke="#B8325A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g></g></svg></div>';   /* 2026-11-16 "처음 측면 토롱이가 좋았는데" — 옆모습 토끼(솜꼬리·발 있음)로 다시 */
    else if (PET === "dog") wrap.innerHTML = '<div class="pet sit dog"><svg viewBox="0 0 64 48" width="52" height="39">'
      + '<g class="p-walk"><g class="p-tail"><path d="M13 27 C6 26 3 18 7 11" fill="none" stroke="#2A2630" stroke-width="5.5" stroke-linecap="round"/><path d="M7 11 c-3 2-4 6-3 9 M9 15 c-3 1-5 4-4 7" fill="none" stroke="#2A2630" stroke-width="2.2" stroke-linecap="round"/></g>'
      + '<g class="p-legs"><g class="lg a"><path d="M16 30c-.6 4-.4 7 .3 10.5h4.4c.7-3.5.9-6.5.3-10.5z" fill="#2A2630"/><ellipse cx="19.2" cy="42.3" rx="3.2" ry="2.2" fill="#FBF7F1"/></g><g class="lg b"><path d="M22 30c-.6 4-.4 7 .3 10.5h4.4c.7-3.5.9-6.5.3-10.5z" fill="#C98A4B"/><ellipse cx="25.2" cy="42.3" rx="3.2" ry="2.2" fill="#FBF7F1"/></g><g class="lg b"><path d="M36 30c-.6 4-.4 7 .3 10.5h4.4c.7-3.5.9-6.5.3-10.5z" fill="#C98A4B"/><ellipse cx="39.2" cy="42.3" rx="3.2" ry="2.2" fill="#FBF7F1"/></g><g class="lg a"><path d="M42 30c-.6 4-.4 7 .3 10.5h4.4c.7-3.5.9-6.5.3-10.5z" fill="#FBF7F1"/><ellipse cx="45.2" cy="42.3" rx="3.2" ry="2.2" fill="#fff"/></g></g>'
      + '<ellipse cx="30" cy="29.5" rx="18" ry="9.5" fill="#2A2630"/><ellipse cx="33" cy="35" rx="12" ry="3.6" fill="#FBF7F1"/><ellipse cx="44" cy="31" rx="5" ry="6.5" fill="#FBF7F1"/></g>'
      + '<g class="p-sit"><g class="p-tail"><path d="M17 41 C7 41 4 32 9 26" fill="none" stroke="#2A2630" stroke-width="5.5" stroke-linecap="round"/><path d="M9 26 c-3 2-4 6-3 9" fill="none" stroke="#2A2630" stroke-width="2.2" stroke-linecap="round"/></g><path d="M16 44c0-14 6-21 15-21s15 7 15 21z" fill="#2A2630"/><path d="M30 44c0-10 3-17 8-18 5 1 8 8 8 18z" fill="#FBF7F1"/><ellipse cx="35" cy="43.5" rx="4" ry="2.5" fill="#fff"/><ellipse cx="44" cy="43.5" rx="4" ry="2.5" fill="#fff"/></g>'
      + '<g class="p-head"><g class="d-ear l"><path d="M37.5 12 L31 -1 C34 -1 40 3 43 7z" fill="#2A2630"/><path d="M37 9.5 L33.5 2 C36 3 39 5 40.5 7.5z" fill="#E9A9A0"/><path d="M31 -1 l-1.6 2.4 M31.5 3 l-2 1.6 M33 6.5 l-2 1.2" stroke="#2A2630" stroke-width="1.3" stroke-linecap="round"/></g>'
      + '<g class="d-ear r"><path d="M55.5 12 L62 -1 C59 -1 53 3 50 7z" fill="#2A2630"/><path d="M56 9.5 L59.5 2 C57 3 54 5 52.5 7.5z" fill="#E9A9A0"/><path d="M62 -1 l1.6 2.4 M61.5 3 l2 1.6 M60 6.5 l2 1.2" stroke="#2A2630" stroke-width="1.3" stroke-linecap="round"/></g>'
      + '<ellipse cx="46.5" cy="16.5" rx="12.5" ry="10.5" fill="#2A2630"/><path d="M46.5 6.5 v5" stroke="#4A4550" stroke-width="1" stroke-linecap="round"/>'
      + '<path d="M37 20 C38 26 42 28.5 46.5 28.5 C51 28.5 55 26 56 20 C53 17.5 50 17 46.5 17.5 C43 17 40 17.5 37 20z" fill="#FBF7F1"/><path d="M44.5 17.5 L46.5 11.5 L48.5 17.5z" fill="#FBF7F1"/>'
      + '<ellipse cx="41.3" cy="11.8" rx="2" ry="1.2" fill="#C98A4B" transform="rotate(-15 41.3 11.8)"/><ellipse cx="51.7" cy="11.8" rx="2" ry="1.2" fill="#C98A4B" transform="rotate(15 51.7 11.8)"/>'
      + '<g class="p-eyes"><circle cx="41.8" cy="15.6" r="2.3" fill="#120F14"/><circle cx="51.2" cy="15.6" r="2.3" fill="#120F14"/><circle cx="42.5" cy="14.8" r=".8" fill="#fff"/><circle cx="51.9" cy="14.8" r=".8" fill="#fff"/></g><g class="p-happy"><path d="M39.6 16.2q2.2-2.8 4.4 0M49 16.2q2.2-2.8 4.4 0" fill="none" stroke="#120F14" stroke-width="1.4" stroke-linecap="round"/></g>'
      + '<path class="d-tongue" d="M44.8 23.2 h3.4 v3.2 a1.7 1.7 0 0 1 -3.4 0z" fill="#F08AA4"/><path d="M46.5 23.4 v2.2" stroke="#D9657F" stroke-width=".6"/>'
      + '<ellipse cx="46.5" cy="20.2" rx="2.3" ry="1.6" fill="#120F14"/><path d="M42.6 22.2q1.9 1.6 3.9.4q2 1.2 3.9-.4" fill="none" stroke="#120F14" stroke-width=".9" stroke-linecap="round"/></g>'
      + '</svg></div>';   /* 2026-11-17 팀장 "우리집 강아지 이가" — 장모 치와와(검정 등·눈썹 황갈색·흰 주둥이·가슴, 큰 털귀, 혀 빼꼼). 사진 보고 새로 그림 */
    else if (PET === "hamster") wrap.innerHTML = '<div class="pet sit ham"><svg viewBox="0 0 64 48" width="52" height="39">'
      + '<g class="p-walk"><g class="p-legs"><g class="lg a"><ellipse cx="19" cy="41.5" rx="3.4" ry="2.4" fill="#F6A9B4"/></g><g class="lg b"><ellipse cx="25" cy="42" rx="3.4" ry="2.4" fill="#F6A9B4"/></g><g class="lg b"><ellipse cx="36" cy="42" rx="3.4" ry="2.4" fill="#F6A9B4"/></g><g class="lg a"><ellipse cx="42" cy="41.5" rx="3.4" ry="2.4" fill="#F6A9B4"/></g></g>'
      + '<circle class="p-tail" cx="11.5" cy="33" r="2.6" fill="#D98E3E"/><ellipse cx="30" cy="32" rx="19.5" ry="10.5" fill="#EFAE5F"/><ellipse cx="33" cy="37.5" rx="13" ry="4.2" fill="#FFF9F0"/><path d="M18 25c5-3 13-3.5 18-1" fill="none" stroke="#D98E3E" stroke-width="2.2" stroke-linecap="round" opacity=".7"/></g>'
      + '<g class="p-sit"><circle class="p-tail" cx="15" cy="40" r="2.6" fill="#D98E3E"/><path d="M15 44c0-15 7-22 16-22s16 7 16 22z" fill="#EFAE5F"/><path d="M28 44c0-10 4-16 9-16s9 6 9 16z" fill="#FFF9F0"/><ellipse cx="35" cy="43.6" rx="3.6" ry="2.3" fill="#F6A9B4"/><ellipse cx="43" cy="43.6" rx="3.6" ry="2.3" fill="#F6A9B4"/><ellipse cx="38" cy="31" rx="2.6" ry="2" fill="#F6A9B4"/><ellipse cx="43.5" cy="31" rx="2.6" ry="2" fill="#F6A9B4"/></g>'
      + '<g class="p-head"><circle cx="37.5" cy="8.5" r="4.6" fill="#EFAE5F"/><circle cx="37.5" cy="8.5" r="2.6" fill="#F6A9B4"/><circle cx="55.5" cy="8.5" r="4.6" fill="#EFAE5F"/><circle cx="55.5" cy="8.5" r="2.6" fill="#F6A9B4"/>'
      + '<ellipse cx="46.5" cy="18" rx="12.8" ry="11" fill="#EFAE5F"/><path d="M34.5 21c1 5.5 6 8.5 12 8.5s11-3 12-8.5c-3-2.8-7.5-4-12-4s-9 1.2-12 4z" fill="#FFF9F0"/><path d="M46.5 8v6" stroke="#FFF9F0" stroke-width="2.6" stroke-linecap="round"/>'
      + '<g class="p-eyes"><circle cx="41.6" cy="16.8" r="2.2" fill="#1E1714"/><circle cx="51.4" cy="16.8" r="2.2" fill="#1E1714"/><circle cx="42.3" cy="16" r=".75" fill="#fff"/><circle cx="52.1" cy="16" r=".75" fill="#fff"/></g><g class="p-happy"><path d="M39.4 17.2q2.2-2.8 4.4 0M49.2 17.2q2.2-2.8 4.4 0" fill="none" stroke="#1E1714" stroke-width="1.3" stroke-linecap="round"/></g>'
      + '<ellipse cx="38" cy="22.5" rx="3" ry="1.9" fill="#FF9BAA" opacity=".75"/><ellipse cx="55" cy="22.5" rx="3" ry="1.9" fill="#FF9BAA" opacity=".75"/><ellipse cx="46.5" cy="20.6" rx="1.5" ry="1.1" fill="#E7798C"/><path d="M44.6 22.6q1 1.1 1.9 0q.9 1.1 1.9 0" fill="none" stroke="#6B4A3A" stroke-width=".9" stroke-linecap="round"/><path d="M45.4 23.4h2.2v1.8h-2.2z" fill="#fff" stroke="#E3D7CC" stroke-width=".4"/></g>'
      + '</svg></div>';   /* 2026-11-19 팀장 "채와와는 와와햄으로" — 새로 그린 골든 햄스터(동그란 몸·흰 볼·분홍 발·앞니), 고양이와 같은 걷기·앉기 */
    else wrap.innerHTML = '<div class="pet sit"><svg viewBox="0 0 64 48" width="52" height="39">'
      + '<g class="p-walk"><path class="p-tail" d="M12 30 C4 28 3 18 8 14" fill="none" stroke="#F3D9B8" stroke-width="4.5" stroke-linecap="round"/>'
      + '<g class="p-legs"><g class="lg a"><path d="M16 30c-.6 4-.4 7 .3 10.5h4.4c.7-3.5.9-6.5.3-10.5z" fill="#EBCBA4"/><ellipse cx="19.2" cy="42.3" rx="3.3" ry="2.3" fill="#fff"/></g><g class="lg b"><path d="M22 30c-.6 4-.4 7 .3 10.5h4.4c.7-3.5.9-6.5.3-10.5z" fill="#FFF3E2"/><ellipse cx="25.2" cy="42.3" rx="3.3" ry="2.3" fill="#fff"/></g><g class="lg b"><path d="M36 30c-.6 4-.4 7 .3 10.5h4.4c.7-3.5.9-6.5.3-10.5z" fill="#EBCBA4"/><ellipse cx="39.2" cy="42.3" rx="3.3" ry="2.3" fill="#fff"/></g><g class="lg a"><path d="M42 30c-.6 4-.4 7 .3 10.5h4.4c.7-3.5.9-6.5.3-10.5z" fill="#FFF3E2"/><ellipse cx="45.2" cy="42.3" rx="3.3" ry="2.3" fill="#fff"/></g></g>'
      + '<ellipse cx="30" cy="30" rx="18" ry="9.5" fill="#FFF3E2"/><path d="M20 22.5c5-2.5 13-2.5 18 0" fill="none" stroke="#F3D9B8" stroke-width="3" stroke-linecap="round"/></g>'
      + '<g class="p-sit"><path class="p-tail" d="M16 42 C6 42 4 34 9 30" fill="none" stroke="#F3D9B8" stroke-width="4.5" stroke-linecap="round"/><path d="M16 44c0-14 6-21 15-21s15 7 15 21z" fill="#FFF3E2"/><ellipse cx="36" cy="43.5" rx="4" ry="2.5" fill="#fff"/><ellipse cx="45" cy="43.5" rx="4" ry="2.5" fill="#fff"/></g>'
      + '<g class="p-head"><path d="M35 11l2-9 7 5z" fill="#FFF3E2"/><path d="M50 7l7-5 1 9z" fill="#FFF3E2"/><path d="M37.5 8.5l1-4 3.2 2.3z" fill="#F7B6C6"/><path d="M52.5 6.8l3.2-2.3.5 4z" fill="#F7B6C6"/>'
      + '<ellipse cx="46.5" cy="17" rx="12.5" ry="10.5" fill="#FFF3E2"/><path d="M40 7.5c2 2 4 2.5 6.500 2.500" fill="none" stroke="#F3D9B8" stroke-width="2.4" stroke-linecap="round"/>'
      + '<g class="p-eyes"><ellipse cx="42" cy="16.500" rx="1.7" ry="2.2" fill="#3A2E2E"/><ellipse cx="51.500" cy="16.500" rx="1.7" ry="2.2" fill="#3A2E2E"/></g><g class="p-happy"><path d="M40 17.4q2-2.6 4 0M49.5 17.4q2-2.6 4 0" fill="none" stroke="#3A2E2E" stroke-width="1.3" stroke-linecap="round"/></g>'
      + '<ellipse cx="38.800" cy="20.500" rx="2.4" ry="1.500" fill="#F9B9C8" opacity=".8"/><ellipse cx="54.800" cy="20.500" rx="2.4" ry="1.500" fill="#F9B9C8" opacity=".8"/>'
      + '<path d="M46 19.300l.9 1 .9-1z" fill="#E98AA2"/><path d="M44.800 21.600q1.050 1.100 2.100 0q1.050 1.100 2.100 0" fill="none" stroke="#3A2E2E" stroke-width=".9" stroke-linecap="round"/>'
      + '<path d="M40.500 26.200l-4-2.200v4.400zM42.500 26.200l4-2.200v4.400z" fill="#D6204F"/><circle cx="41.500" cy="26.200" r="1.500" fill="#B8173F"/></g>'
      + '</svg></div>';
    if (PCOL[PVAR]) PCOL[PVAR].forEach(function (c) { wrap.innerHTML = wrap.innerHTML.split(c[0]).join(c[1]); });
    if (PET === "bunny" && THM === "pinkcheck") wrap.innerHTML = wrap.innerHTML   /* 2026-11-18 이다혜님 — 돌아다니는 토끼를 홈 마스코트 '보니' 색으로(흰 털·갈색 선·노란 헤어밴드) */
      .replace(/#B8325A/gi, "#7A4636").replace(/#FFE8EE/gi, "#FFFFFF").replace(/#D6204F/gi, "#FFD54A").replace(/#F7A9BC/gi, "#FFC2D6").replace(/#4A2030/gi, "#4A2A20");
    document.body.appendChild(wrap);
    var pet = wrap.firstChild, x = 16, dir = 1, tm = 0, W = PET === "bunny" ? 48 : 52, HOP = PET === "bunny", FLIP = true;
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function place(ms) { pet.style.transitionDuration = ms + "ms"; pet.style.transform = "translateX(" + x + "px) scaleX(" + (FLIP ? dir : 1) + ")"; }
    place(0);
    function next() {
      if (still || document.hidden) { tm = setTimeout(next, 4000); return; }
      var max = Math.max(20, wrap.clientWidth - W - 8), to = 8 + Math.random() * (max - 8);
      if (Math.abs(to - x) < 60) to = x < max / 2 ? max - Math.random() * 30 : 8 + Math.random() * 30;
      dir = to > x ? 1 : -1; place(0);
      if (HOP) {   /* 토끼는 미끄러지듯 걷지 않고 한 번에 한 칸씩 폴짝폴짝(뜀 420ms + 착지 110ms) */
        var n = Math.max(2, Math.round(Math.abs(to - x) / 46)), step = (to - x) / n;
        pet.classList.remove("sit");
        (function hop() {
          if (n-- <= 0) { pet.classList.add("sit"); tm = setTimeout(next, 3000 + Math.random() * 5500); return; }
          x += step; pet.classList.remove("jump"); void pet.offsetWidth; pet.classList.add("jump"); place(420);
          tm = setTimeout(function () { pet.classList.remove("jump"); tm = setTimeout(hop, 110); }, 420);
        })();
        return;
      }
      var ms = Math.abs(to - x) * 26; x = to;
      pet.classList.remove("sit"); pet.classList.add("walk");
      requestAnimationFrame(function () { requestAnimationFrame(function () { place(ms); }); });
      tm = setTimeout(function () { pet.classList.remove("walk"); pet.classList.add("sit"); tm = setTimeout(next, 3500 + Math.random() * 6000); }, ms + 80);
    }
    /* 2026-11-17 장동욱 "만지면 좋아하거나 밥을 먹는다던지" — 동물을 누르면 멈춰서 반응: 쓰담쓰담(하트·웃는 눈) → 밥 먹기(당근·생선 냠냠) → 한마디(말풍선) 순서로 돌아가며.
       반응 그림(.petfx)은 화면 위 따로 떠 있는 칸이라 본문엔 영향 없음, 동물 몸만 눌림(.pet pointer-events auto) */
    var tapN = 0, busy = 0;
    var FOOD = PET === "bunny"
      ? '<svg viewBox="0 0 40 40" width="26" height="26"><path d="M14 13c-3-6-1-10 2-11 1 3 0 6-1 8M17 12c0-6 4-9 7-8-1 3-3 6-5 8M18 13c3-4 8-5 10-3-2 2-6 4-9 4" fill="#5DBB63" stroke="#3E8E45" stroke-width="1.2" stroke-linejoin="round"/><path d="M13 14c4-4 10-3 11 2L12 37c-2 2-5 0-4-3z" fill="#FF8A3D" stroke="#D9601E" stroke-width="1.6" stroke-linejoin="round"/><path d="M13 21l4 1M11 27l4 1M10 32l3 .8" stroke="#D9601E" stroke-width="1.4" stroke-linecap="round"/></svg>'
      : '<svg viewBox="0 0 44 30" width="30" height="20"><path d="M6 15c6-10 22-12 30 0-8 12-24 10-30 0z" fill="#8EC5E8" stroke="#4E8DB8" stroke-width="1.6"/><path d="M36 15l7-7v14z" fill="#8EC5E8" stroke="#4E8DB8" stroke-width="1.6" stroke-linejoin="round"/><circle cx="13" cy="13" r="1.8" fill="#24324A"/><path d="M20 9c2 4 2 8 0 12M25 9c2 4 2 8 0 12" fill="none" stroke="#4E8DB8" stroke-width="1.2" stroke-linecap="round"/></svg>';
    var PN = M.pet_name || PNAME[PVAR] || "멍멍이";
    /* 누르면 나오는 감성 글귀 (2026-11-19 팀장 "오늘 하루 고생했다, 진짜 F감성으로 보면 울 수 있게") — 같은 글귀가 연달아 안 나오게 */
    var PQ = ["오늘도 여기까지 온 것만으로\n충분히 잘했어요.", "아무도 몰라줘도 괜찮아요.\n오늘 버틴 거, 제가 다 봤어요.", "힘들었죠?\n오늘은 스스로를 꼭 안아 주세요.",
      "땀 흘린 만큼\n마음도 조금은 가벼워졌길 바라요.", "완벽하지 않아도 돼요.\n포기하지 않은 오늘이 이미 대단해요.", "남들보다 느려도 괜찮아요.\n당신의 속도가 정답이에요.",
      "지친 날에도 운동하러 온 당신,\n그게 진짜 용기예요.", "거울 속 나에게 오늘은\n'수고했어'라고 말해 줘요.", "작은 하루들이 모여서\n결국 당신을 바꿀 거예요.",
      "쉬어도 괜찮아요.\n멈춘 게 아니라 숨 고르는 중이니까요.", "오늘 흘린 땀은\n내일의 당신이 고마워할 거예요.", "당신은 생각보다\n훨씬 강한 사람이에요.",
      "기대도 돼요.\n오늘은 제가 옆에 있을게요.", "하기 싫은 날 해낸 한 세트가\n제일 멋있어요.", "오늘 못 한 건 내일 하면 돼요.\n오늘 한 건 이미 당신 거예요.",
      "수고했어요.\n정말, 진심으로.", "힘든 하루 끝에\n여기 와 줘서 고마워요.", "당신이 당신을\n포기하지 않아서 다행이에요.",
      "오늘의 당신도\n어제보다 한 뼘 자랐어요.", "울고 싶은 날엔 울어도 돼요.\n그래도 당신은 여전히 멋져요.", "따뜻한 물 한 잔 마시고,\n오늘은 푹 자요.",
      "잘하고 있어요.\n정말로, 잘하고 있어요.", "세상이 몰라줘도\n당신의 노력은 몸이 기억해요.", "오늘 하루도 당신답게\n버텨 줘서 고마워요.",
      "조금 느려도, 조금 서툴러도\n계속 가는 당신이 좋아요.", "마음이 지칠 땐 숨을 크게 한 번.\n괜찮아요, 다 지나가요.", "나를 위해 시간을 쓴 오늘,\n그게 나를 사랑하는 방법이에요.",
      "내일 아침 눈 떴을 때\n오늘의 나에게 고마울 거예요.", "당신의 하루는 생각보다\n더 빛났다는 걸 알았으면 해요.", "버티는 것도 실력이에요.\n오늘 당신은 만점이에요.",
      "이만큼 해낸 당신,\n오늘은 맛있는 거 먹어도 돼요.", "힘들다고 말해도 괜찮아요.\n그만큼 열심히 했다는 거니까.", "오늘 하루 고생 많았어요.\n이제 마음 내려놓고 쉬어요.",
      "당신이 웃으면 저도 좋아요.\n오늘 한 번은 꼭 웃어요.", "처음보다 훨씬 단단해졌어요.\n스스로 느껴지나요?", "누가 뭐래도 당신은\n매일 조금씩 나아지고 있어요.",
      "오늘도 와 줘서,\n그리고 포기하지 않아서 고마워요.", "지금 이 순간도 당신은\n충분히 잘하고 있어요.", "괜찮은 척 안 해도 돼요.\n여기선 그냥 당신이면 돼요.",
      "오늘 하루가 무거웠다면\n그 무게를 견딘 당신이 대단한 거예요."], PQL = -1;
    function quote() {
      var old = document.querySelector(".petq"); if (old) old.remove();
      var n; do { n = Math.floor(Math.random() * PQ.length); } while (n === PQL && PQ.length > 1); PQL = n;
      var q = document.createElement("div"); q.className = "petq"; q.setAttribute("role", "status");
      var lc = PN.charCodeAt(PN.length - 1) - 0xAC00, ga = lc >= 0 && lc < 11172 && lc % 28 ? "이" : "가";
      /* 2026-11-19 팀장 "각자 이름 불러 줘 — 수업 때처럼 이름 옆에 님": data.js call(부르는 이름) 또는 이름에서 성 뺀 것(2~4글자 한글 이름) + 님. 그룹 PT(이름에 ·)는 안 부름 */
      var nm = String(M.call || M.name || "").trim(), call = M.call ? nm : /·/.test(nm) ? "" : /^[가-힣]{3,4}$/.test(nm) ? nm.slice(1) : nm;
      q.innerHTML = '<small>' + esc(PN) + ga + ' 전하는 말</small><p>' + (call ? '<b class="pqn">' + esc(call) + '님,</b><br>' : '') + esc(PQ[n]).replace(/\n/g, "<br>") + '</p>';
      document.body.appendChild(q);
      function bye() { q.classList.add("out"); setTimeout(function () { q.remove(); }, 400); }
      q.addEventListener("click", bye); setTimeout(bye, 6500);
    }
    if (PET === "dog") FOOD = '<svg viewBox="0 0 44 24" width="30" height="16"><path d="M10 9h24M10 15h24" stroke="#C9A98A" stroke-width="1"/><path d="M8 7a4 4 0 1 1 3-6 4 4 0 1 1 3 6h16a4 4 0 1 1 3-6 4 4 0 1 1 3 6v10a4 4 0 1 1-3 6 4 4 0 1 1-3-6H14a4 4 0 1 1-3 6 4 4 0 1 1-3-6z" fill="#FFF6EA" stroke="#B88A60" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    var LINES = PET === "dog" ? ["왈! 오늘도 운동 가자멍!", PN + "가 응원한다멍!", "물 마셨멍?", "산책… 아니 운동 가자!", "최고다멍 ♡", "스트레칭도 하자멍"] : PET === "bunny" ? ["오늘도 운동 가자!", "깡충! 같이 뛰자!", "물 많이 마셔요!", "스트레칭 잊지 마요!", "최고예요! ♡", "근육아 자라라~"]
      : ["냥~ 오늘도 화이팅!", "쓰담쓰담 좋아냥", "물 마셨냥?", "운동 끝나면 꿀잠냥", "멋지다냥 ♡", "스트레칭도 하자냥"];
    function fx(cls, html, dx, dy, ms) {
      var r = pet.getBoundingClientRect(), e = document.createElement("div");
      e.className = "petfx " + cls; e.innerHTML = html;
      e.style.left = (r.left + r.width / 2 + (dx || 0)) + "px"; e.style.top = (r.top + (dy || 0)) + "px";
      document.body.appendChild(e); setTimeout(function () { e.remove(); }, ms || 1600); return e;
    }
    function bubble(t, ms) { fx("pbub", esc(t), 0, -12, ms || 1900); }
    function hearts(n) { for (var i = 0; i < n; i++) (function (i) { setTimeout(function () { fx("pheart", "♥", [-W / 2 - 4, W / 2 + 4, -W / 2 + 6][i % 3], 18 + (i % 3) * 4, 1300); }, i * 140); })(i); }
    function freeze() {
      clearTimeout(tm);
      try { var mt = new DOMMatrix(getComputedStyle(pet).transform); x = mt.m41; } catch (e) {}
      pet.classList.remove("walk", "jump"); pet.classList.add("sit"); place(0);
    }
    function react() {
      if (busy) { hearts(1); return; }
      busy = 1; freeze();
      var kind = tapN++ % 2, end = 1800;
      quote();
      if (kind === 0) {   /* 쓰담쓰담 → 웃는 눈 + 하트 */
        pet.classList.add("happy", "pat"); hearts(3);
      } else if (kind === 9) {   /* 밥 먹기 (2026-11-19 글귀로 바꾸면서 안 씀) */
        end = 2600; pet.classList.add("eat");
        var f = fx("pfood", FOOD, (FLIP ? dir : 1) * 24, 20, 2400);
        bubble(PET === "dog" ? "뼈다귀 냠냠!" : PET === "bunny" ? "당근 냠냠!" : "생선 냠냠!", 2300);
        setTimeout(function () { f.classList.add("bite1"); }, 700); setTimeout(function () { f.classList.add("bite2"); }, 1300); setTimeout(function () { f.classList.add("gone"); }, 1900);
        setTimeout(function () { pet.classList.add("happy"); hearts(2); }, 2000);
      } else {   /* 한마디 → 폴짝 */
        pet.classList.add("hi", "happy"); hearts(2);
      }
      try { navigator.vibrate && navigator.vibrate(12); } catch (e) {}
      setTimeout(function () { pet.classList.remove("happy", "pat", "eat", "hi"); busy = 0; tm = setTimeout(next, 1500 + Math.random() * 2500); }, end);
    }
    pet.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); react(); });
    wrap.removeAttribute("aria-hidden"); pet.setAttribute("role", "button"); pet.setAttribute("aria-label", PN + " — 누르면 오늘의 한마디");
    tm = setTimeout(next, 2500);
    window.addEventListener("resize", function () { var max = Math.max(20, wrap.clientWidth - W - 8); if (x > max) { x = max; place(0); } });
  })();
  function skinDeco() {   /* 토롱이 그림을 정해진 칸에 하나씩 (이미 있으면 그대로) — 누르기·글자에는 영향 없음(pointer-events none) */
    if (!SKIN) return;
    var T = BASE + "theme/" + SKIN + "/";
    function put(sel, cls, file) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        var f = typeof file === "function" ? file(el) : file, old = el.querySelector(":scope > .bny");
        if (old && old.getAttribute("data-f") === f) return;
        if (old) old.remove();
        var im = document.createElement("img"); im.className = "bny " + cls; im.src = T + f; im.alt = ""; im.setAttribute("aria-hidden", "true"); im.setAttribute("data-f", f);
        el.appendChild(im);
      });
    }
    put(".stamp", "bny-stamp", function (el) { return el.classList.contains("on") ? "cheer.svg" : "stamp.svg"; });
    put(".thero", "bny-lift", "lift.svg");
    put(".tabs", "bny-peek", "peek.svg");
    put(".hero", "bny-hero", "base.svg");
  }
  if (SKIN) {
    var skinT = 0;
    new MutationObserver(function () { if (!skinT) skinT = requestAnimationFrame(function () { skinT = 0; skinDeco(); }); })
      .observe(document.documentElement, { childList: true, subtree: true });
  }

  var DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var DAY_KO = { mon: "월", tue: "화", wed: "수", thu: "목", fri: "금", sat: "토", sun: "일" };
  var KO_KEY = { "월": "mon", "화": "tue", "수": "wed", "목": "thu", "금": "fri", "토": "sat", "일": "sun" };
  /* "기억해요!" 문구 — 루틴일지 꼬리말(build_log.js FOOTER_MSGS) 23개와 똑같이 (2026-11-04 트레이너 요청)
     + PT 노트에만 있던 복습지용 3개(맨 아래) */
  var QUOTES = [
    "PT는 1시간, 변화는 나머지 시간에 만들어져요",
    "수업은 방향을, 개인운동은 결과를 만듭니다",
    "혼자 하는 1세트가 몸을 바꿉니다",
    "오늘 채운 한 줄이 다음 달 몸이 됩니다",
    "트레이너는 길을 알려주고, 걷는 건 회원님입니다",
    "꾸준함은 재능을 이깁니다. 오늘도 일지대로!",
    "결과는 수업 날이 아니라, 혼자 운동한 날 쌓여요",
    "주 2회 수업 + 개인운동 = 진짜 변화",
    "수업 없는 날도 회원님의 몸은 기다리고 있어요",
    "혼자 하는 운동까지가 PT입니다",
    "일지대로 한 하루하루가 모여 결과가 됩니다",
    "주에 두 번으론 택도 없다!",
    "헬스장이 무섭나요? 회원님의 몸 상태가 무섭나요?",
    "지난달이랑 똑같은 몸, 괜찮으세요?",
    "핑계는 근육이 안 붙어요",
    "일주일은 168시간, PT는 그중 2시간입니다",
    "잔소리 들을 바에 나와라!",
    "회원님의 최고의 동기부여는 회원님의 미래의 모습입니다",
    "변화를 원한다면 변화의 과정을 두려워하지 마세요",
    "체중계 숫자보다 거울 속 모습을 믿으세요",
    "굶는 다이어트는 끝나고, 습관은 남습니다",
    "주사는 살을 빼주지만, 습관은 만들어주지 않아요",
    "체중은 약으로 줄여도, 근육은 운동으로만 붙어요",
    // PT 노트 전용 (복습지)
    "무게보다 자세가 먼저예요",
    "복습한 자세만 내 것이 됩니다",
    "꾸준함은 재능을 이깁니다. 오늘도 복습한 대로!"
  ];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var CHECK = '<span class="ic ok"><svg aria-hidden="true"><use href="#i-check"/></svg></span>';
  var XIC = '<span class="ic no"><svg aria-hidden="true"><use href="#i-x"/></svg></span>';
  var view = document.getElementById("view");
  /* 아래 탭 (회원 페이지 공통 — 여기서 그림) */
  /* 2026-11-11 앱 화면(시안 A "라이트 네이티브"): 아래 탭 5개 — 목표·몸변화·공지는 '나' 탭(위 칸 전환)과 오른쪽 위 종으로 */
  var TABS = [
    ["home", "홈", '<path d="M3.5 10.5 12 4l8.5 6.5V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z" stroke-linejoin="round"/>'],
    ["routine", "운동", '<path d="M6.5 8v8M17.5 8v8M3.5 10v4M20.5 10v4M6.5 12h11" stroke-linecap="round"/>'],
    ["diet", "식단", '<circle cx="13" cy="13" r="6.5"/><path d="M4 4v6M6.5 4v6M4 7h2.5M5.2 10v10" stroke-linecap="round"/>'],
    ["log", "기록", '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 3.5h6v3H9z" stroke-linejoin="round"/><path d="m9 13 2 2 4-4.5" stroke-linecap="round" stroke-linejoin="round"/>'],
    ["me", "나", '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6" stroke-linecap="round"/>', "goal"]
  ];
  /* 2026-11-14 장동욱 "루틴이랑 복습지 합치고, 기록 탭" — 운동(루틴 | 자세 복습지 전환칸) · 기록(오늘 한 운동·첫날 vs 오늘·근육 지도·인바디) */
  function tabOf(t) { return t === "forms" || t === "exlib" ? "routine" : /^(body|log)$/.test(t) ? "log" : /^(goal|notice)$/.test(t) ? "me" : t; }
  /* 2026-11-06 몸변화 탭 (인바디) — 그룹 PT 페이지(이름에 ·)·inbody:false 회원은 탭 없음 */
  if (/·/.test(M.name || "") || M.inbody === false) TABS = TABS.filter(function (t) { return t[0] !== "body"; });
  var COACH_MODE = false;
  /* PT 안내서 "실제로 보기"로 들어왔으면 (2026-11-06, 상담 손님에게 선생님 폰으로 보여주는 중):
     이름은 가운데 글자를 O로 가리고, 위 막대에 "← PT 안내서" 버튼. 새 공지 팝업은 안 띄움 */
  var DEMO = null;
  try { DEMO = sessionStorage.getItem("ptdemo"); } catch (e) {}
  if (DEMO && !/^\/coach-[a-z0-9]+\/(guide|intro)\.html#p\d+$/.test(DEMO)) DEMO = null;
  /* 소개 슬라이드 링크(주소 끝 ?demo)로 열어도 이름을 가림 — 돌아가기 버튼은 없음 */
  var DEMO_BACK = DEMO;
  if (!DEMO && /[?&]demo\b/.test(location.search)) DEMO = "link";
  if (DEMO) {
    var REAL = String(M.name || "").split("·").map(function (p) { return p.trim(); }).filter(function (p) { return p.length > 1; });
    var maskName = function (p) { return p.length === 2 ? p.charAt(0) + "O" : p.charAt(0) + new Array(p.length - 1).join("O") + p.charAt(p.length - 1); };
    var hideReal = function (t) { REAL.forEach(function (n) { t = t.split(n).join(maskName(n)); }); return t; };
    M._real = M.name;
    M.name = hideReal(M.name);
    if (M.diet && typeof M.diet === "object" && M.diet.member) M.diet.member = hideReal(M.diet.member);
    document.title = hideReal(document.title);
    var barName = document.querySelector(".bar-in span");
    if (barName) barName.textContent = hideReal(barName.textContent);
    /* 공지 제목 같은 데 섞인 이름도 화면에 그려질 때마다 가림 */
    var viewEl = document.getElementById("view");
    if (viewEl && window.MutationObserver) {
      var scrub = function () {
        var w = document.createTreeWalker(viewEl, NodeFilter.SHOW_TEXT, null), n;
        while ((n = w.nextNode())) { var t = hideReal(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; }
      };
      new MutationObserver(scrub).observe(viewEl, { childList: true, subtree: true, characterData: true });
    }
  }
  /* 선생님 페이지에서 들어왔으면 위 막대에 "← 회원 목록" 버튼 (선생님 휴대폰에만 보임) */
  try {
    var coachPath = sessionStorage.getItem("ptcoach") || localStorage.getItem("ptcoach");
    if (coachPath) COACH_MODE = true;
    var barIn = document.querySelector(".bar-in");
    if (DEMO_BACK && barIn) {
      var gb = document.createElement("a");
      gb.href = DEMO_BACK; gb.className = "coachback"; gb.textContent = "← PT 안내서";
      barIn.insertBefore(gb, barIn.children[1] || null);
    } else if (coachPath && barIn && /^\/coach-[a-z0-9]+\/$/.test(coachPath) && window.self === window.top) {   /* 아이패드 선생님 페이지 오른쪽 칸(iframe) 안에선 안 붙임 */
      var cb = document.createElement("a");
      cb.href = coachPath; cb.className = "coachback"; cb.textContent = "← 회원 목록";
      cb.addEventListener("click", function () { try { sessionStorage.setItem("vtdir", "back"); } catch (e) {} });
      barIn.insertBefore(cb, barIn.children[1] || null);
    }
  } catch (e) {}
  var tabsIn = document.querySelector(".tabs-in");
  if (tabsIn) {
    tabsIn.innerHTML = TABS.map(function (t) {
      return '<a href="#' + (t[3] || t[0]) + '" data-tab="' + t[0] + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + t[2] + '</svg>' + t[1] + '</a>';
    }).join("");
    tabsIn.style.gridTemplateColumns = "repeat(" + TABS.length + ", 1fr)";
  }
  (function () {   /* 위 막대 오른쪽: 공지 종(새 공지면 빨간 점) + 내 이름 동그라미(→ 나 탭) */
    var bi = document.querySelector(".bar-in");
    if (!bi || bi.querySelector(".bar-r")) return;
    var nm = String(M.name || "").split("·")[0].trim(), ini = /·/.test(M.name || "") ? "함께" : (nm.length >= 3 ? nm.slice(1) : nm);
    var r = document.createElement("div"); r.className = "bar-r";
    r.innerHTML = '<a class="bell" href="#notice" aria-label="선생님 공지"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 6.5 2.5 8.5 2.5 8.5h-17S6 15.5 6 9"/><path d="M10 21h4"/></svg></a>' +
      '<button type="button" class="gear" id="gearBtn" aria-label="설정" aria-haspopup="menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button>' +
      '<a class="ava" href="#goal" aria-label="나의 목표 · 출석">' + esc(ini) + '</a>';
    bi.appendChild(r);
  })();
  function wkSeg(cur) {   /* 2026-11-14 '운동' 탭 위 전환 칸: 루틴 / 자세 복습지 */
    var nNew = (M.forms || []).filter(function (f) { return formNew(f); }).length;
    return '<nav class="meseg wkseg" aria-label="운동">' +
      '<a href="#routine"' + (cur === "routine" ? ' aria-current="page"' : '') + '>루틴</a>' +
      '<a href="#forms"' + (cur === "forms" ? ' aria-current="page"' : '') + '>자세 복습지' + (nNew ? ' <i class="wk-new">NEW</i>' : (M.forms || []).length ? ' <small>' + M.forms.length + '</small>' : '') + '</a>' +
      '<a href="#exlib"' + (cur === "exlib" ? ' aria-current="page"' : '') + '>운동 목록</a></nav>';
  }
  function meSeg(cur) {   /* '나' 탭 위 전환 칸: 목표·출석 / 몸변화 / 공지 */
    var L = [["goal", "목표 · 출석"], ["notice", "공지"]];   /* 몸변화는 2026-11-14 기록 탭으로 */
    return '<nav class="meseg" aria-label="나의 기록">' + L.map(function (x) {
      return '<a href="#' + x[0] + '"' + (x[0] === cur ? ' aria-current="page"' : '') + '>' + x[1] + '</a>';
    }).join("") + '</nav>';
  }


  /* 순환 루틴 (2026-11-04 OO님, 교대근무라 쉬는 요일이 매주 다름): routine.rotation = true
     → 요일 대신 DAY 1~N 순서대로. 주소 #routine-d1 … / 오늘 할 차례 = 순환 시작일부터 출석 체크한 날 수 ÷ N 의 나머지 */
  var ROT = !!(M.routine && M.routine.rotation);
  function rotDays() { return (M.routine && M.routine.days) || []; }
  function rotKeys() { return rotDays().map(function (_, i) { return "d" + (i + 1); }); }
  function isRotKey(k) { return ROT && /^d\d+$/.test(k) && !!rotDays()[+k.slice(1) - 1]; }
  function dayName(k) { return isRotKey(k) ? "DAY " + k.slice(1) : DAY_KO[k] + "요일"; }
  function turnKey() {
    var n = rotDays().length; if (!n) return "d1";
    var since = (M.routine.rotation_start || "2000-01-01"), today = ymd(new Date());
    var done = attLoad().filter(function (k) { return k >= since && k < today; }).length;
    return "d" + (done % n + 1);
  }
  function todayKey() { return ROT ? turnKey() : DAY_KEYS[new Date().getDay()]; }
  /* 이번 주 요일 옮기기 (2026-11-14 장동욱 "그날 못 나오면 상단 루틴 꾹 눌러서 옮기기 — A안, 쉬는 날 갑자기 나와도 넣을 수 있게")
     창고 저장소 mw:<주소>:mv = { w: 이번 주 월요일, m: { 요일: 가져온 요일 | "-"(이번 주 쉼) }, at } — 다음 주 월요일이면 저절로 원래대로 */
  var MV_LS = null, MV = null;
  function mvGet() { if (MV_LS === null) { MV_LS = "ptnote:" + SLUG + ":mv"; try { MV = JSON.parse(localStorage.getItem(MV_LS) || "null"); } catch (e) {} } return MV; }
  function wkMon(d) { d = d || new Date(); return ymd(new Date(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() + 6) % 7)); }
  function mvMap() { mvGet(); return (!ROT && MV && MV.w === wkMon() && MV.m) || {}; }
  function dayByKey(k) {
    var raw = dayByKeyRaw(k);
    if (ROT || RT_EDIT || isRotKey(k)) return raw;
    var src = mvMap()[k];
    if (!src) return raw;
    if (src === "-") return { day: DAY_KO[k], part: "이번 주 쉼", en: "", rest: true, mvSkip: 1 };
    var sd = dayByKeyRaw(src); if (!sd) return raw;
    var o = {}; for (var x in sd) o[x] = sd[x];
    o.day = DAY_KO[k]; o.mvFrom = src; return o;
  }
  function dayAt(dt) { var k = DAY_KEYS[dt.getDay()]; return wkMon(dt) === wkMon() ? dayByKey(k) : dayByKeyRaw(k); }
  function dayByKeyRaw(k) {
    if (isRotKey(k)) return rotDays()[+k.slice(1) - 1];
    var days = (M.routine && M.routine.days) || [];
    for (var i = 0; i < days.length; i++) if (KO_KEY[days[i].day] === k) return days[i];
    return null;
  }
  function findForm(id) {
    for (var i = 0; i < M.forms.length; i++) if (M.forms[i].id === id) return M.forms[i];
    return null;
  }
  /* 루틴 종목 → 자세 복습지 (2026-11-10): form을 정해 뒀으면 그것, 아니면 이름이 같은(띄어쓰기 무시) 가장 최근 복습지를 자동 연결.
     그래서 복습지를 새로 올리기만 해도 선생님이 폰에서 고친 루틴 카드에 "▶ 자세 복습지 보기"가 붙음. form:"-" = 연결 안 함 */
  function fnorm(s) { return String(s || "").replace(/[\s·()\-]/g, "").toLowerCase(); }
  function itemForm(it) {
    if (!it || it.form === "-") return null;
    var f = it.form && findForm(it.form);
    if (f) return f;
    var n = fnorm(it.name);
    for (var i = 0; n && i < (M.forms || []).length; i++) {   /* 복습지 also:[다른 이름] — 루틴 이름이 조금 달라도 연결 (예: 리버스 펙덱 플라이 ↔ 리버스 펙덱) */
      var fm = M.forms[i], nm = [fm.exercise].concat(fm.also || []);
      for (var j = 0; j < nm.length; j++) if (fnorm(nm[j]) === n) return fm;
    }
    return null;
  }
  function remember() {
    var q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    return '<div class="remember"><svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="17" fill="var(--primary)"/>' +
      '<rect x="7" y="13" width="4" height="8" rx="1.2" fill="#fff"/><rect x="23" y="13" width="4" height="8" rx="1.2" fill="#fff"/>' +
      '<rect x="11" y="15.5" width="12" height="3" rx="1" fill="#E8C766"/></svg><div><small>기억해요!</small><p>' + esc(q) + '</p></div></div>' +
      '<footer class="foot"><span>' + esc(BRN || "MY PT NOTE") + '</span><span>PERSONAL TRAINING</span></footer>';
  }
  function head(num, title, sub, more) {
    return '<div class="head">' + (num ? '<span class="num">' + num + '</span>' : '') + '<h2>' + esc(title) + '</h2>' +
      (sub ? '<p>' + esc(sub) + '</p>' : '') + (more || '') + '</div>';
  }
  function tagChip(tag) {
    if (!tag) return "";
    var cls = tag === "메인" ? "main" : tag === "워밍업" ? "warm" : tag === "선행" ? "pre" : "";
    return '<span class="tagc ' + cls + '">' + esc(tag) + '</span>';
  }


  /* ---------------- PT 여정 (12개월 3단계) */
  var STAGES = [
    { no: 1, from: 0, to: 2, name: "기초 다지기", short: "기초", range: "1~2개월",
      focus: ["머신 사용법", "스트레칭 습관", "내 근육 이해하기"],
      msg: "무게보다 정확한 사용법이 먼저예요. 모르는 건 다 물어보세요!" },
    { no: 2, from: 2, to: 7, name: "변화가 시작되는 시기", short: "변화", range: "2~7개월",
      focus: ["자신감 UP", "어느 순간 오는 몸의 변화", "머신 투어", "반복 숙달"],
      msg: "어느 순간 몸이 달라져요. 이 시기의 꾸준함이 결과를 만들어요." },
    { no: 3, from: 7, to: 12, name: "혼자서도 하는 시기", short: "자립", range: "7~12개월",
      focus: ["혼자서 루틴 소화", "프리웨이트", "다음 목표 또는 졸업"],
      msg: "이제 혼자서도 할 수 있어요. 다음 목표를 함께 정해요." }
  ];
  /* 바디프로필 목표 회원 전용 여정 (data.js journey.mode: "bodyprofile", 2026-11-05 OO님부터)
     기초 0~2개월 → 근육 채우기(벌크) 2~8개월 → 컷팅·촬영 8~12개월(16주 컷팅) */
  var STAGES_BP = [
    { no: 1, from: 0, to: 2, name: "바프 몸의 뼈대 세우기", short: "기초", range: "1~2개월",
      focus: ["정확한 자세 · 머신 사용법", "바른 등 만들기", "식사 기록 습관"],
      msg: "바프는 기초가 탄탄해야 끝까지 가요. 지금은 무게보다 자세가 먼저!" },
    { no: 2, from: 2, to: 8, name: "근육 꽉 채우기", short: "벌크", range: "2~8개월",
      focus: ["매주 조금씩 증량", "등 · 하체 볼륨 UP", "단백질 꽉 채우기", "인바디 · 눈바디 체크"],
      msg: "이 시기에 쌓은 근육이 바프 사진의 선이 돼요. 잘 먹고 무겁게!" },
    { no: 3, from: 8, to: 12, name: "컷팅 · 바프 완성", short: "컷팅", range: "8~12개월",
      focus: ["16주 컷팅 식단", "유산소 늘리기", "포징 연습", "촬영 D-DAY"],
      msg: "근육은 지키고 지방만 걷어내요. 마지막 한 달이 사진을 바꿔요." }
  ];
  var BP = !!(M.journey && M.journey.mode === "bodyprofile");
  var JST = BP ? STAGES_BP : STAGES;
  /* 바프 촬영일 맞춤 (2026-11-09, OO님 — 4월 말 촬영처럼 12개월보다 짧은 바프):
     journey.fit: true + shoot 이 있으면 시작일 → 촬영일 길이(JT개월)로 그래프·단계를 맞춤.
     3단계 컷팅 = 촬영 전 16주(짧으면 줄임), 1단계 기초 = 전체의 18%(0.75~2개월), 사이가 2단계 근육 채우기.
     곡선 모양은 12개월 그래프를 단계별로 늘이고 줄여서(jWarp) 그대로 씀. */
  function jDate(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  var JT = 12, JFIT = null;
  if (BP && M.journey.fit && M.journey.start && M.journey.shoot) {
    var jst0 = jDate(M.journey.start), JTd = (jDate(M.journey.shoot) - jst0) / (86400000 * 30.44);
    if (JTd > 2) {
      JT = JTd;
      var jb = Math.max(0.75, Math.min(2, JT * 0.18)), jcw = Math.max(6, Math.min(16, Math.round((JT - jb - 0.75) * 4.35)));
      var jc = JT - jcw / 4.35;
      var jWhen = function (m) { var d = new Date(jst0.getTime() + m * 86400000 * 30.44), dd = d.getDate(); return (d.getMonth() + 1) + "월 " + (dd <= 10 ? "초" : dd <= 20 ? "중순" : "말"); };
      JFIT = { b: jb, c: jc, cw: jcw, when: jWhen, mon: function (m) { return (new Date(jst0.getTime() + m * 86400000 * 30.44).getMonth() + 1) + "월"; } };
      JST = STAGES_BP.map(function (s, i) {
        var f = [0, jb, jc][i], t = [jb, jc, JT][i], o = {};
        for (var k in s) o[k] = s[k];
        o.from = f; o.to = t; o.range = jWhen(f) + " ~ " + (i === 2 ? "촬영" : jWhen(t));
        if (i === 2) o.focus = s.focus.map(function (x) { return x.replace("16주", jcw + "주"); });
        return o;
      });
    }
  }
  var JTN = Math.round(JT);   /* 화면 문구용 "N개월" */
  function jWarp(m) {   /* 실제 개월 → 12개월 그래프 모양 위치 */
    if (!JFIT) return m;
    if (m <= JFIT.b) return m / JFIT.b * 2;
    if (m <= JFIT.c) return 2 + (m - JFIT.b) / (JFIT.c - JFIT.b) * 6;
    return 8 + (m - JFIT.c) / (JT - JFIT.c) * 4;
  }
  function journeyNow() {
    var J = M.journey;
    if (!J || !J.start) return null;
    var st = jDate(J.start);
    var el = (Date.now() - st.getTime()) / (86400000 * 30.44);
    var m = Math.max(0, Math.min(JT, el));
    var stage = m < JST[1].from ? JST[0] : m < JST[2].from ? JST[1] : JST[2];
    return { el: el, m: m, month: el < 0 ? 0 : Math.min(Math.ceil(JT), Math.floor(el) + 1), stage: stage, start: J.start };
  }
  function bpDday() {   /* 촬영일(journey.shoot)이 있으면 D-day */
    var s = M.journey && M.journey.shoot;
    if (!s) return null;
    var p = s.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]), t = new Date(); t.setHours(0, 0, 0, 0);
    return { n: Math.round((d - t) / 86400000), label: p[0] + ". " + (+p[1]) + ". " + (+p[2]) };
  }
  function ss(a, b, m) { var t = Math.max(0, Math.min(1, (m - a) / (b - a))); return t * t * (3 - 2 * t); }
  function bpMuscleU(m) { return 0.1 + 0.72 / (1 + Math.exp(-(m - 4) / 1.2)) - 0.03 * ss(8, 12, m); }
  function bpFatU(m) { return 0.5 + 0.08 * ss(0, 8, m) - 0.44 * ss(8, 11.6, m); }
  var bpGid = 0;
  function reduceMotion() { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
  function journeyChartBP(now) {
    var X = function (m) { return 26 + m * 300 / JT; }, Y = function (v) { return 168 - v * 124; };
    var bpMuscle = function (m) { return bpMuscleU(jWarp(m)); }, bpFat = function (m) { return bpFatU(jWarp(m)); };
    var bands = JST.map(function (s, i) {
      var cur = now && s === now.stage;
      return '<rect x="' + X(s.from) + '" y="34" width="' + (X(s.to) - X(s.from)) + '" height="134" fill="#fff" opacity="' + (cur ? 0.12 : 0.03 + i * 0.015) + '"/>' +
        (i ? '<line x1="' + X(s.from) + '" y1="34" x2="' + X(s.from) + '" y2="168" stroke="#fff" stroke-opacity=".14" stroke-dasharray="2 3"/>' : '') +
        '<text x="' + ((X(s.from) + X(s.to)) / 2) + '" y="26" text-anchor="middle" class="bp-st' + (cur ? ' cur' : '') + '">' + s.no + '단계 ' + s.short + '</text>';
    }).join("");
    var pts = function (f, a, b) {
      var out = [];
      for (var m = a; m <= b + 1e-9; m += JT / 120) out.push(X(m).toFixed(1) + "," + Y(f(m)).toFixed(1));
      return out.join(" ");
    };
    var cm = now ? now.m : 0;
    /* 움직이는 그라데이션 (2026-11-08): 근육 선에 금빛이 흐르고, 선 아래 금색 빛 + 반짝이는 띠가 지나감 */
    var gid = "bpg" + (++bpGid), still = reduceMotion();
    var anim = function (dist, dur) { return still ? "" : '<animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="' + dist + ' 0" dur="' + dur + 's" repeatCount="indefinite"/>'; };
    var defs = '<defs>' +
      '<linearGradient id="' + gid + 'l" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="120" y2="0" spreadMethod="reflect">' +
      '<stop offset="0" stop-color="#C9962E"/><stop offset=".5" stop-color="#FFF3C4"/><stop offset="1" stop-color="#E8C25A"/>' + anim(240, 2.6) + '</linearGradient>' +
      '<linearGradient id="' + gid + 'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8C25A" stop-opacity=".42"/><stop offset="1" stop-color="#E8C25A" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="' + gid + 's" gradientUnits="userSpaceOnUse" x1="-90" y1="0" x2="-10" y2="0">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#FFF3C4" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>' + anim(440, 3.4) + '</linearGradient>' +
      '<linearGradient id="' + gid + 'f" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="0" spreadMethod="reflect">' +
      '<stop offset="0" stop-color="var(--dot)"/><stop offset="1" stop-color="#F3E2B0"/>' + anim(200, 3.8) + '</linearGradient>' +
      '</defs>';
    /* 체지방(분홍 점선) 먼저, 근육(금색) 위에 */
    var path = '<polyline points="' + pts(bpFat, 0, JT) + '" fill="none" stroke="url(#' + gid + 'f)" stroke-width="2.5" stroke-dasharray="1 5" stroke-linecap="round" opacity=".9" class="bp-flow"/>' +
      '<polyline points="' + pts(bpMuscle, cm, JT) + '" fill="none" stroke="url(#' + gid + 'l)" stroke-width="2.5" stroke-dasharray="5 5" opacity=".6" class="bp-ahead"/>';
    /* 앞으로 갈 구간: 옅은 금빛 + 촬영 쪽으로 흐르는 반짝임 (선 아래 전체) */
    var areaAll = pts(bpMuscle, 0, JT) + " " + X(JT) + ",168 " + X(0) + ",168";
    path = '<polygon points="' + pts(bpMuscle, cm, JT) + " " + X(JT) + ",168 " + X(cm).toFixed(1) + ',168" fill="url(#' + gid + 'a)" opacity=".35"/>' +
      '<polygon points="' + areaAll + '" fill="url(#' + gid + 's)"/>' + path;
    if (cm > 0) {
      var area = pts(bpMuscle, 0, cm) + " " + X(cm).toFixed(1) + ",168 " + X(0) + ",168";
      path += '<polygon points="' + area + '" fill="url(#' + gid + 'a)" class="bp-area"/>' +
        '<polyline points="' + pts(bpMuscle, 0, cm) + '" fill="none" stroke="url(#' + gid + 'l)" stroke-width="4.5" stroke-linecap="round" pathLength="1" class="bp-done"/>';
    }
    /* 두 선이 만나는 곳 = 몸이 선명해지는 순간 */
    var cx = JFIT ? JFIT.c : 8;
    for (var m = cx; m <= JT; m += JT / 240) { if (bpMuscle(m) - bpFat(m) > 0.12) { cx = m; break; } }
    var sharp = '<g transform="translate(' + X(cx) + ',' + Y(bpMuscle(cx)) + ')"><path d="M0 -9 L2.2 -2.2 L9 0 L2.2 2.2 L0 9 L-2.2 2.2 L-9 0 L-2.2 -2.2 Z" fill="#fff" opacity=".9"/></g>' +
      '<text x="' + (X(cx) - 6) + '" y="' + (Y(bpMuscle(cx)) - 13) + '" text-anchor="end" class="bp-note">몸이 선명해지는 순간</text>';
    var ticks = (JFIT ? [0, JFIT.b, JFIT.c, JT] : [0, 2, 8, 12]).map(function (m, i) {
      return '<line x1="' + X(m) + '" y1="168" x2="' + X(m) + '" y2="173" stroke="#fff" stroke-opacity=".35"/>' +
        '<text x="' + X(m) + '" y="186" text-anchor="' + (i === 3 ? "end" : "middle") + '" class="bp-x">' + (i === 0 ? "시작" : i === 3 ? "촬영" : JFIT ? JFIT.mon(m) : m + "개월") + '</text>';
    }).join("");
    var mk = "";
    if (now) {
      var mx = X(cm), my = Y(bpMuscle(cm)), right = cm > JT * 0.62, LW = 108, ly = my - 18;
      mk = '<circle cx="' + mx + '" cy="' + my + '" r="7" fill="none" stroke="var(--gold-line)" stroke-width="2" class="bp-sonar"/>' +
        '<circle cx="' + mx + '" cy="' + my + '" r="12" fill="var(--gold-line)" opacity=".25"/><circle cx="' + mx + '" cy="' + my + '" r="6.5" fill="url(#' + gid + 'l)" stroke="#fff" stroke-width="2.5"/>' +
        '<g transform="translate(' + (right ? mx - 6 : mx + 6) + ',' + ly + ')"><rect x="' + (right ? -LW : 0) + '" y="-15" width="' + LW + '" height="22" rx="11" fill="var(--key)"/>' +
        '<text x="' + (right ? -LW / 2 : LW / 2) + '" y="0.5" text-anchor="middle" class="jc-mk">지금 여기 · ' + (now.month || 1) + '개월차</text></g>';
    }
    /* 끝: 금색 카메라 = 바프 촬영 D-DAY */
    var ex = X(JT), ey = Y(bpMuscle(JT));
    var cam = '<g transform="translate(' + ex + ',' + (ey - 22) + ')"><circle r="14" fill="var(--gold-line)" class="bp-glow"/><circle r="14" fill="url(#' + gid + 'l)"/>' +
      '<path d="M-7 -3.5 h3.5 l1.6 -2.4 h3.8 l1.6 2.4 h3.5 v9 h-14 Z" fill="none" stroke="var(--bp-ink, #0E0E10)" stroke-width="1.8" stroke-linejoin="round"/><circle cy="1" r="2.6" fill="none" stroke="var(--bp-ink, #0E0E10)" stroke-width="1.8"/></g>' +
      '<text x="' + (ex - 19) + '" y="' + (ey - 18) + '" text-anchor="end" class="bp-dd">D-DAY</text>';
    return '<div class="jchart bp-chart"><svg viewBox="0 0 340 194" role="img" aria-label="바디프로필 ' + JTN + '개월 여정 그래프: ' + JST.map(function (s) { return s.no + '단계 ' + s.short + '(' + s.range + ')'; }).join(", ") + (now ? ', 지금 ' + (now.month || 1) + '개월차' : '') + '">' +
      defs + bands + '<line x1="26" y1="168" x2="326" y2="168" stroke="#fff" stroke-opacity=".3" stroke-width="1.5"/>' + ticks + path + sharp + cam + mk + '</svg>' +
      '<div class="bp-legend"><span><i class="lg-m"></i>근육</span><span><i class="lg-f"></i>체지방</span></div>' +
      '<p class="bp-cap">2단계에 근육을 꽉 채우고, 3단계에 지방만 걷어내 촬영날 가장 선명한 몸을 만들어요. 선은 개념 그래프예요 (실측 아님).</p></div>';
  }
  function curveY(m) { return 0.06 + 0.86 / (1 + Math.exp(-(m - 4.3) / 1.15)); }
  function journeyChart(now) {
    if (BP) return journeyChartBP(now);
    var X = function (m) { return 26 + m * 25; }, Y = function (v) { return 156 - v * 118; };
    var bands = STAGES.map(function (s, i) {
      var cur = now && s === now.stage;
      return '<rect x="' + X(s.from) + '" y="22" width="' + (X(s.to) - X(s.from)) + '" height="134" fill="var(--primary)" opacity="' + (cur ? 0.13 : 0.05 + i * 0.02) + '"/>' +
        '<text x="' + ((X(s.from) + X(s.to)) / 2) + '" y="15" text-anchor="middle" class="jc-st' + (cur ? ' cur' : '') + '">' + s.no + '단계 ' + s.short + '</text>';
    }).join("");
    var pts = function (a, b) {
      var out = [];
      for (var m = a; m <= b + 1e-9; m += 0.1) out.push(X(m).toFixed(1) + "," + Y(curveY(m)).toFixed(1));
      return out.join(" ");
    };
    var cm = now ? now.m : 0;
    /* 2026-11-06 움직임 시안 D "목표까지 흐르는 길": 지금까지 선이 그려지고 → 점이 톡 → 앞으로 갈 점선이 깃발 쪽으로 계속 흐름,
       깃발 펄럭, 점에서 물결. 애니메이션은 style.css의 .jc-* (화면 다시 그릴 때마다 처음부터) */
    var path = '<polyline points="' + pts(0, 12) + '" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-dasharray="5 5" opacity="' + (cm > 0 ? '.12' : '.35') + '"/>';
    if (cm > 0 && cm < 12) path += '<polyline class="jc-ahead" points="' + pts(cm, 12) + '" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-dasharray="5 5"/>';
    if (cm > 0) path += '<polyline class="jc-done" pathLength="1" points="' + pts(0, cm) + '" fill="none" stroke="var(--primary)" stroke-width="4" stroke-linecap="round"/>';
    var ticks = [0, 2, 7, 12].map(function (m) {
      return '<line x1="' + X(m) + '" y1="156" x2="' + X(m) + '" y2="161" stroke="var(--faint)"/>' +
        '<text x="' + X(m) + '" y="174" text-anchor="middle" class="jc-x">' + (m === 0 ? "시작" : m + "개월") + '</text>';
    }).join("");
    var mk = "";
    if (now) {
      var mx = X(cm), my = Y(curveY(cm)), right = cm > 7.5, below = my < 64, LW = 108;
      var ly = below ? my + 26 : my - 18;
      mk = '<circle class="jc-sonar" cx="' + mx + '" cy="' + my + '" r="7" fill="none" stroke="var(--key)" stroke-width="2"/>' +
        '<g class="jc-pop"><circle cx="' + mx + '" cy="' + my + '" r="11" fill="var(--key)" opacity=".2"/><circle cx="' + mx + '" cy="' + my + '" r="6.5" fill="var(--key)" stroke="#fff" stroke-width="2.5"/></g>' +
        '<g transform="translate(' + (right ? mx - 6 : mx + 6) + ',' + ly + ')"><g class="jc-lab' + (right ? ' r' : '') + '"><rect x="' + (right ? -LW : 0) + '" y="-15" width="' + LW + '" height="22" rx="11" fill="var(--key)"/>' +
        '<text x="' + (right ? -LW / 2 : LW / 2) + '" y="0.5" text-anchor="middle" class="jc-mk">지금 여기 · ' + (now.month || 1) + '개월차</text></g></g>';
    }
    var flag = '<g transform="translate(' + X(12) + ',' + (Y(curveY(12)) - 2) + ')"><line x1="0" y1="0" x2="0" y2="-20" stroke="var(--gold)" stroke-width="2"/><path class="jc-wave" d="M0 -20 L13 -15.5 L0 -11 Z" fill="var(--gold)"/></g>';
    return '<div class="jchart"><svg viewBox="0 0 340 182" role="img" aria-label="12개월 PT 여정 그래프: 1단계 기초(1~2개월), 2단계 변화(2~7개월), 3단계 자립(7~12개월)' + (now ? ', 지금 ' + (now.month || 1) + '개월차' : '') + '">' +
      bands + '<line x1="26" y1="156" x2="326" y2="156" stroke="var(--rule)" stroke-width="1.5"/>' + ticks + path + flag + mk + '</svg>' +
      '<p class="jc-cap">선은 "몸의 변화 · 자신감"이에요. 처음엔 천천히, 어느 순간 확 올라가요. 회원님마다 속도는 달라요.</p></div>';
  }
  function stageCard(s, now, compact) {
    var state = !now ? "" : s.no < now.stage.no ? "done" : s === now.stage ? "cur" : "next";
    var badge = state === "done" ? '<span class="jb done">완료</span>' : state === "cur" ? '<span class="jb cur">지금 여기</span>' : '<span class="jb">' + s.range + '</span>';
    var prog = "";
    if (state === "cur") {
      var pct = Math.round((now.m - s.from) / (s.to - s.from) * 100);
      var left = Math.max(0, Math.round((s.to - now.m) * 4.35));
      prog = '<div class="jprog"><div style="width:' + Math.max(4, pct) + '%"></div></div><p class="jleft">' +
        (s.no === 3 && left === 0 ? (BP ? '바프 촬영 완주! 정말 멋져요' : '12개월 완주! 졸업 또는 다음 목표를 함께 정해요') : s.no + '단계 남은 기간 약 ' + (left >= 8 ? Math.round(left / 4.35) + '개월' : left + '주')) + '</p>';
    }
    return '<div class="jcard ' + state + '"><div class="jtop"><span class="jno">' + s.no + '</span><div><small>' + s.no + '단계 · ' + s.range + '</small><h3>' + esc(s.name) + '</h3></div>' + badge + '</div>' +
      '<ul class="jfocus">' + s.focus.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join("") + '</ul>' +
      (compact && state !== "cur" ? '' : '<p class="jmsg">' + esc(s.msg) + '</p>') + prog + '</div>';
  }
  /* 목표 탭: 1·2·3단계 줄 — 지난 단계 ✓, 지금 단계 숨쉬는 점, 지나온 만큼 선이 채워짐. 누르면 아래 카드가 그 단계로 */
  function stageStepper(now) {
    var ci = JST.indexOf(now.stage), cs = now.stage;
    var f = Math.max(0, Math.min(1, (ci + Math.max(0, Math.min(1, (now.m - cs.from) / (cs.to - cs.from)))) / (JST.length - 1)));
    return '<p class="js-hint">단계를 눌러 목표를 확인해요</p><div class="jstep"><div class="js-track"><i style="width:' + (f * 100).toFixed(1) + '%"></i></div>' +
      JST.map(function (st) {
        var state = st.no < cs.no ? "done" : st === cs ? "cur" : "next";
        return '<button type="button" class="js-n ' + state + (st === cs ? ' on' : '') + '" data-st="' + st.no + '" aria-pressed="' + (st === cs) + '">' +
          '<i>' + (state === "done" ? '✓' : st.no) + '</i><b>' + esc(st.short) + '</b><small>' + (state === "cur" ? '지금 여기' : esc(st.range)) + '</small></button>';
      }).join("") + '</div>';
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".js-n");
    if (!b) return;
    var now = journeyNow(), st = JST[+b.getAttribute("data-st") - 1], box = document.getElementById("jdet");
    if (!now || !st || !box || b.classList.contains("on")) return;
    [].forEach.call(document.querySelectorAll(".js-n"), function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    var dir = +b.getAttribute("data-st") > +(box.getAttribute("data-st") || now.stage.no) ? "r" : "l";
    box.setAttribute("data-st", st.no);
    box.innerHTML = stageCard(st, now, false);
    box.classList.remove("in-r", "in-l"); void box.offsetWidth; box.classList.add("in-" + dir);
  });
  function bpStrip() {   /* 바프 회원: 그래프 위 금색 띠 (촬영일 있으면 D-day) */
    var d = bpDday();
    return '<div class="bp-strip"><span class="bp-tag">BODY PROFILE</span>' +
      (d ? '<b>' + (d.n > 0 ? 'D-' + d.n : d.n === 0 ? 'D-DAY' : '촬영 완료') + '</b><small>촬영 ' + esc(d.label) + '</small>'
         : '<b>목표는 바프 촬영!</b><small>촬영 날짜는 선생님과 정해요</small>') + '</div>';
  }
  function journeyHome() {
    var now = journeyNow();
    if (!now) return "";
    if (BP) return '<section>' + head("", "나의 바프 여정", "촬영날까지 함께 가는 " + JTN + "개월", '<a class="more" href="#goal">목표 자세히 →</a>') +
      '<div class="panel jpanel bp">' + bpStrip() + journeyChart(now) + stageCard(now.stage, now, true) + '</div></section>';
    return '<section>' + head("", "나의 PT 여정", "함께 가는 12개월", '<a class="more" href="#goal">목표 자세히 →</a>') +
      '<div class="panel jpanel">' + journeyChart(now) + stageCard(now.stage, now, true) + '</div></section>';
  }
  function renderGoal() {
    var now = journeyNow();
    var h = meSeg("goal") + '<div class="hero"><div class="hero-main"><div class="hero-l"><div class="eyebrow">MY GOAL <b>· 나의 목표</b></div>' +
      '<h1>' + esc(M.goal || "나의 목표") + '</h1><div class="en">' + esc(M.name) + ' 회원님 · ' + (BP ? '기초 → 벌크 → 컷팅, 바프 촬영까지 함께 가요' : '기초 → 변화 → 자립, 3단계로 함께 가요') + '</div>' +
      '<div class="who"><strong>' + (now ? (now.month ? now.month + '개월차' : '곧 시작해요') + ' · ' + now.stage.no + '단계 ' + esc(now.stage.short) : '') + '</strong><span>담당 ' + esc(TRN) + ' ' + TRL() + '</span></div></div></div>' +
      '<div class="keypoint"><small>KEY POINT</small><p>' + (BP ? '목표는 하나, 바프 촬영날! 그 의지라면 충분해요. 단계마다 함께 넘어가요!' : '혼자 가는 길이 아니에요. 단계마다 함께 넘어가요!') + '</p></div></div>';
    h += careSection();
    var n4 = COACH_MODE ? "04" : "03";
    var attSec = '<section id="att">' + head("01", "출석률 · 출석 달력", "얼마나 꾸준히 나왔는지 봐요") + '<div class="panel attcard">' + attGauge() + attCalendar() + '</div></section>';
    if (!now) {
      return h + attSec + (COACH_MODE ? rankSection("02") + badgeSection("03") : badgeSection("02")) + '<div class="panel empty"><h3>PT 여정 준비 중이에요</h3><p>선생님이 시작일을 넣으면 12개월 여정이 나와요</p></div>' + remember();
    }
    h += attSec + (COACH_MODE ? rankSection("02") + badgeSection("03") : badgeSection("02"));   /* 2026-11-20 팀장 "출석 순위 나만 보이게" — 회원님 화면엔 안 보임, 선생님 페이지에서 열 때만 */
    /* 2026-11-13 "한눈에 보는 12개월 그래프 + 단계별 목표 합치기" — 그래프 아래 1·2·3단계 줄(눌러서 바꾸기) + 고른 단계 목표 카드 */
    h += '<section id="goal-journey">' + head(n4, BP ? "바프까지 " + JTN + "개월 여정" : "나의 12개월 여정", "지금 어디쯤, 무엇을 할지 한눈에") + '<div class="panel jpanel jmerge' + (BP ? ' bp">' + bpStrip() : '">') + journeyChart(now) +
      '<div class="jsel">' + stageStepper(now) + '<div class="jdet" id="jdet">' + stageCard(now.stage, now, false) + '</div></div></div></section>';
    return h + remember();
  }


  /* ---------------- 출석 (오늘 출석 체크 · 출석 달력 · 출석률) */
  var SLUG = window.ATT_SLUG || (location.pathname.match(/\/m\/([^\/]+)\//) || [, M.name])[1];
  /* 출석 창고(구글 Apps Script 웹 앱) 주소 — 비어 있으면 휴대폰에만 저장 */
  var ATT_API = window.ATT_API || SITE.att_api || "";
  var attTimes = {};
  try { attTimes = JSON.parse(localStorage.getItem(ATT_KEY_T()) || "{}") || {}; } catch (e) {}
  function ATT_KEY_T() { return "ptnote:" + SLUG + ":attT"; }
  var ATT_KEY = "ptnote:" + SLUG + ":att";
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function ymd(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  var attMem = null;
  function attLoad() {
    var a = null;
    try { var raw = localStorage.getItem(ATT_KEY); if (raw) a = JSON.parse(raw); } catch (e) {}
    if (!Array.isArray(a)) a = attMem || (window.ATT_DEMO ? window.ATT_DEMO.slice() : []);
    attMem = a;
    return a;
  }
  function attSave(a) { attMem = a; try { localStorage.setItem(ATT_KEY, JSON.stringify(a)); } catch (e) {} }
  function attHas(a, key) { return a.indexOf(key) >= 0; }
  function isWorkoutDay(d) {   /* 루틴에서 운동하는 요일인지 (순환 루틴은 어느 날이든 운동할 수 있음) */
    if (ROT) return true;
    var day = dayAt(d);
    return !!(day && !day.rest);
  }
  var ATT_SINCE = new Date(2026, 10, 4);   /* 출석 체크를 시작한 날 (이 전 날짜는 결석으로 세지 않음) */
  function startDate() {
    var st = null;
    if (M.journey && M.journey.start) { var p = M.journey.start.split("-"); st = new Date(+p[0], +p[1] - 1, +p[2]); }
    if (M.att_since) { var q = M.att_since.split("-"); var s2 = new Date(+q[0], +q[1] - 1, +q[2]); if (!st || s2 > st) st = s2; }
    if (!st || ATT_SINCE > st) st = ATT_SINCE;
    return st;
  }
  function attStats(a, from, to) {   /* from~to(오늘까지) 운동하는 날 중 출석한 날 */
    var st = startDate(), plan = 0, done = 0;
    var d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    if (st && d < st) d = new Date(st.getFullYear(), st.getMonth(), st.getDate());
    for (; d <= to; d.setDate(d.getDate() + 1)) {
      var k = ymd(d), w = isWorkoutDay(d), on = attHas(a, k);
      if (w) plan++;
      if (on) done++;
    }
    if (ROT) plan = Math.max(done ? 1 : 0, Math.round(plan * rotDays().length / 7));   /* 순환: 주 N회 기준으로 운동할 날 수 */
    return { plan: plan, done: done, rate: plan ? Math.min(100, Math.round(done / plan * 100)) : 0 };
  }
  function attStreak(a) {   /* 오늘(또는 어제)부터 거꾸로, 운동하는 날을 빠짐없이 나온 횟수 */
    var d = new Date(), n = 0, today = ymd(d), gap = 0;
    if (!attHas(a, today)) d.setDate(d.getDate() - 1);
    for (var i = 0; i < 400; i++) {
      var k = ymd(d);
      if (attHas(a, k)) { n++; gap = 0; }
      else if (ROT) { if (++gap > 2) break; }   /* 순환: 쉬는 날이 들쭉날쭉해서 3일 넘게 비면 끊김 */
      else if (isWorkoutDay(d)) break;
      d.setDate(d.getDate() - 1);
      var st = startDate(); if (st && d < st) break;
    }
    return n;
  }
  function rateWord(r) { return r >= 80 ? ["good", "아주 좋아요!"] : r >= 50 ? ["mid", "조금만 더!"] : ["low", "다시 시작해봐요"]; }

  /* 출석 도장 (2026-11-11 "A버전에 감성적으로 출석버튼"): 홈 맨 위 카드. 누르면 도장이 쾅 찍히고 점이 톡톡 튐 + 날마다 다른 한마디 */
  var ST_ON = ["오늘의 땀이 내일의 자신감이 돼요", "나와준 것만으로 이미 절반은 해냈어요", "어제의 나보다 한 걸음 더 왔어요",
    "꾸준함이 쌓이는 소리, 들리시죠?", "오늘도 나와의 약속을 지켰어요", "몸은 거짓말을 안 해요. 오늘도 잘 왔어요", "이 한 번이 모여서 달라진 몸이 돼요"];
  var ST_OFF = ["문을 열고 들어온 순간부터 운동이에요", "오늘의 나에게 도장 하나 꾹 찍어줘요", "가장 어려운 건 오는 것, 이미 반은 왔어요", "오늘 찍은 도장이 다음 달 몸이 돼요"];
  function attSeal(on, now, tm) {
    var md = pad2(now.getMonth() + 1) + "." + pad2(now.getDate());
    if (on) return '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" fill="var(--seal)"/>' +
      '<circle cx="36" cy="36" r="28.5" fill="none" stroke="#fff" stroke-width="1.4" opacity=".75"/>' +
      '<text x="36" y="23.5" text-anchor="middle" font-size="7.5" font-weight="900" fill="#fff" letter-spacing="1.5" opacity=".85">JK</text>' +
      '<text x="36" y="41" text-anchor="middle" font-size="17" font-weight="900" fill="#fff">출석</text>' +
      '<text x="36" y="53" text-anchor="middle" font-size="8.5" font-weight="700" fill="#fff" opacity=".9">' + md + '</text></svg>';
    return '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="33" fill="#fff" stroke="var(--seal)" stroke-width="2.4" stroke-dasharray="4.6 4.2"/>' +
      '<circle cx="36" cy="36" r="27" fill="var(--seal)" opacity=".09"/>' +
      '<text x="36" y="40.5" text-anchor="middle" font-size="15" font-weight="900" fill="var(--seal)">출석</text>' +
      '<text x="36" y="53" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--seal)" opacity=".75">' + md + '</text></svg>';
  }
  function attCheckStrip() {   /* 홈 맨 위 출석 도장 카드 (id attBtn — 출석이 바뀌면 attRefresh가 통째로 다시 그림) */
    var a = attLoad(), now = new Date(), key = ymd(now), on = attHas(a, key);
    var doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    var msg = on ? ST_ON[doy % ST_ON.length] : ST_OFF[doy % ST_OFF.length];
    var burst = ""; for (var i = 0; i < 10; i++) burst += '<i style="--a:' + (i * 36) + 'deg"></i>';
    return '<button type="button" class="stamp' + (on ? ' on' : '') + '" id="attBtn" aria-pressed="' + on + '" aria-label="' +
      (now.getMonth() + 1) + '월 ' + now.getDate() + '일 출석 ' + (on ? '완료, 다시 누르면 취소' : '도장 찍기') + '">' +
      '<span class="st-seal">' + attSeal(on, now) + '<span class="st-burst" aria-hidden="true">' + burst + '</span></span>' +
      '<span class="st-txt"><small>' + (on ? a.length + '번째 출석' + (attTimes[key] ? ' · ' + attTimes[key] : '') : '오늘 출석 도장') + '</small>' +
      '<b>' + (on ? '오늘도 와줘서 고마워요' : '눌러서 출석 도장 꾹') + '</b><em>' + esc(msg) + '</em></span>' +
      (on ? '<span class="st-undo" aria-hidden="true">다시 누르면 취소</span>' : '<span class="st-go" aria-hidden="true">›</span>') + '</button>';
  }
  function homeWidgets() {   /* 홈 작은 위젯 2칸: 이번 달 출석률 링 / 연속 출석 + 이번 주 7칸 */
    var a = attLoad(), now = new Date(), today = ymd(now);
    var m = attStats(a, new Date(now.getFullYear(), now.getMonth(), 1), now), s = attStreak(a);
    var R = 22, C = 2 * Math.PI * R, len = C * m.rate / 100;
    var mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    var wk = "";
    for (var i = 0; i < 7; i++) {
      var d = new Date(mon); d.setDate(mon.getDate() + i);
      var k = ymd(d), c = attHas(a, k) ? "on" : (!ROT && !isWorkoutDay(d)) ? "rest" : "";
      wk += '<span class="' + c + (k === today ? ' today' : '') + '"></span>';
    }
    return '<div class="hwid" id="hwid"><a class="hw" href="#goal"><svg class="ring" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="' + R + '" fill="none" stroke="var(--hw-track)" stroke-width="7"/>' +
      (m.rate > 0 ? '<circle cx="27" cy="27" r="' + R + '" fill="none" stroke="var(--seal)" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (m.rate >= 100 ? C.toFixed(1) + ' 0' : len.toFixed(1) + ' ' + C.toFixed(1)) + '" transform="rotate(-90 27 27)"/>' : '') +
      '</svg><span><small>이번 달 출석률</small><b>' + m.rate + '<i>%</i></b></span></a>' +
      '<a class="hw col" href="#goal-badges"><small>연속 출석</small><b>' + s + '<i>회</i></b><span class="wk" aria-label="이번 주 출석">' + wk + '</span></a></div>';
  }
  function homeInfo() {   /* 홈 작은 위젯 2칸 (2026-11-12 "공지·최근 복습지도 출석률 칸처럼"): 선생님 공지 / 최근 자세 복습지 */
    var n = (M.notices || [])[0], f = M.forms[0], nNew = n && nUnseen().length > 0;
    var bell = '<span class="hi-ic bellc' + (nNew ? ' new' : '') + '" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 6.5 2.5 8.5 2.5 8.5h-17S6 15.5 6 9"/><path d="M10 21h4"/></svg></span>';
    var h = '<div class="hwid hinfo">';
    h += '<a class="hw col hi" href="#notice"' + (n ? ' data-nk="' + esc(nKey(n)) + '"' : '') + '><span class="hi-top">' + bell + (nNew ? '<i class="hi-new">NEW</i>' : '<i class="hi-go">›</i>') + '</span>' +
      '<small>선생님 공지' + (n && /(\d{1,2})\D+(\d{1,2})\D*$/.test(n.date || "") ? ' · ' + String(n.date).replace(/^.*?(\d{1,2})\D+(\d{1,2})\D*$/, function (x, a, b) { return +a + "월 " + +b + "일"; }) : '') + '</small>' +
      '<b class="hi-t">' + (n ? esc(n.title) : '아직 공지가 없어요') + '</b></a>';
    if (f) {
      var key = iconOf({ name: f.exercise }), ic = key !== "dumbbell" && window.EXI && EXI.has(key) ? img(key, "hi-ex", true) : '<img class="hi-ph" src="' + esc(f.dir) + 'poster.jpg" alt="" loading="lazy">';
      h += '<a class="hw col hi" href="#form-' + esc(f.id) + '"><span class="hi-top"><span class="hi-ic" aria-hidden="true">' + ic + '</span>' + (formNew(f) ? '<i class="hi-new">NEW</i>' : '<i class="hi-go">›</i>') + '</span>' +
        '<small>최근 자세 복습지 · ' + M.forms.length + '개</small><b class="hi-t">' + esc(f.exercise) + '</b></a>';
    } else {
      h += '<a class="hw col hi" href="#forms"><span class="hi-top"><span class="hi-ic bellc" aria-hidden="true">' + img("dumbbell", "hi-ex", true) + '</span><i class="hi-go">›</i></span><small>최근 자세 복습지</small><b class="hi-t">수업에서 배운 자세가 여기에 쌓여요</b></a>';
    }
    return h + '</div>';
  }
  document.addEventListener("click", function (e) {   /* 홈 공지 칸 → 그 공지로 바로 (반짝 표시) */
    var a = e.target.closest && e.target.closest("a.hi[data-nk]");
    if (a) pendingNotice = a.getAttribute("data-nk");
  }, true);
  function attRefresh() {   /* 출석이 바뀌면 화면의 출석 부분만 다시 그림 */
    var b = document.getElementById("attBtn");
    if (b) { b.outerHTML = attCheckStrip(); setupAttCheck(); }
    var hw = document.getElementById("hwid"); if (hw) hw.outerHTML = homeWidgets();
    var g = document.querySelector(".attgauge"); if (g) g.outerHTML = attGauge();
    var c = document.querySelector(".cal"); if (c) { c.outerHTML = attCalendar(); setupCal(); }
    var bs = document.getElementById("badges"); if (bs) { bs.outerHTML = badgeSection(bs.getAttribute("data-num")); setupBadges(); setupFold(view.getAttribute("data-tab") || "goal"); }
    var mb = document.querySelector(".mm-body"); if (mb) mb.innerHTML = muscleBody();
    rkRefresh();
    alignText(document);
  }
  function attApply(days) {   /* 창고에서 받은 기록으로 바꿔 끼움 */
    attTimes = days || {};
    attSave(Object.keys(attTimes));
    try { localStorage.setItem(ATT_KEY_T(), JSON.stringify(attTimes)); } catch (e) {}
  }
  /* ---------------- 불편하거나 아픈 곳 (2026-11-12 트레이너 "목표 쓰는 것처럼 불편하거나 아픈 곳도")
     data.js M.care(문자열) 또는 선생님이 폰에서 고친 것(창고 저장소 pub:m:<주소>:care, 빈 글자 = 지움)이 있으면 목표 탭 맨 위에.
     선생님 보기에서만 ✎ 고치기. PT 안내서 데모(DEMO)에서는 안 보임(손님에게 회원 몸 상태가 보이지 않게). */
  var CARE_K = "pub:m:" + SLUG + ":care", CARE_LS = "ptnote:" + SLUG + ":care";
  function careText() {
    var v = null; try { v = localStorage.getItem(CARE_LS); } catch (e) {}
    return v !== null ? v : (M.care || "");
  }
  function infoServer(kv) {
    var v = kv && kv["pub:m:" + SLUG + ":info"], had = null, now = v && typeof v === "object" ? JSON.stringify(v) : null;
    try { had = localStorage.getItem(INFO_LS); if (now) localStorage.setItem(INFO_LS, now); else localStorage.removeItem(INFO_LS); } catch (e) { return; }
    if (had !== now) {
      if (now) infoApply(v); else infoApply(null);
      /* 시작일이 바뀌면 PT 여정 계산(단계·그래프)이 처음 열 때 정해져서 새로고침 */
      var sOld = had ? (JSON.parse(had).start || "") : "", sNew = v && v.start || "";
      if (sOld !== sNew) location.reload(); else route();
    }
  }
  function dietServer(kv) {
    var v = kv && kv["pub:m:" + SLUG + ":diet"], had = null, now = v && typeof v === "object" ? JSON.stringify(v) : null;
    try { had = localStorage.getItem(DIET_LS); if (now) localStorage.setItem(DIET_LS, now); else localStorage.removeItem(DIET_LS); } catch (e) { return; }
    if (had !== now) { DIET_REC = dietApply(v) ? v : null; if (view.getAttribute("data-tab") === "diet" || view.getAttribute("data-tab") === "home") rerender(); litApply(view.getAttribute("data-tab")); }
  }
  function mediaServer(kv) {
    if (!kv) return;
    var fm = kv["pub:m:" + SLUG + ":fmedia"], fx = kv["pub:m:" + SLUG + ":fx"];
    var a = JSON.stringify(fm && typeof fm === "object" ? fm : {}), b = JSON.stringify(Array.isArray(fx) ? fx : []);
    var ha = null, hb = null;
    try { ha = localStorage.getItem(FM_LS) || "{}"; hb = localStorage.getItem(FX_LS) || "[]"; localStorage.setItem(FM_LS, a); localStorage.setItem(FX_LS, b); } catch (e) {}
    if (ha !== a || hb !== b) {
      FMEDIA = JSON.parse(a); fxApply(JSON.parse(b));
      var t = view.getAttribute("data-tab"); if (t === "forms" || t === "home") rerender();
      litApply(t);
    }
  }
  /* ---------------- 복습지 본 표시 (2026-11-18 팀장 "회원님들이 복습지 보면 본 거 알 수 있게")
     회원 폰에서 복습지(#form-<id>)를 열면 창고 mw:<주소>:seen = { 복습지id: [처음 본 시각, 마지막 본 시각, 본 횟수] } (초 단위, 10분 안에 다시 열면 안 셈).
     선생님 보기에서만 표시: 복습지 목록 카드 "✓ 봤어요 11/18" / "아직 안 봤어요", 복습지 안 위쪽 한 줄. 선생님 페이지 회원 카드에 "봄 n/m". 재배포 필요 없음(kv_set mw). */
  var SEEN_LS = "ptnote:" + SLUG + ":seen", SEEN = {}, SEEN_T = 0;
  try { SEEN = JSON.parse(localStorage.getItem(SEEN_LS) || "{}") || {}; } catch (e) { SEEN = {}; }
  function seenPush() {
    try { localStorage.setItem(SEEN_LS, JSON.stringify(SEEN)); } catch (e) {}
    clearTimeout(SEEN_T);
    SEEN_T = setTimeout(function () { if (ATT_API && JSON.stringify(SEEN).length < 3900) rtPost({ a: "kv_set", k: "mw:" + SLUG + ":seen", v: SEEN }).catch(function () {}); }, 1200);
  }
  function seenMark(id) {
    if (COACH_MODE || DEMO || !id) return;
    var now = Math.floor(Date.now() / 1000), o = SEEN[id];
    if (o && now - o[1] < 600) return;
    SEEN[id] = o ? [o[0], now, (o[2] || 1) + 1] : [now, now, 1];
    seenPush();
  }
  function seenServer(kv) {
    var v = kv && kv["mw:" + SLUG + ":seen"]; if (!v || typeof v !== "object") v = {};
    var ch = false, up = false;
    Object.keys(v).forEach(function (id) {
      var a = v[id], b = SEEN[id]; if (!Array.isArray(a)) return;
      if (!b) { SEEN[id] = a; ch = true; return; }
      var m = [Math.min(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2] || 1, b[2] || 1)];
      if (m.join() !== b.join()) { SEEN[id] = m; ch = true; }
      if (m.join() !== a.join()) up = true;
    });
    Object.keys(SEEN).forEach(function (id) { if (!v[id]) up = true; });
    if (ch) { try { localStorage.setItem(SEEN_LS, JSON.stringify(SEEN)); } catch (e) {} if (COACH_MODE && /^#forms?(-|$)/.test(location.hash || "")) route(); }
    if (up && !COACH_MODE && !DEMO) seenPush();
  }
  function seenWhen(t) { var d = new Date(t * 1000); return (d.getMonth() + 1) + "/" + d.getDate() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
  function seenChip(f) {
    if (!COACH_MODE || DEMO) return "";
    var o = SEEN[f.id];
    return o ? '<span class="fseen on">✓ 봤어요 ' + seenWhen(o[0]).split(" ")[0] + '</span>' : '<span class="fseen">아직 안 봤어요</span>';
  }
  function seenLine(f) {
    if (!COACH_MODE || DEMO) return "";
    var o = SEEN[f.id];
    return '<div class="fseen-line' + (o ? ' on' : '') + '">' + (o ? '👀 회원님이 <b>' + seenWhen(o[0]) + '</b>에 처음 봤어요' + ((o[2] || 1) > 1 ? ' · ' + o[2] + '번 봄 (마지막 ' + seenWhen(o[1]) + ')' : '') : '회원님이 아직 이 복습지를 안 열어 봤어요') + '</div>';
  }
  function careServer(kv) {
    seenServer(kv); mealServer(kv); infoServer(kv); dietServer(kv); mediaServer(kv); xdServer(kv);
    var tv = kv && kv["pub:m:" + SLUG + ":trainer"];
    if (typeof tv === "string" && tv && tv !== TRN) { M.trainer = tv; TRN = tv; try { localStorage.setItem(TRN_LS, tv); } catch (e) {} route(); }
    var had, now;
    try { had = localStorage.getItem(CARE_LS); } catch (e) { return; }
    if (kv && typeof kv[CARE_K] === "string") { now = kv[CARE_K]; try { localStorage.setItem(CARE_LS, now); } catch (e) {} }
    else { now = null; try { localStorage.removeItem(CARE_LS); } catch (e) {} }
    if (had !== now && /^#(goal|journey)/.test(location.hash)) route();
  }
  function careSection() {
    if (DEMO) return "";
    var t = careText();
    var ib = COACH_MODE ? '<div class="infoedit"><button type="button" id="infoEdit">✎ 회원 정보 고치기 <small>목표 · 시작한 달 · 다음 수업 · 아픈 곳</small></button></div>' : "";
    if (!t && !COACH_MODE) return "";
    if (!t) return ib;
    return ib + '<section id="care"><div class="panel carebox' + (t ? '' : ' empty') + '"><div class="care-h"><b>⚠ 불편하거나 아픈 곳</b>' +
      (COACH_MODE ? '<button type="button" class="care-ed" id="careEdit">✎ ' + (t ? '고치기' : '적기') + '</button>' : '') + '</div>' +
      (t ? '<p class="care-t">' + esc(t) + '</p><p class="care-s">선생님이 수업·루틴에 반영해요. 운동 중에 아프면 바로 말해 주세요!</p>'
         : '<p class="care-s">아직 없어요 — 회원님이 불편하거나 아픈 곳을 적어 두면 여기 나와요</p>') + '</div></section>';
  }
  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest("#infoEdit")) return;
    var hasKey = !!rtKey(), st = M.journey && M.journey.start ? M.journey.start.slice(0, 7) : "";
    var sh = rtSheet("회원 정보 고치기",
      '<label>목표 <small>목표 탭 맨 위 큰 글씨</small><input id="ieGoal" maxlength="40" value="' + esc(M.goal || "") + '" autocomplete="off"></label>' +
      '<label>PT 시작한 달 <small>PT 여정 단계·그래프가 여기서 계산돼요</small><input id="ieStart" type="month" value="' + esc(st) + '"></label>' +
      '<label>다음 수업 <small>홈에 보여요 · 비우면 안 보여요</small><input id="ieNext" maxlength="40" placeholder="예: 11월 14일(금) 오후 8시" value="' + esc(M.next_class || "") + '" autocomplete="off"></label>' +
      '<label>불편하거나 아픈 곳 <small>비우면 지워져요</small><textarea id="ieCare" rows="3" maxlength="300" placeholder="예: 오른쪽 무릎 계단 내려갈 때 통증">' + esc(careText()) + '</textarea></label>' +
      '<label id="sKeyWrap"' + (hasKey ? ' hidden' : '') + '>선생님 열쇠 <small>처음 한 번만</small><input id="sKey" type="password" autocomplete="off"></label>',
      function (s) {
        var key = (s.querySelector("#sKey").value || "").trim() || rtKey();
        if (!key) { s.querySelector("#sKeyWrap").hidden = false; return "선생님 열쇠를 넣어 주세요"; }
        var g = s.querySelector("#ieGoal").value.trim(), m = s.querySelector("#ieStart").value, n = s.querySelector("#ieNext").value.trim(), c = s.querySelector("#ieCare").value.trim();
        var info = { goal: g, start: m ? m + "-15" : "", next_class: n };
        if (INFO_ORIG.journey && INFO_ORIG.journey.start && m && INFO_ORIG.journey.start.slice(0, 7) === m) info.start = INFO_ORIG.journey.start;   /* 같은 달이면 원래 날짜 그대로 */
        var items = {}; items["pub:m:" + SLUG + ":info"] = info; items[CARE_K] = c;
        s.msg("저장하는 중…");
        rtPost({ a: "kv_set", key: key, items: items }).then(function (j) {
          if (!j || !j.ok) { rtErr(j, s); return; }
          var sOld = M.journey && M.journey.start || "";
          try { localStorage.setItem("ptkey", key); localStorage.setItem(INFO_LS, JSON.stringify(info)); localStorage.setItem(CARE_LS, c); } catch (x) {}
          infoApply(info); s.close();
          if ((info.start || (INFO_ORIG.journey && INFO_ORIG.journey.start) || "") !== sOld) { location.reload(); return; }
          route(); attToast("저장했어요 · 회원님 노트에 바로 보여요");
        }).catch(function () { s.msg(rtNetMsg()); });
        return true;
      }, "저장 · 바로 반영");
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest("#careEdit")) return;
    var hasKey = !!rtKey();
    var sh = rtSheet("불편하거나 아픈 곳",
      '<label class="rtl">회원님 노트 목표 탭에 보여요 <small>비우면 지워져요</small><textarea id="careIn" rows="4" maxlength="300" placeholder="예: 오른쪽 무릎 계단 내려갈 때 통증, 허리 디스크 이력">' + esc(careText()) + '</textarea></label>' +
      '<label class="rtl" id="sKeyWrap"' + (hasKey ? ' hidden' : '') + '>선생님 열쇠 <small>처음 한 번만</small><input id="sKey" type="password" autocomplete="off"></label>',
      function (s) {
        var v = s.querySelector("#careIn").value.trim(), key = (s.querySelector("#sKey").value || "").trim() || rtKey();
        if (!key) { s.querySelector("#sKeyWrap").hidden = false; return "선생님 열쇠를 넣어 주세요"; }
        s.msg("저장하는 중…");
        rtPost({ a: "kv_set", key: key, k: CARE_K, v: v }).then(function (j) {
          if (!j || !j.ok) { rtErr(j, s); return; }
          try { localStorage.setItem("ptkey", key); localStorage.setItem(CARE_LS, v); } catch (x) {}
          s.close(); route(); attToast(v ? "저장했어요 · 회원님 노트에 바로 보여요" : "지웠어요");
        }).catch(function () { s.msg(rtNetMsg()); });
        return true;
      }, "저장 · 바로 반영");
    var ta = sh.querySelector("#careIn"); if (ta) ta.focus();
  });

  function attCall(q) {
    return fetch(ATT_API + "?m=" + encodeURIComponent(SLUG) + (q || ""), { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j || !j.ok) throw new Error("save"); attApply(j.days); if ("routine" in j) rtServer(j.routine); if ("bnotices" in j) bnServer(j.bnotices); if ("kv" in j) { careServer(j.kv); grServer(j.kv); lgServer(j.kv); bgServer(j.kv); mvServer(j.kv); rkServer(j.kv); } return j; });
  }
  function attSync() {
    if (!ATT_API) return;
    attCall("").then(function () { attRefresh(); badgeCheck(); }).catch(function () {});
  }
  function attToast(msg) {
    var t = document.createElement("div"); t.className = "atttoast"; t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600);
  }
  function setupAttCheck() {
    var b = document.getElementById("attBtn");
    if (!b) return;
    if (COACH_MODE) {   /* 선생님 휴대폰에서는 보기만 (실수로 눌러 회원 출석이 바뀌지 않게) */
      b.classList.add("ro");
      b.addEventListener("click", function () { attToast("선생님 보기에서는 출석을 바꿀 수 없어요"); });
      return;
    }
    b.addEventListener("click", function () {
      var a = attLoad().slice(), now = new Date(), key = ymd(now), i = a.indexOf(key), turnOn = i < 0;
      var tm = pad2(now.getHours()) + ":" + pad2(now.getMinutes()), prevTm = attTimes[key];
      if (turnOn) { a.push(key); attTimes[key] = tm; } else { a.splice(i, 1); delete attTimes[key]; }
      attSave(a);
      attRefresh();
      var nb = document.getElementById("attBtn");
      if (nb && turnOn) { nb.classList.add("pop"); try { navigator.vibrate && navigator.vibrate([18, 40, 26]); } catch (e) {} }
      if (!ATT_API) return;
      if (nb) nb.classList.add("saving");
      attCall("&a=" + (turnOn ? "check" : "uncheck") + "&d=" + key + "&t=" + encodeURIComponent(tm) + "&n=" + encodeURIComponent(M._real || M.name))
        .then(function () { attRefresh(); badgeCheck(); })
        .catch(function () {
          var cur = attLoad().slice(), k = cur.indexOf(key);
          if (turnOn) { if (k >= 0) cur.splice(k, 1); delete attTimes[key]; }
          else { if (k < 0) cur.push(key); if (prevTm) attTimes[key] = prevTm; }
          attSave(cur); attRefresh();
          attToast("인터넷 연결을 확인하고 다시 눌러주세요");
        });
    });
  }

  var calMonth = null;   /* 달력에 보이는 달 (1일) */
  function attCalendar() {
    var a = attLoad(), now = new Date(), today = ymd(now), st = startDate();
    if (!calMonth) calMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    var y = calMonth.getFullYear(), mo = calMonth.getMonth();
    var first = new Date(y, mo, 1), last = new Date(y, mo + 1, 0);
    var to = last < now ? last : now;
    var ms = attStats(a, first, to);
    var cells = "", lead = first.getDay();
    for (var i = 0; i < lead; i++) cells += '<span class="cd blank" aria-hidden="true"></span>';
    for (var dd = 1; dd <= last.getDate(); dd++) {
      var d = new Date(y, mo, dd), k = ymd(d), on = attHas(a, k), w = isWorkoutDay(d);
      var past = k < today, before = st && d < st, cls = "cd";
      if (k === today) cls += " today";
      if (on) cls += " on";
      else if (before) cls += " pre";
      else if (ROT) cls += past ? " rest" : "";
      else if (past && w) cls += " miss";
      else if (!w) cls += " rest";
      else cls += " plan";
      cells += '<span class="' + cls + '"><b>' + dd + '</b></span>';
    }
    var canPrev = !st || new Date(y, mo, 0) >= new Date(st.getFullYear(), st.getMonth(), 1);
    var canNext = new Date(y, mo + 1, 1) <= now;
    return '<div class="panel cal"><div class="cal-head">' +
      '<button type="button" class="calnav" id="calPrev"' + (canPrev ? '' : ' disabled') + ' aria-label="이전 달">‹</button>' +
      '<div><b>' + y + '년 ' + (mo + 1) + '월</b><small>' + ms.done + '번 출석 · 출석률 ' + ms.rate + '%</small></div>' +
      '<button type="button" class="calnav" id="calNext"' + (canNext ? '' : ' disabled') + ' aria-label="다음 달">›</button></div>' +
      '<div class="cal-grid"><span class="dw sun">일</span><span class="dw">월</span><span class="dw">화</span><span class="dw">수</span><span class="dw">목</span><span class="dw">금</span><span class="dw sat">토</span>' + cells + '</div>' +
      (ROT ? '<div class="cal-legend"><span><i class="lg on"></i>출석</span><span><i class="lg rest"></i>쉰 날</span></div></div>'
        : '<div class="cal-legend"><span><i class="lg on"></i>출석</span><span><i class="lg miss"></i>운동날 결석</span><span><i class="lg plan"></i>운동하는 날</span><span><i class="lg rest"></i>쉬는 날</span></div></div>');
  }
  function attGauge() {
    var a = attLoad(), now = new Date();
    var m = attStats(a, new Date(now.getFullYear(), now.getMonth(), 1), now);
    var st = startDate(), all = attStats(a, st || new Date(now.getFullYear(), now.getMonth(), 1), now);
    var w = (m.plan === 0 || all.done === 0) ? ["none", "오늘부터 채워봐요!"] : rateWord(m.rate), R = 46, C = 2 * Math.PI * R, len = C * m.rate / 100;
    return '<div class="panel attgauge"><div class="gauge ' + w[0] + '"><svg viewBox="0 0 120 120" aria-hidden="true">' +
      '<defs><linearGradient id="gGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="gs1"/><stop offset="1" class="gs2"/></linearGradient></defs>' +   /* 게이지 그라데이션 (2026-11-08) */
      '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="var(--tint)" stroke-width="11"/>' +
      (m.rate > 0 ? '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="url(#gGrad)" stroke-width="11" stroke-linecap="round" stroke-dasharray="' + (m.rate >= 100 ? C.toFixed(1) + ' 0' : len.toFixed(1) + ' ' + C.toFixed(1)) + '" transform="rotate(-90 60 60)"/>' : '') + '</svg>' +
      '<div class="gnum' + (m.rate >= 100 ? ' full' : '') + '"><b>' + m.rate + '<i>%</i></b><small>이번 달 출석률</small></div></div>' +
      '<div class="gside"><p class="gword ' + w[0] + '">' + w[1] + '</p>' +
      '<dl><div><dt>이번 달</dt><dd>' + m.done + ' / ' + m.plan + '회</dd></div>' +
      '<div><dt>연속 출석</dt><dd>' + attStreak(a) + '회째</dd></div>' +
      '<div><dt>누적 출석</dt><dd>' + all.done + '회 · ' + all.rate + '%</dd></div></dl></div></div>';
  }
  function setupCal() {
    var p = document.getElementById("calPrev"), n = document.getElementById("calNext");
    function go(dm) {
      calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + dm, 1);
      var box = document.querySelector(".cal"); if (box) { box.outerHTML = attCalendar(); setupCal(); }
    }
    if (p) p.addEventListener("click", function () { go(-1); });
    if (n) n.addEventListener("click", function () { go(1); });
  }

  /* ---------------- 몸 변화 기록 (인바디) — 2026-11-06
     회원이 인바디 결과지 사진 + 숫자 4개(체중·골격근량·체지방량·체지방률)를 올리면
     지난달 마지막 기록 vs 이번 달 마지막 기록을 비교. 저장은 출석 창고(ATT_API)와 같은 Apps Script
     (시트 "인바디" 탭 + 드라이브 "PT노트 인바디 사진" 폴더). 그룹 PT 페이지(이름에 ·)는 숨김 */
  var IB_ON = !/·/.test(M.name || "") && M.inbody !== false;
  var IB_KEY = "ptib_" + SLUG;
  var ibData = null, ibErr = false, ibReady = null;
  try { ibData = JSON.parse(localStorage.getItem(IB_KEY) || "null"); } catch (e) {}
  var IB_ROWS = [
    { k: "w", name: "체중", unit: "kg", good: 0 },
    { k: "smm", name: "골격근량", unit: "kg", good: 1 },
    { k: "bfm", name: "체지방량", unit: "kg", good: -1 },
    { k: "pbf", name: "체지방률", unit: "%", good: -1 }
  ];
  function ibFmt(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  function ibDate(d) { var p = d.split("-"); return (+p[1]) + ". " + (+p[2]); }
  function ibPair() {   /* [이전, 이번] — 이번 = 가장 최근 기록, 이전 = 그보다 앞선 달의 마지막 기록 */
    var a = ibData || [];
    if (!a.length) return null;
    var cur = a[a.length - 1], prev = null;
    for (var i = a.length - 2; i >= 0; i--) { if (a[i].d.slice(0, 7) < cur.d.slice(0, 7)) { prev = a[i]; break; } }
    return { cur: cur, prev: prev };
  }
  function ibSummary(p) {
    var ds = p.cur.smm - p.prev.smm, df = p.cur.bfm - p.prev.bfm;
    if (ds > 0.05 && df < -0.05) return "근육은 늘고 지방은 줄었어요! 가장 좋은 변화예요";
    if (ds > 0.05) return "근육이 늘었어요! 지금처럼 꾸준히 가요";
    if (df < -0.05) return "체지방이 줄었어요! 근육 지키면서 계속 가요";
    if (Math.abs(ds) <= 0.05 && Math.abs(df) <= 0.05) return "몸이 잘 유지되고 있어요. 다음 달에 한 칸 더!";
    return "이번 달은 숨 고르기. 루틴·식단 같이 점검해요";
  }
  function ibPanel() {
    if (!IB_ON) return "";
    var p = ibPair();
    var btn = '<button class="btn fill ib-add" type="button">' + (p && p.cur.d.slice(0, 7) === ymd(new Date()).slice(0, 7) ? "인바디 다시 올리기" : "이번 달 인바디 올리기") + '</button>';
    if (ibReady === false) return '<div class="panel ibpanel ib-empty"><div class="ib-empty-ic" aria-hidden="true"><span>InBody</span></div><h3>곧 열려요</h3><p>인바디 결과지를 올려 지난달과 비교하는 기능을 준비 중이에요</p></div>';
    if (!ibData && !ibErr) return '<div class="panel ibpanel ib-loading"><p class="ib-empty-t">기록을 불러오는 중이에요…</p></div>';
    if (!p) {
      return '<div class="panel ibpanel ib-empty"><div class="ib-empty-ic" aria-hidden="true"><span>InBody</span></div>' +
        '<h3>인바디 결과지를 올려 보세요</h3><p>한 달에 한 번, 결과지 사진과 숫자 4개만 넣으면 지난달과 비교해 드려요</p>' + btn +
        (ibErr ? '<p class="ib-err">지금은 기록을 못 불러왔어요. 인터넷 연결을 확인해 주세요</p>' : '') + '</div>';
    }
    var head2, rows;
    if (p.prev) {
      head2 = '<div class="ib-when"><span><small>' + (+p.prev.d.slice(5, 7)) + '월</small>' + ibDate(p.prev.d) + '</span><b aria-hidden="true">→</b><span class="now"><small>' + (+p.cur.d.slice(5, 7)) + '월</small>' + ibDate(p.cur.d) + '</span></div>';
      rows = IB_ROWS.map(function (r) {
        var a = p.prev[r.k], b = p.cur[r.k], dlt = Math.round((b - a) * 10) / 10;
        var cls = dlt === 0 || !r.good ? "same" : (dlt > 0) === (r.good > 0) ? "up" : "down";
        var sign = dlt > 0 ? "▲ +" : dlt < 0 ? "▼ −" : "";
        return '<div class="ib-row"><span class="ib-name">' + r.name + '</span><span class="ib-prev">' + ibFmt(a) + '</span>' +
          '<span class="ib-cur">' + ibFmt(b) + '<small>' + r.unit + '</small></span>' +
          '<span class="ib-d ' + cls + '">' + (dlt === 0 ? "그대로" : sign + ibFmt(Math.abs(dlt)) + r.unit) + '</span></div>';
      }).join("");
      rows = '<div class="ib-grid"><div class="ib-row ib-hd"><span></span><span>지난달</span><span>이번 달</span><span>변화</span></div>' + rows + '</div>' +
        '<p class="ib-sum">' + ibSummary(p) + '</p>';
    } else {
      head2 = '<div class="ib-when"><span class="now"><small>' + (+p.cur.d.slice(5, 7)) + '월 첫 기록</small>' + ibDate(p.cur.d) + '</span></div>';
      rows = '<div class="ib-first">' + IB_ROWS.map(function (r) {
        return '<div><small>' + r.name + '</small><b>' + ibFmt(p.cur[r.k]) + '<em>' + r.unit + '</em></b></div>';
      }).join("") + '</div><p class="ib-sum">첫 기록 완료! 다음 달에 올리면 지난달과 비교해 드려요</p>';
    }
    var hist = (ibData || []).slice().reverse().map(function (r) {
      return '<li><span class="ib-hd8">' + r.d.replace(/-/g, ". ") + '</span><span>' + ibFmt(r.w) + 'kg · 근육 ' + ibFmt(r.smm) + ' · 지방 ' + ibFmt(r.pbf) + '%</span>' +
        (r.img ? '<button type="button" class="ib-photo" data-id="' + esc(r.id) + '">결과지</button>' : '') +
        '<button type="button" class="ib-del" data-id="' + esc(r.id) + '">삭제</button></li>';
    }).join("");
    return '<div class="panel ibpanel">' + head2 + rows + btn +
      '<details class="ib-hist"><summary>지난 기록 ' + ibData.length + '개 보기</summary><ul>' + hist + '</ul></details></div>';
  }
  function ibHomeStrip() {
    if (!IB_ON || !ibData || ibReady === false) return "";
    var p = ibPair();
    var txt = !p ? "인바디 결과지 올리고 지난달과 비교해 봐요" :
      !p.prev ? "첫 인바디 기록 완료! 다음 달에 비교해 드려요" :
      "지난달보다 골격근 " + (p.cur.smm - p.prev.smm >= 0 ? "+" : "−") + ibFmt(Math.abs(p.cur.smm - p.prev.smm)) + "kg · 체지방 " +
        (p.cur.bfm - p.prev.bfm >= 0 ? "+" : "−") + ibFmt(Math.abs(p.cur.bfm - p.prev.bfm)) + "kg";
    return '<a class="ibstrip" href="#body"><span class="ibs-tag">InBody</span><span class="ibs-t">' + txt + '</span><span class="ibs-go" aria-hidden="true">›</span></a>';
  }
  function ibRefresh() {
    var b = document.querySelector(".ibpanel"); if (b) { b.outerHTML = ibPanel(); setupIb(); }
    var tr = document.querySelector(".ibtrend"); if (tr) tr.outerHTML = ibTrend();
    var s = document.querySelector(".ibstrip, .ibstrip-slot");
    if (s) { var h = ibHomeStrip(); s.outerHTML = h || '<span class="ibstrip-slot"></span>'; }
    alignText(document);
  }
  function ibSet(list) { ibData = list || []; ibErr = false; try { localStorage.setItem(IB_KEY, JSON.stringify(ibData)); } catch (e) {} }
  function ibSync() {
    if (!IB_ON || !ATT_API) return;
    fetch(ATT_API + "?m=" + encodeURIComponent(SLUG) + "&a=inbody", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) throw new Error("ib");
        if (!("inbody" in j)) { ibReady = false; ibRefresh(); return; }   /* 창고가 아직 옛 버전(인바디 없음) */
        ibReady = true; ibSet(j.inbody); ibRefresh();
        if (bgReady) badgeCheck();
      })
      .catch(function () { if (!ibData) { ibErr = true; ibRefresh(); } });
  }
  /* 결과지 글자(OCR, Apps Script가 구글 드라이브로 읽어 글자만 돌려줌) → 숫자 찾기. 규칙은 여기서 고치면 됨(창고 재배포 필요 없음) */
  function ibParse(text) {
    var t = String(text || "").replace(/[\u00a0\t]/g, " ").replace(/(\d),(\d)/g, "$1.$2");
    function grab(re, lo, hi, skipBefore) {
      var rx = new RegExp(re.source, "gi"), m;
      while ((m = rx.exec(t))) {
        if (skipBefore && skipBefore.test(t.slice(Math.max(0, m.index - 3), m.index))) continue;
        var st = m.index + m[0].length, rest = t.slice(st, st + 70), nr = /\d{1,3}\.\d/g, k;
        while ((k = nr.exec(rest))) {
          var before = rest.slice(Math.max(0, k.index - 2), k.index), after = rest.slice(k.index + k[0].length, k.index + k[0].length + 3);
          if (/[~～]/.test(before) || /^\s*[~～\-]\s*\d/.test(after)) continue;   /* 표준 범위(55.7~75.3)는 건너뜀 */
          var v = parseFloat(k[0]);
          if (v >= lo && v <= hi) return v;
        }
      }
      return null;
    }
    var r = {
      w: grab(/체\s*중(?!\s*(조절|관리))|weight/, 20, 300, /(적정|표준|목표)\s*$/),
      smm: grab(/골\s*격\s*근\s*량|skeletal\s*muscle\s*mass|SMM/, 3, 90),
      bfm: grab(/체\s*지\s*방\s*량|body\s*fat\s*mass/, 0.5, 200),
      pbf: grab(/체\s*지\s*방\s*률|percent\s*body\s*fat|PBF/, 1, 75)
    };
    if (r.smm !== null && r.w !== null && r.smm >= r.w) r.smm = null;
    if (r.w !== null && r.pbf !== null && r.bfm !== null && Math.abs(r.w * r.pbf / 100 - r.bfm) > Math.max(1.5, r.bfm * 0.15)) r.bfm = null;
    if (r.w !== null && r.bfm !== null && r.pbf === null) r.pbf = Math.round(r.bfm / r.w * 1000) / 10;
    var dm = t.match(/(20\d{2})\s*[.\-\/년]\s*(\d{1,2})\s*[.\-\/월]\s*(\d{1,2})/);
    if (dm) {
      var dd = new Date(+dm[1], +dm[2] - 1, +dm[3]), now = new Date();
      if (dd <= now && now - dd < 400 * 86400000) r.d = ymd(dd);
    }
    return r;
  }
  function ibShrink(file, max) {   /* 사진을 긴 변 max(기본 1400)px JPEG로 줄여 base64 (글자만) */
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onerror = rej;
      fr.onload = function () {
        var im = new Image();
        im.onerror = rej;
        im.onload = function () {
          var s = Math.min(1, (max || 1400) / Math.max(im.width, im.height)), c = document.createElement("canvas");
          c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
          c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          res(c.toDataURL("image/jpeg", 0.82).split(",")[1]);
        };
        im.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
  function ibSheetOpen() {
    var wrap = document.createElement("div");
    wrap.className = "ibsheet";
    wrap.innerHTML = '<div class="ibs-back" data-close></div><form class="ibs-card" novalidate>' +
      '<div class="ibs-top"><h3>인바디 올리기</h3><button type="button" class="ibs-x" data-close aria-label="닫기">×</button></div>' +
      '<label class="ibs-file"><input type="file" id="ibFile" accept="image/*"><span class="ibs-ph"><b>결과지 사진 찍기 · 고르기</b><small>사진을 올리면 숫자를 자동으로 읽어 채워요</small></span><img alt="" hidden></label>' +
      '<label class="ibs-f"><span>측정한 날</span><input type="date" id="ibDate" value="' + ymd(new Date()) + '" max="' + ymd(new Date()) + '"></label>' +
      '<p class="ibs-hint">결과지 맨 위 <b>체성분분석 · 골격근·지방분석</b> 칸의 숫자를 넣어요</p>' +
      '<div class="ibs-nums">' +
      '<label class="ibs-f"><span>체중 <em>kg</em></span><input id="ibW" inputmode="decimal" placeholder="예 72.4" autocomplete="off"></label>' +
      '<label class="ibs-f"><span>골격근량 <em>kg</em></span><input id="ibS" inputmode="decimal" placeholder="예 31.2" autocomplete="off"></label>' +
      '<label class="ibs-f"><span>체지방량 <em>kg</em></span><input id="ibB" inputmode="decimal" placeholder="비우면 자동" autocomplete="off"></label>' +
      '<label class="ibs-f"><span>체지방률 <em>%</em></span><input id="ibP" inputmode="decimal" placeholder="예 21.5" autocomplete="off"></label>' +
      '</div><p class="ibs-msg" role="alert"></p>' +
      '<button class="btn fill ibs-save" type="submit">저장하기</button></form>';
    document.body.appendChild(wrap);
    document.documentElement.classList.add("ib-lock");
    var form = wrap.querySelector("form"), file = wrap.querySelector("#ibFile"), pv = wrap.querySelector(".ibs-file img"), msg = wrap.querySelector(".ibs-msg");
    var b64 = null, busy = false, ocrRun = 0;
    function close() { wrap.remove(); document.documentElement.classList.remove("ib-lock"); }
    Array.prototype.forEach.call(wrap.querySelectorAll("[data-close]"), function (x) { x.addEventListener("click", close); });
    file.addEventListener("change", function () {
      var f = file.files && file.files[0];
      if (!f) return;
      msg.textContent = "사진 준비 중…";
      ibShrink(f, 1800).then(function (d) {
        b64 = d; pv.src = "data:image/jpeg;base64," + d; pv.hidden = false;
        wrap.querySelector(".ibs-ph").hidden = true; msg.textContent = "";
        if (!ATT_API) return;
        var my = ++ocrRun;
        msg.className = "ibs-msg info"; msg.textContent = "결과지 숫자 읽는 중… (몇 초 걸려요)";
        fetch(ATT_API, { method: "POST", body: JSON.stringify({ a: "inbody_ocr", m: SLUG, img: d }) })
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (my !== ocrRun || !wrap.isConnected) return;
            if (!j || !j.ok) throw new Error(j && j.error || "ocr");
            var r = ibParse(j.text), got = 0;
            [["#ibW", "w"], ["#ibS", "smm"], ["#ibB", "bfm"], ["#ibP", "pbf"]].forEach(function (x) {
              var inp = wrap.querySelector(x[0]);
              if (r[x[1]] !== null && r[x[1]] !== undefined && !inp.value) { inp.value = ibFmt(r[x[1]]); inp.classList.add("auto"); got++; }
            });
            if (r.d) { var di = wrap.querySelector("#ibDate"); di.value = r.d; di.classList.add("auto"); }
            msg.className = "ibs-msg " + (got ? "info" : "");
            msg.textContent = got ? "결과지에서 숫자 " + got + "개를 읽었어요. 분홍 칸이 결과지와 맞는지 꼭 확인해 주세요"
              : "숫자를 못 읽었어요. 직접 넣어 주세요 (결과지를 평평하게 놓고 위에서 정면으로 찍으면 더 잘 읽어요)";
          })
          .catch(function () {
            if (my !== ocrRun || !wrap.isConnected) return;
            msg.className = "ibs-msg"; msg.textContent = "자동 읽기가 안 됐어요. 숫자를 직접 넣어 주세요";
          });
      }).catch(function () { msg.className = "ibs-msg"; msg.textContent = "이 사진은 못 읽었어요. 다른 사진으로 해 주세요"; });
    });
    Array.prototype.forEach.call(wrap.querySelectorAll(".ibs-f input"), function (inp) {
      inp.addEventListener("input", function () { inp.classList.remove("auto"); });
    });
    function n(id) { var v = String(wrap.querySelector(id).value || "").replace(",", ".").trim(); return v === "" ? null : Number(v); }
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (busy) return;
      msg.className = "ibs-msg";
      var w = n("#ibW"), s = n("#ibS"), bf = n("#ibB"), pf = n("#ibP"), d = wrap.querySelector("#ibDate").value;
      if (!d) { msg.textContent = "측정한 날을 골라 주세요"; return; }
      if (!(w >= 20 && w <= 300)) { msg.textContent = "체중을 확인해 주세요 (예 72.4)"; return; }
      if (!(s >= 3 && s <= 90)) { msg.textContent = "골격근량을 확인해 주세요 (예 31.2)"; return; }
      if (!(pf >= 1 && pf <= 75)) { msg.textContent = "체지방률을 확인해 주세요 (예 21.5)"; return; }
      if (bf !== null && !(bf > 0 && bf < w)) { msg.textContent = "체지방량을 확인해 주세요 (모르면 비워 두세요)"; return; }
      if (!ATT_API) { msg.textContent = "저장할 곳이 아직 준비 안 됐어요"; return; }
      busy = true; form.classList.add("saving"); msg.className = "ibs-msg info"; msg.textContent = "저장하는 중…";
      fetch(ATT_API, { method: "POST", body: JSON.stringify({ a: "inbody_add", m: SLUG, n: M._real || M.name, d: d, w: w, smm: s, bfm: bf, pbf: pf, img: b64 || "" }) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j || !j.ok) throw new Error(j && j.error || "save");
          ibSet(j.inbody); close(); ibRefresh(); attToast("인바디 기록을 저장했어요");
          setTimeout(badgeCheck, 2800);
        })
        .catch(function () { busy = false; form.classList.remove("saving"); msg.className = "ibs-msg"; msg.textContent = "저장 못 했어요. 인터넷 연결을 확인하고 다시 눌러 주세요"; });
    });
  }
  function ibPhotoOpen(id) {
    var wrap = document.createElement("div");
    wrap.className = "ibview";
    wrap.innerHTML = '<button type="button" class="ibs-x" aria-label="닫기">×</button><p>결과지 불러오는 중…</p>';
    document.body.appendChild(wrap);
    wrap.addEventListener("click", function () { wrap.remove(); });
    fetch(ATT_API + "?m=" + encodeURIComponent(SLUG) + "&a=inbody_img&id=" + encodeURIComponent(id), { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) throw new Error("img");
        var p = wrap.querySelector("p"); var im = document.createElement("img"); im.alt = "인바디 결과지"; im.src = j.data; p.replaceWith(im);
      })
      .catch(function () { var p = wrap.querySelector("p"); if (p) p.textContent = "사진을 못 불러왔어요"; });
  }
  function setupIb() {
    var add = document.querySelector(".ib-add");
    if (add) add.addEventListener("click", ibSheetOpen);
    Array.prototype.forEach.call(document.querySelectorAll(".ib-photo"), function (b) {
      b.addEventListener("click", function () { ibPhotoOpen(b.getAttribute("data-id")); });
    });
    Array.prototype.forEach.call(document.querySelectorAll(".ib-del"), function (b) {
      b.addEventListener("click", function () {
        if (!b.classList.contains("arm")) {   /* 한 번 더 눌러야 삭제 */
          b.classList.add("arm"); b.textContent = "한 번 더 누르면 삭제";
          setTimeout(function () { if (b.isConnected) { b.classList.remove("arm"); b.textContent = "삭제"; } }, 3000);
          return;
        }
        b.disabled = true; b.textContent = "삭제 중…";
        fetch(ATT_API + "?m=" + encodeURIComponent(SLUG) + "&a=inbody_del&id=" + encodeURIComponent(b.getAttribute("data-id")), { cache: "no-store" })
          .then(function (r) { return r.json(); })
          .then(function (j) { if (!j || !j.ok) throw new Error("del"); ibSet(j.inbody); ibRefresh(); })
          .catch(function () { b.disabled = false; b.classList.remove("arm"); b.textContent = "삭제"; attToast("인터넷 연결을 확인하고 다시 눌러주세요"); });
      });
    });
  }

  /* 몸변화 탭 (#body) — 2026-11-06 목표 탭에서 따로 뺌 */
  function ibSpark(list, k, good) {
    var W = 230, H = 46, n = list.length, vs = list.map(function (r) { return r[k]; });
    var lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs), pad = Math.max(0.6, (hi - lo) * 0.25);
    lo -= pad; hi += pad;
    var X = function (i) { return n === 1 ? W / 2 : 8 + i * (W - 16) / (n - 1); }, Y = function (v) { return 6 + (hi - v) / (hi - lo) * (H - 12); };
    var pts = list.map(function (r, i) { return X(i).toFixed(1) + "," + Y(r[k]).toFixed(1); }).join(" ");
    var dots = list.map(function (r, i) {
      var last = i === n - 1;
      return '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(r[k]).toFixed(1) + '" r="' + (last ? 4.5 : 3) + '" fill="' + (last ? "var(--key)" : "var(--primary)") + '"' + (last ? ' stroke="#fff" stroke-width="2"' : '') + '/>';
    }).join("");
    var d = vs[n - 1] - vs[0], cls = Math.abs(d) < 0.05 || !good ? "same" : (d > 0) === (good > 0) ? "up" : "down";
    return { svg: '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><polyline points="' + pts + '" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" opacity=".55"/>' + dots + '</svg>',
             d: d, cls: cls };
  }
  function ibTrend() {
    var a = (ibData || []).slice(-12);
    if (a.length < 2) return '<div class="ibtrend panel ib-trend-empty"><p>기록이 2개 이상 쌓이면 여기에 흐름 그래프가 나와요</p></div>';
    var rows = [["smm", "골격근량", "kg", 1], ["bfm", "체지방량", "kg", -1], ["pbf", "체지방률", "%", -1], ["w", "체중", "kg", 0]].map(function (r) {
      var sp = ibSpark(a, r[0], r[3]);
      return '<div class="ibt-row"><div class="ibt-l"><b>' + r[1] + '</b><small>' + ibFmt(a[a.length - 1][r[0]]) + r[2] + '</small></div>' + sp.svg +
        '<span class="ib-d ' + sp.cls + '">' + (Math.abs(sp.d) < 0.05 ? "그대로" : (sp.d > 0 ? "▲ +" : "▼ −") + ibFmt(Math.abs(sp.d)) + r[2]) + '</span></div>';
    }).join("");
    return '<div class="ibtrend panel"><p class="ibt-when">' + a[0].d.replace(/-/g, ". ") + ' → ' + a[a.length - 1].d.replace(/-/g, ". ") + ' · 기록 ' + a.length + '개</p>' + rows + '</div>';
  }
  function renderBody() {
    var h = '<a class="back" href="#log">← 기록</a><div class="hero"><div class="hero-main"><div class="hero-l"><div class="eyebrow">MY BODY <b>· 몸 변화 기록</b></div>' +
      '<h1>몸 변화 기록</h1><div class="en">' + esc(M.name) + ' 회원님 · 인바디로 지난달과 비교해요</div>' +
      '<div class="who"><strong>한 달에 한 번</strong><span>담당 ' + esc(TRN) + ' ' + TRL() + '</span></div></div></div>' +
      '<div class="keypoint"><small>KEY POINT</small><p>숫자는 한 달에 한 번! 같은 시간 · 같은 조건으로 재요</p></div></div>';
    h += '<section>' + head("01", "지난달 vs 이번 달", "결과지 찍어 올리면 비교해 드려요") + ibPanel() + '</section>';
    h += '<section>' + head("02", "한눈에 보는 흐름", "처음 기록부터 지금까지") + ibTrend() + '</section>';
    h += '<section>' + head("03", "정확하게 재는 법", "조건이 같아야 비교가 정확해요") + '<div class="panel ibtips"><ul>' +
      ['아침 공복, 화장실 다녀온 뒤에 재요', '운동 · 샤워 · 사우나 직후는 피해요', '양말 벗고, 시계 · 반지 같은 금속은 빼요', '매번 같은 시간대, 같은 기계로 재요', '결과지는 평평하게 놓고 위에서 정면으로 찍어요'].map(function (x) {
        return '<li>' + esc(x) + '</li>';
      }).join("") + '</ul></div></section>';
    return h + remember();
  }

  /* 로테이션 날 (2026-11-06, OO님 — 주말에 한 번 부위를 골라서): day.pick = ["mon","tue",…] 고를 수 있는 요일들, items 없음 */
  function pickList(d) {
    return '<div class="ex-list">' + d.pick.map(function (pk) {
      var pd = dayByKey(pk); if (!pd || pd.rest || !pd.items || !pd.items.length) return '';
      var mi = mainItem(pd);
      return '<a class="ex pick" href="#routine-' + pk + '"><div class="ex-top"><span class="ex-ic">' + img(iconOf(mi)) + '</span><div>' +
        '<h3>' + esc(pd.part) + '</h3><div class="meta">' + DAY_KO[pk] + '요일 루틴 그대로 · ' + pd.items.length + '종목</div>' +
        '<div class="tip">메인 ' + esc(mi.name) + ' →</div></div></div></a>';
    }).join("") + '</div>';
  }
  /* ---------------- 출석 배지 · 이번 달 근육 지도 · 월간 리포트 (2026-11-08 장동욱 "이렇게 ㄱㄱ")
     - (2026-11-17 리메이크 → 아래 '배지 리메이크' 주석 참고) 옛 배지 12개(목표 탭 03): 출석 횟수 1·10·30·50·100 / 연속 출석 3·7·14 / 새벽 운동(7시 전) / 주말 전사(토·일 둘 다) /
       첫 인바디(인바디 없는 회원은 연속 30) / 루틴 레벨업(루틴 v2 이상). 등급 Lv.1 한 줄 → Lv.2 두 겹 → Lv.3 금빛 월계수 → Lv.4 금빛+리본.
       새로 받으면 팝업 한 번(휴대폰 localStorage ptnote:<주소>:badges). 선생님 보기·안내서 보기에서는 팝업 안 띄움.
     - 근육 지도(목표 탭 04): 출석한 날의 루틴(요일 / 순환은 DAY 순서) 종목 이름 → 부위 8개. 1~2회 · 3~4회 · 5회 이상 진하게.
       그림은 assets/muscle/M|F/base.png + 부위별 투명 그림(_tools/make_musclemap.py).
     - 월간 리포트(#report, #report-YYYY-MM): 1080×1350 카드, 이미지로 저장(html2canvas). 매달 1~7일 홈에 '지난달 리포트 도착'.
       선생님 한마디는 data.js reports: { "2026-11": "문구" } (없으면 자동 한 줄 요약) */
  (function () {   /* 숫자용 글꼴 */
    if (document.getElementById("oswald")) return;
    var l = document.createElement("link"); l.id = "oswald"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap";
    document.head.appendChild(l);
  })();
  /* ---------------- 배지 (2026-11-17 2차 장동욱 "바프 배지 없애고, 브론즈~레전드 없애고, 배지는 늘리되 퀄리티 있게, 한 페이지로")
     - 배지 45개 = 출석·기록·성장 15개씩(5칸×3줄) (badgeList). 등급 없음 — 전부 같은 디자인(금테 + 검정 에나멜 + 금색 그림, bgIcon 84×72 SVG). 못 받은 건 연회색.
     - 나 탭 배지 칸은 한 칸(.bgx): 전체 막대 + 다음 배지 한 줄 + 탭(출석·기록·성장, bgTab) + 그 탭 배지만. 바프 완료 특별 배지는 없앰(journey.bpDone 안 씀).
     - 받은 날·누적 기록은 창고 mw:<주소>:bg = { on:{배지id:날짜}, m:{"YYYY-MM":[기록한 날, ✓ 수]}, n:[✓한 종목 이름], at } (bgSync·bgServer, 재배포 X)
     - 팝업(showBadgePop): 금빛 빛줄기 + 메달이 돌며 떨어짐 + 모은 배지 막대가 차오름. 이미 본 배지 id는 폰 ptnote:<주소>:badges. */
  var BG_CAT = [["att", "출석"], ["log", "기록"], ["grow", "성장"]];
  var BG_SEEN = "ptnote:" + SLUG + ":badges", bgTab = "att";
  var BG_IC = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5" stroke-width="2.8"/>',
    flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.4 1.3-4 2.6-5.2.3 1.6 1 2.6 2.1 3.2C11.3 8.6 11.2 5.6 12 3z"/>',
    sun: '<path d="M4 18h16"/><path d="M7 18a5 5 0 0 1 10 0"/><path d="M12 6v3"/><path d="M5.6 10.6l1.8 1.4"/><path d="M18.4 10.6l-1.8 1.4"/>',
    moon: '<path d="M19.5 14.2A7.8 7.8 0 0 1 9.8 4.5a7.8 7.8 0 1 0 9.7 9.7z"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16"/><path d="M8 3v4"/><path d="M16 3v4"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8-4.3-4.1 5.9-.8z"/>',
    pen: '<path d="M4.5 19.5l1-4.5L15.8 4.7a2.1 2.1 0 0 1 3 3L8.5 18z"/><path d="M13.8 6.7l3 3"/>',
    list: '<path d="M10 6.5h10M10 12h10M10 17.5h10"/><path d="M3.8 6.5l1.4 1.4 2.4-2.6M3.8 12l1.4 1.4 2.4-2.6M3.8 17.5l1.4 1.4 2.4-2.6"/>',
    layers: '<path d="M12 4l9 5-9 5-9-5z"/><path d="M3 13.5l9 5 9-5"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
    body: '<circle cx="12" cy="4.8" r="2.2"/><path d="M5 9.2h14"/><path d="M12 9.2v6"/><path d="M12 15.2l-3.6 5.3M12 15.2l3.6 5.3"/>',
    bell: '<path d="M2.5 9.5v5M5.5 7v10M18.5 7v10M21.5 9.5v5M5.5 12h13"/>',
    trend: '<path d="M4 17l5-5 4 3.2L20 7.5"/><path d="M15 7.5h5v5"/>',
    scale: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 10a3.5 3.5 0 0 1 7 0"/><path d="M12 10l1.6-1.6"/>',
    up: '<path d="M12 19V6"/><path d="M6.5 11.5L12 6l5.5 5.5"/><path d="M5 20h14"/>',
    book: '<path d="M4 5.5C6.5 4.3 9.5 4.3 12 6c2.5-1.7 5.5-1.7 8-.5V19c-2.5-1.2-5.5-1.2-8 .5-2.5-1.7-5.5-1.7-8-.5z"/><path d="M12 6v13.5"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z"/>'
  };
  (function (I) {   /* 2026-11-17 3차 "각자 다른 아이콘": 배지마다 그림이 다름 */
    I.flag = '<path d="M6 21V4"/><path d="M6 4.5h11l-2.5 4 2.5 4H6z"/>';
    I.stamp = '<circle cx="12" cy="12" r="8.8"/><path d="M12 7.6l1.4 2.9 3.2.4-2.3 2.2.6 3.1L12 14.7l-2.9 1.5.6-3.1-2.3-2.2 3.2-.4z"/>';
    I.medal = '<path d="M8.5 10.5L6 3h4l2 5"/><path d="M15.5 10.5L18 3h-4l-2 5"/><circle cx="12" cy="15" r="5.5"/>';
    I.trophy = '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5.5H4a3 3 0 0 0 3 4"/><path d="M17 5.5h3a3 3 0 0 1-3 4"/><path d="M12 14v3.5M9.5 17.5h5M8 20.5h8"/>';
    I.crown = '<path d="M4 17.5L2.5 8l5 4L12 5l4.5 7 5-4L20 17.5z"/><path d="M4.5 21h15"/>';
    I.flame = '<path d="M12 2.5c1 3.5 5.5 6 5.5 11a5.5 5.5 0 0 1-11 0c0-2.6 1.4-4.3 2.8-5.6.3 1.7 1 2.8 2.2 3.4C11.2 8.6 11.2 5.4 12 2.5z"/>';
    I.flame2 = I.flame + '<path d="M12 19.5a2.4 2.4 0 0 0 2.4-2.4c0-1.5-1.3-2.2-2.4-3.8-1.1 1.6-2.4 2.3-2.4 3.8a2.4 2.4 0 0 0 2.4 2.4z"/>';
    I.bolt = '<path d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z"/>';
    I.rocket = '<path d="M12 2.5c3.2 2.4 4.5 6 4.5 9.5l-1.5 4H9l-1.5-4c0-3.5 1.3-7.1 4.5-9.5z"/><circle cx="12" cy="9.5" r="1.7"/><path d="M7.5 13l-3 3.5 3.5-.5M16.5 13l3 3.5-3.5-.5M10.5 18.5l1.5 3 1.5-3"/>';
    I.moon = '<path d="M18.5 14.7A7.6 7.6 0 0 1 9.3 5.5a7.6 7.6 0 1 0 9.2 9.2z"/><path d="M17 3.5v3.4M15.3 5.2h3.4"/>';
    I.calw = I.cal + '<circle cx="9" cy="15" r="1.3"/><circle cx="15" cy="15" r="1.3"/>';
    I.calc = I.cal + '<path d="M8.5 14.6l2.5 2.5 4.5-4.6"/>';
    I.clip = '<rect x="5" y="4.5" width="14" height="16" rx="2.5"/><path d="M9 3h6v3.5H9z"/><path d="M8.5 11.5h7M8.5 15.5h5"/>';
    I.bookmark = '<path d="M6.5 3.5h11v17l-5.5-4-5.5 4z"/>';
    I.shield = '<path d="M12 2.8l7.5 2.7v6c0 4.6-3 8-7.5 9.7-4.5-1.7-7.5-5.1-7.5-9.700v-6z"/><path d="M8.5 11.8l2.5 2.5 4.5-4.6"/>';
    I.ccheck = '<circle cx="12" cy="12" r="8.8"/><path d="M8 12.3l2.8 2.8L16 9.7"/>';
    I.dcheck = '<path d="M2.5 12.5l4 4 8-8.5"/><path d="M10.5 15.5l1.5 1.5 9.5-10"/>';
    I.target = '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.2"/><circle cx="12" cy="12" r="1.5"/>';
    I.mount = '<path d="M2.5 19.5L9 7l4 7 2.5-3.5 6 9z"/><path d="M7.3 10.300l1.7 1.5 1.7-1.3"/>';
    I.compass = '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>';
    var r8 = '<circle cx="12" cy="12" r="2.2"/>'; for (var i = 0; i < 8; i++) r8 += '<circle cx="' + (12 + 8 * Math.cos(i * Math.PI / 4)).toFixed(1) + '" cy="' + (12 + 8 * Math.sin(i * Math.PI / 4)).toFixed(1) + '" r="1.7"/>';
    I.ring8 = r8;
    I.kettle = '<path d="M8.8 9.5V7a3.2 3.2 0 0 1 6.4 0v2.5"/><circle cx="12" cy="14.7" r="6.3"/>';
    I.barbell = '<path d="M2 12h20M5.5 6.5v11M8.5 8.5v7M18.5 6.5v11M15.5 8.5v7"/>';
    I.plate = '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.6"/>';
    I.chev2 = '<path d="M5 12.5l7-7 7 7"/><path d="M5 19.5l7-7 7 7"/>';
    I.stairs = '<path d="M3 20.5h4.5V16H12v-4.5h4.5V7H21"/>';
    I.cap = '<path d="M2 9.5L12 5l10 4.5-10 4.5z"/><path d="M6.5 12v4.5c1.5 1.6 3.4 2.3 5.5 2.300s4-.7 5.5-2.300V12M21.5 10v5"/>';
    I.award = '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5"/>';
    I.sprout = '<path d="M12 21v-9"/><path d="M12 13c0-4-2.5-6.5-7-6.5 0 4 2.5 6.5 7 6.5z"/><path d="M12 11c0-3.5 2-6 6.5-6 0 3.8-2 6-6.5 6z"/>';
    I.tree = '<path d="M12 21.5v-6"/><path d="M12 3l-5.5 7h3L5 15.5h14L14.5 10h3z"/>';
    I.gem = '<path d="M6.5 4h11l4 5.5L12 21 2.5 9.5z"/><path d="M2.5 9.5h19M9 4L7.5 9.5 12 21l4.5-11.5L15 4"/>';
  })(BG_IC);
  var BG_PAL = { R: ["#FF7A80", "#B00E17"], O: ["#FFB259", "#DD4A12"], Y: ["#FFD96E", "#D07F00"], G: ["#73E6A5", "#0C8A54"], T: ["#66E2D8", "#0A7785"], B: ["#74BCFF", "#1B48CC"],
    I: ["#9AA1FF", "#3729B4"], P: ["#C894FF", "#6520BF"], K: ["#FF97C7", "#C91867"], N: ["#5567D8", "#11164A"], S: ["#FFCB6E", "#EC4777"], D: ["#5C5C68", "#0C0C0F"] };
  var BG_ST = {   /* 배지 id: [색, 그림, 효과, 모양, 높은 단계(1~4 — 높을수록 그라데이션이 깊고 은은한 빛이 돎)] · 효과(shine 빛 지나감·pulse 빛 숨쉬기·spin 빛 링·rays 햇살·twinkle 별·flame 일렁·float 둥실·beat 두근)] */
    att1: ["R", "check", "shine", "circle", 1], att10: ["O", "flag", "pulse", "hex", 1], att30: ["K", "stamp", "shine", "scallop", 2], att50: ["P", "medal", "pulse shine", "oct", 2], att100: ["Y", "trophy", "rays shine", "shield", 3], att200: ["D", "crown", "spin twinkle", "star", 4],
    stk3: ["O", "flame", "flame", "diamond", 1], stk7: ["R", "flame2", "flame pulse", "scallop", 2], stk14: ["Y", "bolt", "beat pulse", "star", 3], stk30: ["I", "rocket", "float spin", "shield", 4],
    dawn: ["S", "sun", "rays", "oct", 2], night: ["N", "moon", "twinkle float", "circle", 2], wkend: ["T", "calw", "shine", "diamond", 2], mon20: ["G", "calc", "pulse", "hex", 3], perf: ["P", "star", "spin twinkle", "star", 4],
    log1: ["B", "pen", "shine", "circle", 1], logd10: ["T", "clip", "pulse", "diamond", 1], logd30: ["I", "book", "shine", "hex", 2], logd50: ["P", "bookmark", "pulse shine", "oct", 3], logd100: ["D", "shield", "spin twinkle", "shield", 4],
    chk100: ["G", "ccheck", "shine", "scallop", 1], chk300: ["T", "dcheck", "pulse", "circle", 2], chk500: ["B", "list", "shine pulse", "pent", 3], chk1000: ["R", "target", "spin", "star", 4],
    day5: ["O", "layers", "float", "hex", 1], day7: ["G", "mount", "shine", "pent", 2], var15: ["K", "grid", "pulse", "diamond", 2], var30: ["N", "compass", "twinkle shine", "oct", 3], body6: ["G", "body", "beat", "shield", 3], body8: ["Y", "ring8", "rays twinkle", "scallop", 4],
    lf1: ["T", "kettle", "shine", "circle", 1], lf3: ["B", "bell", "beat", "pent", 2], lf5: ["I", "barbell", "pulse shine", "hex", 3], lf10: ["D", "plate", "spin", "oct", 4],
    pc30: ["G", "trend", "shine", "diamond", 3], pc50: ["Y", "chev2", "float pulse", "star", 4], pw1: ["P", "up", "float", "shield", 2], pw4: ["K", "stairs", "shine pulse", "scallop", 3],
    fv3: ["B", "book", "shine", "circle", 1], fv5: ["B", "cap", "shine", "pent", 2], fv10: ["P", "award", "twinkle pulse", "oct", 3], ib1: ["T", "scale", "pulse", "hex", 1],
    day30: ["G", "sprout", "float", "circle", 1], day100: ["K", "heart", "beat pulse", "scallop", 2], day200: ["T", "tree", "shine", "pent", 3], day365: ["D", "gem", "spin twinkle rays", "star", 4]
  };
  BG_IC.camera = '<path d="M3.5 8h3.3L8.5 5.5h7L17.2 8h3.3v11.5h-17z"/><circle cx="12" cy="13.3" r="3.7"/><path d="M12 11.8l.5 1 1.1.2-.8.8.2 1.1-1-.5-1 .5.2-1.1-.8-.8 1.1-.2z"/>';
  var BG_LAU = '<g transform="translate(16 55) rotate(45)"><ellipse rx="3" ry="6.5"/></g><g transform="translate(7.5 42) rotate(20)"><ellipse rx="3" ry="6.5"/></g>' +
    '<g transform="translate(5.5 27) rotate(-5)"><ellipse rx="3" ry="6.5"/></g><g transform="translate(10 13) rotate(-30)"><ellipse rx="3" ry="6"/></g>' +
    '<g transform="translate(68 55) rotate(-45)"><ellipse rx="3" ry="6.5"/></g><g transform="translate(76.5 42) rotate(-20)"><ellipse rx="3" ry="6.5"/></g>' +
    '<g transform="translate(78.5 27) rotate(5)"><ellipse rx="3" ry="6.5"/></g><g transform="translate(74 13) rotate(30)"><ellipse rx="3" ry="6"/></g>';
  function bgMix(a, b, t) { var o = "#"; for (var i = 1; i < 7; i += 2) { var x = Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t); o += (x < 16 ? "0" : "") + x.toString(16); } return o; }
  var BG_SPK = 'M7 0 L8.4 5.6 L14 7 L8.4 8.4 L7 14 L5.6 8.4 L0 7 L5.6 5.6 Z';
  function bgRgb(h) { return parseInt(h.slice(1, 3), 16) + "," + parseInt(h.slice(3, 5), 16) + "," + parseInt(h.slice(5, 7), 16); }
  function md(k) { var p = k.split("-"); return (+p[1]) + ". " + pad2(+p[2]); }
  function ymOf(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1); }
  function ymDate(ym) { var p = ym.split("-"); return new Date(+p[0], +p[1] - 1, 1); }
  function ymAdd(ym, n) { var d = ymDate(ym); return ymOf(new Date(d.getFullYear(), d.getMonth() + n, 1)); }

  function attHistory() {   /* 날마다 연속 출석 수를 따라감 → 연속 n회가 처음 된 날, 달마다 최고 연속 */
    var a = attLoad(), st = startDate(), today = ymd(new Date());
    var res = { first: {}, monthBest: {}, best: 0 };
    if (!a.length || !st) return res;
    var on = {}; a.forEach(function (k) { on[k] = 1; });
    var d = new Date(st.getFullYear(), st.getMonth(), st.getDate()), run = 0, gap = 0;
    for (var i = 0; i < 1500 && ymd(d) <= today; i++, d.setDate(d.getDate() + 1)) {
      var k = ymd(d);
      if (on[k]) {
        run++; gap = 0;
        if (!res.first[run]) res.first[run] = k;
        var mo = k.slice(0, 7);
        if (run > (res.monthBest[mo] || 0)) res.monthBest[mo] = run;
        if (run > res.best) res.best = run;
      } else if (k === today) { /* 오늘은 아직 안 끝남 */ }
      else if (ROT) { if (++gap > 2) run = 0; }
      else if (isWorkoutDay(d)) run = 0;
    }
    return res;
  }
  /* ---- 누적 기록·받은 날 (창고 mw:<주소>:bg) */
  var BGS_LS = "ptnote:" + SLUG + ":bgs", BGS = null, BGS_T = 0;
  try { BGS = JSON.parse(localStorage.getItem(BGS_LS) || "null"); } catch (e) {}
  /* 2026-11-17 장동욱 "내가 루틴 고치면 업적이 완료돼 — 구조적으로 바꾸자": 배지는 회원님이 한 일로만 받음
     · 증량·무게% = 회원님이 ✓한 무게(x[종목]=[처음 ✓ kg, 가장 무거운 ✓ kg])끼리 비교 — 루틴 무게를 올려도 회원님이 그 무게로 ✓해야 받음
     · '루틴 레벨업'·'복습지 개수'(선생님이 올리면 생기던 것) 없앰 → '완벽한 한 주'(출석)·'복습지 열어 보기'(회원님이 연 것)
     · 선생님 폰(COACH_MODE)에선 창고에 절대 안 올림 · 선생님 '배지 초기화' = 창고 rs(초기화 시각) → 회원 폰이 받으면 받은 배지를 비우고 다시 계산 */
  function bgsObj() {
    if (!BGS || typeof BGS !== "object") BGS = { on: {}, m: {}, x: {}, at: 0 };
    BGS.on = BGS.on || {}; BGS.m = BGS.m || {}; BGS.x = BGS.x || {};
    if (BGS.n) { BGS.n.forEach(function (k) { if (!BGS.x[k]) BGS.x[k] = [0, 0]; }); delete BGS.n; }
    return BGS;
  }
  function bgsSave(push) {
    var o = bgsObj(); o.at = Date.now();
    try { localStorage.setItem(BGS_LS, JSON.stringify(o)); } catch (e) {}
    if (!push || DEMO || !ATT_API || COACH_MODE) return;
    clearTimeout(BGS_T);
    BGS_T = setTimeout(function () { rtPost({ a: "kv_set", k: "mw:" + SLUG + ":bg", v: BGS }).catch(function () {}); }, 1500);
  }
  function bgServer(kv) {
    var v = kv && kv["mw:" + SLUG + ":bg"];
    if (!v || typeof v !== "object") { if (BGS && Object.keys(BGS.on || {}).length) bgsSave(true); return; }
    var o = bgsObj(), ch = false, more = false, k;
    if ((v.rs || 0) > (o.rs || 0)) { o.on = {}; o.rs = v.rs; ch = true; }   /* 선생님이 배지 초기화 */
    else if ((o.rs || 0) > (v.rs || 0)) more = true;
    for (k in (v.on || {})) if (!o.on[k] || v.on[k] < o.on[k]) { o.on[k] = v.on[k]; ch = true; }
    for (k in o.on) if (!(v.on || {})[k]) more = true;
    for (k in (v.m || {})) {
      var a = v.m[k] || [0, 0], b = o.m[k] || [0, 0];
      if (a[0] > b[0] || a[1] > b[1]) { o.m[k] = [Math.max(a[0], b[0]), Math.max(a[1], b[1])]; ch = true; }
    }
    (v.n || []).forEach(function (x) { if (!o.x[x] && Object.keys(o.x).length < 60) { o.x[x] = [0, 0]; ch = true; } });
    for (k in (v.x || {})) {
      var p = v.x[k] || [0, 0], q = o.x[k];
      if (!q) { if (Object.keys(o.x).length < 60) { o.x[k] = p.slice(); ch = true; } continue; }
      if ((p[0] > 0 && (!q[0] || p[0] < q[0])) || p[1] > q[1]) { o.x[k] = [p[0] > 0 && (!q[0] || p[0] < q[0]) ? p[0] : q[0], Math.max(p[1], q[1])]; ch = true; }
    }
    if (ch || more) bgsSave(more);
  }
  function bgSync() {   /* 운동 기록(LG) → 달마다 [기록한 날, ✓ 수]·종목 이름을 누적 (큰 값 유지) */
    var o = bgsObj(), L = (LG && LG.d) || {}, mm = {}, ch = false;
    Object.keys(L).forEach(function (k) {
      var t = L[k] || []; if (!t.length) return;
      var ym = k.slice(0, 7); mm[ym] = mm[ym] || [0, 0]; mm[ym][0]++; mm[ym][1] += t.length;
      t.forEach(function (x) {   /* 종목 이름·회원님이 ✓한 무게 */
        var nm = x[0], kg = +x[1] || 0; if (!nm) return;
        var q = o.x[nm];
        if (!q) { if (Object.keys(o.x).length >= 60) return; q = o.x[nm] = [0, 0]; ch = true; }
        var f0 = LG && LG.f && +LG.f[nm] > 0 ? +LG.f[nm] : kg;
        if (kg > 0 && !q[0]) { q[0] = Math.min(f0 || kg, kg); ch = true; }
        if (kg > q[1]) { q[1] = kg; ch = true; }
      });
    });
    for (var ym in mm) { var b = o.m[ym] || [0, 0]; if (mm[ym][0] > b[0] || mm[ym][1] > b[1]) { o.m[ym] = [Math.max(mm[ym][0], b[0]), Math.max(mm[ym][1], b[1])]; ch = true; } }
    var tot = { days: 0, chk: 0, names: Object.keys(o.x).length };
    for (ym in o.m) { tot.days += o.m[ym][0]; tot.chk += o.m[ym][1]; }
    return { tot: tot, ch: ch };
  }


  function badgeList() {
    var a = attLoad().slice().sort(), hs = attHistory(), cur = attStreak(attLoad()), L = [], today = ymd(new Date());
    var S = bgSync(), o = bgsObj(), T = S.tot, LGd = (LG && LG.d) || {}, lgKeys = Object.keys(LGd).filter(function (k) { return LGd[k] && LGd[k].length; }).sort();
    function add(cat, id, label, ic, sm, on, have, goal, how, desc, x) {
      var b = { id: id, cat: cat, label: label, ic: ic, sm: sm, on: on, have: have, goal: goal, how: how, desc: desc };
      if (x) for (var k in x) b[k] = x[k];
      L.push(b);
    }
    function q(ok) { return ok ? "?" : null; }
    /* 출석 16 */
    [1, 10, 30, 50, 100, 200].forEach(function (n) {
      add("att", "att" + n, n === 1 ? "첫 출석" : "출석 " + n + "회", n === 1 ? "check" : null, null, a[n - 1] || null, a.length, n, "출석 " + n + "번이면 받아요",
        n === 1 ? "PT 노트 첫 출석 체크! 시작이 반이에요." : "출석 " + n + "번 달성! 꾸준함이 몸을 바꿔요.", n === 1 ? null : { big: n });
    });
    [3, 7, 14, 30].forEach(function (n) {
      add("att", "stk" + n, "연속 " + n + "회", "flame", n, hs.first[n] || null, cur, n, "운동하는 날 " + n + "번 연속으로 오면 받아요", "운동하는 날 " + n + "번 연속으로 한 번도 안 빠졌어요.");
    });
    var dawn = null, night = null, wk = null, m20 = null, mc20 = {}, m20have = 0;
    a.forEach(function (k) {
      if (!dawn && attTimes[k] && attTimes[k] < "07:00") dawn = k;
      if (!night && attTimes[k] && attTimes[k] >= "22:00") night = k;
      var p = k.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
      if (!wk && d.getDay() === 0) { var s = new Date(d); s.setDate(s.getDate() - 1); if (attHas(a, ymd(s))) wk = k; }
      var ym = k.slice(0, 7); mc20[ym] = (mc20[ym] || 0) + 1;
      if (mc20[ym] > m20have) m20have = mc20[ym];
      if (!m20 && mc20[ym] === 20) m20 = k;
    });
    add("att", "dawn", "새벽 운동", "sun", null, dawn, dawn ? 1 : 0, 0, "아침 7시 전에 출석하면 받아요", "아침 7시 전에 출석했어요. 하루를 먼저 이긴 사람!", { hint: "7시 전 출석" });
    add("att", "night", "심야 운동", "moon", null, night, night ? 1 : 0, 0, "밤 10시 넘어 출석하면 받아요", "밤 10시가 넘어도 운동하러 왔어요. 이 정도면 진심!", { hint: "밤 10시 이후" });
    add("att", "wkend", "주말 전사", "cal", null, wk, wk ? 1 : 0, 0, "토요일·일요일 둘 다 오면 받아요", "토·일 둘 다 나왔어요. 주말에도 멈추지 않아요!", { hint: "토·일 둘 다" });
    add("att", "mon20", "한 달 20회", "cal", 20, m20, m20have, 20, "한 달에 20번 출석하면 받아요", "한 달에 20번 출석! 헬스장이 집 같아졌어요.");
    var perf = null, st0 = startDate();   /* 개근: 다 끝난 달 중 운동하는 날을 하나도 안 빠진 달 */
    if (st0 && a.length) {
      var ym = ymOf(st0), nowYm = ymOf(new Date());
      for (var g = 0; g < 40 && ym < nowYm; g++, ym = ymAdd(ym, 1)) {
        var d0 = ymDate(ym), d1 = new Date(d0.getFullYear(), d0.getMonth() + 1, 0), r = attStats(a, d0, d1);
        if (r.plan >= 4 && r.done >= r.plan) { var inM = a.filter(function (k) { return k.slice(0, 7) === ym; }); perf = inM[inM.length - 1] || ymd(d1); break; }
      }
    }
    add("att", "perf", "한 달 개근", "star", null, perf, perf ? 1 : 0, 0, "한 달 동안 운동하는 날을 하나도 안 빠지면 받아요", "한 달 출석률 100%! 이건 진짜 아무나 못 해요.", { hint: "한 달 100%" });

    /* 기록 12 */
    function lgNth(n) { return lgKeys[n - 1] || q(T.days >= n); }
    function chkNth(n) { var c = 0; for (var i = 0; i < lgKeys.length; i++) { c += LGd[lgKeys[i]].length; if (c >= n) return lgKeys[i]; } return q(T.chk >= n); }
    function dayN(n) { var f = null; lgKeys.some(function (k) { if (LGd[k].length >= n) { f = k; return true; } return false; }); return f; }
    var dayMax = lgKeys.reduce(function (m, k) { return Math.max(m, LGd[k].length); }, 0);
    add("log", "log1", "첫 운동 기록", "pen", null, lgNth(1), T.days, 1, "운동 탭에서 끝낸 종목에 ✓하면 받아요", "첫 종목 ✓! 기록하는 사람이 결국 바뀌어요.");
    [[10, "운동 기록 10일째. 이제 습관이 되어가요!"], [30, "기록 30일! 한 달 치 운동이 다 남아 있어요."], [50, "기록 50일! 운동 일지가 두툼해졌어요."], [100, "기록 100일. 이 정도면 운동이 생활이에요."]].forEach(function (v) {
      add("log", "logd" + v[0], "기록 " + v[0] + "일", "pen", v[0], lgNth(v[0]), T.days, v[0], "✓한 날이 " + v[0] + "일이면 받아요", v[1]);
    });
    [[100, "종목 ✓ 100번! 벌써 이만큼 해냈어요."], [300, "종목 ✓ 300번! 쌓인 세트만큼 몸이 달라졌어요."], [500, "종목 ✓ 500번! 꾸준함이 숫자로 보여요."], [1000, "종목 ✓ 1000번. 말이 필요 없어요, 존경합니다."]].forEach(function (v) {
      add("log", "chk" + v[0], "종목 ✓ " + v[0], "list", v[0], chkNth(v[0]), T.chk, v[0], "종목 ✓를 모두 합쳐 " + v[0] + "번 하면 받아요", v[1]);
    });
    add("log", "day5", "하루 5종목", "layers", 5, dayN(5), dayMax, 5, "하루에 종목 5개를 ✓하면 받아요", "하루에 5종목 완주! 오늘 운동 제대로 했어요.");
    add("log", "day7", "하루 7종목", "layers", 7, dayN(7), dayMax, 7, "하루에 종목 7개를 ✓하면 받아요", "하루에 7종목! 오늘은 불태웠어요.");
    add("log", "var15", "종목 15가지", "grid", 15, q(T.names >= 15), T.names, 15, "서로 다른 종목 15가지를 ✓하면 받아요", "15가지 종목을 해봤어요. 몸 구석구석 다 써봤어요!");
    add("log", "var30", "종목 30가지", "grid", 30, q(T.names >= 30), T.names, 30, "서로 다른 종목 30가지를 ✓하면 받아요", "30가지 종목! 헬스장 기구는 거의 다 내 거예요.");
    var full = null, fullHave = 0;
    if (st0) {
      for (var ym2 = ymOf(st0), g2 = 0; g2 < 40 && ym2 <= ymOf(new Date()); g2++, ym2 = ymAdd(ym2, 1)) {
        var mc = muscleCounts(ym2).cnt, n6 = MG.filter(function (x) { return mc[x[0]] > 0; }).length;
        if (n6 > fullHave) fullHave = n6;
        if (n6 >= 6 && !full) full = ym2 === ymOf(new Date()) ? today : ymd(new Date(ymDate(ym2).getFullYear(), ymDate(ym2).getMonth() + 1, 0));
      }
    }
    add("log", "body6", "전신 정복", "body", null, full, fullHave, 6, "한 달 근육 지도에 부위 6곳 이상 불이 들어오면 받아요", "한 달에 6부위 이상! 근육 지도가 꽉 찼어요.");
    add("log", "body8", "올 클리어", "body", 8, q(fullHave >= 8), fullHave, 8, "한 달 근육 지도 8부위에 전부 불이 들어오면 받아요", "8부위 전부! 빠진 곳 없이 온몸을 다 썼어요.");

    /* 성장 12 */
    var up = 0, best = 0;   /* 회원님이 ✓한 무게끼리: 처음 ✓ kg → 가장 무거운 ✓ kg */
    Object.keys(o.x).forEach(function (k) { var p = o.x[k]; if (p[0] > 0 && p[1] > p[0]) { up++; best = Math.max(best, (p[1] - p[0]) / p[0]); } });
    add("grow", "lf1", "첫 증량", "bell", null, q(up >= 1), up, 1, "처음 ✓한 무게보다 무겁게 ✓한 종목이 생기면 받아요", "처음보다 무거운 무게를 들었어요. 몸이 답하기 시작했어요!");
    add("grow", "lf3", "증량 3종목", "bell", 3, q(up >= 3), up, 3, "처음보다 무겁게 ✓한 종목이 3개면 받아요", "3종목 증량! 힘이 붙는 게 느껴지죠?");
    add("grow", "lf5", "증량 5종목", "bell", 5, q(up >= 5), up, 5, "처음보다 무겁게 ✓한 종목이 5개면 받아요", "5종목이나 무게가 올랐어요. 전체적으로 힘이 붙었어요.");
    add("grow", "lf10", "증량 10종목", "bell", 10, q(up >= 10), up, 10, "처음보다 무겁게 ✓한 종목이 10개면 받아요", "10종목 증량! 온몸이 강해졌어요.");
    var bp = Math.round(best * 100);
    add("grow", "pc30", "무게 +30%", "trend", "30%", q(best >= 0.3), bp, 30, "한 종목이라도 처음 ✓한 무게보다 30% 무겁게 ✓하면 받아요", "처음보다 30% 무거워진 종목이 생겼어요. 완전 다른 사람!", { unit: "%" });
    add("grow", "pc50", "무게 +50%", "trend", "50%", q(best >= 0.5), bp, 50, "한 종목이라도 처음 ✓한 무게보다 50% 무겁게 ✓하면 받아요", "처음의 1.5배를 들어요. 이건 진짜 성장이에요!", { unit: "%" });
    var pw = [], pwN = 0;   /* 완벽한 한 주: 다 끝난 주(월~일) 중 운동하는 날을 다 출석한 주 */
    if (st0 && a.length) {
      var w0 = new Date(st0); w0.setDate(w0.getDate() - ((w0.getDay() + 6) % 7));
      var nowD = new Date(), wNow = new Date(nowD.getFullYear(), nowD.getMonth(), nowD.getDate()); wNow.setDate(wNow.getDate() - ((wNow.getDay() + 6) % 7));
      for (var g3 = 0; g3 < 120 && w0 < wNow; g3++) {
        var w1 = new Date(w0); w1.setDate(w1.getDate() + 6);
        var rw = attStats(a, w0, w1);
        if (rw.plan >= 2 && rw.done >= rw.plan) { pwN++; var inW = a.filter(function (k) { return k >= ymd(w0) && k <= ymd(w1); }); pw.push(inW[inW.length - 1] || ymd(w1)); }
        w0.setDate(w0.getDate() + 7);
      }
    }
    add("grow", "pw1", "완벽한 한 주", "up", null, pw[0] || null, pwN, 1, "한 주 동안 운동하는 날을 하나도 안 빠지면 받아요", "이번 주 계획을 100% 지켰어요. 이게 쌓이면 몸이 바뀌어요!");
    add("grow", "pw4", "완벽한 4주", "up", 4, pw[3] || null, pwN, 4, "운동하는 날을 다 지킨 주가 4번 쌓이면 받아요", "완벽한 주가 4번! 한 달을 꽉 채운 셈이에요.");
    var fids = (M.forms || []).map(function (f) { return f.id; }), fo = lsArr(FOPEN_KEY).filter(function (id) { return fids.indexOf(id) >= 0; }).length;
    if (!COACH_MODE) o.fo = Math.max(o.fo || 0, fo); fo = Math.max(fo, COACH_MODE ? 0 : (o.fo || 0));
    add("grow", "fv5", "자세 공부 5개", "book", 5, q(fo >= 5), fo, 5, "자세 복습지를 5개 열어 보면 받아요", "복습지 5개를 직접 봤어요. 배운 동작이 내 것이 되고 있어요.");
    add("grow", "fv10", "자세 공부 10개", "book", 10, q(fo >= 10), fo, 10, "자세 복습지를 10개 열어 보면 받아요", "복습지 10개! 이제 웬만한 동작은 다 알아요.");
    if (IB_ON) {
      var ibs = (ibData || []).map(function (r) { return r.d; }).sort();
      add("grow", "ib1", "첫 인바디", "scale", null, ibs[0] || null, ibs.length, 1, "몸변화 탭에서 인바디를 올리면 받아요", "첫 인바디 기록 완료! 이제 변화를 숫자로 봐요.");
    } else add("grow", "fv3", "자세 공부 3개", "book", 3, q(fo >= 3), fo, 3, "자세 복습지를 3개 열어 보면 받아요", "복습지 3개를 직접 봤어요. 차근차근 배워 가고 있어요.");
    var days = st0 ? Math.floor((new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) - st0) / 86400000) + 1 : 0;
    function dayOn(n) { if (!st0 || days < n) return null; var d = new Date(st0); d.setDate(d.getDate() + n - 1); return ymd(d); }
    add("grow", "day30", "함께 30일", "heart", 30, dayOn(30), Math.max(0, days), 30, "PT 시작하고 30일이 되면 받아요", "첫 한 달 완주! 제일 어려운 구간을 넘었어요.", { unit: "일" });
    add("grow", "day100", "함께 100일", "heart", 100, dayOn(100), Math.max(0, days), 100, "PT 시작하고 100일이 되면 받아요", "선생님과 함께한 지 100일! 여기까지 온 것만으로 대단해요.", { unit: "일" });
    var bpB = bpBadge();
    if (!bpB) add("grow", "day200", "함께 200일", "heart", 200, dayOn(200), Math.max(0, days), 200, "PT 시작하고 200일이 되면 받아요", "200일째 함께하고 있어요. 운동이 일상이 됐어요.", { unit: "일" });
    add("grow", "day365", "함께 1년", "heart", 365, dayOn(365), Math.max(0, days), 365, "PT 시작하고 1년이 되면 받아요", "1년 완주. 처음의 나와는 완전히 다른 사람이에요!", { unit: "일" });

    if (bpB) L.push(bpB);
    var ids = {}; L.forEach(function (b) { ids[b.id] = 1; });
    for (var ok in o.on) if (!ids[ok] && ok !== "bpdone") { delete o.on[ok]; S.ch = true; }   /* 없어진 배지(루틴 레벨업 등) 기록 지우기 */
    /* 바프 회원은 '함께 200일' 자리에 전설 배지 '바프 완료' (성장 칸 맨 끝) */
    /* 받은 날 정리: 기록된 날짜가 있으면 그게 우선(먼저 받은 날), 날짜를 모르면("?") 오늘 · 한 번 받은 건 계속 받은 상태 */
    var ch = S.ch;
    L.forEach(function (b) {
      var stl = BG_ST[b.id] || ["D", "star", "shine"];
      if (!b.sp) b.col = BG_PAL[stl[0]]; if (!b.sp) { b.ic = stl[1]; b.fx = stl[2]; b.sh = stl[3] || "circle"; b.lv = stl[4] || 1; }
      if (b.big) { b.sm = b.big; b.big = null; }
      var saved = o.on[b.id];
      if (b.on === "?") b.on = saved || today;
      if (!b.on && saved) b.on = saved;
      if (b.on && b.on > today) b.on = today;
      if (b.on && (!saved || b.on < saved)) { o.on[b.id] = b.on; ch = true; }
      if (b.on && saved && saved < b.on) b.on = saved;
      if (b.on && b.goal) b.have = Math.max(b.have || 0, b.goal);
    });
    if (ch) bgsSave(!COACH_MODE);
    return L;
  }

  /* ---- 메달 그림: 금테 + 검정 에나멜 + 금색 그림 (전부 같은 디자인) */
  var bgUid = 0;
  /* 2026-11-17 4차 "3D 효과, 배지 모양도 다르게": 모양 8가지(원·육각·팔각·오각·마름모·방패·별·꽃 도장) + 두께(옆면)·빗면·광택 + 좌우로 살짝 도는 3D */
  function bgPts(n, r, rot, cy, r2) {
    var p = [], m = r2 ? n * 2 : n;
    for (var i = 0; i < m; i++) { var rr = r2 && i % 2 ? r2 : r, q = (rot + i * 360 / m) * Math.PI / 180; p.push((42 + rr * Math.cos(q)).toFixed(1) + "," + (cy + rr * Math.sin(q)).toFixed(1)); }
    return p.join(" ");
  }
  function bgSh(sh, r, cy, paint, extra) {   /* 모양 하나 그리기 (r = 원 기준 반지름) */
    var at = ' fill="' + paint + '"' + (extra || ""), rj = ' stroke="' + paint + '" stroke-width="2.4" stroke-linejoin="round"';
    if (paint === "none") rj = "";
    if (sh === "hex") return '<polygon points="' + bgPts(6, r * 1.02, -90, cy) + '"' + at + rj + '/>';
    if (sh === "oct") return '<polygon points="' + bgPts(8, r * 1.01, 22.5, cy) + '"' + at + rj + '/>';
    if (sh === "pent") return '<polygon points="' + bgPts(5, r * 1.04, -90, cy + r * 0.05) + '"' + at + rj + '/>';
    if (sh === "diamond") return '<polygon points="' + bgPts(4, r * 1.1, -90, cy) + '"' + at + rj + '/>';
    if (sh === "star") return '<polygon points="' + bgPts(8, r * 1.07, -90, cy, r * 0.87) + '"' + at + rj + '/>';
    if (sh === "scallop") { var p = []; for (var i = 0; i < 72; i++) { var q = i * Math.PI / 36, rr = r * (1.0 + 0.06 * Math.cos(10 * q)); p.push((42 + rr * Math.cos(q)).toFixed(1) + "," + (cy + rr * Math.sin(q)).toFixed(1)); }
      return '<polygon points="' + p.join(" ") + '"' + at + '/>'; }
    if (sh === "shield") { var x = function (k) { return (42 + k * r).toFixed(1); }, y = function (k) { return (cy + k * r).toFixed(1); };
      return '<path d="M' + x(0) + ' ' + y(-1.02) + 'L' + x(.92) + ' ' + y(-.74) + 'V' + y(.08) + 'C' + x(.92) + ' ' + y(.6) + ' ' + x(.45) + ' ' + y(.88) + ' ' + x(0) + ' ' + y(1.06) +
        'C' + x(-.45) + ' ' + y(.88) + ' ' + x(-.92) + ' ' + y(.6) + ' ' + x(-.92) + ' ' + y(.08) + 'V' + y(-.74) + 'Z"' + at + rj + '/>'; }
    return '<circle cx="42" cy="' + cy + '" r="' + r + '"' + at + '/>';
  }
  /* 2026-11-17 7차 장동욱 "에나멜 핀 느낌으로 리메이크": 금색 가는 선(금선)으로 나눈 칸마다 쨍한 단색을 채운 칠보·에나멜 핀 스타일
     · 색 3가지(BG_EN: 바탕·둘째·셋째) + 무늬 6가지(배지 id로 고름) · 높은 단계일수록 칸이 많아짐 · 그림은 금선 테두리 + 크림색 선 */
  var BG_EN = { R: ["#E8263C", "#FF8FA3", "#FFD53D"], O: ["#FF8A1F", "#FFD53D", "#E8263C"], Y: ["#FFD53D", "#FF8A1F", "#17245C"], G: ["#1FA85A", "#C8F03C", "#2EC8F0"],
    T: ["#14B8A6", "#C8F03C", "#17245C"], B: ["#2E7BF0", "#2EC8F0", "#C8F03C"], I: ["#3B2FC9", "#2EC8F0", "#FF3D7F"], P: ["#6A2BD9", "#FF3D7F", "#FFD53D"],
    K: ["#FF3D7F", "#FFB3D1", "#6A2BD9"], N: ["#17245C", "#2E7BF0", "#FFD53D"], S: ["#FF8A1F", "#FF3D7F", "#FFD53D"], D: ["#17171C", "#E8263C", "#FFD53D"], SP: ["#F6CF58", "#17171C", "#FFF3B0"] };
  var BG_OFF = ["#F4F2F2", "#E9E5E5", "#DEDADA"];
  function bgFields(pat, n, c, CY, R, wire) {   /* 금선으로 나눈 색 칸들 (배지 모양으로 잘라서 씀) */
    var W = ' stroke="' + wire + '" stroke-width="1.3"', X = 42, o = "";
    function ci(dx, dy, r, f) { return '<circle cx="' + (X + dx * R).toFixed(1) + '" cy="' + (CY + dy * R).toFixed(1) + '" r="' + (r * R).toFixed(1) + '" fill="' + f + '"' + W + '/>'; }
    function po(pts, f) { return '<polygon points="' + pts.map(function (q) { return (X + q[0] * R).toFixed(1) + "," + (CY + q[1] * R).toFixed(1); }).join(" ") + '" fill="' + f + '"' + W + '/>'; }
    if (pat === 0) { o += ci(0, 0, .68, c[1]); if (n >= 2) o += ci(0, 0, .4, c[2]); }
    else if (pat === 1) { o += po([[-1.4, 1.1], [1.1, -1.4], [1.5, 1.5]], c[1]); if (n >= 2) o += po([[-.5, 1.5], [1.5, -.5], [1.5, 1.5]], c[2]); if (n >= 3) o += po([[-1.5, -.45], [-.45, -1.5], [-1.5, -1.5]], c[2]); }
    else if (pat === 2) { o += ci(-.5, 1.15, .95, c[1]); if (n >= 2) o += ci(.7, 1.25, .85, c[2]); if (n >= 3) o += ci(.5, -.52, .2, c[2]); }
    else if (pat === 3) { o += ci(-.95, 0, .95, c[1]); if (n >= 2) o += ci(1, .2, .82, c[2]); }
    else if (pat === 4) { o += po([[-1.5, .28], [1.5, .28], [1.5, 1.5], [-1.5, 1.5]], c[1]); if (n >= 2) o += po([[-1.5, .66], [1.5, .66], [1.5, 1.5], [-1.5, 1.5]], c[2]); if (n >= 3) o += po([[-1.5, -1.5], [1.5, -1.5], [1.5, -.66], [-1.5, -.66]], c[2]); }
    else { o += ci(0, -.8, .72, c[1]); if (n >= 2) o += ci(-.75, .62, .62, c[2]); if (n >= 3) o += ci(.75, .62, .62, c[1]); }
    return o;
  }
  function bgIcon(b) {   /* 84×72 에나멜 핀 */
    var on = !!b.on, u = "bx" + (++bgUid), sh = b.sh || "circle", lv = b.lv || 1, sp = !!b.sp, fx = on ? " " + (b.fx || "") + " " : " ", CY = 30;
    function has(k) { return fx.indexOf(" " + k + " ") >= 0; }
    var key = "D"; if (!sp && b.col) for (var k in BG_PAL) if (BG_PAL[k] === b.col) key = k;
    var c = on ? (sp ? BG_EN.SP : BG_EN[key]) : BG_OFF, hsh = 0; for (var i = 0; i < b.id.length; i++) hsh = (hsh * 31 + b.id.charCodeAt(i)) % 997;
    var R = sh === "circle" || sh === "scallop" ? 29 : 27.6, RI = R * 0.925, wire = on ? "url(#" + u + "w)" : "#CBC6C6";
    var s = '<svg class="bdg-s" viewBox="0 0 84 72" width="84" height="72" aria-hidden="true"><defs>' +
      '<linearGradient id="' + u + 'w" x1=".1" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="#FFF6C8"/><stop offset=".35" stop-color="#EFC452"/><stop offset=".6" stop-color="#B8860B"/><stop offset=".8" stop-color="#F7D774"/><stop offset="1" stop-color="#8A5A00"/></linearGradient>' +
      '<linearGradient id="' + u + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      (on && lv >= 3 ? '<linearGradient id="' + u + 'o" gradientUnits="userSpaceOnUse" x1="18" y1="6" x2="66" y2="54"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".36" stop-color="#fff" stop-opacity="0"/>' +
        '<stop offset=".64" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/>' +
        '<animateTransform attributeName="gradientTransform" type="rotate" from="0 42 30" to="360 42 30" dur="' + (lv === 4 ? 7 : 10) + 's" repeatCount="indefinite"/></linearGradient>' : '') +
      '<clipPath id="' + u + 'c">' + bgSh(sh, RI, CY, "#000") + '</clipPath></defs>';
    if (on) {
      if (has("rays")) s += '<polygon class="bdx-rays" points="' + bgPts(14, 38, 0, CY, 30.5) + '" fill="' + (sp ? "#F3C94F" : c[1]) + '" opacity=".9"/>';
      if (sp) s += '<g fill="' + wire + '" transform="translate(0 -2)">' + BG_LAU + '</g>';
      s += '<ellipse cx="42" cy="66.5" rx="19" ry="2.8" fill="#000" opacity="' + (sp ? .3 : .16) + '"/>' +
        '<g transform="translate(0 3)">' + bgSh(sh, R, CY, "#7A4E00") + '</g>';
    } else s += '<g transform="translate(0 2.6)">' + bgSh(sh, R, CY, "#D2CCCC") + '</g>';
    s += bgSh(sh, R, CY, on ? wire : "#DAD5D5") + bgSh(sh, RI, CY, c[0]) +
      '<g clip-path="url(#' + u + 'c)">' + bgFields(hsh % 6, Math.min(3, lv), c, CY, R, wire) +
      (on ? '<ellipse cx="34" cy="' + (CY - 21) + '" rx="30" ry="17" fill="url(#' + u + 'g)"/>' : '') + '</g>' +
      (lv >= 3 ? bgSh(sh, RI * 0.9, CY, "none", ' stroke="' + wire + '" stroke-width="1.1" stroke-linejoin="round"') : '') +
      (on && lv >= 3 ? bgSh(sh, RI, CY, "url(#" + u + "o)", ' opacity="' + (lv === 4 ? .8 : .5) + '"') : '');
    var sc = sh === "circle" || sh === "scallop" ? 1.2 : 1.08, cy = CY + (b.sm != null ? -2 : 0) + (sh === "shield" ? -1.5 : sh === "pent" ? 1 : 0), ik = has("flame") ? " bdx-flame" : has("float") ? " bdx-float" : has("beat") ? " bdx-beat" : "";
    var IC = BG_IC[b.ic] || BG_IC.star, ink = !on ? "#F7F5F5" : sp || key === "Y" ? "#17171C" : "#FFF8E7";
    s += '<g transform="translate(' + (42 - 12 * sc).toFixed(2) + ' ' + (cy - 12 * sc).toFixed(2) + ') scale(' + sc + ')"><g class="bdx-i' + ik + '" stroke-linecap="round" stroke-linejoin="round">' +
      '<g fill="none" stroke="' + (on ? wire : "#C4BEBE") + '" stroke-width="4.3">' + IC + '</g>' +
      '<g fill="' + ink + '" fill-opacity="' + (on ? .5 : .6) + '" stroke="' + ink + '" stroke-width="2.1">' + IC + '</g></g></g>';
    if (has("shine")) s += '<g clip-path="url(#' + u + 'c)"><g transform="rotate(22 42 32)"><rect class="bdx-sh" x="-16" y="-20" width="11" height="110" fill="#fff" opacity=".5"/></g></g>';
    if (has("twinkle")) s += '<g transform="translate(63 -1) scale(.95)"><path class="bdg-spark" d="' + BG_SPK + '" fill="#FFE48A"/></g><g transform="translate(6 40) scale(.6)"><path class="bdg-spark s2" d="' + BG_SPK + '" fill="#fff"/></g>' +
      '<g transform="translate(14 2) scale(.45)"><path class="bdg-spark s3" d="' + BG_SPK + '" fill="#FFE48A"/></g>';
    s += '</svg>';
    var sm = b.sm != null ? '<span class="bdg-m' + (on ? '' : ' off') + '">' + b.sm + '</span>' : '';
    var ex = (has("pulse") ? '<span class="bdx-glow" aria-hidden="true"></span>' : '') + (has("spin") ? '<span class="bdx-ring" aria-hidden="true"></span>' : '');
    return '<span class="bdg bx' + (on ? ' on' : '') + '" style="--bgc:' + bgRgb(on ? (sp ? "#F3C94F" : c[key === "D" || key === "N" ? 1 : 0]) : "#BBBBBB") + '">' + ex + s + sm + '</span>';
  }
  function bpBadge() {   /* 전설 배지 "바프 완료": 바프 회원(journey.mode bodyprofile)만 보임. 선생님이 data.js journey.bpDone: "촬영 날짜" 넣으면 획득. 45개 수에는 안 셈 */
    var J = M.journey || {};
    if (!(BP || J.bpDone)) return null;
    var ok = function (x) { return typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x); }, dn = J.bpDone, ds = ok(dn) ? dn : ok(J.shoot) ? J.shoot : null;
    var dd = !dn && ds ? Math.ceil((jDate(ds) - new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) / 86400000) : -1;
    return { id: "bpdone", sp: true, cat: "grow", hint: dd >= 0 ? "D-" + dd : "촬영 완주", label: "바프 완료", ic: "camera", sh: "shield", lv: 4, col: ["#F6CF58", "#B97F06"], fx: "rays spin twinkle shine", sm: dn ? "완주" : null,
      on: dn ? (ds || ymd(new Date())) : null, shot: ds, how: "바디프로필 촬영을 마치면 선생님이 달아 드려요", desc: "바디프로필 촬영 완주. 끝까지 해낸 사람만 받는 전설 배지예요." };
  }
  function bpStrip() {
    var b = bpBadge(); if (!b) return "";
    var r = "아직", p;
    if (b.on) { p = b.on.split("-"); r = (+p[0]) + ". " + (+p[1]) + ". " + (+p[2]); }
    else if (b.shot) { var dd = Math.ceil((jDate(b.shot) - new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) / 86400000); if (dd >= 0) r = "D-" + dd; }
    return '<button type="button" class="bgx-sp' + (b.on ? ' on' : '') + '"><span class="bgx-sp-ic">' + bgIcon(b) + '</span><div><small>전설 배지</small><b>바프 완료</b><p>' +
      (b.on ? "촬영 완주 · 끝까지 해낸 사람만" : "촬영을 마치면 선생님이 달아 드려요") + '</p></div><em>' + r + '</em></button>';
  }

  /* ---- 나 탭 배지 칸 (한 칸) */
  function bgPct(b) { return b.on ? 1 : b.goal ? Math.min(1, (b.have || 0) / b.goal) : 0; }
  function bgSub(b) {
    if (b.on) return '<small>' + md(b.on) + '</small>';
    if (b.goal > 1) return '<small class="pg">' + (b.pre || "") + Math.min(b.have || 0, b.goal) + ' / ' + (b.pre || "") + b.goal + (b.unit === "%" ? "%" : "") + '</small>';
    return '<small>' + esc(b.hint || "아직") + '</small>';
  }
  function bgNext(L) {   /* 아직 못 받은 것 중 제일 가까운 배지 */
    var c = L.filter(function (b) { return !b.on && b.goal; }).sort(function (x, y) { return bgPct(y) - bgPct(x) || x.goal - y.goal; });
    return c[0] || null;
  }
  function badgeSection(num) {
    var L = badgeList(), got = L.filter(function (b) { return b.on; }).length, nx = bgNext(L), top;
    if (nx) {
      var left = nx.goal - Math.min(nx.have || 0, nx.goal);
      top = '<div class="bgx-next"><span class="bgx-ic">' + bgIcon(nx) + '</span><div><b>다음 배지 · ' + esc(nx.label) + '</b><p>' + esc(nx.how) + '</p></div>' +
        '<em>' + (nx.pre ? nx.pre + nx.goal + '까지' : left + (nx.unit || "") + ' 남음') + '</em></div>';
    } else top = '<div class="bgx-next done"><b>배지를 전부 모았어요! 정말 대단해요</b></div>';
    var tabs = "", grids = "";
    BG_CAT.forEach(function (c) {
      var cl = []; L.forEach(function (b, i) { if (b.cat === c[0]) cl.push(i); });
      var cg = cl.filter(function (i) { return L[i].on; }).length, on = bgTab === c[0];
      tabs += '<button type="button" class="bgx-tab' + (on ? ' on' : '') + '" data-c="' + c[0] + '" role="tab" aria-selected="' + on + '">' + c[1] + ' <i>' + cg + '/' + cl.length + '</i></button>';
      grids += '<div class="bggrid" data-c="' + c[0] + '"' + (on ? '' : ' hidden') + '>' + cl.map(function (i) {
        var b = L[i];
        return '<button type="button" class="bgc' + (b.on ? ' on' : '') + '" data-i="' + i + '" aria-label="' + esc(b.label) + (b.on ? ' 받음' : ' 아직') + '">' + bgIcon(b) + '<b>' + esc(b.label) + '</b>' + bgSub(b) + '</button>';
      }).join("") + '</div>';
    });
    return '<section id="badges" data-num="' + num + '">' + head(num, "나의 배지", "꾸준함이 쌓이는 곳", '<span class="more bg-cnt"><b>' + got + '</b> / ' + L.length + '</span>') +
      '<div class="panel bgx"><i class="bgx-bar" aria-label="모은 배지 ' + got + '개 / ' + L.length + '개"><em style="width:' + (got / L.length * 100).toFixed(1) + '%"></em></i>' + top +
      '<div class="bgx-tabs" role="tablist">' + tabs + '</div>' + grids +
      (COACH_MODE && !DEMO ? '<button type="button" class="bgx-reset">선생님만 보여요 · 이 회원님 배지 초기화</button>' : '') + '</div></section>';
  }
  function setupBadges() {
    var sec = document.getElementById("badges"); if (!sec) return;
    Array.prototype.forEach.call(sec.querySelectorAll(".bgc"), function (el) {
      el.addEventListener("click", function () {
        var b = badgeList()[+el.getAttribute("data-i")];
        if (!b) return;
        bgDetail(b);
      });
    });
    var rsb = sec.querySelector(".bgx-reset");
    if (rsb) rsb.addEventListener("click", function () {   /* 선생님: 배지 초기화 — 받은 배지를 비우고, 회원님 폰이 다음에 열 때 회원님이 한 일로 다시 계산 */
      if (!rsb.classList.contains("sure")) { rsb.classList.add("sure"); rsb.textContent = "한 번 더 누르면 받은 배지가 전부 지워져요"; setTimeout(function () { rsb.classList.remove("sure"); rsb.textContent = "선생님만 보여요 · 이 회원님 배지 초기화"; }, 3000); return; }
      var o = bgsObj(), t = Date.now();
      o.on = {}; o.rs = t; o.at = t;
      try { localStorage.setItem(BGS_LS, JSON.stringify(o)); } catch (e) {}
      rsb.disabled = true; rsb.textContent = "초기화하는 중…";
      rtPost({ a: "kv_set", k: "mw:" + SLUG + ":bg", v: { on: {}, m: o.m, x: o.x, fo: o.fo || 0, rs: t, at: t } }).then(function (j) {
        if (j && j.ok === false) throw new Error(j.error || "fail");
        attToast("배지를 초기화했어요 · 회원님이 한 일로 다시 계산돼요"); rerender();
      }).catch(function () { rsb.disabled = false; rsb.classList.remove("sure"); rsb.textContent = "실패했어요 · 다시 누르기"; });
    });
    var spb = sec.querySelector(".bgx-sp");
    if (spb) spb.addEventListener("click", function () {
      var b = bpBadge(), sv = spb.querySelector(".bdg-s"); if (!b) return;
      if (sv && b.on) { sv.classList.remove("flip"); void sv.getBoundingClientRect(); sv.classList.add("flip"); }
      attToast(b.on ? "바프 완료 — 정말 끝까지 해냈어요!" : b.how);
    });
    Array.prototype.forEach.call(sec.querySelectorAll(".bgx-tab"), function (el) {
      el.addEventListener("click", function () {
        bgTab = el.getAttribute("data-c");
        Array.prototype.forEach.call(sec.querySelectorAll(".bgx-tab"), function (t) { var on = t === el; t.classList.toggle("on", on); t.setAttribute("aria-selected", on); });
        Array.prototype.forEach.call(sec.querySelectorAll(".bggrid"), function (g) { g.hidden = g.getAttribute("data-c") !== bgTab; });
      });
    });
  }
  /* 2026-11-17 장동욱 "확대했을 때 빛 효과 더 고급스럽게, 배지마다 고유 효과": 굵은 줄무늬 빛줄기 대신
     부드러운 후광 + 가는 빛살 두 겹(서로 반대로 천천히) + 배지 효과(BG_ST 3번째 값)마다 다른 연출
     flame 불티가 올라감 · twinkle 금빛 별 · spin 궤도를 도는 빛 · pulse 퍼지는 물결 · shine 빛이 스침 · float 떠오르는 빛망울 · beat 두근 물결 · rays 햇살 */
  function bgAura(b) {
    var fx = " " + (b.fx || "") + " ", h = '<div class="bxa" aria-hidden="true"><i class="bxa-halo"></i><i class="bxa-fine"></i><i class="bxa-fine b"></i>', i, q;
    function has(k) { return fx.indexOf(" " + k + " ") >= 0; }
    function rnd(n) { var x = Math.sin((b.id.length * 7 + n) * 12.9898) * 43758.5453; return x - Math.floor(x); }
    if (has("rays")) h += '<i class="bxa-sun"></i>';
    if (has("pulse")) for (i = 0; i < 3; i++) h += '<i class="bxa-rip" style="animation-delay:' + (i * 1.1) + 's"></i>';
    if (has("beat")) h += '<i class="bxa-beat"></i><i class="bxa-beat" style="animation-delay:.22s"></i>';
    if (has("spin")) h += '<i class="bxa-orb"><b></b></i><i class="bxa-orb o2"><b></b></i><i class="bxa-orb o3"><b></b></i>';
    if (has("shine")) h += '<i class="bxa-beam"></i>';
    if (has("flame")) for (i = 0; i < 14; i++) h += '<i class="bxa-ember" style="left:' + Math.round(rnd(i) * 150 - 75) + 'px;--dx:' + Math.round(rnd(i + 30) * 60 - 30) + 'px;width:' + (3 + Math.round(rnd(i + 60) * 4)) + 'px;animation-delay:' + (rnd(i + 90) * 2.6).toFixed(2) + 's;animation-duration:' + (2.2 + rnd(i + 120) * 1.6).toFixed(2) + 's"></i>';
    if (has("float")) for (i = 0; i < 9; i++) h += '<i class="bxa-bok" style="left:' + Math.round(rnd(i) * 240 - 120) + 'px;width:' + (10 + Math.round(rnd(i + 20) * 22)) + 'px;animation-delay:' + (rnd(i + 40) * 4).toFixed(2) + 's;animation-duration:' + (4 + rnd(i + 70) * 3).toFixed(2) + 's"></i>';
    if (has("twinkle")) for (i = 0; i < 10; i++) { q = (i / 10 + rnd(i) * .08) * Math.PI * 2; var rr = 95 + rnd(i + 11) * 70, sz = 10 + Math.round(rnd(i + 22) * 12);
      h += '<svg class="bxa-star" viewBox="0 0 14 14" style="left:' + Math.round(Math.cos(q) * rr - sz / 2) + 'px;top:' + Math.round(Math.sin(q) * rr - sz / 2) + 'px;width:' + sz + 'px;height:' + sz + 'px;animation-delay:' + (rnd(i + 33) * 2.4).toFixed(2) + 's"><path d="' + BG_SPK + '"/></svg>'; }
    return h + '</div>';
  }
  function bgAuraPos(box) {   /* 후광을 메달 한가운데에 맞춤 */
    var a = box.querySelector(".bxa"), c = box.querySelector(".bxp-card"); if (!a || !c) return;
    a.style.left = (c.offsetLeft + c.offsetWidth / 2) + "px"; a.style.top = (c.offsetTop - 42) + "px";
  }
  function bgDetail(b) {   /* 배지를 누르면 크게 보여 주는 창: 받은 날 · 설명 · 받는 방법 · (아직이면) 진행 막대 */
    var old = document.querySelector(".bgpop-wrap.dt"); if (old && old.parentNode) old.parentNode.removeChild(old);
    var p = b.on ? b.on.split("-") : null, box = document.createElement("div"), pg = "";
    if (!b.on && b.goal > 1) { var hv = Math.min(b.have || 0, b.goal), u2 = b.unit || "";
      pg = '<div class="bxp-bar"><div><span>지금까지</span><b>' + (b.pre || "") + hv + u2 + ' / ' + (b.pre || "") + b.goal + u2 + '</b></div><i><em style="width:' + (hv / b.goal * 100).toFixed(1) + '%"></em></i></div>'; }
    box.className = "bgpop-wrap bxp dt" + (b.sp && b.on ? " sp" : "") + (b.on ? "" : " off");
    if (b.on && b.col && !b.sp && b.col !== BG_PAL.D) box.style.setProperty("--bgc", bgRgb(b.col[0]));
    box.innerHTML = (b.on ? bgAura(b) : '') +
      '<div class="bxp-card" role="dialog" aria-modal="true" aria-labelledby="bxdT"><div class="bxp-medal">' + bgIcon(b) + '</div>' +
      '<small class="bxp-k">' + (b.sp ? '전설 배지' : (BG_CAT.filter(function (c) { return c[0] === b.cat; })[0] || ["", "배지"])[1] + ' 배지') + '</small><h3 id="bxdT">' + esc(b.label) + '</h3>' +
      '<span class="bxd-when' + (b.on ? ' on' : '') + '">' + (p ? (+p[0]) + '년 ' + (+p[1]) + '월 ' + (+p[2]) + '일에 받았어요' : '아직 못 받았어요') + '</span>' +
      (b.on ? '<p>' + esc(b.desc) + '</p>' : '') +
      '<div class="bxd-how"><small>받는 방법</small><b>' + esc(b.how) + '</b></div>' + pg +
      '<button type="button" class="bxp-go">확인</button></div>';
    document.body.appendChild(box);
    requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add("in"); }); });
    function close() { box.classList.remove("in"); setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 260); }
    box.querySelector(".bxp-go").addEventListener("click", close);
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    bgAuraPos(box);
  }
  function bgBest(n) {   /* 대표 배지: 받은 것 중 높은 순(전설 → 단계 높은 순 → 최근)으로 n개 — 홈 맨 위 */
    var L; try { L = badgeList().filter(function (b) { return b.on; }); } catch (e) { return []; }
    L.sort(function (x, y) { return (y.sp ? 1 : 0) - (x.sp ? 1 : 0) || (y.lv || 0) - (x.lv || 0) || (y.on > x.on ? 1 : y.on < x.on ? -1 : 0) || (y.goal || 0) - (x.goal || 0); });
    return L.slice(0, n || 1);
  }
  function bgHomeChip() {   /* 2026-11-17 "설명 없애고 3개": 글자 없이 배지 3개 — 첫 번째(제일 높은 것)만 조금 크게 */
    var L = bgBest(3); if (!L.length) return "";
    return '<a class="hbdg3" href="#goal-badges" aria-label="내 대표 배지 ' + esc(L.map(function (b) { return b.label; }).join(", ")) + '">' +
      L.map(function (b, i) { return '<span class="hb' + (i ? ' s' : '') + '">' + bgIcon(b) + '</span>'; }).join("") + '</a>';
  }
  var bgReady = false;
  function badgeCheck() {   /* 새로 받은 배지가 있으면 팝업 한 번 */
    bgReady = true;
    if (DEMO || COACH_MODE) return;
    if (TOUR_ON || TOUR_WANT || document.querySelector(".npop-wrap, .bgpop-wrap, .ibsheet")) { setTimeout(badgeCheck, 6500); return; }
    var L = badgeList(), seen = lsArr(BG_SEEN);
    var fresh = L.filter(function (b) { return b.on && seen.indexOf(b.id) < 0; });
    if (!fresh.length) return;
    lsAdd(BG_SEEN, fresh.map(function (b) { return b.id; }));
    fresh.sort(function (x, y) { return (y.sp ? 1 : 0) - (x.sp ? 1 : 0) || (y.lv || 0) - (x.lv || 0) || (y.on > x.on ? 1 : y.on < x.on ? -1 : 0) || (y.goal || 0) - (x.goal || 0); });
    showBadgePop(fresh[0], fresh.length - 1, L);
  }
  function showBadgePop(b, extra, L) {
    var got = L.filter(function (x) { return x.on; }).length, prev = Math.max(0, got - 1 - extra), conf = "", pal = ["#FFE48A", "#E4B544", "#FFFFFF", "#C9A227", "#FFF4C2"];
    for (var i = 0; i < 22; i++) {
      conf += '<i style="left:' + (3 + (i * 37) % 94) + '%;background:' + pal[i % 5] + ';animation-delay:' + (0.9 + (i * 0.11) % 1.5).toFixed(2) + 's;animation-duration:' + (2.4 + (i % 4) * 0.4).toFixed(2) + 's' +
        (i % 3 === 0 ? ';border-radius:50%;width:7px;height:7px' : '') + '"></i>';
    }
    var nx = bgNext(L), box = document.createElement("div");
    box.className = "bgpop-wrap bxp" + (b.sp ? " sp" : "");
    if (b.col && b.col !== BG_PAL.D) box.style.setProperty("--bgc", bgRgb(b.col[1]));
    box.innerHTML = bgAura(b) + '<div class="bxp-flash" aria-hidden="true"></div><div class="bgpop-conf" aria-hidden="true">' + conf + '</div>' +
      '<div class="bxp-card" role="dialog" aria-modal="true" aria-labelledby="bxpT"><div class="bxp-medal">' + bgIcon(b) + '</div>' +
      '<small class="bxp-k">' + (b.sp ? '전설 배지 획득!' : '새 배지 획득!') + '</small><h3 id="bxpT">' + esc(b.label) + '</h3>' +
      '<p>' + esc(b.desc) + (extra > 0 ? '<br><em>외 ' + extra + '개도 함께 받았어요</em>' : '') + '</p>' +
      '<div class="bxp-bar"><div><span>모은 배지</span><b><span class="bxp-n">' + prev + '</span> / ' + L.length + '</b></div><i><em style="width:' + (prev / L.length * 100).toFixed(1) + '%" data-to="' + (got / L.length * 100).toFixed(1) + '"></em></i>' +
      (nx ? '<small>다음 목표 · <b>' + esc(nx.label) + '</b></small>' : '') + '</div>' +
      '<a class="bxp-go" href="#goal-badges">내 배지 보러 가기</a><button type="button" class="bxp-x">닫기</button></div>';
    document.body.appendChild(box);
    bgAuraPos(box);
    requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add("in"); }); });
    var em = box.querySelector(".bxp-bar em"), nEl = box.querySelector(".bxp-n");
    setTimeout(function () {
      em.style.width = em.getAttribute("data-to") + "%";
      if (got <= prev) return;
      var n = prev, iv = setInterval(function () { n++; nEl.textContent = n; if (n >= got) clearInterval(iv); }, Math.max(40, 600 / (got - prev)));
    }, 1350);
    function close() { box.classList.remove("in"); setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 320); }
    box.querySelector(".bxp-x").addEventListener("click", close);
    box.querySelector(".bxp-go").addEventListener("click", function () { close(); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
  }

  /* ---- 근육 지도 */
  var MG = [["chest", "가슴"], ["back", "등"], ["shoulder", "어깨"], ["arm", "팔"], ["core", "복근"], ["thigh", "허벅지"], ["glute", "엉덩이"], ["calf", "종아리"]];
  var MG_KO = {}; MG.forEach(function (g) { MG_KO[g[0]] = g[1]; });
  var MG_RULES = [   /* 종목 이름 → 부위 (위에서부터 처음 맞는 것) */
    [/레그\s?컬/, ["thigh"]],
    [/RDL|데드리프트|굿모닝/i, ["thigh", "glute"]],
    [/레그\s?익스텐션|시시\s?스쿼트/, ["thigh"]],
    [/카프|종아리/, ["calf"]],
    [/스쿼트|레그\s?프레스|핵\s?프레스|런지|스텝\s?업/, ["thigh", "glute"]],
    [/이너\s?타이|어덕/, ["thigh"]],
    [/아웃\s?타이|힙|글루트|브릿지|어브덕/, ["glute"]],
    [/페이스\s?풀|리버스\s?펙덱|리어\s?델트/, ["shoulder"]],
    [/레터럴|숄더|밀리터리|프론트\s?레이즈|업라이트/, ["shoulder"]],
    [/슈러그|풀다운|로우|풀업|친업|턱걸이|풀오버|백\s?익스텐션/, ["back"]],
    [/푸[쉬시]\s?다운|익스텐션|딥스|킥백|컬/, ["arm"]],
    [/플랭크|크런치|복근|코어|레그\s?레이즈|싯업|AB/i, ["core"]],
    [/펙덱|플라이|체스트|벤치|프레스|푸[쉬시]\s?업/, ["chest"]]
  ];
  var MG_PART = [[/가슴/, ["chest"]], [/등/, ["back"]], [/어깨/, ["shoulder"]], [/팔|삼두|이두/, ["arm"]], [/하체/, ["thigh", "glute"]], [/엉덩이|힙/, ["glute"]], [/복근|코어/, ["core"]]];
  function dayGroups(d) {
    var out = {};
    if (!d || d.rest || d.pick || d.cardio_only) return [];
    (d.items || []).forEach(function (it) {
      var n = it.name || "";
      for (var i = 0; i < MG_RULES.length; i++) if (MG_RULES[i][0].test(n)) { MG_RULES[i][1].forEach(function (g) { out[g] = 1; }); break; }
    });
    if (!Object.keys(out).length) MG_PART.forEach(function (r) { if (r[0].test(d.part || "")) r[1].forEach(function (g) { out[g] = 1; }); });
    return Object.keys(out);
  }
  function dayOfDate(k, sorted) {   /* 그날 한 루틴 (요일 / 순환은 그 전까지 출석 수로 DAY 순서) */
    if (ROT) {
      var n = rotDays().length; if (!n) return null;
      var since = M.routine.rotation_start || "2000-01-01";
      var before = sorted.filter(function (x) { return x >= since && x < k; }).length;
      return rotDays()[before % n];
    }
    var p = k.split("-");
    return dayAt(new Date(+p[0], +p[1] - 1, +p[2]));
  }
  function muscleCounts(ym) {
    var a = attLoad().slice().sort(), cnt = {}, days = 0, L = (LG && LG.d) || {};
    MG.forEach(function (g) { cnt[g[0]] = 0; });
    var ks = a.slice(); Object.keys(L).forEach(function (k) { if (ks.indexOf(k) < 0) ks.push(k); });
    ks.forEach(function (k) {
      if (k.slice(0, 7) !== ym) return;
      days++;
      /* 2026-11-14: 그날 ✓한 종목이 있으면 그 종목들로, 없으면 그날 루틴 전체로 */
      var g0 = L[k] && L[k].length ? dayGroups({ items: L[k].map(function (x) { return { name: x[0] }; }) }) : dayGroups(dayOfDate(k, a));
      g0.forEach(function (g) { cnt[g]++; });
    });
    return { cnt: cnt, days: days };
  }
  function routineGroups() {
    var out = {};
    ((M.routine && M.routine.days) || []).forEach(function (d) { dayGroups(d).forEach(function (g) { out[g] = 1; }); });
    return out;
  }
  function mgLevel(n) { return n >= 5 ? 3 : n >= 3 ? 2 : n >= 1 ? 1 : 0; }
  function mmFigure(cnt, alt) {
    var sx = M.sex === "F" ? "F" : "M", src = BASE + "muscle/" + sx + "/";
    return '<div class="mm-fig"><img src="' + src + 'base.png" alt="' + esc(alt) + '">' +
      MG.map(function (g) {
        var lv = mgLevel(cnt[g[0]]);
        return lv ? '<img class="mm-l" src="' + src + g[0] + '.png" alt="" style="opacity:' + [0, 0.4, 0.72, 1][lv] + '">' : '';
      }).join("") + '</div>';
  }
  function mgTop(cnt) {
    return MG.filter(function (g) { return cnt[g[0]] > 0; })
      .sort(function (x, y) { return cnt[y[0]] - cnt[x[0]]; }).map(function (g) { return { k: g[0], name: g[1], n: cnt[g[0]] }; });
  }
  function mgWhite(cnt) {   /* 루틴엔 있는데 이번 달 아직 안 칠해진 부위 */
    var rg = routineGroups();
    return MG.filter(function (g) { return rg[g[0]] && !cnt[g[0]]; }).map(function (g) { return g[1]; });
  }
  var mmWhich = "cur";
  function muscleBody() {
    var now = new Date(), ym = mmWhich === "prev" ? ymAdd(ymOf(now), -1) : ymOf(now), mo = +ym.slice(5);
    var r = muscleCounts(ym), top = mgTop(r.cnt), white = mgWhite(r.cnt);
    var alt = mo + "월 근육 지도: " + (top.length ? top.map(function (t) { return t.name + " " + t.n + "회"; }).join(", ") : "아직 색칠된 곳 없음");
    var h = '<div class="mm-card">' + mmFigure(r.cnt, alt) + (r.days ? '' : '<p class="mm-empty">' + (mmWhich === "prev" ? '이 달엔 출석 기록이 없어요' : '출석하면 그날 루틴 부위가<br>하나씩 색칠돼요') + '</p>') +
      '<div class="mm-leg"><span><i class="l0"></i>안 함</span><span><i class="l1"></i>1~2회</span><span><i class="l2"></i>3~4회</span><span><i class="l3"></i>5회 이상</span></div></div>';
    if (top.length) {
      h += '<div class="mm-top"><b>' + (mmWhich === "prev" ? mo + '월에' : '이번 달') + ' 제일 많이 한 부위</b><div>' + top.slice(0, 3).map(function (t, i) {
        return '<span class="' + (i ? '' : 'first') + '"><small>' + (i + 1) + '위</small><b>' + t.name + '</b><em>' + t.n + '회</em></span>';
      }).join("") + '</div></div>';
    }
    if (r.days && white.length) h += '<div class="mm-tip"><span aria-hidden="true">!</span><div><b>아직 하얀 곳 · ' + white.slice(0, 2).join(" · ") + '</b><small>루틴에 있는 부위예요. 그 요일에 나와서 채워 봐요!</small></div></div>';
    else if (r.days) h += '<div class="mm-tip ok"><span aria-hidden="true">★</span><div><b>루틴 부위를 다 칠했어요!</b><small>이 기세 그대로 다음 달도 채워 봐요</small></div></div>';
    return h;
  }
  function muscleSection(num) {
    var now = new Date(), st = startDate(), prevYm = ymAdd(ymOf(now), -1);
    var canPrev = st && ymOf(st) <= prevYm;
    if (!canPrev) mmWhich = "cur";
    return '<section id="muscle" data-num="' + num + '">' + head(num, "이번 달 근육 지도", "✓한 종목 · 출석한 날 부위가 칠해져요", '<a class="more" href="#report">' + (now.getMonth() + 1) + '월 리포트</a>') +
      '<div class="panel mmap"><div class="mm-seg" role="group" aria-label="달 고르기">' +
      '<button type="button" data-m="cur" aria-pressed="' + (mmWhich === "cur") + '">이번 달 ' + (now.getMonth() + 1) + '월</button>' +
      '<button type="button" data-m="prev" aria-pressed="' + (mmWhich === "prev") + '"' + (canPrev ? '' : ' disabled') + '>지난달 ' + (+prevYm.slice(5)) + '월</button></div>' +
      '<div class="mm-body">' + muscleBody() + '</div></div></section>';
  }
  function setupMuscle() {
    Array.prototype.forEach.call(document.querySelectorAll(".mm-seg button"), function (b) {
      b.addEventListener("click", function () {
        mmWhich = b.getAttribute("data-m");
        Array.prototype.forEach.call(document.querySelectorAll(".mm-seg button"), function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        var body = document.querySelector(".mm-body"); if (body) body.innerHTML = muscleBody();
      });
    });
  }

  /* ---- 월간 리포트 */
  function reportData(ym) {
    var a = attLoad(), now = new Date(), first = ymDate(ym), last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
    var to = last < now ? last : now, s = attStats(a, first, to), hs = attHistory(), L = badgeList();
    var mc = muscleCounts(ym), ib = null;
    if (IB_ON && ibData && ibData.length) {
      var recs = ibData.slice().sort(function (x, y) { return x.d < y.d ? -1 : 1; });
      var cur = null, prev = null;
      recs.forEach(function (r) { if (r.d.slice(0, 7) === ym) cur = r; else if (r.d.slice(0, 7) < ym) prev = r; });
      if (cur) ib = { cur: cur, prev: prev };
    }
    return { ym: ym, mo: +ym.slice(5), y: +ym.slice(0, 4), done: s.done, rate: s.rate, best: hs.monthBest[ym] || 0,
      badges: L.filter(function (b) { return b.on && b.on.slice(0, 7) === ym; }), mc: mc, ib: ib,
      live: ym === ymOf(now), upto: md(ymd(to)) };
  }
  function reportCard(R) {
    var top = mgTop(R.mc.cnt), white = mgWhite(R.mc.cnt);
    var cm = M.reports && M.reports[R.ym], quote, qwho;
    if (cm) { quote = esc(cm).replace(/\n/g, "<br>"); qwho = TRN + " " + TRL() + "의 한마디"; }
    else {
      qwho = R.mo + "월 한 줄 요약";
      quote = !R.done ? "이번 달은 쉬어 갔어요.<br>다음 달엔 하나씩 다시 채워 봐요!" :
        (top.length ? "이번 달 " + top[0].name + " 운동이 제일 성실했어요." : R.done + "번 출석, 잘 해냈어요.") +
        "<br>" + (white.length ? "다음 달엔 " + white[0] + "까지 채워 봐요!" : "다음 달도 이 기세 그대로 가요!");
    }
    var tile = function (lab, v, unit, cls) { return '<div class="rp-tile ' + (cls || '') + '"><span>' + lab + '</span><p><b>' + v + '</b><small>' + unit + '</small></p></div>'; };
    var right;
    if (R.ib) {
      var rows = R.ib.prev ? [["골격근량", "smm", 1], ["체지방량", "bfm", -1], ["체중", "w", 0]].map(function (r) {
        var dl = Math.round((R.ib.cur[r[1]] - R.ib.prev[r[1]]) * 10) / 10;
        var cls = !r[2] || !dl ? "" : (dl > 0) === (r[2] > 0) ? "up" : "down";
        return '<div class="rp-ibr"><span>' + r[0] + '</span><b class="' + cls + '">' + (dl > 0 ? "+" : dl < 0 ? "−" : "") + ibFmt(Math.abs(dl)) + '<small> kg</small></b></div>';
      }).join("") : [["골격근량", "smm", "kg"], ["체지방량", "bfm", "kg"], ["체중", "w", "kg"]].map(function (r) {
        return '<div class="rp-ibr"><span>' + r[0] + '</span><b>' + ibFmt(R.ib.cur[r[1]]) + '<small> ' + r[2] + '</small></b></div>';
      }).join("");
      right = '<div class="rp-box rp-ib"><h4>' + (R.ib.prev ? '인바디 · 지난번보다' : '인바디 · 첫 기록') + '</h4>' + rows + '</div>';
    } else if (IB_ON) {
      right = '<div class="rp-box rp-ib empty"><h4>인바디</h4><p>' + R.mo + '월 인바디 기록이 없어요.<br>몸변화 탭에 올리면<br>여기서 지난번과 비교돼요</p></div>';
    } else {
      right = '<div class="rp-box rp-ib"><h4>제일 많이 한 부위</h4>' + (top.length ? top.slice(0, 3).map(function (t, i) {
        return '<div class="rp-ibr"><span>' + (i + 1) + '위 · ' + t.name + '</span><b>' + t.n + '<small> 회</small></b></div>';
      }).join("") : '<p>출석하면 여기에 쌓여요</p>') + '</div>';
    }
    var bdgs = R.badges.slice(0, 4).map(function (b) { return bgIcon(b, "#0E0E10"); }).join("");
    return '<div class="rp" id="rp"><i class="rp-stripe"></i><i class="rp-c1"></i><i class="rp-c2"></i>' +
      '<div class="rp-top"><div class="rp-brand"><b>MY PT NOTE</b><span>' + esc(BRANCH) + '</span></div><span class="rp-k">MONTHLY REPORT · ' + R.y + '. ' + pad2(R.mo) + '</span></div>' +
      '<div class="rp-title"><span>' + esc(M.name) + ' 회원님의</span><h2>' + R.mo + '월 운동 리포트</h2>' + (R.live ? '<em>' + R.upto + ' 기준 · 진행 중</em>' : '') + '</div>' +
      '<div class="rp-tiles">' + tile("출석", R.done, "회", "pk") + tile("출석률", R.rate, "%") + tile("최고 연속", R.best, "회") + tile("새 배지", R.badges.length, "개", "gd") + '</div>' +
      '<div class="rp-mid"><div class="rp-map"><h4>' + R.mo + '월 근육 지도</h4>' + mmFigure(R.mc.cnt, R.mo + "월 근육 지도") +
      '<p>' + (top.length ? '가장 많이 한 부위 · ' + top.slice(0, 2).map(function (t) { return t.name; }).join(" · ") : '출석하면 부위가 색칠돼요') + '</p></div>' +
      '<div class="rp-side">' + right + '<div class="rp-box rp-bd"><h4>' + (R.badges.length ? '이번 달 받은 배지' : '이번 달 배지') + '</h4>' +
      (bdgs ? '<div class="rp-bds">' + bdgs + '</div>' : '<p>다음 달엔 배지 하나 받아 봐요!</p>') + '</div></div></div>' +
      '<div class="rp-quote"><span aria-hidden="true">“</span><div><p>' + quote + '</p><small>' + qwho + '</small></div></div>' +
      '<div class="rp-foot"><span><b>MY PT NOTE</b> · 나만의 운동 노트</span><span>' + (BRN ? esc(BRN) + ' · ' : '') + '담당 ' + esc(TRN) + ' ' + TRL() + '</span></div></div>';
  }
  function renderReport(ym) {
    var now = new Date(), curYm = ymOf(now), st = startDate(), firstYm = st ? ymOf(st) : curYm;
    if (!ym || ym > curYm) ym = curYm;
    if (ym < firstYm) ym = firstYm;
    var R = reportData(ym), pv = ymAdd(ym, -1), nx = ymAdd(ym, 1);
    return '<div class="rp-nav"><a href="#routine" class="rp-back">← 루틴</a><div class="rp-mo">' +
      (pv >= firstYm ? '<a href="#report-' + pv + '" aria-label="' + (+pv.slice(5)) + '월 리포트">‹</a>' : '<span class="off">‹</span>') +
      '<b>' + R.y + '년 ' + R.mo + '월</b>' +
      (nx <= curYm ? '<a href="#report-' + nx + '" aria-label="' + (+nx.slice(5)) + '월 리포트">›</a>' : '<span class="off">›</span>') + '</div></div>' +
      '<div class="rp-frame" id="rpFrame">' + reportCard(R) + '</div>' +
      '<button type="button" class="btn fill rp-save" id="rpSave"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>이미지로 저장 · 공유</button>' +
      '<p class="rp-hint">' + (R.live ? '이번 달은 아직 진행 중이라 숫자가 계속 바뀌어요. ' : '') + '카톡·인스타에 올려 자랑해 보세요!</p>' + remember();
  }
  function rpFit() {
    var f = document.getElementById("rpFrame"), r = document.getElementById("rp");
    if (!f || !r) return;
    var s = f.clientWidth / 1080;
    r.style.transform = "scale(" + s + ")";
    f.style.height = Math.round(1350 * s) + "px";
  }
  window.addEventListener("resize", rpFit);
  function loadH2C() {
    if (window.html2canvas) return Promise.resolve(window.html2canvas);
    return new Promise(function (ok, no) {
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      s.onload = function () { ok(window.html2canvas); }; s.onerror = no;
      document.head.appendChild(s);
    });
  }
  function rpShow(url, name) {   /* 공유가 안 되는 브라우저(카톡 안 등): 그림을 띄워서 길게 눌러 저장 */
    var box = document.createElement("div");
    box.className = "rp-shot";
    box.innerHTML = '<div><img src="' + url + '" alt="월간 리포트 그림"><p>그림을 <b>길게 눌러</b> 사진에 저장하세요</p>' +
      '<a class="btn fill" href="' + url + '" download="' + name + '">파일로 받기</a><button type="button" class="btn">닫기</button></div>';
    document.body.appendChild(box);
    box.querySelector("button").addEventListener("click", function () { box.remove(); });
  }
  function setupReport() {
    rpFit();
    var imgs = document.querySelectorAll("#rp img");
    Array.prototype.forEach.call(imgs, function (im) { if (!im.complete) im.addEventListener("load", rpFit); });
    var b = document.getElementById("rpSave");
    if (!b) return;
    b.addEventListener("click", function () {
      var r = document.getElementById("rp"); if (!r || b.disabled) return;
      b.disabled = true; b.classList.add("saving");
      var name = /^#growth/.test(location.hash) ? "PT성장기록-" + ymd(new Date()) + ".png" : "PT리포트-" + (location.hash.match(/\d{4}-\d{2}/) || [ymOf(new Date())])[0] + ".png";
      var holder = document.createElement("div");
      holder.style.cssText = "position:fixed;left:-12000px;top:0;width:1080px;height:1350px;overflow:hidden";
      var c = r.cloneNode(true); c.removeAttribute("id"); c.style.transform = "none";
      Array.prototype.forEach.call(c.querySelectorAll(".bdg-fx, .bdg-ring"), function (x) { x.remove(); });   /* 움직이는 효과는 그림에선 빼고 */
      holder.appendChild(c); document.body.appendChild(holder);
      var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      fontsReady.then(loadH2C).then(function (h2c) {
        return h2c(c, { scale: 1, width: 1080, height: 1350, backgroundColor: "#111113", useCORS: true, logging: false });
      }).then(function (cv) {
        holder.remove();
        cv.toBlob(function (blob) {
          b.disabled = false; b.classList.remove("saving");
          var url = cv.toDataURL("image/png");
          var file = null;
          try { file = new File([blob], name, { type: "image/png" }); } catch (e) {}
          if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: M.name + (/^#growth/.test(location.hash) ? " 회원님 성장 기록" : " 회원님 월간 리포트") }).catch(function (e) { if (!e || e.name !== "AbortError") rpShow(url, name); });
          } else rpShow(url, name);
        }, "image/png");
      }).catch(function () {
        holder.remove(); b.disabled = false; b.classList.remove("saving");
        attToast("그림을 못 만들었어요. 인터넷 연결을 확인해 주세요");
      });
    });
  }
  /* ---- 첫날 vs 오늘 · 성장 기록 카드 (2026-11-12 장동욱 "재등록 아이디어 1번 — 회원이 얼마나 변했는지 숫자로")
     #growth. 처음 무게 = data.js start_weights + 창고 pub:m:<주소>:growth {w:{종목:kg}, note, at} (선생님 폰에서 넣음, 루틴 저장할 때 새 종목은 그때 무게로 자동 기록)
     지금 무게 = 지금 루틴(폰에서 고친 것 포함) 종목별 가장 무거운 세트. 인바디 = 첫 기록 vs 최근 기록. */
  var GR_LS = "ptnote:" + SLUG + ":growth", GR = null;
  try { GR = JSON.parse(localStorage.getItem(GR_LS) || "null"); } catch (e) {}
  /* ---- 운동 기록 (2026-11-14 장동욱 "운동 탭에서 한 종목 끝날 때마다 체크 → 기록 탭에 저장, 첫날 vs 오늘도 기록에 연동")
     창고 저장소 mw:<주소>:log = { d: {"YYYY-MM-DD": [[종목, 가장 무거운 kg, 세트 수], …]}, f: {종목: 처음 ✓한 kg}, at }
     회원 폰도 쓸 수 있는 칸(mw:)이라 창고 재배포 필요 없음. 4천 자 넘으면 오래된 날부터 지움. 무게는 루틴에 적힌 무게 그대로(고치기 X) */
  var LG_LS = "ptnote:" + SLUG + ":log", LG = null, LG_PEND = false, LG_T = 0;
  try { LG = JSON.parse(localStorage.getItem(LG_LS) || "null"); LG_PEND = !!(LG && LG.pend); } catch (e) {}
  function lgObj() { if (!LG || typeof LG !== "object") LG = { d: {}, f: {}, at: 0 }; LG.d = LG.d || {}; LG.f = LG.f || {}; return LG; }
  /* 체크 칸 날짜 (2026-11-14 "오늘 하는 날만 체크 칸, 선생님은 전날·오늘 상관없이"):
     회원 = 오늘 요일(순환은 오늘 차례 DAY, 로테이션 날은 고를 수 있는 요일)만 → 오늘 날짜 / 선생님 = 이번 주 그 요일 날짜(앞으로 올 요일은 X, 순환은 오늘 날짜)
     요일 카드의 ✓는 '이번 주 그 날짜' 기록이라 새 주(월요일)가 되면 저절로 비어 있음. 기록은 기록 탭에 그대로 남음 */
  function chkDate(sel) {
    if (DEMO) return null;
    var now = new Date(), today = ymd(now), tk = todayKey(), coach = COACH_MODE;
    if (ROT) return coach || sel === tk ? today : null;
    var td = dayByKey(tk);
    if (sel === tk || (td && td.pick && td.pick.indexOf(sel) >= 0)) return today;
    if (!coach) return null;
    var off = ((DAY_KEYS.indexOf(sel) + 6) % 7) - ((now.getDay() + 6) % 7);
    if (off > 0) return null;
    return ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + off));
  }
  function lgDone(name, k) { var t = LG && LG.d && LG.d[k || ymd(new Date())]; return !!t && t.some(function (x) { return x[0] === name; }); }
  function lgPush() {
    clearTimeout(LG_T);
    LG_T = setTimeout(function () {
      if (!ATT_API) return;
      var v = {}; for (var k in LG) if (k !== "pend") v[k] = LG[k];
      rtPost({ a: "kv_set", k: "mw:" + SLUG + ":log", v: v }).then(function (j) {
        if (j && j.ok) { LG_PEND = false; delete LG.pend; try { localStorage.setItem(LG_LS, JSON.stringify(LG)); } catch (e) {} }
      }).catch(function () {});
    }, 900);
  }
  function lgSave() {
    var o = lgObj(); o.at = Date.now(); o.pend = 1; LG_PEND = true;
    var ds = Object.keys(o.d).sort();
    while (ds.length > 1 && JSON.stringify({ d: o.d, f: o.f, at: o.at }).length > 3800) delete o.d[ds.shift()];
    try { localStorage.setItem(LG_LS, JSON.stringify(o)); } catch (e) {}
    lgPush();
  }
  function lgToggle(it, k) {
    k = k || ymd(new Date());
    var o = lgObj(), t = o.d[k] = o.d[k] || [];
    var i = -1; t.forEach(function (x, j) { if (x[0] === it.name) i = j; });
    var kg = 0; (it.sets || []).forEach(function (s) { if (s[1] != null && +s[1] > kg) kg = +s[1]; });
    if (i >= 0) { t.splice(i, 1); if (!t.length) delete o.d[k]; }
    else { t.push([it.name, kg || null, (it.sets || []).length]); if (kg > 0 && !(o.f[it.name] > 0)) o.f[it.name] = kg; }
    lgSave();
    return i < 0;
  }
  function lgServer(kv) {
    var v = kv && kv["mw:" + SLUG + ":log"] || null;
    if (LG_PEND && LG && (!v || (LG.at || 0) >= (v.at || 0))) { lgPush(); return; }   /* 폰에서 체크한 게 아직 안 올라갔으면 다시 보냄 */
    if (!v || (LG && JSON.stringify(v) === JSON.stringify({ d: LG.d, f: LG.f, at: LG.at }))) return;
    if (LG && (LG.at || 0) > (v.at || 0)) { lgPush(); return; }
    LG = v; LG_PEND = false;
    try { localStorage.setItem(LG_LS, JSON.stringify(v)); } catch (e) {}
    if (/^#(log|routine|muscle)/.test(location.hash)) rerender();
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".exchk[data-chk]");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var d = dayByKey(view.getAttribute("data-day")), it = d && d.items && d.items[+b.getAttribute("data-chk")];
    if (!it) return;
    var dk = b.getAttribute("data-date") || ymd(new Date());
    var on = lgToggle(it, dk), card = b.closest(".ex");
    if (card) card.classList.toggle("done", on);
    b.setAttribute("aria-pressed", String(on));
    if (on) { b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); try { navigator.vibrate && navigator.vibrate(18); } catch (x) {} }
    var kg = 0; (it.sets || []).forEach(function (s) { if (s[1] != null && +s[1] > kg) kg = +s[1]; });
    var dl = dk === ymd(new Date()) ? "" : lgMd(dk) + " ", auto = on && attAuto(dk);
    attToast(on ? "✓ " + dl + it.name + (kg ? " " + kg + "kg" : "") + (auto ? " · 출석 도장도 같이 찍었어요" : " · 기록에 저장했어요") : dl + it.name + " 체크를 풀었어요");
  }, true);
  /* 종목 ✓하면 자동 출석 (2026-11-14 장동욱 "개인운동 나와도 출석을 안 하네") — 그날 출석이 없으면 같이 찍음. ✓를 풀어도 출석은 그대로 */
  function attAuto(dk) {
    if (DEMO) return false;
    var a = attLoad().slice(); if (attHas(a, dk)) return false;
    var now = new Date(), tm = dk === ymd(now) ? pad2(now.getHours()) + ":" + pad2(now.getMinutes()) : "운동기록";
    a.push(dk); attTimes[dk] = tm; attSave(a);
    try { localStorage.setItem(ATT_KEY_T(), JSON.stringify(attTimes)); } catch (e) {}
    if (!ATT_API) return true;
    var go = function () { return attCall("&a=check&d=" + dk + "&t=" + encodeURIComponent(tm) + "&n=" + encodeURIComponent(M._real || M.name)); };
    go().catch(function () { return new Promise(function (ok) { setTimeout(ok, 2500); }).then(go); })
      .then(function () { attRefresh(); badgeCheck(); rkRefresh(); })
      .catch(function () { attToast("출석은 인터넷이 연결되면 다시 찍어 주세요"); });
    return true;
  }
  /* ---- 이번 달 출석 순위 (2026-11-14 "회원끼리 출석 순위") — 선생님 페이지가 열릴 때 창고 pub:all:rank = {ym, at, list:[{s:주소, n:가린 이름, c:횟수}]} 저장
     회원 노트는 그걸 받아서 내 횟수만 지금 폰 기록으로 바꿔 순위를 다시 셈. 이름은 가운데 글자 O */
  var RK_LS = "ptnote:rank", RK = null;
  try { RK = JSON.parse(localStorage.getItem(RK_LS) || "null"); } catch (e) {}
  function rkServer(kv) {
    var v = kv && kv["pub:all:rank"] || null;
    if (!v || JSON.stringify(v) === JSON.stringify(RK)) return;
    RK = v; try { localStorage.setItem(RK_LS, JSON.stringify(v)); } catch (e) {}
    rkRefresh();
  }
  function rkRefresh() { var r = document.getElementById("rank"); if (r) { r.outerHTML = rankSection(r.getAttribute("data-num")); setupFold(view.getAttribute("data-tab") || "goal"); } }
  function rkMask(n) {
    return String(n || "").split("·").map(function (p) { p = p.trim(); return p.length <= 1 ? p : p.length === 2 ? p.charAt(0) + "O" : p.charAt(0) + new Array(p.length - 1).join("O") + p.charAt(p.length - 1); }).join(" · ");
  }
  function rankSection(num) {
    var now = new Date(), ym = ymd(now).slice(0, 7), mine = attLoad().filter(function (k) { return k.slice(0, 7) === ym; }).length;
    var L = (RK && RK.ym === ym && Array.isArray(RK.list) ? RK.list : []).filter(function (x) { return x.s !== SLUG; }).map(function (x) { return { n: x.n, c: +x.c || 0 }; });
    L.push({ n: rkMask(M._real || M.name), c: mine, me: 1 });
    L = L.filter(function (x) { return x.c > 0 || x.me; }).sort(function (a, b) { return b.c - a.c || (b.me ? 1 : 0) - (a.me ? 1 : 0); });
    var rank = 0, prev = -1, my = 0, max = Math.max(1, L[0].c);
    L.forEach(function (x, i) { if (x.c !== prev) { rank = i + 1; prev = x.c; } x.r = rank; if (x.me) my = rank; });
    var show = L.filter(function (x, i) { return i < 5 || x.me; });
    var sub = mine ? (my === 1 ? "이번 달 1등이에요! 👑" : "지금 " + my + "등" + (function () { var up = L.filter(function (x) { return x.c > mine; }), t = up[up.length - 1]; return t ? " · " + (t.c - mine) + "번 더 오면 " + t.r + "등" : ""; })()) : "출석 도장을 찍으면 순위에 올라가요";
    var h = '<section id="rank" data-num="' + num + '">' + head(num, (now.getMonth() + 1) + "월 출석 순위", sub) + '<div class="panel rklist">';
    h += show.map(function (x) {
      return '<div class="rk' + (x.me ? ' me' : '') + (x.r <= 3 && x.c ? ' r' + x.r : '') + '"><span class="no">' + (x.r <= 3 && x.c ? ["", "🥇", "🥈", "🥉"][x.r] : x.r) + '</span>' +
        '<span class="nm"><b>' + esc(x.n) + (x.me ? ' <i>나</i>' : '') + '</b><span class="rk-bar"><i style="width:' + Math.round(x.c / max * 100) + '%"></i></span></span><span class="cnt">' + x.c + '회</span></div>';
    }).join("");
    if (L.length < 2) h += '<p class="rk-note">다른 회원님 순위는 곧 보여요</p>';
    else h += '<p class="rk-note">PT 노트 출석 도장 · 운동 ✓ 기준 · 이름은 가려서 보여요</p>';
    return h + '</div></section>';
  }
  function lgMd(k) { var p = k.split("-"), dt = new Date(+p[0], +p[1] - 1, +p[2]); return (+p[1]) + ". " + (+p[2]) + " (" + "일월화수목금토"[dt.getDay()] + ")"; }
  function renderLog() {
    var L = (LG && LG.d) || {}, now = new Date(), today = ymd(now), T = L[today] || [], att = attLoad();
    var mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() + 6) % 7), wn = 0, wk = "";
    for (var i = 0; i < 7; i++) {
      var dt = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i), k = ymd(dt), on = !!(L[k] && L[k].length) || att.indexOf(k) >= 0;
      if (on) wn++;
      wk += '<span class="' + (on ? 'on' : '') + (k === today ? ' now' : '') + '"><i>' + (on ? '✓' : '') + '</i><small>' + "월화수목금토일"[i] + '</small></span>';
    }
    var ym = today.slice(0, 7), mo = 0; Object.keys(L).forEach(function (k) { if (k.slice(0, 7) === ym) mo += L[k].length; });
    var G = grData(), kp = G.lifts.length ? esc(G.lifts[0].name) + " 처음 " + grKg(G.lifts[0].a) + " → 지금 " + grKg(G.lifts[0].b) + "kg! 꾸준함이 무게가 됐어요" : "한 종목 끝날 때마다 ✓ 꾹 — 그게 다 기록이 돼요";
    var h = '<div class="hero"><div class="hero-main"><div class="hero-l"><div class="eyebrow">MY LOG <b>· 운동 기록</b></div>' +
      '<h1>이번 주 ' + wn + '일 운동했어요</h1><div class="en">' + esc(M.name) + ' 회원님 · 운동 탭에서 ✓한 종목이 여기 쌓여요</div>' +
      '<div class="who"><strong>이번 달 ' + mo + '종목 완료</strong><span>담당 ' + esc(TRN) + ' 트레이너</span></div>' +
      '<div class="lgweek">' + wk + '</div></div></div>' +
      '<div class="keypoint"><small>KEY POINT</small><p>' + kp + '</p></div></div>';
    var rows = T.map(function (x) {
      return '<li><span class="lg-ck" aria-hidden="true">✓</span><b>' + esc(x[0]) + '</b><small>' + (x[2] || "") + '세트</small><em>' + (x[1] ? x[1] + 'kg' : '맨몸') + '</em></li>';
    }).join("");
    var past = Object.keys(L).filter(function (k) { return k < today && L[k].length; }).sort().reverse().slice(0, 5).map(function (k) {
      var a = L[k], top = a.slice().sort(function (x, y) { return (y[1] || 0) - (x[1] || 0); })[0];
      return '<li><span>' + lgMd(k) + '</span><b>' + a.length + '종목</b><em>' + esc(top[0]) + (top[1] ? ' ' + top[1] + 'kg' : '') + '</em></li>';
    }).join("");
    h += '<section id="lgtoday">' + head("01", "오늘 한 운동", T.length ? T.length + "종목 완료" : "운동 탭에서 ✓하면 여기 쌓여요") +
      '<div class="panel lglist">' + (T.length ? '<ul class="lg-today">' + rows + '</ul>' :
        '<div class="lg-empty"><p>아직 오늘 ✓한 종목이 없어요</p><a class="btn fill" href="#routine-' + todayKey() + '">오늘 운동하러 가기 →</a></div>') +
      (past ? '<div class="lg-past"><h4>지난 기록</h4><ul>' + past + '</ul></div>' : '') + '</div></section>';
    var gl = G.lifts.length ? G.lifts : G.top;
    h += '<section id="lggrow">' + head("02", "첫날 vs 오늘", "✓한 무게로 자동으로 채워져요") + grLink() +
      (gl.length ? '<div class="panel lg-grow"><h4>' + (G.lifts.length ? '처음 무게 → 지금 무게' : '지금 나의 무게 · ✓할수록 처음 무게가 쌓여요') + '</h4>' + gl.map(function (l) {
        return '<div class="lg-g"><b>' + esc(l.name) + '</b>' + (l.a != null ? '<span><i>' + grKg(l.a) + '</i> → <em>' + grKg(l.b) + 'kg</em></span><u>+' + grKg(l.up) + '</u>' : '<span><em>' + grKg(l.b) + 'kg</em></span>') + '</div>';
      }).join("") + '</div>' : '') + '</section>';
    h += muscleSection("03");
    if (IB_ON) h += '<section id="inbody">' + head("04", "몸 변화 · 인바디", "지난달과 비교해요", '<a class="more" href="#body">흐름 보기</a>') + ibPanel() + '</section>';
    return h + remember();
  }
  function grServer(kv) {
    var v = kv && kv["pub:m:" + SLUG + ":growth"] || null;
    if (JSON.stringify(v) === JSON.stringify(GR)) return;
    GR = v;
    try { if (v) localStorage.setItem(GR_LS, JSON.stringify(v)); else localStorage.removeItem(GR_LS); } catch (e) {}
    if (/^#growth/.test(location.hash)) rerender();
  }
  function grNowW() {   /* 지금 루틴: 종목 → 가장 무거운 kg */
    var o = {};
    ((M.routine && M.routine.days) || []).forEach(function (d) {
      (d.items || []).forEach(function (it) {
        (it.sets || []).forEach(function (st) { var kg = +st[1]; if (st[1] != null && kg > 0 && (!o[it.name] || kg > o[it.name])) o[it.name] = kg; });
      });
    });
    return o;
  }
  function grBase() { var o = {}, k, a = M.start_weights || {}, b = (GR && GR.w) || {}, f = (LG && LG.f) || {}; for (k in f) if (+f[k] > 0) o[k] = +f[k]; for (k in a) o[k] = +a[k]; for (k in b) if (b[k] != null && b[k] !== "") o[k] = +b[k]; return o; }
  function grData() {
    var now = new Date(), st = M.journey && M.journey.start ? jDate(M.journey.start) : null, a = attLoad().slice().sort();
    if (!st && a.length) { var p = a[0].split("-"); st = new Date(+p[0], +p[1] - 1, +p[2]); }
    var days = st ? Math.max(1, Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - st) / 86400000) + 1) : 0;
    var nw = grNowW(), bw = grBase(), lifts = [], top = [];
    Object.keys(nw).forEach(function (k) {
      if (bw[k] > 0 && nw[k] > bw[k]) lifts.push({ name: k, a: bw[k], b: nw[k], up: nw[k] - bw[k], pct: (nw[k] - bw[k]) / bw[k] });
      top.push({ name: k, b: nw[k] });
    });
    lifts.sort(function (x, y) { return y.pct - x.pct || y.up - x.up; });
    top.sort(function (x, y) { return y.b - x.b; });
    var ib = null;
    if (IB_ON && ibData && ibData.length > 1) { var r = ibData.slice().sort(function (x, y) { return x.d < y.d ? -1 : 1; }); ib = { a: r[0], b: r[r.length - 1] }; }
    return { st: st, days: days, att: a.length, forms: (M.forms || []).length, badges: badgeList().filter(function (b) { return b.on; }).length,
      lifts: lifts.slice(0, 4), top: top.slice(0, 4), ib: ib, ver: M.routine && M.routine.version, now: journeyNow() };
  }
  function grKg(n) { return (Math.round(n * 10) / 10) + ""; }
  function grCard(G) {
    var tile = function (lab, v, unit, cls) { return '<div class="rp-tile ' + (cls || '') + '"><span>' + lab + '</span><p><b>' + v + '</b><small>' + unit + '</small></p></div>'; };
    var left;
    if (G.lifts.length) {
      left = '<div class="rp-box gr-lifts"><h4>처음 무게 → 지금 무게</h4>' + G.lifts.map(function (l) {
        return '<div class="gr-l"><span>' + esc(l.name) + '</span><p><i>' + grKg(l.a) + '</i><em>→</em><b>' + grKg(l.b) + '<small>kg</small></b><u>+' + grKg(l.up) + 'kg</u></p></div>';
      }).join("") + '</div>';
    } else {
      left = '<div class="rp-box gr-lifts"><h4>지금 나의 무게</h4>' + (G.top.length ? G.top.map(function (l) {
        return '<div class="gr-l"><span>' + esc(l.name) + '</span><p><b>' + grKg(l.b) + '<small>kg</small></b></p></div>';
      }).join("") : '<p>루틴이 올라오면 여기에 무게가 쌓여요</p>') + '</div>';
    }
    var right = '';
    if (G.ib) {
      right += '<div class="rp-box rp-ib"><h4>인바디 · 첫 기록 → 지금</h4>' + [["골격근량", "smm", 1], ["체지방량", "bfm", -1], ["체중", "w", 0]].map(function (r) {
        var dl = Math.round((G.ib.b[r[1]] - G.ib.a[r[1]]) * 10) / 10, cls = !r[2] || !dl ? "" : (dl > 0) === (r[2] > 0) ? "up" : "down";
        return '<div class="rp-ibr"><span>' + r[0] + '</span><b class="' + cls + '">' + (dl > 0 ? "+" : dl < 0 ? "−" : "") + ibFmt(Math.abs(dl)) + '<small> kg</small></b></div>';
      }).join("") + '</div>';
    }
    right += '<div class="rp-box gr-path"><h4>지금 나의 자리</h4>' +
      (G.now ? '<p><b>' + (G.now.month ? G.now.month + '개월차' : '시작') + '</b> · ' + G.now.stage.no + '단계 ' + esc(G.now.stage.short) + '</p>' : '') +
      (G.ver ? (parseInt(String(G.ver).replace(/\D/g, ""), 10) > 1 ? '<p>루틴을 <b>' + esc(G.ver) + '</b>까지 함께 바꿔 왔어요</p>' : '<p>나만의 루틴 <b>' + esc(G.ver) + '</b>로 운동 중</p>') : '') +
      '<p>배운 자세 <b>' + G.forms + '개</b> · 받은 배지 <b>' + G.badges + '개</b></p></div>';
    var quote, qwho;
    if (GR && GR.note) { quote = esc(GR.note).replace(/\n/g, "<br>"); qwho = TRN + " 트레이너의 한마디"; }
    else {
      qwho = "지금까지 한 줄 요약";
      quote = G.lifts.length ? "처음 " + esc(G.lifts[0].name) + " " + grKg(G.lifts[0].a) + "kg에서 지금 " + grKg(G.lifts[0].b) + "kg까지 왔어요.<br>다음 목표도 같이 만들어 가요!" :
        G.days > 1 ? G.days + "일 동안 함께 걸어왔어요.<br>이 꾸준함이 몸을 바꿔요!" : "오늘이 첫날이에요.<br>여기서부터 같이 쌓아 가요!";
    }
    var d = new Date();
    return '<div class="rp gr" id="rp"><i class="rp-stripe"></i><i class="rp-c1"></i><i class="rp-c2"></i>' +
      '<div class="rp-top"><div class="rp-brand"><b>MY PT NOTE</b><span>' + esc(BRANCH) + '</span></div><span class="rp-k">MY GROWTH · ' + d.getFullYear() + '. ' + pad2(d.getMonth() + 1) + '. ' + pad2(d.getDate()) + '</span></div>' +
      '<div class="rp-title"><span>' + esc(M.name) + ' 회원님의</span><h2>첫날 vs 오늘</h2>' +
      (G.st ? '<em>' + G.st.getFullYear() + '. ' + (G.st.getMonth() + 1) + '. ' + G.st.getDate() + ' 시작 · 함께한 지 ' + G.days + '일</em>' : '') + '</div>' +
      '<div class="rp-tiles">' + tile("함께한 날", G.days, "일", "pk") + tile("출석 도장", G.att, "회") + tile("배운 자세", G.forms, "개") + tile("받은 배지", G.badges, "개", "gd") + '</div>' +
      '<div class="rp-mid gr-mid">' + left + '<div class="rp-side">' + right + '</div></div>' +
      '<div class="rp-quote"><span aria-hidden="true">“</span><div><p>' + quote + '</p><small>' + qwho + '</small></div></div>' +
      '<div class="rp-foot"><span><b>MY PT NOTE</b> · 나만의 운동 노트</span><span>' + (BRN ? esc(BRN) + ' · ' : '') + '담당 ' + esc(TRN) + ' 트레이너</span></div></div>';
  }
  function renderGrowth() {
    var G = grData(), coach = COACH_MODE && !DEMO;
    return '<div class="rp-nav"><a href="#log" class="rp-back">← 기록</a><b class="gr-navt">성장 기록</b></div>' +
      '<div class="rp-frame" id="rpFrame">' + grCard(G) + '</div>' +
      '<button type="button" class="btn fill rp-save" id="rpSave"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>이미지로 저장 · 공유</button>' +
      (coach ? '<button type="button" class="btn gr-edit" id="grEdit">✎ 처음 무게 · 선생님 한마디 넣기</button>' +
        '<p class="rp-hint">선생님 보기에만 보여요. 첫날 무게를 넣으면 "처음 → 지금"으로 비교돼요.' + (G.lifts.length ? '' : ' 지금은 처음 무게가 없어서 "지금 나의 무게"로 나와요.') + '</p>' :
        '<p class="rp-hint">처음 왔던 날과 비교해 봐요. 숫자는 출석·루틴·인바디로 자동으로 바뀌어요.</p>') + remember();
  }
  function grSheet() {
    var nw = grNowW(), bw = grBase(), names = Object.keys(nw);
    var rows = names.length ? names.map(function (k, i) {
      return '<div class="gr-row"><span>' + esc(k) + '<small>지금 ' + grKg(nw[k]) + 'kg</small></span><input id="gw' + i + '" data-n="' + esc(k) + '" type="number" inputmode="decimal" step="0.5" min="0" placeholder="처음 kg" value="' + (bw[k] > 0 ? grKg(bw[k]) : '') + '"></div>';
    }).join("") : '<p class="rts-note">루틴에 무게가 있는 종목이 없어요.</p>';
    var body = '<p class="rts-note">회원님이 처음 왔을 때 무게(kg)를 넣어 주세요. 비운 종목은 비교에서 빠져요.</p>' +
      (names.length ? '<button type="button" class="rtb gr-fill" id="grFill">빈 칸은 지금 무게로 채우기</button>' : '') +
      '<div class="gr-rows">' + rows + '</div>' +
      '<label>선생님 한마디 <small>(비우면 자동 요약)</small><textarea id="grNote" rows="3" placeholder="처음엔 랫풀다운 20kg도 버거웠는데…">' + esc(GR && GR.note || "") + '</textarea></label>' +
      '<label id="grKeyWrap"' + (rtKey() ? ' hidden' : '') + '>선생님 열쇠 <small>처음 한 번만</small><input id="grKey" type="password" autocomplete="off"></label>';
    var sh = rtSheet("첫날 vs 오늘 · 처음 기록", body, function (sh) {
      var key = fv(sh, "grKey") || rtKey();
      if (!key) { sh.querySelector("#grKeyWrap").hidden = false; return "선생님 열쇠를 넣어 주세요"; }
      var w = {};
      Array.prototype.forEach.call(sh.querySelectorAll(".gr-rows input"), function (x) { var v = parseFloat(x.value); if (v > 0) w[x.getAttribute("data-n")] = v; });
      var old = (GR && GR.w) || {}, k;
      for (k in old) if (!(k in nw) && !(k in w)) w[k] = old[k];   /* 지금 루틴에 없는 옛 종목 기록은 그대로 둠 */
      var v = { w: w, note: fv(sh, "grNote"), at: ymd(new Date()) };
      var ok = sh.querySelector("[data-ok]"); ok.disabled = true; ok.textContent = "저장 중…"; sh.msg("");
      rtPost({ a: "kv_set", key: key, k: "pub:m:" + SLUG + ":growth", v: v }).then(function (j) {
        if (!j || !j.ok) { ok.disabled = false; ok.textContent = "저장"; sh.msg(j && j.error === "key" ? "선생님 열쇠가 맞지 않아요" : rtNetMsg()); if (j && j.error === "key") sh.querySelector("#grKeyWrap").hidden = false; return; }
        try { localStorage.setItem("ptkey", key); localStorage.setItem(GR_LS, JSON.stringify(v)); } catch (x) {}
        GR = v; sh.close(); rerender(); attToast("성장 기록에 바로 반영됐어요");
      }).catch(function () { ok.disabled = false; ok.textContent = "저장"; sh.msg(rtNetMsg()); });
      return true;
    }, "저장");
    var fb = sh.querySelector("#grFill");
    if (fb) fb.addEventListener("click", function () {
      Array.prototype.forEach.call(sh.querySelectorAll(".gr-rows input"), function (x) { if (!x.value) x.value = grKg(nw[x.getAttribute("data-n")]); });
    });
  }
  function grSeed(key) {   /* 선생님이 루틴을 저장할 때: 처음 기록이 없는 종목은 그때 무게를 처음 무게로 */
    var nw = grNowW(), bw = grBase(), w = {}, add = 0, k;
    for (k in (GR && GR.w) || {}) w[k] = GR.w[k];
    for (k in nw) if (!(bw[k] > 0)) { w[k] = nw[k]; add++; }
    if (!add) return;
    var v = { w: w, note: GR && GR.note || "", at: GR && GR.at || ymd(new Date()) };
    rtPost({ a: "kv_set", key: key, k: "pub:m:" + SLUG + ":growth", v: v }).then(function (j) {
      if (j && j.ok) { GR = v; try { localStorage.setItem(GR_LS, JSON.stringify(v)); } catch (x) {} }
    }).catch(function () {});
  }
  function setupGrowth() {
    setupReport();
    var e = document.getElementById("grEdit"); if (e) e.addEventListener("click", grSheet);
  }
  function grLink() {
    return '<a class="rp-home gr-link" href="#growth"><span class="rh-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg></span>' +
      '<span class="rh-t"><small>MY GROWTH</small><b>첫날 vs 오늘 · 나의 성장 기록</b><em>처음 왔던 날과 지금을 숫자로 비교해요</em></span><span class="rh-go" aria-hidden="true">›</span></a>';
  }
  function reportHomeCard() {   /* 매달 1~7일: 지난달 리포트 도착 */
    var now = new Date();
    if (now.getDate() > 7) return "";
    var ym = ymAdd(ymOf(now), -1), st = startDate();
    if (!st || ymOf(st) > ym) return "";
    var R = reportData(ym);
    if (!R.done) return "";
    return '<a class="rp-home" href="#report-' + ym + '"><span class="rh-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M9 8h6M9 12h6M9 16h3"/></svg></span>' +
      '<span class="rh-t"><small>MONTHLY REPORT</small><b>' + R.mo + '월 리포트가 도착했어요</b><em>출석 ' + R.done + '회 · 출석률 ' + R.rate + '%' + (R.badges.length ? ' · 새 배지 ' + R.badges.length + '개' : '') + '</em></span>' +
      '<span class="rh-go" aria-hidden="true">›</span></a>';
  }

  /* ---------------- 홈 */
  function exMini(d) {
    return '<ul class="mini">' + d.items.map(function (it, i) {
      return '<li><span class="mini-ic' + (it.tag === "메인" ? " main" : "") + '">' + img(iconOf(it), "", true) + '<span class="n">' + (i + 1) + '</span></span>' + esc(it.name) +
        (it.tag ? ' ' + tagChip(it.tag) : '') + '</li>';
    }).join("") + '</ul>';
  }
  function todayHero(k, d) {   /* 홈 오늘 운동 큰 카드 (남 블랙 / 여 핑크레드) */
    var go = function (t) { return '<a class="th-go" href="#routine-' + k + '">' + t + '</a>'; };
    var top = function (eye, title, sub) { return '<div><div class="th-eye">' + eye + '</div><h2>' + title + '</h2>' + (sub ? '<p class="th-sub">' + sub + '</p>' : '') + '</div>'; };
    var label = ROT ? dayName(k) : DAY_KO[k] + "요일";
    if (!d) return '<div class="thero">' + top("TODAY", "루틴이 아직 없어요", "선생님이 곧 올려드릴게요") + '</div>';
    if (d.rest) return '<div class="thero">' + top("TODAY · REST DAY", label + " 쉬는 날", "푹 쉬고 잘 먹는 것도 운동이에요") + '</div>';
    if (d.cardio_only) return '<div class="thero">' + top("TODAY · CARDIO", label + " 유산소만!", "유산소 " + d.cardio_only + "분" + (M.routine.cardio ? " · " + esc(M.routine.cardio.options) : "")) + go("오늘 운동 보기 →") + '</div>';
    if (d.pick) return '<div class="thero">' + top("TODAY · " + esc(d.en.toUpperCase()), "오늘은 골라서 하는 날!", esc(d.note || "이번 주에 아쉬웠던 부위 하나를 골라 그 요일 루틴 그대로 해요")) + go("부위 고르러 가기 →") + '</div>';
    var its = d.items || [], mi = mainItem(d);
    var tiles = its.map(function (it) {
      var main = it === mi && it.tag === "메인";
      return '<a class="th-tile' + (main ? ' main' : '') + '" href="#routine-' + k + '">' + (main ? '<em>메인</em>' : '') + img(iconOf(it), "icn", !main) + '<span>' + esc(it.name) + '</span></a>';
    }).join("");
    return '<div class="thero">' + top("TODAY · " + esc(String(d.en || "").toUpperCase()), label + " " + esc(d.part),
        its.length + "종목" + (d.cardio && M.routine.cardio ? " · 마무리 유산소 " + M.routine.cardio.minutes + "분" : "")) +
      '<div class="th-tiles">' + tiles + '</div>' + go("오늘 운동 시작하기 →") +
      (ROT ? '<p class="th-hint">출석 도장 찍은 날을 세서 다음 순서를 알려줘요. 순서가 다르면 루틴 탭에서 그날 DAY를 눌러요</p>' : '') + '</div>';
  }
  /* 회원 메모 (2026-11-12): 선생님 보기에서만 홈 맨 위 — assets/memo.js(PTMemo), 창고 coach:memo:<주소>(선생님 열쇠로만 읽힘) */
  /* 2026-11-12 "메모칸 간소화 — 상단에 작은 아이콘으로": 홈 칸 대신 위 막대 종 왼쪽 📝 동그라미(메모 개수 배지, 고정 메모 있으면 금색) → 누르면 메모 창 */
  function cmemoDraw(list) {
    var b = document.getElementById("memoBtn"); if (!b) return;
    var n = (list || []).length, pin = (list || []).some(function (x) { return x.pin; });
    b.classList.toggle("pin", pin);
    b.querySelector("i").textContent = n ? (n > 9 ? "9+" : n) : "";
    b.querySelector("i").hidden = !n;
    b.setAttribute("aria-label", "선생님 메모" + (n ? " " + n + "개" : "") + " (회원님께는 안 보여요)");
    b.title = n ? window.PTMemo.line(list) : "선생님 메모 — 회원님께는 안 보여요";
  }
  function cmemoFill() {
    if (!(COACH_MODE && !DEMO)) return;
    var r = document.querySelector(".bar-r"); if (!r || document.getElementById("memoBtn")) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "memob"; b.id = "memoBtn";
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h10l4 4v12H5z"/><path d="M14 4v5h5M8.5 13h7M8.5 16.5h5"/></svg><i hidden></i>';
    r.insertBefore(b, r.firstChild);
    b.addEventListener("click", function () { if (window.PTMemo) window.PTMemo.open(SLUG, M.name, cmemoDraw); });
    function go() { window.PTMemo.load(SLUG).then(function (o) { cmemoDraw(o ? o[SLUG] : []); }); }
    if (window.PTMemo) return go();
    var sc = document.createElement("script"); sc.src = BASE + "memo.js"; sc.onload = go; document.head.appendChild(sc);
  }
  function renderHome() {
    var k = todayKey(), d = dayByKey(k), now = new Date();
    var h = '<div class="hlead hl-bdg">' + bgHomeChip() + '<p>' + esc(M.name) + ' 회원님 · ' + (now.getMonth() + 1) + '월 ' + now.getDate() + '일 ' + DAY_KO[DAY_KEYS[now.getDay()]] + '요일</p><h1>오늘</h1>' + mascot() + '</div>';
    h += attCheckStrip();
    h += todayHero(k, d);
    h += homeWidgets();
    h += instHomeCard();
    h += reportHomeCard();
    h += journeyHome();
    if (IB_ON) h += ibHomeStrip() || '<span class="ibstrip-slot"></span>';


    h += homeInfo();
    return h + remember();
  }

  /* ---------------- 공지 */
  function noticeCard(n) {
    return '<div class="panel notice" data-nkey="' + esc(nKey(n)) + '"><time>' + esc(n.date) + (n.all ? '<span class="nall">전체 공지</span>' : '') + '</time><h3>' + esc(n.title) + '</h3><p>' + esc(n.body) + '</p>' +
      (n.link ? '<a class="btn" href="#' + esc(n.link) + '">바로 보기</a>' : '') + '</div>';
  }
  function renderNotice() {
    var h = meSeg("notice") + '<section>' + head("", "선생님 공지", "새 소식이 위에 있어요");
    h += (M.notices && M.notices.length) ? M.notices.map(noticeCard).join("") :
      '<div class="panel empty"><h3>아직 공지가 없어요</h3></div>';
    return h + '</section>' + remember();
  }

  /* ---------------- 새 공지 팝업 (2026-11-05 트레이너 요청)
     안 본 새 공지가 있으면 페이지를 열 때 위에서 내려왔다가 몇 초 뒤 올라가며 사라짐. 누르면 공지 탭의 그 공지로 이동(반짝 표시).
     - 공지 하나당 팝업은 한 번만(npop). 공지 탭을 열기 전까지 아래 '공지' 탭에 빨간 점(nseen).
     - 날짜가 NOTICE_DAYS일 넘은 공지는 새 공지로 치지 않음. 기록은 회원 휴대폰(localStorage)에만. */
  var NSEEN_KEY = "ptnote:" + SLUG + ":nseen", NPOP_KEY = "ptnote:" + SLUG + ":npop";
  var NOTICE_DAYS = 14, NPOP_MS = 5500, pendingNotice = null;
  function nKey(n) { return (n.date || "") + "|" + (n.title || ""); }
  function lsArr(k) { try { var a = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function lsAdd(k, add) {
    var a = lsArr(k);
    add.forEach(function (x) { if (a.indexOf(x) < 0) a.push(x); });
    try { localStorage.setItem(k, JSON.stringify(a.slice(-80))); } catch (e) {}
  }
  function nDate(n) { var m = String(n.date || "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function nUnseen() {
    var seen = lsArr(NSEEN_KEY), d0 = Date.now() - NOTICE_DAYS * 86400000;
    return (M.notices || []).filter(function (n) { var d = nDate(n); return (!d || d.getTime() >= d0) && seen.indexOf(nKey(n)) < 0; });
  }
  function nDot() {
    var a = document.querySelector('.bar .bell');
    if (a) a.classList.toggle("has-new", nUnseen().length > 0);
  }
  function nMarkSeen() { lsAdd(NSEEN_KEY, (M.notices || []).map(nKey)); lsAdd(NPOP_KEY, (M.notices || []).map(nKey)); nDot(); }
  function openNotice(key) {
    pendingNotice = key;
    if ((location.hash || "").replace(/^#/, "") === "notice") route(); else location.hash = "notice";
  }
  function showNoticePop() {
    if (TOUR_ON || (TOUR_WANT && (!location.hash || location.hash === "#home"))) return;
    var popped = lsArr(NPOP_KEY);
    var list = nUnseen().filter(function (n) { return popped.indexOf(nKey(n)) < 0; });
    if (!list.length) return;
    var n = list[0], extra = list.length - 1, d = nDate(n);
    lsAdd(NPOP_KEY, list.map(nKey));
    var box = document.createElement("div");
    box.className = "npop-wrap"; box.setAttribute("role", "status"); box.setAttribute("aria-live", "polite");
    box.innerHTML = '<button type="button" class="npop" style="--dur:' + NPOP_MS + 'ms" aria-label="새 공지: ' + esc(n.title) + '. 누르면 공지로 이동">' +
      '<span class="nic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 10v4h3l6 4V6L7 10z" stroke-linejoin="round"/><path d="M16.5 9.5a3.5 3.5 0 0 1 0 5M19 7a7 7 0 0 1 0 10" stroke-linecap="round"/></svg></span>' +
      '<span class="ntx"><small><i>NEW</i>선생님 공지' + (d ? ' · ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일' : '') + (extra ? ' · 외 ' + extra + '개' : '') + '</small>' +
      '<b>' + esc(n.title) + '</b>' + (n.body ? '<span class="nbody">' + esc(n.body) + '</span>' : '') + '</span>' +
      '<svg class="ngo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<span class="nbar" aria-hidden="true"></span></button>';
    document.body.appendChild(box);
    var btn = box.firstChild, gone = false, sy = null, swiped = false, timer;
    function hide() {
      if (gone) return; gone = true; clearTimeout(timer);
      btn.classList.remove("in"); btn.classList.add("out");
      setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 500);
    }
    requestAnimationFrame(function () { requestAnimationFrame(function () { btn.classList.add("in"); }); });
    timer = setTimeout(hide, NPOP_MS + 450);
    btn.addEventListener("click", function () { if (swiped) return; hide(); openNotice(nKey(n)); });
    /* 위로 밀면 바로 닫힘 */
    btn.addEventListener("touchstart", function (e) { sy = e.touches[0].clientY; }, { passive: true });
    btn.addEventListener("touchmove", function (e) {
      if (sy != null && e.touches[0].clientY - sy < -24) { swiped = true; sy = null; hide(); }
    }, { passive: true });
  }

  /* ---------------- 복습지 목록 */
  /* 하단 탭 점등 (2026-11-11 "루틴이나 자세복습지 업데이트하면 하단 아이콘도 점등"):
     루틴(버전·업데이트 날짜·폰에서 고친 시각)·복습지(새 id)·식단(updated)이 14일 안에 바뀌었는데 아직 그 탭을 안 열었으면 아이콘에 LED.
     그 탭을 열면 꺼짐(이 휴대폰 localStorage ptnote:<주소>:lit). 복습지 목록 카드에는 아직 안 열어 본 새 복습지에 NEW (…:fopen) */
  var LIT_KEY = "ptnote:" + SLUG + ":lit", FOPEN_KEY = "ptnote:" + SLUG + ":fopen", LIT_DAYS = 14;
  function dRecent(s) {
    var m = String(s || "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
    return !!m && Date.now() - new Date(+m[1], +m[2] - 1, +m[3]).getTime() <= LIT_DAYS * 86400000;
  }
  function litSigs() {
    var o = { routine: [], forms: [], diet: [] }, R = M.routine, D = M.diet, at = RT_REC && RT_REC.at;
    if (R && dRecent(at || R.updated)) o.routine.push("r|" + rtBase(R) + "|" + (at || ""));
    (M.forms || []).forEach(function (f) { if (dRecent(f.date)) o.forms.push("f|" + f.id); });
    if (D && typeof D === "object" && dRecent(D.updated)) o.diet.push("d|" + (D.updated || "") + "|" + (D._at || ""));
    return o;
  }
  function formNew(f) { return !DEMO && dRecent(f.date) && lsArr(FOPEN_KEY).indexOf(f.id) < 0; }
  function litApply(curTab) {
    if (DEMO) return;
    var sg = litSigs();
    if (sg[curTab] && sg[curTab].length) lsAdd(LIT_KEY, sg[curTab]);
    var seen = lsArr(LIT_KEY), on = {};
    Object.keys(sg).forEach(function (t) { var e = tabOf(t); on[e] = on[e] || sg[t].some(function (k) { return seen.indexOf(k) < 0; }); });
    Object.keys(on).forEach(function (t) {
      var a = document.querySelector('.tabs a[data-tab="' + t + '"]');
      if (a) a.classList.toggle("lit", on[t]);
    });
  }

  /* 복습지 부위별 보기 (2026-11-12 장동욱 "복습지 영상들 부위별로 볼 수 있게 구분칸") — part 글자로 부위를 찾음("어깨·등"은 둘 다) */
  var FCATS = [["가슴", /가슴/], ["등", /등/], ["어깨", /어깨/], ["팔", /팔|삼두|이두/], ["하체", /하체|다리|허벅지/], ["엉덩이", /엉덩이|힙/], ["복근", /복근|코어/]];
  var FCAT_K = "ptnote:" + SLUG + ":fcat";
  function formCats(f) {
    var p = String(f.part || ""), out = FCATS.filter(function (c) { return c[1].test(p); }).map(function (c) { return c[0]; });
    return out.length ? out : ["기타"];
  }
  function fmImg(id, w) { return "https://lh3.googleusercontent.com/d/" + encodeURIComponent(id) + "=w" + (w || 1200); }
  function fmThumb(f) {
    var L = FMEDIA[f.id] || [], im = null;
    for (var i = 0; i < L.length; i++) if (L[i].t === "img") { im = L[i]; break; }
    if (im) return '<img src="' + esc(fmImg(im.id, 320)) + '" alt="" loading="lazy">';
    return '<span class="fmd-ph">' + (L.length ? "▶" : "📷") + '</span>';
  }
  function formCard(f) {
    return '<a class="card-link" data-cat="' + esc(formCats(f).join(" ")) + '" href="#form-' + esc(f.id) + '"><div class="thumb">' + (f.simple ? fmThumb(f) : '<img src="' + esc(f.dir) + 'poster.jpg" alt="" loading="lazy">') + '</div>' +
      '<div>' + (f.part ? '<span class="tagc">' + esc(f.part) + '</span>' : '') + (formNew(f) ? '<span class="fnew">NEW</span>' : '') + seenChip(f) + '<h3>' + esc(f.exercise) + '</h3><p>' + (f.simple ? '사진·영상 ' + (FMEDIA[f.id] || []).length + '개' : esc(f.exercise_en)) + ' · ' + esc(f.date) + '</p></div></a>';
  }
  /* 복습지 날짜별로 묶기 (2026-11-12 트레이너 "날짜별 ㄱ") — "11월 12일 (목) · 3개" 제목 아래 그날 복습지. 최신 날짜가 위, 같은 날은 원래 순서
     + 그날 더 한 운동 (2026-11-12 트레이너 "수업한 날 회원님들이 추가로 운동을 더 하면 종목을 더 추가하고 싶다"):
       회원 폰에서 그날 칸 아래 "＋ 이날 더 한 운동 추가" → 창고 저장소 mw:<주소>:xd:<YYYY-MM-DD> [{id, n(종목), s(세트), r(횟수), w(kg), memo, at}] (회원 폰도 쓰기 가능, 하루 4KB까지) */
  var XD_LS = "ptnote:" + SLUG + ":xd", XD = {};
  try { XD = JSON.parse(localStorage.getItem(XD_LS) || "{}") || {}; } catch (e) { XD = {}; }
  function xdServer(kv) {
    if (!kv) return;
    var o = {}, pre = "mw:" + SLUG + ":xd:";
    Object.keys(kv).forEach(function (k) { if (k.indexOf(pre) === 0 && Array.isArray(kv[k]) && kv[k].length) o[k.slice(pre.length)] = kv[k]; });
    if (JSON.stringify(o) === JSON.stringify(XD)) return;
    XD = o; try { localStorage.setItem(XD_LS, JSON.stringify(XD)); } catch (e) {}
    if (/^#forms$/.test(location.hash || "")) route();
  }
  function xdToday() { var t = new Date(); return t.getFullYear() + "-" + ("0" + (t.getMonth() + 1)).slice(-2) + "-" + ("0" + t.getDate()).slice(-2); }
  function formKey(d) { var m = String(d || "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/); return m ? m[1] + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[3]).slice(-2) : ""; }
  function dayLabel(k) {
    if (!k) return "날짜 없음";
    var p = k.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]), DW = ["일", "월", "화", "수", "목", "금", "토"];
    return (p[0] !== String(new Date().getFullYear()) ? p[0] + "년 " : "") + (+p[1]) + "월 " + (+p[2]) + "일 (" + DW[d.getDay()] + ")";
  }
  function xdSetsText(S) {   /* [[kg,회,완료],…] → "3세트 · 25kg×12 · 30×10 · 30×10 · 볼륨 900kg" */
    var v = 0, parts = S.map(function (x, i) {
      var a = parseFloat(x[0]), b = parseFloat(x[1]); if (isFinite(a) && isFinite(b)) v += a * b;
      return (x[0] !== "" && x[0] !== null && x[0] !== undefined ? x[0] + (i ? "" : "kg") + (x[1] !== "" ? "×" : "") : "") + (x[1] !== "" && x[1] !== undefined ? x[1] + (x[0] === "" || x[0] === null ? "회" : "") : "") + (x[2] ? "✓" : "");
    });
    return S.length + "세트 · " + parts.join(" · ") + (v ? " · 볼륨 " + Math.round(v).toLocaleString() + "kg" : "");
  }
  function xdBlock(k) {
    var L = XD[k] || [], can = !DEMO;
    if (!L.length && !can) return "";
    var h = '<div class="xd">';
    if (L.length) h += '<div class="xdh">이날 더 한 운동 <small>' + L.length + '개</small></div>' + L.map(function (x) {
      var sr = Array.isArray(x.sets) && x.sets.length ? xdSetsText(x.sets) : [[x.s ? x.s + "세트" : "", x.r ? x.r + "회" : ""].filter(Boolean).join(" × "), x.w ? x.w + "kg" : ""].filter(Boolean).join(" · ");
      return '<div class="xdi">' + img(iconOf({ name: x.n }), "xdic", true) + '<div><b>' + esc(x.n) + '</b>' + (sr ? '<span>' + esc(sr) + '</span>' : '') +
        (x.memo ? '<p>' + esc(x.memo) + '</p>' : '') + '</div>' + (can ? '<div class="xdbt"><button type="button" class="xded" data-xadd="' + esc(k) + '" data-xid="' + esc(x.id) + '">✎</button><button type="button" class="xddel" data-xdel="' + esc(k + "|" + x.id) + '">삭제</button></div>' : '') + '</div>';
    }).join("");
    if (can) h += '<button type="button" class="xdadd" data-xadd="' + esc(k) + '">＋ 이날 더 한 운동 추가</button>';
    return h + '</div>';
  }
  var FC_M = "", FD_OPEN = {};
  function fdSet(g, open) {
    var k = g.id.slice(3); FD_OPEN[k] = open;
    g.classList.toggle("fold", !open);
    var h = g.querySelector("[data-fdt]"); if (h) h.setAttribute("aria-expanded", open ? "true" : "false");
  }
  document.addEventListener("click", function (e) {
    var h = e.target.closest && e.target.closest("[data-fdt]"); if (!h) return;
    var g = h.parentNode; fdSet(g, g.classList.contains("fold"));
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.hasAttribute && e.target.hasAttribute("data-fdt")) { e.preventDefault(); e.target.click(); }
  });
  function fdCal() {
    var has = {}, xd = {};
    M.forms.forEach(function (f) { var k = formKey(f.date); if (k) has[k] = (has[k] || 0) + 1; });
    Object.keys(XD).forEach(function (k) { if ((XD[k] || []).length) xd[k] = 1; });
    var today = xdToday();
    if (!FC_M) FC_M = today.slice(0, 7);
    var y = +FC_M.slice(0, 4), m = +FC_M.slice(5, 7), first = new Date(y, m - 1, 1).getDay(), n = new Date(y, m, 0).getDate();
    var cnt = 0, cells = "";
    for (var i = 0; i < first; i++) cells += '<span class="fc-d fc-x"></span>';
    for (var d = 1; d <= n; d++) {
      var k = FC_M + "-" + ("0" + d).slice(-2), f = has[k], x = xd[k], dw = (first + d - 1) % 7;
      var cl = "fc-d" + (dw === 0 ? " sun" : dw === 6 ? " sat" : "") + (k === today ? " now" : k > today ? " fut" : "") + (f || x ? " on" : "");
      var dots = (f ? '<i class="fc-f"></i>' : '') + (x ? '<i class="fc-e"></i>' : '');
      if (f || x) { cnt++; cells += '<button type="button" class="' + cl + '" data-fcd="' + k + '" aria-label="' + esc(dayLabel(k)) + (f ? ' 복습지 ' + f + '개' : '') + (x ? ' 더 한 운동' : '') + '">' + d + '<em>' + dots + '</em></button>'; }
      else if (!DEMO && k <= today) cells += '<button type="button" class="' + cl + '" data-xadd="' + k + '" aria-label="' + esc(dayLabel(k)) + ' 더 한 운동 적기">' + d + '<em></em></button>';
      else cells += '<span class="' + cl + '">' + d + '<em></em></span>';
    }
    return '<div class="fcal" id="fcal"><div class="fc-h"><button type="button" data-fcm="-1" aria-label="지난달">‹</button><b>' + y + '년 ' + m + '월</b><button type="button" data-fcm="1" aria-label="다음달">›</button></div>' +
      '<div class="fc-w"><span class="sun">일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span class="sat">토</span></div>' +
      '<div class="fc-g">' + cells + '</div><p class="fc-l"><span><i class="fc-f"></i>자세 복습지</span><span><i class="fc-e"></i>더 한 운동</span><small>' + (cnt ? '이번 달 ' + cnt + '일 운동했어요' : '이 달엔 기록이 없어요') + '</small></p></div>';
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-fcm],[data-fcd]");
    if (!t) return;
    if (t.hasAttribute("data-fcm")) {
      var y = +FC_M.slice(0, 4), m = +FC_M.slice(5, 7) + (+t.getAttribute("data-fcm"));
      if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; }
      FC_M = y + "-" + ("0" + m).slice(-2);
      var c = document.getElementById("fcal"); if (c) c.outerHTML = fdCal();
      return;
    }
    var k = t.getAttribute("data-fcd"), el = document.getElementById("fd-" + k);
    if (!el) return;
    var all = document.querySelector('.fcat [data-fc=""]');
    if (el.offsetParent === null && all) all.click();
    fdSet(el, true);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.remove("fd-hit"); void el.offsetWidth; el.classList.add("fd-hit");
  });
  function formDays() {
    var G = {}, order = [];
    function add(k) { if (!G[k]) { G[k] = []; order.push(k); } }
    M.forms.forEach(function (f) { var k = formKey(f.date); add(k); G[k].push(f); });
    Object.keys(XD).forEach(function (k) { if ((XD[k] || []).length) add(k); });
    order.sort(function (a, b) { return a < b ? 1 : a > b ? -1 : 0; });
    var top = !DEMO && order.indexOf(xdToday()) < 0 ? '<button type="button" class="xdadd today" data-xadd="' + xdToday() + '">＋ 오늘 더 한 운동 기록하기<small>수업 말고 혼자 더 한 운동을 적어 두세요</small></button>' : '';
    return top + order.map(function (k) {
      var fs = G[k];
      if (FD_OPEN[k] === undefined) FD_OPEN[k] = k === order[0];
      return '<div class="fday' + (FD_OPEN[k] ? '' : ' fold') + '" id="fd-' + k + '"><h3 role="button" tabindex="0" data-fdt="' + k + '" aria-expanded="' + (FD_OPEN[k] ? 'true' : 'false') + '">' + esc(dayLabel(k)) + '<small>' + (fs.length ? '복습지 ' + fs.length + '개' : '') + ((XD[k] || []).length ? (fs.length ? ' · ' : '') + '더 한 운동 ' + XD[k].length + '개' : '') + '</small></h3>' +
        '<div class="fd-b">' + (fs.length ? '<div class="flist">' + fs.map(formCard).join("") + '</div>' : '') + xdBlock(k) + '</div></div>';
    }).join("");
  }
  function xdSave(k, arr, sh, ok) {
    var key = "mw:" + SLUG + ":xd:" + k, items = {}; items[key] = arr.length ? arr : null;
    if (JSON.stringify(arr).length > 3800) { if (sh) sh.msg("하루에 적을 수 있는 양을 넘었어요 — 메모를 줄여 주세요"); return; }
    if (sh) sh.msg("저장하는 중…");
    rtPost({ a: "kv_set", items: items }).then(function (j) {
      if (!j || !j.ok) { if (sh) sh.msg(j && j.error === "action" ? "창고를 새 버전으로 다시 배포해야 해요" : "저장이 안 됐어요 — 다시 눌러 주세요"); else attToast("저장이 안 됐어요"); return; }
      if (arr.length) XD[k] = arr; else delete XD[k];
      try { localStorage.setItem(XD_LS, JSON.stringify(XD)); } catch (e) {}
      if (sh) sh.close(); route(); attToast(ok);
    }).catch(function () { if (sh) sh.msg(rtNetMsg()); else attToast(rtNetMsg()); });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-xadd]");
    if (a) {
      /* 2026-11-20 팀장 "운동 기록 앱처럼 세트추가·세트삭제" — 세트마다 kg·회·완료 ✓, 볼륨 자동 계산. 저장 = sets [[kg, 회, 완료(0/1)], …] (+ 옛 화면용 s·r·w) */
      var k = a.getAttribute("data-xadd"), xid = a.getAttribute("data-xid"), names = [];
      var x0 = xid ? (XD[k] || []).filter(function (x) { return x.id === xid; })[0] || null : null;
      RT_CAT.forEach(function (c) { c[1].forEach(function (n) { if (names.indexOf(n) < 0) names.push(n); }); });
      var S0 = x0 && Array.isArray(x0.sets) && x0.sets.length ? x0.sets : x0 && (x0.s || x0.r || x0.w) ? Array.apply(null, Array(Math.max(1, Math.min(20, +x0.s || 1)))).map(function () { return [x0.w || "", x0.r || "", 0]; }) : [["", "", 0], ["", "", 0], ["", "", 0]];
      function row(v, i) {
        return '<div class="xs-r"><span class="xs-n">' + (i + 1) + '</span><input class="xs-w" inputmode="decimal" maxlength="6" placeholder="kg" value="' + esc(v[0] === null || v[0] === undefined ? "" : v[0]) + '">' +
          '<input class="xs-c" inputmode="numeric" maxlength="6" placeholder="회" value="' + esc(v[1] === undefined ? "" : v[1]) + '"><button type="button" class="xs-d' + (v[2] ? ' on' : '') + '" aria-label="' + (i + 1) + '세트 완료">✓</button></div>';
      }
      var sh = rtSheet(dayLabel(k) + (x0 ? " 운동 고치기" : " 더 한 운동"),
        '<label>운동 이름<input id="xdN" list="xdNL" maxlength="30" placeholder="예: 레그 익스텐션" autocomplete="off" value="' + esc(x0 ? x0.n : a.getAttribute("data-xname") || "") + '"></label><datalist id="xdNL">' + names.map(function (n) { return '<option value="' + esc(n) + '">'; }).join("") + '</datalist>' +
        '<div class="xs-prev" id="xsPrev"></div>' +
        '<div class="xs"><div class="xs-h"><span>세트</span><span>KG</span><span>회</span><span>완료</span></div><div id="xsRows">' + S0.map(row).join("") + '</div>' +
        '<div class="xs-btns"><button type="button" class="xs-add" id="xsAdd">＋ 세트추가</button><button type="button" class="xs-del" id="xsDel">－ 세트삭제</button></div>' +
        '<div class="xs-vol" id="xsVol"></div><div class="xs-rest" id="xsRest" hidden></div></div>' +
        '<label>메모 <small>없어도 돼요</small><input id="xdM" maxlength="60" placeholder="예: 마지막 세트 힘들었어요" autocomplete="off" value="' + esc(x0 && x0.memo || "") + '"></label>',
        function (s) {
          var n = fv(s, "xdN"); if (!n) return "운동 이름을 넣어 주세요";
          var sets = rows().filter(function (v) { return v[0] !== "" || v[1] !== ""; });
          var w = sets.reduce(function (m, v) { var q = parseFloat(v[0]); return isFinite(q) && q > m ? q : m; }, 0);
          var x = { id: x0 ? x0.id : Date.now().toString(36), n: n, sets: sets, s: sets.length ? String(sets.length) : "", r: sets.length ? String(sets[0][1]) : "", w: w ? String(w) : "", memo: fv(s, "xdM"), at: x0 ? x0.at : new Date().toISOString() };
          Object.keys(x).forEach(function (q) { if (x[q] === "" || (Array.isArray(x[q]) && !x[q].length)) delete x[q]; });
          var L = (XD[k] || []).slice(), ix = x0 ? L.map(function (y) { return y.id; }).indexOf(x0.id) : -1;
          if (ix >= 0) L[ix] = x; else L.push(x);
          xdSave(k, L, s, n + (x0 ? " 고쳤어요" : " 추가했어요"));
          return true;
        }, x0 ? "저장" : "추가");
      function rows() {
        return Array.prototype.map.call(sh.querySelectorAll(".xs-r"), function (r) {
          var w = r.querySelector(".xs-w").value.trim().replace(/kg/i, ""), c = r.querySelector(".xs-c").value.trim();
          return [w === "" ? "" : (isFinite(+w) ? +w : w), c === "" ? "" : (isFinite(+c) ? +c : c), r.querySelector(".xs-d").classList.contains("on") ? 1 : 0];
        });
      }
      function vol() {
        var R = rows(), v = R.reduce(function (t, x) { var a = parseFloat(x[0]), b = parseFloat(x[1]); return t + (isFinite(a) && isFinite(b) ? a * b : 0); }, 0), d = R.filter(function (x) { return x[2]; }).length;
        sh.querySelector("#xsVol").innerHTML = '볼륨 <b>' + (Math.round(v * 10) / 10).toLocaleString() + '</b> kg <small>' + R.length + '세트' + (d ? ' · 완료 ' + d : '') + '</small>';
      }
      function renum() { Array.prototype.forEach.call(sh.querySelectorAll(".xs-n"), function (n, i) { n.textContent = i + 1; }); }
      sh.addEventListener("click", function (ev) {
        if (ev.target.closest(".xs-d")) { var dn = ev.target.closest(".xs-d"); dn.classList.toggle("on"); vol(); if (dn.classList.contains("on")) restStart(); return; }
        var rb = ev.target.closest("[data-rest]");
        if (rb) {
          var rv = rb.getAttribute("data-rest");
          if (rv === "x") { clearInterval(restT); sh.querySelector("#xsRest").hidden = true; return; }
          rv = +rv; restDur = Math.max(15, Math.min(600, restDur + rv)); restLeft = Math.max(0, restLeft + rv);
          try { localStorage.setItem(REST_K, String(restDur)); } catch (e2) {}
          restDraw(); return;
        }
        if (ev.target.closest("#xsLoad")) {
          var ph = exlHist()[fv(sh, "xdN")], pst = ph && Array.isArray(ph.x.sets) ? ph.x.sets : [];
          if (pst.length) { sh.querySelector("#xsRows").innerHTML = pst.map(function (v, i) { return row([v[0], v[1], 0], i); }).join(""); vol(); attToast("지난번 기록을 불러왔어요"); }
          return;
        }
        if (ev.target.closest("#xsAdd")) {
          var R = rows(); if (R.length >= 20) { sh.msg("20세트까지 넣을 수 있어요"); return; }
          var last = R[R.length - 1] || ["", "", 0];
          sh.querySelector("#xsRows").insertAdjacentHTML("beforeend", row([last[0], last[1], 0], R.length)); vol(); return;
        }
        if (ev.target.closest("#xsDel")) {
          var all = sh.querySelectorAll(".xs-r"); if (all.length <= 1) { sh.msg("1세트는 남겨 둘게요"); return; }
          all[all.length - 1].remove(); renum(); vol();
        }
      });
      sh.addEventListener("input", function (ev) { if (ev.target.id === "xdN") prevDraw(); vol(); });
      /* 지난번 기록 보여 주고 그대로 불러오기 + 세트 ✓ 누르면 휴식 타이머 (2026-11-20 팀장 "플릭 앱처럼") */
      var REST_K = "ptnote:" + SLUG + ":rest", restT = null, restLeft = 0, restDur = 90;
      try { restDur = +localStorage.getItem(REST_K) || 90; } catch (e3) {}
      function restDraw() {
        var el = sh.querySelector("#xsRest"); if (!el || !sh.isConnected) { clearInterval(restT); return; }
        var L0 = Math.max(0, restLeft);
        el.hidden = false; el.className = "xs-rest" + (L0 <= 0 ? " done" : "");
        el.innerHTML = '<i style="width:' + (L0 > 0 ? L0 / restDur * 100 : 100) + '%"></i><span class="xr-l">' + (L0 > 0 ? '쉬는 중' : '다음 세트 시작!') + '</span><b>' + Math.floor(L0 / 60) + ':' + ("0" + L0 % 60).slice(-2) + '</b>' +
          '<button type="button" data-rest="-15">−15초</button><button type="button" data-rest="15">+15초</button><button type="button" data-rest="x">' + (L0 > 0 ? '건너뛰기' : '닫기') + '</button>';
      }
      function restStart() {
        clearInterval(restT); restLeft = restDur; restDraw();
        restT = setInterval(function () {
          if (!sh.isConnected) { clearInterval(restT); return; }
          restLeft--;
          if (restLeft <= 0) { clearInterval(restT); try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e4) {} }
          restDraw();
        }, 1000);
      }
      function prevDraw() {
        var el = sh.querySelector("#xsPrev"); if (!el || x0) return;
        var h = exlHist()[fv(sh, "xdN")];
        if (!h || !h.x) { el.innerHTML = ""; return; }
        var st = Array.isArray(h.x.sets) ? h.x.sets : [];
        el.innerHTML = '<div><b>' + esc(exlLast(h)) + '</b>' + (st.length ? '<small>' + st.map(function (v) { return (v[0] !== "" ? v[0] + "kg" : "-") + " × " + (v[1] !== "" ? v[1] : "-"); }).join("  ·  ") + '</small>' : '') + '</div>' +
          (st.length ? '<button type="button" id="xsLoad">그대로 불러오기</button>' : '');
      }
      prevDraw();
      vol();
      if (!x0) setTimeout(function () { var i = sh.querySelector("#xdN"); if (i) i.focus(); }, 50);
      return;
    }
    var d = e.target.closest && e.target.closest("[data-xdel]");
    if (d) {
      if (!d.classList.contains("sure")) { d.classList.add("sure"); d.textContent = "한 번 더"; setTimeout(function () { d.classList.remove("sure"); d.textContent = "삭제"; }, 2500); return; }
      var p = d.getAttribute("data-xdel").split("|");
      xdSave(p[0], (XD[p[0]] || []).filter(function (x) { return x.id !== p[1]; }), null, "지웠어요");
    }
  });
  /* ---------------- 운동 목록 (2026-11-20 팀장 "운동 앱처럼 루틴에 — 움직이는 그림, 부위·기구별로 나누고, 누르면 세트추가·무게 기록")
     EXL = [이름, 부위(쉼표), 기구, 아이콘 키]. 그림은 exicons.js 움직이는 그림(없으면 PNG). 누르면 오늘 날짜 '더 한 운동' 세트 표(XD)가 이름 채워진 채로 열림.
     좋아하는 = 하트(이 폰에만 저장) · 자주하는/최근 = 지금까지 적은 기록(XD) · 커스텀 = 목록에 없는 이름으로 적은 운동 */
  var EXL = [
    ["벤치프레스","가슴,삼두,어깨","바벨","bench_press"],["인클라인 벤치프레스","가슴,어깨,삼두","바벨","smith_incline_press"],["디클라인 벤치프레스","가슴,삼두","바벨","bench_press"],
    ["덤벨 벤치프레스","가슴,삼두","덤벨","db_bench_press"],["인클라인 덤벨 프레스","가슴,어깨","덤벨","incline_db_press"],["덤벨 플라이","가슴","덤벨","db_bench_press"],["인클라인 덤벨 플라이","가슴","덤벨","incline_db_press"],
    ["스미스 벤치프레스","가슴,삼두","스미스","smith_bench_press"],["스미스 인클라인 프레스","가슴,어깨","스미스","smith_incline_press"],
    ["체스트 프레스 머신","가슴,삼두","머신","chest_press"],["라잉 체스트 프레스 머신","가슴,삼두","머신","lying_chest_press"],["플랫 벤치프레스 머신","가슴,삼두","머신","lying_chest_press"],["인클라인 프레스 머신","가슴,어깨","머신","incline_machine_press"],["펙덱 플라이","가슴","머신","pec_deck"],
    ["케이블 체스트 프레스","가슴","케이블","cable_chest_press"],["케이블 크로스오버","가슴","케이블","cable_chest_press"],
    ["푸쉬업","가슴,삼두","맨몸","band_push_up"],["딥스","가슴,삼두","맨몸","band_push_up"],["랙 밴드 푸쉬업","가슴,삼두","밴드","band_push_up"],
    ["랫풀다운","등,이두","머신","lat_pulldown"],["와이드 그립 랫풀다운","등","머신","wide_pulldown"],["클로즈그립 랫풀다운","등,이두","머신","close_grip_pulldown"],["패럴렐 그립 랫풀다운","등,이두","머신","close_grip_pulldown"],
    ["언더그립 랫풀다운","등,이두","머신","underhand_pulldown"],["버티컬 풀다운","등","머신","vertical_pulldown"],["어시스트 친업","등,이두","머신","assisted_chin_up"],["풀업","등,이두","맨몸","assisted_chin_up"],["친업","등,이두","맨몸","assisted_chin_up"],
    ["케이블 시티드 로우","등,이두","케이블","cable_seated_row"],["언더그립 시티드 로우","등,이두","케이블","underhand_seated_row"],["롱풀","등,이두","케이블","cable_seated_row"],
    ["시티드 로우 머신","등,이두","머신","seated_row_machine"],["엠토처 시티드 로우","등","머신","mtorture_row"],["하이 로우 머신","등","머신","high_row"],["로우 로우 머신","등","머신","low_row"],["프론트 로우 머신","등","머신","front_row"],["티바 로우","등,이두","머신","tbar_row"],
    ["바벨 로우","등,이두","바벨","smith_row"],["펜들레이 로우","등","바벨","smith_row"],["스미스 벤트오버 로우","등,이두","스미스","smith_row"],["원암 덤벨 로우","등,이두","덤벨","one_arm_row"],["벤트오버 덤벨 로우","등,이두","덤벨","one_arm_row"],
    ["스트레이트 암 풀다운","등","케이블","straight_arm_pulldown"],["케이블 풀오버","등","케이블","cable_pullover"],["데드리프트","등,하체,엉덩이","바벨","db_rdl"],["백 익스텐션","등,엉덩이","맨몸","back_extension"],
    ["숄더 프레스 머신","어깨,삼두","머신","shoulder_press"],["머신 비하인드 넥 프레스","어깨,삼두","머신","shoulder_press"],["덤벨 숄더 프레스","어깨,삼두","덤벨","shoulder_press"],["아놀드 프레스","어깨","덤벨","shoulder_press"],
    ["바벨 오버헤드 프레스","어깨,삼두","바벨","smith_shoulder_press"],["스미스 숄더 프레스","어깨,삼두","스미스","smith_shoulder_press"],
    ["사이드 레터럴 레이즈","어깨","덤벨","lateral_raise"],["시티드 레터럴 레이즈","어깨","덤벨","seated_lateral_raise"],["사이드 레터럴 레이즈 머신","어깨","머신","lateral_raise_machine"],["스탠딩 사이드 레터럴 레이즈 머신","어깨","머신","lateral_raise_standing"],
    ["케이블 레터럴 레이즈","어깨","케이블","lateral_raise_standing"],["덤벨 프론트 레이즈","어깨","덤벨","lateral_raise"],["리버스 펙덱","어깨,등","머신","reverse_pec_deck"],["벤트오버 레터럴 레이즈","어깨,등","덤벨","reverse_pec_deck"],
    ["페이스풀","어깨,등","케이블","face_pull"],["스탠딩 페이스풀","어깨,등","케이블","standing_face_pull"],["덤벨 슈러그","등,어깨","덤벨","shrug"],["스미스 슈러그","등,어깨","스미스","smith_shrug"],["업라이트 로우","어깨","바벨","shrug"],
    ["케이블 푸쉬다운","삼두","케이블","cable_pushdown"],["로프 푸쉬다운","삼두","케이블","cable_pushdown"],["오버헤드 익스텐션","삼두","케이블","overhead_ext"],["덤벨 오버헤드 익스텐션","삼두","덤벨","overhead_ext"],
    ["라잉 트라이셉스 익스텐션","삼두","바벨","overhead_ext"],["덤벨 킥백","삼두","덤벨","one_arm_row"],["클로즈그립 벤치프레스","삼두,가슴","바벨","bench_press"],
    ["덤벨 컬","이두","덤벨","db_curl"],["해머 컬","이두","덤벨","db_curl"],["바벨 컬","이두","바벨","db_curl"],["EZ바 컬","이두","바벨","db_curl"],["인클라인 덤벨 컬","이두","덤벨","incline_db_curl"],
    ["스파이더 컬","이두","덤벨","spider_curl"],["프리처 컬 머신","이두","머신","preacher_curl_machine"],["머신 암 컬","이두","머신","preacher_curl_machine"],["케이블 컬","이두","케이블","db_curl"],
    ["스쿼트","하체,엉덩이","바벨","squat"],["스미스 스쿼트","하체,엉덩이","스미스","smith_squat"],["고블릿 스쿼트","하체,엉덩이","덤벨","goblet_squat"],["맨몸 스쿼트","하체,엉덩이","맨몸","goblet_squat"],
    ["핵스쿼트","하체","머신","hack_squat"],["핵프레스","하체","머신","hack_press"],["레그프레스","하체,엉덩이","머신","leg_press"],["파워 레그프레스","하체,엉덩이","머신","leg_press"],
    ["레그 익스텐션","하체","머신","leg_extension"],["라잉 레그컬","하체","머신","lying_leg_curl"],["시티드 레그컬","하체","머신","seated_leg_curl"],["이너타이","하체","머신","inner_thigh"],
    ["런지","하체,엉덩이","덤벨","goblet_squat"],["스플릿 스쿼트","하체,엉덩이","덤벨","goblet_squat"],["불가리안 스플릿 스쿼트","하체,엉덩이","덤벨","goblet_squat"],
    ["루마니안 데드리프트","하체,엉덩이","바벨","db_rdl"],["덤벨 루마니안 데드리프트","하체,엉덩이","덤벨","db_rdl"],["스티프 레그 데드리프트","하체,엉덩이","바벨","db_rdl"],["덤벨 컨벤셔널 데드리프트","엉덩이,하체,등","덤벨","db_rdl"],["카프 레이즈","하체","머신","leg_press"],
    ["아웃타이 머신","엉덩이","머신","outer_thigh"],["스탠딩 아웃타이","엉덩이","머신","outer_thigh_pin"],["플레이트 아웃타이","엉덩이","머신","outer_thigh_plate"],
    ["힙쓰러스트","엉덩이,하체","바벨","hip_thrust"],["힙쓰러스트 머신","엉덩이","머신","hip_thrust"],["몬스터 글루트","엉덩이","머신","hip_thrust"],["글루트 브릿지","엉덩이","맨몸","hip_thrust"],
    ["케이블 힙 킥백","엉덩이","케이블","cable_kickback"],["힙 익스텐션","엉덩이","머신","back_extension"],
    ["플랭크","복근","맨몸","plank"],["크런치","복근","맨몸","dead_bug"],["레그 레이즈","복근","맨몸","dead_bug"],["데드버그","복근","맨몸","dead_bug"],["행잉 레그 레이즈","복근","맨몸","assisted_chin_up"],
    ["트레드밀","유산소","유산소","treadmill"],["인클라인 워킹","유산소","유산소","walk"],["천국의 계단","유산소","유산소","stair_climber"],["실내 사이클","유산소","유산소","bike"],
    ["폼롤러","스트레칭","스트레칭","foam_roller"]
    ,
    ["디클라인 덤벨 프레스","가슴,삼두","덤벨","db_bench_press"],["덤벨 풀오버","가슴,등","덤벨","cable_pullover"],["해머 스트렝스 체스트 프레스","가슴,삼두","머신","chest_press"],
    ["케이블 플라이","가슴","케이블","cable_chest_press"],["로우 케이블 플라이","가슴,어깨","케이블","cable_chest_press"],["하이 케이블 플라이","가슴","케이블","cable_chest_press"],
    ["니 푸쉬업","가슴,삼두","맨몸","band_push_up"],["인클라인 푸쉬업","가슴,삼두","맨몸","band_push_up"],["디클라인 푸쉬업","가슴,어깨","맨몸","band_push_up"],["어시스트 딥스 머신","가슴,삼두","머신","band_push_up"],
    ["원암 케이블 로우","등,이두","케이블","cable_seated_row"],["원암 랫풀다운","등","케이블","lat_pulldown"],["인버티드 로우","등,이두","맨몸","smith_row"],["체스트 서포티드 로우","등","덤벨","low_row"],
    ["메도우스 로우","등","바벨","one_arm_row"],["랙 풀","등,엉덩이","바벨","db_rdl"],["스모 데드리프트","하체,엉덩이,등","바벨","db_rdl"],["트랩바 데드리프트","하체,엉덩이,등","바벨","db_rdl"],["굿모닝","엉덩이,하체,등","바벨","back_extension"],
    ["시티드 덤벨 숄더 프레스","어깨,삼두","덤벨","shoulder_press"],["바벨 비하인드 넥 프레스","어깨,삼두","바벨","smith_shoulder_press"],["랜드마인 프레스","어깨,가슴","바벨","shoulder_press"],
    ["케이블 프론트 레이즈","어깨","케이블","lateral_raise_standing"],["바벨 프론트 레이즈","어깨","바벨","lateral_raise"],["Y 레이즈","어깨,등","덤벨","lateral_raise"],
    ["케이블 리어 델트 플라이","어깨,등","케이블","reverse_pec_deck"],["덤벨 업라이트 로우","어깨","덤벨","shrug"],["케이블 업라이트 로우","어깨","케이블","shrug"],["바벨 슈러그","등,어깨","바벨","shrug"],
    ["원암 케이블 푸쉬다운","삼두","케이블","cable_pushdown"],["리버스 그립 푸쉬다운","삼두","케이블","cable_pushdown"],["트라이셉스 익스텐션 머신","삼두","머신","cable_pushdown"],
    ["벤치 딥스","삼두,가슴","맨몸","band_push_up"],["스컬 크러셔","삼두","바벨","overhead_ext"],["덤벨 라잉 익스텐션","삼두","덤벨","overhead_ext"],
    ["컨센트레이션 컬","이두","덤벨","db_curl"],["케이블 해머 컬","이두","케이블","db_curl"],["EZ바 프리처 컬","이두","바벨","preacher_curl_machine"],["드래그 컬","이두","바벨","db_curl"],["리버스 컬","이두","바벨","db_curl"],
    ["프론트 스쿼트","하체,엉덩이","바벨","squat"],["박스 스쿼트","하체,엉덩이","바벨","squat"],["와이드 스쿼트","하체,엉덩이","바벨","squat"],["스모 스쿼트","하체,엉덩이","덤벨","goblet_squat"],
    ["펜듈럼 스쿼트","하체,엉덩이","머신","hack_squat"],["브이 스쿼트 머신","하체,엉덩이","머신","hack_squat"],["벨트 스쿼트","하체,엉덩이","머신","goblet_squat"],["시시 스쿼트","하체","맨몸","goblet_squat"],
    ["워킹 런지","하체,엉덩이","덤벨","goblet_squat"],["리버스 런지","하체,엉덩이","덤벨","goblet_squat"],["사이드 런지","하체,엉덩이","덤벨","goblet_squat"],["스텝업","하체,엉덩이","덤벨","goblet_squat"],
    ["스미스 런지","하체,엉덩이","스미스","smith_squat"],["스미스 스플릿 스쿼트","하체,엉덩이","스미스","smith_squat"],["싱글 레그 익스텐션","하체","머신","leg_extension"],
    ["스탠딩 레그컬","하체","머신","lying_leg_curl"],["노르딕 컬","하체","맨몸","lying_leg_curl"],["원레그 데드리프트","하체,엉덩이","덤벨","db_rdl"],
    ["스탠딩 카프 레이즈","하체","머신","leg_press"],["시티드 카프 레이즈","하체","머신","leg_press"],["덤벨 카프 레이즈","하체","덤벨","goblet_squat"],
    ["스미스 힙쓰러스트","엉덩이,하체","스미스","hip_thrust"],["덤벨 힙쓰러스트","엉덩이","덤벨","hip_thrust"],["싱글 레그 힙쓰러스트","엉덩이","맨몸","hip_thrust"],["프로그 펌프","엉덩이","맨몸","hip_thrust"],
    ["케이블 풀스루","엉덩이,하체","케이블","db_rdl"],["킥백 머신","엉덩이","머신","cable_kickback"],["동키킥","엉덩이","맨몸","cable_kickback"],["클램쉘","엉덩이","밴드","outer_thigh"],["밴드 사이드 워크","엉덩이","밴드","outer_thigh"],
    ["케틀벨 스윙","엉덩이,하체,전신","케틀벨","db_rdl"],["케틀벨 고블릿 스쿼트","하체,엉덩이","케틀벨","goblet_squat"],["케틀벨 데드리프트","엉덩이,하체","케틀벨","db_rdl"],
    ["사이드 플랭크","복근","맨몸","plank"],["러시안 트위스트","복근","맨몸","dead_bug"],["바이시클 크런치","복근","맨몸","dead_bug"],["리버스 크런치","복근","맨몸","dead_bug"],["싯업","복근","맨몸","dead_bug"],
    ["할로우 바디 홀드","복근","맨몸","dead_bug"],["버드독","복근,엉덩이","맨몸","plank"],["마운틴 클라이머","복근,전신","맨몸","plank"],["AB 롤아웃","복근","맨몸","plank"],
    ["케이블 크런치","복근","케이블","dead_bug"],["앱 크런치 머신","복근","머신","dead_bug"],["행잉 니 레이즈","복근","맨몸","assisted_chin_up"],
    ["버피","전신,유산소","맨몸","goblet_squat"],["점핑잭","전신,유산소","맨몸","walk"],["로잉 머신","유산소,등","유산소","walk"],["일립티컬","유산소","유산소","bike"],["줄넘기","유산소","유산소","walk"],
    ["야외 걷기","유산소","유산소","walk"],["러닝","유산소","유산소","treadmill"],
    ["고양이-소 스트레칭","스트레칭","스트레칭","plank"],["햄스트링 스트레칭","스트레칭","스트레칭","dead_bug"],["고관절 스트레칭","스트레칭","스트레칭","dead_bug"],["비둘기 자세","스트레칭","스트레칭","plank"],
    ["흉추 회전 스트레칭","스트레칭","스트레칭","foam_roller"],["어깨 스트레칭","스트레칭","스트레칭","foam_roller"],["종아리 스트레칭","스트레칭","스트레칭","walk"]
  ];
  var EXL_M = ["가슴", "등", "어깨", "삼두", "이두", "하체", "엉덩이", "복근", "전신", "유산소"];
  var EXL_E = ["머신", "케이블", "덤벨", "바벨", "스미스", "케틀벨", "맨몸", "밴드", "유산소", "스트레칭"];
  var EXL_F = [["", "전체"], ["fav", "좋아하는"], ["freq", "자주하는"], ["recent", "최근"], ["custom", "커스텀"]];
  var EXL_K = "ptnote:" + SLUG + ":exl", EXS = { f: "", m: "", e: "", q: "" }, EXFAV = {};
  try { var ex0 = JSON.parse(localStorage.getItem(EXL_K) || "null"); if (ex0) { EXS.f = ex0.f || ""; EXS.m = ex0.m || ""; EXS.e = ex0.e || ""; EXFAV = ex0.fav || {}; } } catch (e) {}
  function exlSave() { try { localStorage.setItem(EXL_K, JSON.stringify({ f: EXS.f, m: EXS.m, e: EXS.e, fav: EXFAV })); } catch (e) {} }
  function exlHist() {   /* 이름별: 몇 번 했는지 · 마지막 날짜 · 마지막 기록 */
    var H = {};
    Object.keys(XD).sort().forEach(function (k) {
      (XD[k] || []).forEach(function (x) {
        var h = H[x.n] || (H[x.n] = { c: 0, last: "", x: null }); h.c++; h.last = k; h.x = x;
      });
    });
    return H;
  }
  function exlLast(h) {
    if (!h) return "";
    var x = h.x, best = null;
    (Array.isArray(x.sets) ? x.sets : []).forEach(function (v) { var w = parseFloat(v[0]); if (!best || (isFinite(w) && w > parseFloat(best[0] || 0))) best = v; });
    var t = best ? ((best[0] !== "" && best[0] != null ? best[0] + "kg" : "") + (best[1] ? (best[0] ? " × " : "") + best[1] + "회" : "")) : x.w ? x.w + "kg" + (x.r ? " × " + x.r + "회" : "") : "";
    var p = h.last.split("-");
    return "지난번 " + (+p[1]) + "/" + (+p[2]) + (t ? " · " + t : "");
  }
  function exInfo(n) {   /* 운동 그림 누르면: 큰 움직이는 그림 + 내 기록(최고 무게·추정 1RM·볼륨·그래프·최근 기록) */
    var x = EXL.filter(function (y) { return y[0] === n; })[0] || [n, "", "커스텀", iconOf({ name: n })];
    var recs = [];
    Object.keys(XD).sort().forEach(function (k) { (XD[k] || []).forEach(function (r) { if (r.n === n) recs.push([k, r]); }); });
    function sets(r) { return Array.isArray(r.sets) && r.sets.length ? r.sets : (r.w || r.r) ? [[r.w || "", r.r || "", 1]] : []; }
    var best = 0, orm = 0, bestVol = 0, pts = [];
    recs.forEach(function (q) {
      var mx = 0, v = 0;
      sets(q[1]).forEach(function (st) {
        var w = parseFloat(st[0]), c = parseFloat(st[1]);
        if (!isFinite(w)) return;
        if (w > mx) mx = w;
        if (isFinite(c) && c > 0) { v += w * c; var e1 = c === 1 ? w : w * (1 + Math.min(c, 15) / 30); if (e1 > orm) orm = e1; }
      });
      if (mx > best) best = mx; if (v > bestVol) bestVol = v; if (mx) pts.push([q[0], mx]);
    });
    function md(k) { var p = k.split("-"); return (+p[1]) + "/" + (+p[2]); }
    function r1(v) { return (Math.round(v * 10) / 10).toLocaleString(); }
    var chart = "";
    if (pts.length > 1) {
      var P = pts.slice(-10), W = 320, Hh = 120, lo = Math.min.apply(null, P.map(function (q) { return q[1]; })), hi = Math.max.apply(null, P.map(function (q) { return q[1]; }));
      if (hi === lo) { hi += 5; lo = Math.max(0, lo - 5); }
      var xy = P.map(function (q, i) { return [20 + i * (W - 40) / (P.length - 1), 22 + (1 - (q[1] - lo) / (hi - lo)) * (Hh - 50)]; });
      chart = '<div class="exi-ch"><b>최고 무게 변화</b><svg viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="최고 무게 변화 그래프"><polyline points="' + xy.map(function (q) { return q.join(","); }).join(" ") + '"/>' +
        xy.map(function (q, i) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="4"/><text x="' + q[0] + '" y="' + (q[1] - 9) + '">' + P[i][1] + '</text><text class="d" x="' + q[0] + '" y="' + (Hh - 6) + '">' + md(P[i][0]) + '</text>'; }).join("") + '</svg></div>';
    }
    var hist = recs.slice(-5).reverse().map(function (q) {
      var st = sets(q[1]);
      return '<li><b>' + md(q[0]) + '</b><span>' + (st.length ? st.map(function (v) { return (v[0] !== "" ? v[0] + "kg" : "-") + "×" + (v[1] !== "" ? v[1] : "-"); }).join(" · ") : "기록만") + (q[1].memo ? '<em>' + esc(q[1].memo) + '</em>' : '') + '</span></li>';
    }).join("");
    var body = '<div class="exi-pic">' + img(x[3], "", false) + '</div>' +
      '<p class="exi-tags">' + (x[1] ? x[1].split(",").map(function (t) { return '<span>' + esc(t) + '</span>'; }).join("") : '') + '<span class="eq">' + esc(x[2]) + '</span></p>' +
      '<div class="exi-st"><div><small>한 번수</small><b>' + recs.length + '<i>번</i></b></div><div><small>최고 무게</small><b>' + (best ? r1(best) + '<i>kg</i>' : '-') + '</b></div>' +
      '<div><small>추정 1RM</small><b>' + (orm ? r1(orm) + '<i>kg</i>' : '-') + '</b></div><div><small>최고 볼륨</small><b>' + (bestVol ? r1(bestVol) + '<i>kg</i>' : '-') + '</b></div></div>' +
      chart + (hist ? '<div class="exi-h"><b>최근 기록</b><ul>' + hist + '</ul></div>' : '<p class="exi-none">아직 기록이 없어요' + (DEMO ? '' : ' — 기록하기로 첫 기록을 남겨요') + '</p>');
    rtSheet(n, body, function (s) {
      s.close();
      var b = document.createElement("button"); b.setAttribute("data-xadd", xdToday()); b.setAttribute("data-xname", n); b.hidden = true;
      document.body.appendChild(b); b.click(); b.remove();
      return true;
    }, DEMO ? false : "＋ 기록하기");
  }
  function renderExlib() {
    function seg(cls, L, cur, attr) {
      return '<div class="exl-seg ' + cls + '" role="tablist">' + L.map(function (x) {
        var v = Array.isArray(x) ? x[0] : x, t = Array.isArray(x) ? x[1] : x;
        return '<button type="button" role="tab" ' + attr + '="' + v + '" aria-selected="' + (cur === v ? "true" : "false") + '">' + t + '</button>';
      }).join("") + '</div>';
    }
    return wkSeg("exlib") + '<section class="exl">' +
      '<div class="exl-top"><label class="exl-q"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5" stroke-linecap="round"/></svg><input id="exlQ" type="search" placeholder="운동 이름 찾기" autocomplete="off" value="' + esc(EXS.q) + '"></label></div>' +
      seg("f1", EXL_F, EXS.f, "data-exf") +
      seg("f2", [["", "전체"]].concat(EXL_M), EXS.m, "data-exm") +
      seg("f3", [["", "전체"]].concat(EXL_E), EXS.e, "data-exe") +
      (DEMO ? '' : '<button type="button" class="exl-add" data-xadd="' + xdToday() + '"><b>＋</b>커스텀 운동 추가</button>') +
      '<div id="exlList" class="exl-list"></div></section>';
  }
  function setupExlib() {
    var box = view.querySelector("#exlList"); if (!box) return;
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var el = en.target, k = el.getAttribute("data-ic"), on = en.isIntersecting;
        if ((el.getAttribute("data-on") === "1") === on) return;
        el.setAttribute("data-on", on ? "1" : "0"); el.innerHTML = img(k, "", !on);
      });
    }, { rootMargin: "60px 0px" }) : null;
    function draw() {
      if (io) io.disconnect();
      var H = exlHist(), known = {}, q = EXS.q.replace(/\s+/g, "").toLowerCase();
      EXL.forEach(function (x) { known[x[0]] = 1; });
      var L = EXL.slice();
      Object.keys(H).forEach(function (n) { if (!known[n]) L.push([n, "", "커스텀", iconOf({ name: n }), 1]); });
      L = L.filter(function (x) {
        if (EXS.f === "fav" && !EXFAV[x[0]]) return false;
        if ((EXS.f === "freq" || EXS.f === "recent") && !H[x[0]]) return false;
        if (EXS.f === "custom" && !x[4]) return false;
        if (EXS.m && (x[4] || ("," + x[1] + ",").indexOf("," + EXS.m + ",") < 0)) return false;
        if (EXS.e && x[2] !== EXS.e) return false;
        if (q && x[0].replace(/\s+/g, "").toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      if (EXS.f === "freq") L.sort(function (a, b) { return H[b[0]].c - H[a[0]].c; });
      if (EXS.f === "recent" || EXS.f === "custom") L.sort(function (a, b) { var p = (H[a[0]] || {}).last || "", r = (H[b[0]] || {}).last || ""; return p < r ? 1 : p > r ? -1 : 0; });
      var today = xdToday();
      box.innerHTML = L.length ? L.map(function (x) {
        var h = H[x[0]], sub = x[4] ? "직접 추가한 운동" : x[1].split(",").join(", ");
        return '<div class="exr">' +
          '<button type="button" class="exr-fav' + (EXFAV[x[0]] ? ' on' : '') + '" data-exfav="' + esc(x[0]) + '" aria-label="' + esc(x[0]) + ' 좋아하는 운동' + (EXFAV[x[0]] ? ' 빼기' : '에 넣기') + '"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></button>' +
          '<button type="button" class="exr-ic" data-exinfo="' + esc(x[0]) + '" data-ic="' + x[3] + '" aria-label="' + esc(x[0]) + ' 동작·기록 보기">' + img(x[3], "", true) + '</button>' +
          '<button type="button" class="exr-b"' + (DEMO ? '' : ' data-xadd="' + today + '" data-xname="' + esc(x[0]) + '"') + '>' +
          '<span class="exr-t"><b>' + esc(x[0]) + '</b><small>' + esc(sub) + (x[4] ? '' : ' · ' + esc(x[2])) + '</small>' + (h ? '<em>' + esc(exlLast(h)) + (h.c > 1 ? ' · ' + h.c + '번' : '') + '</em>' : '') + '</span>' +
          (DEMO ? '' : '<span class="exr-go" aria-hidden="true">＋</span>') + '</button></div>';
      }).join("") : '<div class="panel empty"><h3>' + (EXS.f === "fav" ? "하트 누른 운동이 없어요" : EXS.f ? "아직 기록한 운동이 없어요" : "찾는 운동이 없어요") + '</h3><p>' + (EXS.f === "fav" ? "운동 옆 ♡를 누르면 여기 모여요" : "＋ 커스텀 운동 추가로 직접 적을 수 있어요") + '</p></div>';
      if (io) Array.prototype.forEach.call(box.querySelectorAll(".exr-ic"), function (el) { io.observe(el); });
    }
    view.querySelector(".exl").addEventListener("click", function (e) {
      var b = e.target.closest("[data-exf],[data-exm],[data-exe],[data-exfav],[data-exinfo]"); if (!b) return;
      if (b.hasAttribute("data-exinfo")) { exInfo(b.getAttribute("data-exinfo")); return; }
      if (b.hasAttribute("data-exfav")) {
        var n = b.getAttribute("data-exfav");
        if (EXFAV[n]) delete EXFAV[n]; else EXFAV[n] = 1;
        exlSave(); b.classList.toggle("on", !!EXFAV[n]);
        if (EXS.f === "fav") draw();
        return;
      }
      var a = b.hasAttribute("data-exf") ? "data-exf" : b.hasAttribute("data-exm") ? "data-exm" : "data-exe", v = b.getAttribute(a);
      EXS[a.slice(-1)] = v; exlSave();
      Array.prototype.forEach.call(b.parentNode.children, function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      b.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      draw();
    });
    var qi = view.querySelector("#exlQ");
    qi.addEventListener("input", function () { EXS.q = qi.value; draw(); });
    draw();
  }
  function renderForms() {
    var h = wkSeg("forms") + (CAN_EDIT ? '<button type="button" class="fxnew" data-fx="new">＋ 사진·영상 복습지 만들기<small>운동 이름만 넣고 사진·영상을 바로 올려요</small></button>' : "") + '<section>' + head("", "자세 복습지", "수업에서 배운 자세를 영상으로 다시 봐요");
    if (M.forms.length) {
      var cnt = {}; M.forms.forEach(function (f) { formCats(f).forEach(function (c) { cnt[c] = (cnt[c] || 0) + 1; }); });
      var cats = FCATS.map(function (c) { return c[0]; }).concat(["기타"]).filter(function (c) { return cnt[c]; });
      if (cats.length > 1) {
        h += '<div class="fcat" role="tablist" aria-label="부위별 보기"><button type="button" role="tab" data-fc="" aria-selected="true">전체 <b>' + M.forms.length + '</b></button>' +
          cats.map(function (c) { return '<button type="button" role="tab" data-fc="' + c + '" aria-selected="false">' + c + ' <b>' + cnt[c] + '</b></button>'; }).join("") + '</div>';
      }
      h += fdCal() + formDays();
    } else h += (Object.keys(XD).length ? fdCal() + formDays() : '') + '<div class="panel empty"><h3>아직 복습지가 없어요</h3><p>수업에서 배운 자세가 여기에 쌓여요</p></div>';
    return h + '</section>' + remember();
  }
  function setupForms() {
    var bar = view.querySelector(".fcat"), list = view.querySelector(".flist");
    if (!bar || !list) return;
    var cards = view.querySelectorAll(".flist .card-link");
    function apply(c, save) {
      var ok = false;
      Array.prototype.forEach.call(bar.children, function (b) { var on = b.getAttribute("data-fc") === c; if (on) ok = true; b.setAttribute("aria-selected", on ? "true" : "false"); });
      if (!ok) { c = ""; bar.children[0].setAttribute("aria-selected", "true"); }
      Array.prototype.forEach.call(cards, function (a) { a.hidden = !!c && (" " + a.getAttribute("data-cat") + " ").indexOf(" " + c + " ") < 0; });
      Array.prototype.forEach.call(view.querySelectorAll(".fday"), function (g) {   /* 날짜 칸: 고른 부위 복습지가 없으면 숨김 */
        g.hidden = !!c && !g.querySelector(".flist .card-link:not([hidden])");
      });
      view.classList.toggle("fc-on", !!c);   /* 부위 고르면 접힌 날도 다 펼쳐 보여 줌 */
      /* 2026-11-20 팀장 "펼쳐도 없어" — 부위 탭(폰에 기억됨)이 골라져 있으면 다른 부위 복습지가 숨는 걸 몰라서, 날짜 목록 위에 알림 + 전체 보기 */
      var fn = view.querySelector(".fc-note"), d0 = view.querySelector(".fday");
      if (c) {
        var hid = Array.prototype.filter.call(cards, function (a) { return a.hidden; }).length;
        if (!fn && d0) { fn = document.createElement("div"); fn.className = "fc-note"; d0.parentNode.insertBefore(fn, d0); }
        if (fn) fn.innerHTML = '<span><b>' + esc(c) + '</b>만 보는 중 · 다른 부위 ' + hid + '개 숨김</span><button type="button" data-fc-all>전체 보기</button>';
      } else if (fn) fn.remove();
      if (save) { try { localStorage.setItem(FCAT_K, c); } catch (e) {} }
    }
    view.addEventListener("click", function (e) { if (e.target.closest("[data-fc-all]")) apply("", true); });
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-fc]"); if (!b) return;
      apply(b.getAttribute("data-fc"), true);
      b.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    });
    var c0 = ""; try { c0 = localStorage.getItem(FCAT_K) || ""; } catch (e) {}
    apply(c0, false);
  }

  /* ---------------- 복습지 상세 */
  function mediaSection(f) {
    var L = FMEDIA[f.id] || [];
    if (!L.length && !CAN_EDIT) return "";
    var h = '<section id="fmedia">' + head("", f.simple ? "사진 · 영상" : "선생님이 올린 사진 · 영상", L.length ? L.length + "개" : "") + '<div class="fmgrid">';
    h += L.map(function (x, i) {
      var m = x.t === "vid"
        ? '<div class="fmd-vid"><iframe src="https://drive.google.com/file/d/' + esc(encodeURIComponent(x.id)) + '/preview" allow="autoplay; fullscreen" allowfullscreen loading="lazy" title="수업 영상"></iframe></div>'
        : '<a class="fmd-img" href="' + esc(fmImg(x.id, 2000)) + '" target="_blank" rel="noopener"><img src="' + esc(fmImg(x.id)) + '" alt="' + esc(x.cap || "수업 사진") + '" loading="lazy" onerror="this.onerror=null;this.src=\'https://drive.google.com/thumbnail?id=' + esc(encodeURIComponent(x.id)) + '&sz=w1200\'"></a>';
      return '<figure class="fmd">' + m + (x.cap ? '<figcaption>' + esc(x.cap) + '</figcaption>' : '') +
        (CAN_EDIT ? '<button type="button" class="fmd-del" data-fmdel="' + i + '">삭제</button>' : '') + '</figure>';
    }).join("");
    h += '</div>' + (CAN_EDIT ? '<button type="button" class="fmadd" data-fmadd="' + esc(f.id) + '">＋ 사진 · 영상 올리기</button>' : '') +
      (L.some(function (x) { return x.t === "vid"; }) ? '<p class="hint">영상은 올린 뒤 몇 분 동안 "처리 중"으로 보일 수 있어요</p>' : '') + '</section>';
    return h;
  }
  function renderSimpleForm(f) {
    var h = '<a class="back" href="#forms">← 복습지 목록</a>';
    h += '<div class="hero"><div class="hero-main"><div class="hero-l"><div class="eyebrow">MY FORM NOTE <b>· 자세 복습지</b></div><h1>' + esc(f.exercise) + '</h1>' +
      (f.part ? '<div class="en">' + esc(f.part) + '</div>' : '') +
      '<div class="who"><strong>' + esc(M.name) + ' 회원님</strong><span>' + esc(f.date) + '</span></div></div></div>' +
      (f.note ? '<div class="keypoint"><small>KEY POINT</small><p style="white-space:pre-line">' + esc(f.note) + '</p></div>' : '') + '</div>';
    h += mediaSection(f);
    if (CAN_EDIT) h += '<div class="fxctl"><button type="button" data-fx="edit" data-id="' + esc(f.id) + '">✎ 이름 · 메모 고치기</button><button type="button" class="del" data-fx="del" data-id="' + esc(f.id) + '">복습지 지우기</button></div>';
    return h + remember();
  }
  /* ---------------- 근육 위치 보기 (2026-11-21 팀장 "주동근·보조근이 어디 근육인지 모르니 누르면 알 수 있게")
     복습지 03 자극 부위의 근육 이름을 누르면 → 몸 지도(assets/muscle/map-M|F.svg, _tools/make_muscle_svg.py = 인체모형 v3 모양)에서 그 근육만 칠하고 위치·하는 일 설명.
     MU = [이름 찾는 규칙, 그림 칸 키(anatomy_v3 이름), 이름, 위치, 하는 일] — 위에서부터 먼저 맞는 것 */
  var MU = [
    [/대흉근\s*(위|상부)|쇄골/, "pec_clav", "대흉근 위쪽", "가슴 위쪽, 쇄골 바로 아래", "팔을 앞·위로 밀어 올릴 때 (인클라인 프레스)"],
    [/대흉근\s*(아래|하부)/, "pec_stern", "대흉근 아래쪽", "가슴 아래쪽", "팔을 앞·아래로 밀고 모을 때"],
    [/대흉근|가슴/, "pec_clav pec_stern", "대흉근", "가슴 전체 — 가장 큰 가슴 근육", "팔을 앞으로 밀고, 몸 쪽으로 모을 때"],
    [/전면\s*삼각|어깨\s*앞/, "delt_ant", "전면 삼각근", "어깨 앞쪽 동그란 부분", "팔을 앞으로 들어 올리고, 머리 위로 밀 때"],
    [/측면\s*삼각|어깨\s*옆/, "delt_lat", "측면 삼각근", "어깨 옆 바깥쪽", "팔을 옆으로 들 때 — 어깨가 넓어 보이게 해요"],
    [/후면\s*삼각|어깨\s*뒤/, "delt_post", "후면 삼각근", "어깨 뒤쪽", "팔을 뒤로 당기고 벌릴 때 — 말린 어깨를 펴 줘요"],
    [/삼각근|어깨/, "delt_ant delt_lat delt_post", "삼각근", "어깨를 감싸는 동그란 근육 (앞·옆·뒤)", "팔을 앞·옆·뒤 모든 방향으로 들어 올릴 때"],
    [/(상부\s*승모|승모근\s*상부|승모근\s*위)/, "trap_up", "상부 승모근", "목 옆에서 어깨 위까지", "어깨를 으쓱 올릴 때 — 너무 많이 쓰면 목이 뻐근해요"],
    [/(중부\s*승모|승모근\s*중부)/, "trap_mid", "중부 승모근", "날개뼈 사이, 등 가운데", "날개뼈를 뒤로 모을 때"],
    [/(하부\s*승모|승모근\s*하부)/, "trap_low", "하부 승모근", "날개뼈 아래 안쪽", "날개뼈를 아래로 내려 줄 때"],
    [/승모근/, "trap_up trap_mid trap_low", "승모근", "목 뒤부터 등 가운데까지 마름모 모양", "어깨를 올리고, 날개뼈를 모으고 내릴 때"],
    [/능형근/, "rhomboid", "능형근", "날개뼈 사이 깊은 곳", "날개뼈를 등뼈 쪽으로 모아 줘요 — 자세가 펴져요"],
    [/광배근/, "lat", "광배근", "겨드랑이부터 허리까지 등 옆 넓은 근육", "팔을 아래·뒤로 당길 때 — 등이 넓은 역삼각형이 돼요"],
    [/대원근/, "teres_major", "대원근", "겨드랑이 뒤, 날개뼈 아래 바깥", "광배근을 도와 팔을 아래·뒤로 당겨요"],
    [/척추\s*기립|허리/, "erector erector_thoracic", "척추기립근", "등뼈 양옆으로 길게 (허리 양옆)", "상체를 곧게 세우고 허리를 버텨 줘요"],
    [/이두근\s*짧은/, "biceps_short", "이두근 짧은 머리", "팔 앞쪽 안쪽", "팔꿈치를 굽히고 손바닥을 위로 돌릴 때"],
    [/상완근/, "brachialis", "상완근", "이두근 아래 깊은 곳 (팔꿈치 위)", "팔꿈치를 굽힐 때 이두근과 같이"],
    [/이두|팔\s*앞/, "biceps_long biceps_short", "이두근", "팔 앞쪽 (알통)", "팔꿈치를 굽혀 당길 때"],
    [/삼두|팔\s*뒤/, "triceps_long triceps_lat triceps_med", "삼두근", "팔 뒤쪽", "팔꿈치를 쭉 펼 때 — 팔뚝 뒤 탄력"],
    [/전완|아래팔|악력/, "forearm_flex forearm_ext brachioradialis", "전완근", "팔꿈치부터 손목까지 (아래팔)", "손잡이를 꽉 쥐고 버틸 때"],
    [/복사근|옆구리/, "oblique", "복사근", "옆구리", "몸통을 비틀고 옆으로 굽힐 때"],
    [/복근|복직근|코어/, "abs", "복직근", "배 앞쪽 (식스팩)", "몸통을 말고 버텨 줘요"],
    [/중둔|엉덩이\s*옆/, "glute_med", "중둔근", "엉덩이 옆 위쪽 (골반 옆)", "다리를 옆으로 벌리고, 한 발로 설 때 골반을 잡아 줘요"],
    [/대퇴근막장|골반\s*앞\s*바깥/, "tfl", "대퇴근막장근", "골반 앞 바깥쪽", "다리를 옆·앞으로 들 때 도와줘요"],
    [/이상근|엉덩이\s*속/, "piriformis", "이상근", "엉덩이 깊은 곳 (대둔근 아래)", "다리를 바깥으로 돌릴 때"],
    [/대둔|엉덩이/, "glute_max", "대둔근", "엉덩이 전체 — 몸에서 가장 큰 근육", "엉덩이를 앞으로 밀어 골반을 펼 때 (힙 업)"],
    [/대퇴\s*사두|허벅지\s*앞/, "rectus_fem vastus_lat vastus_med", "대퇴사두근", "허벅지 앞쪽", "무릎을 펼 때 — 앉았다 일어날 때"],
    [/햄스트링|허벅지\s*뒤/, "ham_bf ham_st", "햄스트링", "허벅지 뒤쪽", "무릎을 굽히고, 숙였다가 골반을 펼 때"],
    [/내전|허벅지\s*안/, "add_long add_mag gracilis pectineus", "내전근", "허벅지 안쪽", "다리를 안으로 모을 때"],
    [/종아리|비복|가자미/, "gastroc_med gastroc_lat soleus soleus_f", "종아리 (비복근·가자미근)", "무릎 아래 뒤쪽", "발끝으로 설 때, 걷고 뛸 때"],
    [/장요근|고관절\s*굴곡/, "iliopsoas", "장요근", "배 깊은 곳에서 허벅지 앞 위로", "다리를 앞으로 들어 올릴 때"],
    [/전거근/, "serratus", "전거근", "갈비뼈 옆 (겨드랑이 아래)", "날개뼈를 앞으로 밀어 줄 때"]
  ];
  function muSplit(t) {   /* "삼두근(팔 뒤) · 승모근" → 괄호 안 · 는 안 자름 */
    var out = [], cur = "", d = 0;
    String(t || "").split("").forEach(function (ch) {
      if (ch === "(") d++; else if (ch === ")") d = Math.max(0, d - 1);
      if ((ch === "·" || ch === ",") && !d) { if (cur.trim()) out.push(cur.trim()); cur = ""; } else cur += ch;
    });
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  function muFind(name) {   /* "능형근 · 승모근 중부"처럼 두 개면 둘 다 */
    var parts = muSplit(name), hits = [];
    parts.forEach(function (p) {
      var bare = p.replace(/\(.*?\)?$/, "").trim() || p, q = null;
      for (var i = 0; i < MU.length; i++) if (MU[i][0].test(bare)) { q = MU[i]; break; }
      if (!q) for (var j = 0; j < MU.length; j++) if (MU[j][0].test(p)) { q = MU[j]; break; }
      if (q && hits.indexOf(q) < 0) hits.push(q);
    });
    return hits;
  }
  var MU_SVG = {};
  function muSheet(f, name, role) {
    var all = [];
    (f.primary_muscles || []).forEach(function (m) { all.push([m.name, "p", m.where || ""]); });
    muSplit(f.secondary_muscles).forEach(function (t) { all.push([t, "s", ""]); });
    var sh = rtSheet("근육 위치", '<div class="mu-chips">' + all.map(function (x) { return '<button type="button" class="mu-c ' + x[1] + '" data-mu="' + esc(x[0]) + '" data-mr="' + x[1] + '">' + esc(x[0].replace(/\(.*$/, "").trim()) + '</button>'; }).join("") + '</div>' +
      '<div class="mu-map"><p class="mu-load">몸 지도를 불러오는 중…</p></div>' +
      '<div class="mu-z"><button type="button" data-mz="F">앞모습</button><button type="button" data-mz="B">뒷모습</button><button type="button" data-mz="all">전체 몸</button></div><div class="mu-info"></div>', null, false);
    var cl = sh.querySelector(".rts-foot [data-close]"); if (cl) cl.textContent = "닫기";
    var sx = M.sex === "F" ? "F" : "M";
    function show(n, r) {
      Array.prototype.forEach.call(sh.querySelectorAll(".mu-c"), function (b) { b.classList.toggle("on", b.getAttribute("data-mu") === n); });
      var hits = muFind(n), keys = {};
      hits.forEach(function (q) { q[1].split(" ").forEach(function (k) { keys[k] = 1; }); });
      var svg = sh.querySelector(".mu-map svg");
      if (svg) {
        Array.prototype.forEach.call(svg.querySelectorAll(".m"), function (el) { var on = !!keys[el.getAttribute("data-k")]; el.classList.toggle("on", on); el.classList.toggle("s", on && r === "s"); });
        svg.classList.toggle("sel", hits.length > 0);
        curLab = hits.map(function (q) { return q[2]; }).join(" · ");
        muZoom("auto");
      }
      var w0 = (all.filter(function (x) { return x[0] === n; })[0] || [])[2];
      sh.querySelector(".mu-info").innerHTML = '<p class="mu-role ' + r + '">' + (r === "p" ? "주동근 · 여기가 메인!" : "보조근 · 같이 도와줘요") + '</p>' +
        (hits.length ? hits.map(function (q) { return '<div class="mu-one"><b>' + esc(q[2]) + '</b><p><i>위치</i>' + esc(q[3]) + '</p><p><i>하는 일</i>' + esc(q[4]) + '</p></div>'; }).join("")
          : '<div class="mu-one"><b>' + esc(n) + '</b>' + (w0 ? '<p><i>위치</i>' + esc(w0) + '</p>' : '') + '<p class="mu-none">그림에는 아직 표시하지 못하는 근육이에요</p></div>');
    }
    /* 확대: 칠한 근육이 있는 쪽(앞/뒤 중 더 넓게 칠해진 쪽)으로 viewBox를 부드럽게 당김 + 이름표 */
    var curLab = "", zAnim = 0;
    function muZoom(mode) {
      var svg = sh.querySelector(".mu-map svg"); if (!svg) return;
      var vb0 = svg.getAttribute("data-vb0") || svg.getAttribute("viewBox"); svg.setAttribute("data-vb0", vb0);
      var F = vb0.split(/\s+/).map(Number), box = { F: null, B: null }, area = { F: 0, B: 0 };
      Array.prototype.forEach.call(svg.querySelectorAll(".m.on"), function (el) {
        var v = el.getAttribute("data-v"), bb; try { bb = el.getBBox(); } catch (e2) { return; }
        if (!bb.width) return;
        area[v] += bb.width * bb.height;
        var o = box[v]; box[v] = o ? { x: Math.min(o.x, bb.x), y: Math.min(o.y, bb.y), x2: Math.max(o.x2, bb.x + bb.width), y2: Math.max(o.y2, bb.y + bb.height) } : { x: bb.x, y: bb.y, x2: bb.x + bb.width, y2: bb.y + bb.height };
      });
      if (mode === "auto") mode = !box.F && !box.B ? "all" : area.F >= area.B ? "F" : "B";
      Array.prototype.forEach.call(sh.querySelectorAll("[data-mz]"), function (b) { var z = b.getAttribute("data-mz"); b.hidden = z !== "all" && !box[z]; b.classList.toggle("on", z === mode); });
      var T = F.slice(), bx = mode !== "all" && box[mode];
      if (bx) {
        var w = Math.max(150, (bx.x2 - bx.x) * 1.9), h = Math.max(150, (bx.y2 - bx.y) * 1.6), ar = F[2] / F[3];
        if (w / h > ar) h = w / ar; else w = h * ar;
        var cx = (bx.x + bx.x2) / 2, cy = (bx.y + bx.y2) / 2;
        T = [Math.max(F[0], Math.min(F[0] + F[2] - w, cx - w / 2)), Math.max(F[1], Math.min(F[1] + F[3] - h, cy - h / 2 + h * 0.06)), w, h];
      }
      var lab = svg.querySelector(".mlab"); if (lab) lab.remove();
      var S0 = (svg.getAttribute("viewBox") || vb0).split(/\s+/).map(Number), t0 = performance.now(), me = ++zAnim;
      (function step(now) {
        if (me !== zAnim) return;
        var k = Math.min(1, (now - t0) / 380), e3 = 1 - Math.pow(1 - k, 3);
        svg.setAttribute("viewBox", S0.map(function (v, i) { return (v + (T[i] - v) * e3).toFixed(1); }).join(" "));
        if (k < 1) requestAnimationFrame(step);
        else if (bx && curLab) {
          var tx = document.createElementNS("http://www.w3.org/2000/svg", "text");
          tx.setAttribute("class", "mlab"); tx.setAttribute("x", ((bx.x + bx.x2) / 2).toFixed(1));
          tx.setAttribute("y", Math.max(T[1] + T[3] * 0.07, bx.y - T[3] * 0.03).toFixed(1));
          tx.setAttribute("font-size", (T[2] * 0.055).toFixed(1)); tx.setAttribute("stroke-width", (T[2] * 0.012).toFixed(1));
          tx.textContent = curLab; svg.appendChild(tx);
        }
      })(t0);
    }
    sh.addEventListener("click", function (e) {
      var z = e.target.closest("[data-mz]"); if (z) { muZoom(z.getAttribute("data-mz")); return; }
      var b = e.target.closest(".mu-c"); if (b) show(b.getAttribute("data-mu"), b.getAttribute("data-mr"));
    });
    function put(t) { var m = sh.querySelector(".mu-map"); if (m) { m.innerHTML = t; show(name, role); } }
    show(name, role);
    if (MU_SVG[sx]) put(MU_SVG[sx]);
    else fetch(BASE + "muscle/map-" + sx + ".svg").then(function (r) { return r.text(); }).then(function (t) { MU_SVG[sx] = t; put(t); })
      .catch(function () { var m = sh.querySelector(".mu-map"); if (m) m.innerHTML = '<p class="mu-load">몸 지도를 못 불러왔어요 — 인터넷 연결을 확인해 주세요</p>'; });
  }
  function muInline() {   /* 2026-11-21 팀장 "이다혜님 봐봐" — 03 자극 부위 큰 그림도 같은 해부도 스타일로(주동근 빨강·보조근 주황). 못 불러오면 예전 anatomy.png 그대로 */
    var im = view.querySelector(".muscle > img"), id = (location.hash || "").replace(/^#form-/, ""), f = findForm(id);
    if (!im || !f || f.simple) return;
    var sx = M.sex === "F" ? "F" : "M";
    function put(t) {
      if (!document.body.contains(im)) return;
      var on = {};
      muSplit(f.secondary_muscles).forEach(function (n) { muFind(n).forEach(function (q) { q[1].split(" ").forEach(function (k) { on[k] = "s"; }); }); });
      (f.primary_muscles || []).forEach(function (m) { muFind(m.name).forEach(function (q) { q[1].split(" ").forEach(function (k) { on[k] = "p"; }); }); });
      if (!Object.keys(on).length) return;
      var box = document.createElement("button"); box.type = "button"; box.className = "mu-big"; box.setAttribute("aria-label", "자극 부위 몸 그림 — 누르면 근육 위치 자세히");
      box.innerHTML = '<span class="mu-bt">오늘의 운동 자극 부위</span>' + t + '<span class="mu-lg"><i class="p"></i>주동근<i class="s"></i>보조근<em>눌러서 자세히 ›</em></span>';
      var svg = box.querySelector("svg"); svg.classList.add("sel");
      Array.prototype.forEach.call(svg.querySelectorAll(".m"), function (el) { var r = on[el.getAttribute("data-k")]; if (r) { el.classList.add("on"); if (r === "s") el.classList.add("s"); } });
      box.addEventListener("click", function () { var m0 = (f.primary_muscles || [])[0]; if (m0) muSheet(f, m0.name, "p"); });
      im.replaceWith(box);
    }
    if (MU_SVG[sx]) put(MU_SVG[sx]);
    else fetch(BASE + "muscle/map-" + sx + ".svg").then(function (r) { return r.text(); }).then(function (t) { MU_SVG[sx] = t; put(t); }).catch(function () {});
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".mbtn"); if (!b) return;
    var id = (location.hash || "").replace(/^#form-/, ""), f = findForm(id);
    if (f) muSheet(f, b.getAttribute("data-mu"), b.getAttribute("data-mr"));
  });
  function renderForm(f) {
    if (f.simple) return renderSimpleForm(f);
    var D = f.dir;
    var h = '<a class="back" href="#forms">← 자세 복습지</a>' + seenLine(f);
    h += '<div class="hero"><div class="hero-main split"><div class="hero-l">' +
      '<div class="eyebrow">MY FORM NOTE <b>· 자세 복습지</b></div><h1>' + esc(f.exercise) + '</h1>' +
      '<div class="en">' + esc(f.exercise_en) + '</div>' +
      '<div class="who"><strong>' + esc(f.member || M.name) + ' 회원님</strong><span>' + esc(f.date) + '</span></div></div>' +
      '<div class="hero-r"><div class="eyebrow">오늘의 타깃</div><ul class="dots">' +
      f.targets.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("") + '</ul>' +
      '<div class="benefit">' + esc(f.benefit) + '</div></div></div>' +
      '<div class="keypoint"><small>KEY POINT</small><p>' + esc(f.key_point) + '</p></div></div>';

    /* 앞·옆·뒤 (2026-11-20 팀장 "한 영상에 앞 옆 뒤 찍어서 보내면") — data.js "angles": ["앞","옆","뒤"] → 파일 form.mp4 / form-side.mp4 / form-back.mp4 (+ poster·webp 같은 꼬리) */
    var ANG = Array.isArray(f.angles) && f.angles.length > 1 ? f.angles : null, ANGK = { "앞": "", "옆": "-side", "뒤": "-back" };
    h += '<section>' + head("01", "오늘 내 자세", ANG ? ANG.join(" · ") + "에서 확인해요" : "영상으로 확인해요") +
      (ANG ? '<div class="angseg" role="tablist" aria-label="보는 방향">' + ANG.map(function (t, i) { return '<button type="button" role="tab" data-ang="' + esc(ANGK[t] || "") + '" data-angt="' + esc(t) + '" aria-selected="' + (i ? "false" : "true") + '">' + esc(t) + '</button>'; }).join("") + '</div>' : '') +
      '<div class="player"><video id="main" poster="' + esc(D) + 'poster.jpg" autoplay muted loop playsinline webkit-playsinline disablepictureinpicture disableremoteplayback x-webkit-airplay="deny" preload="auto" data-src="' + esc(D) + 'form.mp4" data-gif="' + esc(D) + 'form.webp"></video>' +
      '<img id="gifFallback" alt="오늘 수업 영상 (반복 재생)" hidden>' +
      '<span class="chip">▶ 오늘 수업 영상</span><button class="tapper" id="tap" type="button" aria-label="영상 재생 / 멈춤"></button>' +
      '<div class="paused-badge" id="pbadge" hidden></div></div>' +
      '<div class="controls" id="controls" role="group" aria-label="재생 속도"><button class="btn" id="playBtn" type="button">⏸ 멈춤</button>' +
      '<button class="btn" type="button" data-rate="0.5" aria-pressed="false">느리게 0.5배</button>' +
      '<button class="btn" type="button" data-rate="1" aria-pressed="true">보통 속도</button></div>' +
      '<p class="hint" id="hint">영상을 누르면 멈추고, 다시 누르면 재생돼요</p></section>';

    h += mediaSection(f);
    h += '<section>' + head("02", "오늘 잘한 점", "이대로만 하면 돼요") + '<div class="cards3">' +
      f.good_points.map(function (g, i) {
        return '<div class="good"><div class="tag">' + CHECK + 'POINT ' + (i + 1) + '</div><h3>' + esc(g.title) + '</h3><p>' + esc(g.desc) + '</p></div>';
      }).join("") + '</div></section>';

    h += '<section>' + head("03", "자극 부위", "여기에 자극이 와야 정상이에요") + '<div class="muscle">' +
      '<img src="' + esc(D) + 'anatomy.png" alt="자극 부위 인체 그림: 진한 분홍은 주동근, 연한 분홍은 보조근" loading="lazy"><div class="mcol">' +
      '<div class="mgroup"><div class="mrow"><span class="mchip p">주동근</span>여기가 메인!</div>' +
      f.primary_muscles.map(function (m) { return '<p class="mname"><button type="button" class="mbtn" data-mu="' + esc(m.name) + '" data-mr="p" data-mw="' + esc(m.where || "") + '">' + esc(m.name) + '</button><span>' + esc(m.where) + '</span></p>'; }).join("") + '</div>' +
      '<div class="mgroup"><div class="mrow"><span class="mchip s">보조근</span>같이 도와줘요</div><p class="mname s2">' + muSplit(f.secondary_muscles).map(function (t) { return '<button type="button" class="mbtn s" data-mu="' + esc(t) + '" data-mr="s">' + esc(t) + '</button>'; }).join('<i class="mdot">·</i>') + '</p></div>' +
      '<p class="mhint">근육 이름을 누르면 몸 어디인지 보여 줘요</p>' +
      '<div class="feels"><div class="feel ok"><div class="tag">' + CHECK + '이 느낌이면 성공</div><p>' + esc(f.feel_good) + '</p></div>' +
      '<div class="feel no"><div class="tag">' + XIC + '이 느낌이면 STOP</div><p>' + esc(f.feel_stop) + '</p></div></div></div></div></section>';

    h += '<section>' + head("04", "동작 3단계", "이 순서대로 따라 하세요") + '<div class="steps">' +
      f.steps.map(function (s, i) {
        return '<article class="step"><div class="step-media"><img src="' + esc(D + s.media) + '" alt="' + esc(s.title) + ' 동작" loading="lazy">' +
          (s.loop ? '<span class="loop">반복 재생</span>' : '') + '</div><div class="step-body"><div class="step-no">STEP<b>0' + (i + 1) + '</b></div>' +
          '<h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p><span class="breath">' + esc(s.chip) + '</span></div></article>';
      }).join("") + '</div></section>';

    h += '<section>' + head("05", "이렇게 O · 이렇게 X", "헷갈릴 땐 여기만 보세요") + '<div class="ox">' +
      '<div class="oxbox o"><h3><svg class="mark" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.6" fill="none" stroke="currentColor" stroke-width="3.2"/></svg>이렇게 하세요</h3><ul>' +
      f.do.map(function (t) { return '<li>' + CHECK + esc(t) + '</li>'; }).join("") + '</ul></div>' +
      '<div class="oxbox x"><h3><svg class="mark" viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 3.5l13 13M16.5 3.5l-13 13" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg>이건 피하세요</h3><ul>' +
      f.dont.map(function (t) { return '<li>' + XIC + esc(t) + '</li>'; }).join("") + '</ul></div></div></section>';
    return h + remember();
  }

  /* 앱을 나가거나 화면을 끌 때도 영상 멈춤 (아이폰이 재생 중인 영상을 PiP로 빼지 않게) */
  document.addEventListener("visibilitychange", function () {
    Array.prototype.forEach.call(document.querySelectorAll("#view video"), function (v) {
      try {
        if (document.hidden) { v.setAttribute("data-bg", v.paused ? "" : "1"); v.pause(); }
        else if (v.getAttribute("data-bg") === "1") { v.removeAttribute("data-bg"); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      } catch (e) {}
    });
  });
  function setupPlayer() {
    muInline();
    var v = document.getElementById("main");
    if (!v) return;
    var badge = document.getElementById("pbadge"), playBtn = document.getElementById("playBtn"), tap = document.getElementById("tap");
    var started = false, touched = false, swapped = false;
    function sync() { badge.hidden = !v.paused || swapped; playBtn.textContent = v.paused ? "▶ 재생" : "⏸ 멈춤"; }
    function tryPlay() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    function toggle() { touched = true; if (v.paused) tryPlay(); else v.pause(); }
    tap.addEventListener("click", toggle);
    playBtn.addEventListener("click", toggle);
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    v.addEventListener("playing", function () { started = true; });
    var rateBtns = document.querySelectorAll("[data-rate]");
    Array.prototype.forEach.call(rateBtns, function (b) {
      b.addEventListener("click", function () {
        v.playbackRate = parseFloat(b.getAttribute("data-rate"));
        Array.prototype.forEach.call(rateBtns, function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      });
    });
    var angBar = document.querySelector(".angseg");
    if (angBar) angBar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ang]"); if (!b || b.getAttribute("aria-selected") === "true") return;
      Array.prototype.forEach.call(angBar.children, function (o) { o.setAttribute("aria-selected", o === b ? "true" : "false"); });
      var D0 = v.getAttribute("data-src").replace(/form(-side|-back)?\.mp4$/, ""), k = b.getAttribute("data-ang");
      v.setAttribute("data-src", D0 + "form" + k + ".mp4"); v.setAttribute("data-gif", D0 + "form" + k + ".webp");
      v.poster = D0 + "poster" + k + ".jpg";
      var ch = document.querySelector(".player .chip"); if (ch) ch.textContent = "▶ " + b.getAttribute("data-angt") + "에서 본 영상";
      if (swapped) { document.getElementById("gifFallback").src = D0 + "form" + k + ".webp"; return; }
      var rate = v.playbackRate; v.src = D0 + "form" + k + ".mp4"; v.load(); v.playbackRate = rate; tryPlay();
    });
    // 카톡 등 앱 안 브라우저: 영상을 통째로 받아 재생, 4초 안에 안 나오면 움직이는 그림으로 바꿈
    function swapToGif() {
      if (swapped || started || !document.body.contains(v)) return;
      swapped = true;
      try { v.pause(); } catch (e) {}
      var g = document.getElementById("gifFallback");
      g.src = v.getAttribute("data-gif"); g.hidden = false; v.hidden = true; badge.hidden = true; tap.hidden = true;
      document.getElementById("controls").hidden = true;
      document.getElementById("hint").textContent = "영상이 계속 반복돼요";
    }
    v.addEventListener("error", function () { if (!started) swapToGif(); });
    var src = v.getAttribute("data-src");
    if (window.fetch && window.URL && URL.createObjectURL) {
      fetch(src).then(function (r) { if (!r.ok) throw new Error("load"); return r.blob(); })
        .then(function (b) { v.src = URL.createObjectURL(new Blob([b], { type: "video/mp4" })); tryPlay(); })
        .catch(function () { v.src = src; tryPlay(); });
    } else { v.src = src; tryPlay(); }
    setTimeout(function () { if (!started && !touched) swapToGif(); }, 4000);
    sync();
  }

  /* ---------------- 루틴 */
  /* ---- 요일 옮기기 창 (A안) */
  var KEYS7 = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  function mvIdx(k) { return KEYS7.indexOf(k); }
  function mvDate(k) { var t = new Date(), off = mvIdx(k) - (t.getDay() + 6) % 7; return ymd(new Date(t.getFullYear(), t.getMonth(), t.getDate() + off)); }
  function mvDid(k) { var dk = mvDate(k); return attLoad().indexOf(dk) >= 0 || !!(LG && LG.d && LG.d[dk] && LG.d[dk].length); }
  function mvMissed(k) {   /* 이번 주 지난 날 · 운동하는 날인데 출석도 ✓도 없고 아직 안 옮긴 날 */
    if (ROT || mvIdx(k) < 0 || mvIdx(k) >= mvIdx(todayKey())) return false;
    var d = dayByKey(k); return !!(d && !d.rest && !d.pick && !d.cardio_only && !mvMap()[k] && !mvDid(k));
  }
  function mvSave(m) {
    mvGet(); var clean = {}; for (var k in m) if (m[k]) clean[k] = m[k];
    MV = { w: wkMon(), m: clean, at: Date.now() };
    try { localStorage.setItem(MV_LS, JSON.stringify(MV)); } catch (e) {}
    if (ATT_API) rtPost({ a: "kv_set", k: "mw:" + SLUG + ":mv", v: MV }).catch(function () {});
    rerender();
  }
  function mvServer(kv) {
    mvGet(); var v = kv && kv["mw:" + SLUG + ":mv"] || null;
    if (!v || (MV && (MV.at || 0) >= (v.at || 0))) return;
    MV = v; try { localStorage.setItem(MV_LS, JSON.stringify(v)); } catch (e) {}
    if (/^#(routine|home)?$|^#routine/.test(location.hash || "#home")) rerender();
  }
  function mvName(k) { var d = dayByKeyRaw(k); return DAY_KO[k] + "요일 " + (d && !d.rest ? d.part : "휴식"); }
  /* 2026-11-16 장동욱 "요일 아이콘 꾹 눌러서 다음 날로 쉽게 옮기게, 옮기기가 안 되는 것 같아" — 오늘·앞으로 올 날도 꾹 → 하루 미루기 / 다음 날과 바꾸기 / 건너뛰기 */
  function mvEff(m, q) { var src = m[q] || q; if (src === "-") return "-"; var d = dayByKeyRaw(src); return (!d || d.rest || d.pick) ? "-" : src; }
  function mvClean(m) { for (var q in m) { var r = dayByKeyRaw(q); if (m[q] === q || (m[q] === "-" && (!r || r.rest))) delete m[q]; } return m; }
  function mvPush(m, k) {   /* k 운동을 다음 날로 — 뒤 운동도 첫 쉬는 날까지 한 칸씩. 일요일을 넘기면 넘친 운동 키를 돌려줌 */
    var carry = mvEff(m, k); m[k] = "-";
    for (var j = mvIdx(k) + 1; j < 7; j++) { var q = KEYS7[j], nx = mvEff(m, q); m[q] = carry; if (nx === "-") return null; carry = nx; }
    return carry;
  }
  function mvPart(src) { var d = dayByKeyRaw(src); return d ? d.part : ""; }
  function mvSheet(k) {   /* 2026-11-16 장동욱 "원하는 요일로 옮길 수 있게 자유도 높이자 — 월요일을 금요일로 등, 주마다 초기화, 간단한 안내말"
       운동 날 꾹 → 이번 주 남은 요일 칸 중 골라서 옮김(쉬는 날이면 그대로 들어가고, 운동 있는 날이면 서로 바꿈)
       쉬는 날(오늘·앞날) 꾹 → 이번 주 운동 중 하나를 그날로 가져옴. 옮긴 건 이번 주만, 월요일이면 원래 루틴 */
    if (ROT || RT_EDIT || DEMO || mvIdx(k) < 0) return;
    var T = todayKey(), it = mvIdx(T), ik = mvIdx(k), m = {}, cur = mvMap(), x;
    for (x in cur) m[x] = cur[x];
    var ek = mvEff(cur, k), raw = dayByKeyRaw(k), past = ik < it, who = k === T ? "오늘" : DAY_KO[k] + "요일";
    var grid = [], opts = [], title, sub, note;
    function dn(q) { return DAY_KO[q] + (q === T ? "(오늘)" : ""); }
    if (ek !== "-" && (!past || mvMissed(k))) {
      title = who + " " + mvPart(ek) + ", 어디로 옮길까요?";
      sub = "옮길 요일을 누르세요 · 쉬는 날이면 그대로 들어가고, 운동 있는 날이면 서로 바꿔요";
      KEYS7.forEach(function (q, iq) {
        if (iq < it || q === k) return;
        var eq = mvEff(cur, q), pk = (dayByKeyRaw(q) || {}).pick;
        grid.push({ d: dn(q), p: eq === "-" ? (pk ? "골라서 하는 날" : "쉬는 날") : mvPart(eq), act: eq === "-" ? "여기로" : (past ? "바꾸면 " + mvPart(eq) + " 건너뜀" : "서로 바꿈"), free: eq === "-",
          go: function () { m[q] = ek; m[k] = (eq === "-" || past) ? "-" : eq;
            return eq === "-" ? mvPart(ek) + " 운동을 " + DAY_KO[q] + "요일로 옮겼어요" : who + "과 " + DAY_KO[q] + "요일 운동을 바꿨어요"; } });
      });
      opts.push({ t: "이번 주는 건너뛰기", s: "다음 주 " + DAY_KO[k] + "요일에 다시 해요", go: function () { m[k] = "-"; return who + " " + mvPart(ek) + " 운동은 이번 주 건너뛰었어요"; } });
    } else if (ek === "-" && !past && !(raw && raw.pick && !cur[k])) {
      title = who + " 어떤 운동 할까요?"; sub = "이번 주 운동 중 하나를 " + (k === T ? "오늘" : DAY_KO[k] + "요일") + "로 가져와요";
      var list = KEYS7.filter(function (q) { return q !== k && mvEff(cur, q) !== "-"; });
      list.sort(function (a2, b2) { return (mvMissed(b2) ? 1 : 0) - (mvMissed(a2) ? 1 : 0); });
      list.forEach(function (q) {
        var eq = mvEff(cur, q), qp = mvIdx(q) < it, done = qp && mvDid(q), miss = mvMissed(q);
        grid.push({ d: dn(q), p: mvPart(eq), act: miss ? "못 한 날" : qp ? (done ? "한 번 더" : "지난 날") : "가져오기", free: miss,
          go: function () { m[k] = eq; if (!done) m[q] = "-"; return DAY_KO[q] + "요일 " + mvPart(eq) + " 운동을 " + (k === T ? "오늘" : DAY_KO[k] + "요일") + "로 가져왔어요"; } });
      });
      if (!grid.length) { attToast("이번 주에 가져올 운동이 없어요"); return; }
    } else if (Object.keys(cur).length) {
      title = "옮긴 운동 되돌리기"; sub = past ? "지난 날은 옮길 수 없어요 · 이번 주에 옮긴 걸 원래대로 돌릴 수 있어요" : "이번 주에 옮긴 요일을 원래 루틴으로 돌려요";
    } else { attToast(past ? "지난 날은 옮길 수 없어요" : "이 날은 옮길 운동이 없어요"); return; }
    if (Object.keys(cur).length) opts.push({ t: "이번 주 옮긴 것 모두 되돌리기", s: "원래 루틴으로 · 월요일이면 어차피 원래대로 돌아와요", go: function () { m = {}; return "원래 루틴으로 되돌렸어요"; } });
    var body = '<p class="rts-note">' + esc(sub) + '</p>' +
      (grid.length ? '<div class="mv-days">' + grid.map(function (g, i) {
        return '<button type="button" class="mv-day' + (g.free ? ' free' : '') + '" data-g="' + i + '"><b>' + esc(g.d) + '</b><span>' + esc(g.p) + '</span><small>' + esc(g.act) + '</small></button>';
      }).join("") + '</div>' : '') +
      (opts.length ? '<div class="mv-opts">' + opts.map(function (o, i) {
        return '<button type="button" class="mv-opt" data-i="' + i + '"><b>' + esc(o.t) + '</b><small>' + esc(o.s) + '</small></button>';
      }).join("") + '</div>' : '') + '<p class="rts-note">옮긴 건 이번 주에만 · 다음 주 월요일이면 원래 루틴으로 돌아와요</p>';
    var sh = rtSheet(title, body, function () {}, false);
    sh.addEventListener("click", function (e) {
      var g = e.target.closest(".mv-day"), b = e.target.closest(".mv-opt"); if (!g && !b) return;
      var msg = g ? grid[+g.getAttribute("data-g")].go() : opts[+b.getAttribute("data-i")].go();
      sh.close(); mvSave(mvClean(m)); attToast(msg);
    });
  }
  (function () {   /* 요일 칸 꾹 누르기 (0.55초) */
    var tm = 0, fired = 0, x0 = 0, y0 = 0, tile = null;
    function stop() { clearTimeout(tm); if (tile) tile.classList.remove("holding"); tile = null; }
    document.addEventListener("pointerdown", function (e) {
      var t = e.target.closest && e.target.closest(".wk-cmp a.day-tile");
      if (!t || ROT || RT_EDIT || DEMO) return;
      var k = (t.getAttribute("href") || "").replace("#routine-", "");
      x0 = e.clientX; y0 = e.clientY; tile = t; t.classList.add("holding");
      tm = setTimeout(function () { stop(); fired = Date.now(); try { navigator.vibrate && navigator.vibrate(15); } catch (x) {} mvSheet(k); }, 550);
    });
    document.addEventListener("pointermove", function (e) { if (tile && (Math.abs(e.clientX - x0) > 10 || Math.abs(e.clientY - y0) > 10)) stop(); });
    ["pointerup", "pointercancel"].forEach(function (ev) { document.addEventListener(ev, stop); });
    document.addEventListener("click", function (e) {
      if (Date.now() - fired < 900 && e.target.closest && e.target.closest(".wk-cmp a.day-tile")) { e.preventDefault(); e.stopPropagation(); }
      var g = e.target.closest && e.target.closest(".mv-go"); if (g) mvSheet(g.getAttribute("data-mvk"));
    }, true);
    document.addEventListener("contextmenu", function (e) { if (e.target.closest && e.target.closest(".wk-cmp a.day-tile")) e.preventDefault(); });
  })();
  function renderRoutine(sel) {
    var R = M.routine;
    if (!R) return wkSeg("routine") + (CAN_EDIT ? '<div class="rtbar"><div><b>선생님만 보여요</b><span>여기서 바로 루틴을 만들 수 있어요</span></div><div class="rtbar-b"><button type="button" class="rtb" data-rt="createcopy">다른 회원 루틴 복사</button><button type="button" class="rtb fill" data-rt="create">✎ 새 루틴 만들기</button></div></div>' : '') +
      '<section>' + head("", "주간 루틴", "") + '<div class="panel empty"><h3>루틴이 아직 없어요</h3><p>선생님이 곧 올려드릴게요</p></div></section>' + remember();
    var tk = todayKey(), ED = !!RT_EDIT;
    sel = sel || tk;
    view.setAttribute("data-day", sel);
    var h = wkSeg("routine") + rtTopBar() + '<div class="hero"><div class="hero-main split"><div class="hero-l">' +
      '<div class="eyebrow">' + (ROT ? 'ROTATION ROUTINE <b>· 순환 루틴 ' : 'WEEKLY ROUTINE <b>· 주간 루틴 ') + esc(R.version) + '</b></div><h1>' + esc(R.title) + '</h1>' +
      '<div class="who"><strong>' + esc(M.name) + ' 회원님</strong><span>' + esc(R.updated) + ' 업데이트</span></div></div>' +
      '<div class="hero-r"><div class="eyebrow">이번 주 계획</div><ul class="dots small">' +
      R.plan.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join("") + '</ul></div></div>' +
      '<div class="keypoint"><small>KEY POINT</small><p>' + esc(R.key_point) + '</p></div></div>';

    /* 2026-11-14 장동욱 "1·2 항목 합치기, 종목은 스크롤 없이 한눈에": 일주일 줄을 그날 운동 칸 안 맨 위로, 종목 카드는 작게(.ex-list.cmp) */
    var d = dayByKey(sel);
    h += '<section id="day">' + head("01", dayName(sel) + " " + (d ? d.part : "휴식"), sel === tk ? (ROT ? "오늘 할 차례" : "오늘") : (d && !d.rest ? d.en : ""),
      ED && d && !d.rest ? '<button type="button" class="rtb sm" data-rt="day">✎ 이날 정보</button>' : '');
    h += '<div class="week wk-cmp" role="tablist">';
    if (ROT) {
      rotKeys().forEach(function (k) {
        var d = dayByKey(k);
        h += '<a class="day-tile' + (k === tk ? " today" : "") + (ED ? ' rtdk' : '') + '" data-dk="' + k + '" href="#routine-' + k + '" role="tab" aria-current="' + (k === sel) + '"><b class="rot"><small>DAY</small>' + k.slice(1) + '</b>' +
          img(dayIcon(d), "wk-ic", true) + '<span>' + esc(d.part) + '</span></a>';
      });
      if (rotKeys().length < 7) h += '<div class="day-tile rest"><b class="rot"><small>OFF</small>휴</b>' + img("rest", "wk-ic") + '<span>근무표 따라</span></div>';
    } else
    ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].forEach(function (k) {
      var d = dayByKey(k), mvs = mvMap()[k];
      var cls = "day-tile" + (!d || d.rest ? " rest" : "") + (k === tk ? " today" : "") + (!ED && mvMissed(k) ? " missed" : "");
      h += '<a class="' + cls + (ED ? ' rtdk' : '') + '" data-dk="' + k + '" href="#routine-' + k + '" role="tab" aria-current="' + (k === sel) + '"><b>' + DAY_KO[k] + '</b>' +
        img(dayIcon(d), "wk-ic", true) + '<span>' +
        esc(d ? d.part : "휴식") + '</span>' + (ED || !mvs ? '' : '<em class="mv-tag' + (mvs === "-" ? ' off' : '') + '">' + (mvs === "-" ? '옮김' : DAY_KO[mvs] + '에서') + '</em>') + '</a>';
    });
    h += '</div>';
    if (!ROT && !ED && !DEMO) {
      var td0 = dayByKey(tk), anyMiss = ["mon", "tue", "wed", "thu", "fri", "sat"].some(mvMissed), anyMv = Object.keys(mvMap()).length;
      h += '<p class="mv-hint">' + (anyMiss ? '못 나온 날 칸을 <b>꾹</b> 누르면 이번 주 안에서 옮길 수 있어요' :
        (!td0 || td0.rest) ? '쉬는 날인데 나왔다면 <b>오늘 칸을 꾹</b> 눌러 운동을 골라요' : anyMv ? '이번 주에 옮긴 운동이 있어요 · 칸을 꾹 누르면 더 옮기거나 되돌려요' :
        '요일 칸을 <b>꾹</b> 누르면 원하는 요일로 옮길 수 있어요 · 매주 월요일 원래대로') + '</p>';
    }
    if (!d || d.rest) {
      h += '<div class="rest-card"><b>' + (d && d.mvSkip ? '이번 주는 옮겼어요' : '쉬는 날') + '</b>' + (d && d.mvSkip ? '다른 날로 옮긴 운동이에요' : '푹 쉬고 잘 먹기! 근육은 쉬는 동안 자라요') +
        (!ED && !ROT && !DEMO && sel === tk ? '<button type="button" class="btn fill mv-go" data-mvk="' + tk + '">오늘 나왔어요 · 운동 고르기</button>' : '') + '</div>';
      if (ED && !ROT) h += '<button type="button" class="rtadd" data-rt="work">+ 이날 운동 넣기</button>';
    } else if (d.cardio_only) {
      h += '<div class="ex-list"><div class="ex cardio"' + (CAN_EDIT ? ' data-cardio="1"' : '') + '><div class="ex-top"><span class="ex-ic">' + img("treadmill") + '</span><div><h3>유산소만 ' + d.cardio_only + '분</h3>' +
        '<div class="tip">' + esc(R.cardio ? R.cardio.options : "") + '</div></div></div></div></div>' +
        '<p class="note">' + esc(d.note || "웨이트 없이 유산소만 하는 날이에요") + '</p>';
    } else if (d.pick) {
      h += '<p class="note" style="margin:0 0 12px">' + esc(d.note || "이번 주에 아쉬웠던 부위 하나를 골라 그 요일 루틴 그대로 해요") + '</p>' + pickList(d) +
        (d.cardio && R.cardio ? '<div class="ex-list" style="margin-top:12px"><div class="ex cardio"' + (CAN_EDIT ? ' data-cardio="1"' : '') + '><div class="ex-top"><span class="ex-ic">' + img("treadmill") + '</span><div><h3>마무리 유산소 ' + R.cardio.minutes + '분</h3><div class="tip">' + esc(R.cardio.options) + '</div></div></div></div></div>' : '');
    } else {
      h += '<div class="flow1"><span><b>①</b> 스트레칭 10분</span><i>›</i><span><b>②</b> 웨이트 ' + d.items.length + '종목</span><i>›</i><span' + (CAN_EDIT ? ' data-cardio="1"' : '') + '><b>③</b> 유산소 ' + (d.cardio && R.cardio ? R.cardio.minutes + '분' : '없음') + '</span></div>';
      var ckD = ED ? null : chkDate(sel);
      h += '<div class="ex-list cmp' + (ckD ? ' ck' : '') + '">' + d.items.map(function (it, i) {
        var main = it.tag === "메인";
        var sets = it.sets.map(function (s, j) {
          var reps = typeof s[0] === "string" ? esc(s[0]) : s[0] + '<i>회</i>';   /* "30초" 같은 글자도 됨 */
          var kg = s[1] == null ? '맨몸' : s[1] + 'kg';                              /* null = 맨몸 */
          return '<div class="set"><small>' + (j + 1) + '세트</small><b>' + reps + '</b><i>' + kg + '</i></div>';
        }).join("");
        var dn = !!ckD && lgDone(it.name, ckD);
        return '<div class="ex' + (main ? ' main' : '') + (it.tag === "워밍업" ? ' t-warm' : it.tag === "선행" ? ' t-pre' : '') + (dn ? ' done' : '') + (ED ? ' rtdr' : '') + '"' + (ED ? ' data-di="' + i + '"' : ' data-exi="' + i + '" role="button" tabindex="0" aria-label="' + esc(it.name) + ' 자세히 보기"') + '><div class="ex-top"><span class="ex-ic">' + img(iconOf(it)) + '<span class="ex-no">' + (i + 1) + '</span>' +
          (main ? '<span class="main-badge">메인</span>' : '') + '</span><div>' +
          '<h3>' + esc(it.name) + '</h3><div class="meta">' + esc(it.en) + ' ' + tagChip(it.tag) + '</div>' +
          '<div class="tip">' + esc(it.tip) + '</div><div class="sets">' + sets + '</div></div></div>' +
          (itemForm(it) ? '<a class="formlink" href="#form-' + esc(itemForm(it).id) + '">▶ 복습지</a>' : '') +
          (ED ? rtItemCtl(i, d.items.length) : !ckD ? '' : '<button type="button" class="exchk" data-chk="' + i + '" data-date="' + ckD + '" aria-pressed="' + dn + '" aria-label="' + esc(it.name) + ' 끝, 기록에 저장"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17l9-10"/></svg></button>') + '</div>';
      }).join("");
      if (ED) h += '<button type="button" class="rtadd" data-rt="add">+ 종목 추가</button>';
      if (d.cardio && R.cardio) {
        h += '<div class="ex cardio"' + (CAN_EDIT ? ' data-cardio="1"' : '') + '><div class="ex-top"><span class="ex-ic">' + img("treadmill") + '</span><div><h3>마무리 유산소 ' + R.cardio.minutes + '분</h3>' +
          '<div class="tip">' + esc(R.cardio.options) + '</div></div></div></div>';
      }
      h += '</div>' + (R.note ? '<p class="note">' + esc(R.note) + '</p>' : '');
    }
    h += '</section>';
    /* 근육 지도는 2026-11-14 기록 탭으로 옮김 */
    return h + remember();
  }

  /* ---- 종목 자세히 보기 (2026-11-14 장동욱 "종목을 누르면 더 정확하게 + 루틴이랑 복습지를 한번에 합쳐서 부드럽게")
     루틴 종목 카드를 누르면 아래에서 창이 올라옴: 큰 움직이는 아이콘·세트표·선생님 팁 + (연결된 복습지가 있으면) 영상·KEY POINT·O/X → "복습지 전체 보기" */
  function exSheet(it, no) {
    var f = itemForm(it), D = f ? f.dir : "";
    var sets = it.sets.map(function (s, j) {
      var reps = typeof s[0] === "string" ? esc(s[0]) : s[0] + '<small>회</small>';
      return '<div class="xs-set"><span>' + (j + 1) + '세트</span><b>' + reps + '</b><em>' + (s[1] == null ? '맨몸' : s[1] + '<small>kg</small>') + '</em></div>';
    }).join("");
    var h = '<div class="xs-grab" aria-hidden="true"></div><button type="button" class="xs-x" data-xclose aria-label="닫기">×</button>' +
      '<div class="xs-head"><span class="xs-ic' + (it.tag === "메인" ? ' main' : '') + '">' + img(iconOf(it)) + '</span><div>' +
      '<small>' + no + '번째 종목' + (it.tag ? ' · ' + esc(it.tag) : '') + '</small><h2>' + esc(it.name) + '</h2><div class="xs-en">' + esc(it.en || "") + '</div></div></div>' +
      '<div class="xs-sets' + (it.sets.length >= 5 ? ' many' : '') + '">' + sets + '</div>' +
      (it.tip ? '<div class="xs-tip"><b>선생님 팁</b>' + esc(it.tip) + '</div>' : '');
    if (f) {
      h += '<div class="xs-form"><div class="xs-fh"><b>자세 복습지</b><span>' + esc(f.date) + ' 수업</span></div>' +
        '<div class="xs-vid"><video poster="' + esc(D) + 'poster.jpg" src="' + esc(D) + 'form.mp4" autoplay muted loop playsinline webkit-playsinline disablepictureinpicture disableremoteplayback x-webkit-airplay="deny" preload="metadata"></video></div>' +
        '<div class="xs-kp"><small>KEY POINT</small>' + esc(f.key_point) + '</div>' +
        '<div class="xs-ox"><div class="o"><b>이렇게</b><ul>' + f.do.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("") + '</ul></div>' +
        '<div class="x"><b>이건 피하기</b><ul>' + f.dont.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("") + '</ul></div></div>' +
        '<a class="xs-go" href="#form-' + esc(f.id) + '" data-xgo>자극 부위 · 동작 3단계까지 전체 보기 →</a></div>';
    }
    var bg = document.createElement("div");
    bg.className = "xsheet-bg";
    bg.innerHTML = '<div class="xsheet" role="dialog" aria-modal="true" aria-label="' + esc(it.name) + '">' + h + '</div>';
    document.body.appendChild(bg);
    document.documentElement.classList.add("rts-open");
    var sh = bg.firstChild;
    requestAnimationFrame(function () { bg.classList.add("on"); });
    var v = sh.querySelector("video"); if (v) { try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
    function close(nav) {
      if (bg.classList.contains("off")) return;
      if (v) try { v.pause(); } catch (e) {}
      bg.classList.add("off"); bg.classList.remove("on");
      setTimeout(function () { bg.remove(); if (!document.querySelector(".rtsheet-bg, .xsheet-bg")) document.documentElement.classList.remove("rts-open"); }, nav ? 0 : 280);
    }
    bg.addEventListener("click", function (e) {
      if (e.target === bg || e.target.closest("[data-xclose]")) close();
      else if (e.target.closest("[data-xgo]")) close(true);
    });
    /* 위쪽(손잡이·제목)을 끌어내리면 닫힘 */
    var y0 = null, dy = 0;
    sh.addEventListener("touchstart", function (e) { if (sh.scrollTop > 0) { y0 = null; return; } y0 = e.touches[0].clientY; dy = 0; }, { passive: true });
    sh.addEventListener("touchmove", function (e) { if (y0 == null) return; dy = e.touches[0].clientY - y0; if (dy > 0) { sh.style.transition = "none"; sh.style.transform = "translateY(" + dy + "px)"; } }, { passive: true });
    sh.addEventListener("touchend", function () { if (y0 == null) return; y0 = null; sh.style.transition = ""; sh.style.transform = ""; if (dy > 90) close(); });
  }
  document.addEventListener("click", function (e) {
    var c = e.target.closest && e.target.closest(".ex-list.cmp .ex[data-exi]");
    if (!c || e.target.closest("a, button") || CAN_EDIT) return;   /* 선생님 보기는 누르면 고치기(터치해서 고치기) */
    var d = dayByKey(view.getAttribute("data-day")), it = d && d.items && d.items[+c.getAttribute("data-exi")];
    if (it) exSheet(it, +c.getAttribute("data-exi") + 1);
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches(".ex-list.cmp .ex[data-exi]")) { e.preventDefault(); e.target.click(); }
  });

  /* ---------------- 식단 */
  /* M.diet: null = 준비 중 / 문자열 = 그대로 / 객체 = 종이 다이어트 식단표(2026-10-21 표준 틀)와 같은 구성 (2026-11-05) */
  function foodImg(key, cls) {
    var src = /^ic_/.test(key) ? BASE + "food/" + icv() + "/" + key + ".png" : BASE + "food/" + key + ".png";
    return '<img class="' + (cls || "fd-img") + '" src="' + src + '" alt="" loading="lazy">';
  }
  function dietBar() {
    if (!CAN_EDIT) return "";
    var D = M.diet, obj = D && typeof D === "object";
    return '<div class="dtbar">' + (obj ? '<b>✎ 고치고 싶은 글자를 눌러 보세요</b><small>누르면 그 부분만 고치는 창이 떠요' + (DIET_REC ? ' · 폰에서 고친 식단 사용 중' : '') + '</small>'
      : '<b>식단 ' + (D ? '고치기' : '쓰기') + '</b><small>글로 간단히 써서 올릴 수 있어요 (표 식단은 Claude에게)</small>') +
      '<div class="dtbtns">' + (obj ? '' : '<button type="button" data-dt="text">✎ ' + (D ? '글 고치기' : '식단 글로 쓰기') + '</button>') +
      (DIET_REC ? '<button type="button" data-dt="reset">처음 식단으로</button>' : '') + '</div></div>';
  }
  /* ---------------- 오늘 먹은 것 — 식단 사진 기록 (2026-11-20 팀장 "식단 사진으로 찍어서 나도 회원님도 기록, 양·칼로리·순탄수·순단백·지방 분석")
     식단 탭 맨 위. 회원 폰·선생님 보기 둘 다 기록·삭제 가능. 하루치 = 창고 mw:<주소>:meal:<YYYY-MM-DD> [{id,t(끼니),img(드라이브 id),memo,note,items:[{n,g,kcal,c,p,f}],by:"m"|"c",at}]
     사진: 창고 meal_img(드라이브 "PT노트 식단 사진"). 자동 분석: 창고 meal_ai(Gemini — 스크립트 속성 GEMINI_KEY 있어야). 키가 없거나 실패하면 음식 이름·양을 넣으면 FOOD_DB(100g당 대략값)로 계산.
     c = 순탄수(식이섬유 뺀 탄수화물). 폰 기억 ptnote:<주소>:meal */
  var FOOD_DB = {   /* 100g당 [kcal, 순탄수, 단백질, 지방] — 대략값 */
    "현미밥": [150, 31, 3, 1], "흰쌀밥": [145, 32, 2.6, 0.3], "잡곡밥": [148, 31, 3.3, 0.8], "고구마": [128, 29, 1.4, 0.2], "감자": [77, 16, 2, 0.1],
    "오트밀": [380, 58, 13, 7], "바나나": [90, 21, 1.1, 0.3], "사과": [52, 12, 0.3, 0.2], "블루베리": [57, 12, 0.7, 0.3], "방울토마토": [18, 2.7, 0.9, 0.2],
    "닭가슴살": [165, 0, 31, 3.6], "훈제 닭가슴살": [120, 2, 23, 2], "계란": [143, 0.7, 12.6, 9.5], "계란 흰자": [52, 0.7, 11, 0.2], "소고기 우둔": [150, 0, 22, 6],
    "소고기 등심": [250, 0, 20, 19], "돼지 목살": [230, 0, 18, 17], "삼겹살": [330, 0, 17, 29], "연어": [208, 0, 20, 13], "참치캔": [130, 0, 27, 2],
    "고등어구이": [210, 0, 24, 12], "새우": [99, 0.2, 24, 0.3], "두부": [80, 1.5, 8.5, 4.5], "그릭요거트": [97, 4, 9, 5], "우유": [65, 5, 3.2, 3.5],
    "저지방 우유": [42, 5, 3.4, 1], "프로틴 쉐이크": [400, 8, 78, 6], "아몬드": [580, 10, 21, 50], "견과류": [600, 15, 18, 52], "땅콩버터": [590, 14, 25, 50],
    "아보카도": [160, 2, 2, 15], "샐러드 채소": [20, 2.5, 1.3, 0.2], "브로콜리": [34, 4, 2.8, 0.4], "김치": [20, 2, 1.5, 0.5], "된장찌개": [50, 3, 3.5, 2.5],
    "김치찌개": [55, 3, 4, 3], "라면": [110, 15, 2.5, 4.5], "김밥": [170, 26, 5, 5], "떡볶이": [200, 40, 4, 2.5], "치킨": [290, 10, 20, 18],
    "피자": [270, 30, 11, 11], "햄버거": [250, 27, 12, 10], "짜장면": [130, 21, 4, 3.5], "식빵": [265, 47, 9, 3.5], "베이글": [260, 50, 10, 1.6],
    "비빔밥": [130, 20, 4.5, 3.5], "제육볶음": [190, 8, 14, 11], "불고기": [180, 8, 16, 9], "닭볶음탕": [130, 6, 13, 6], "쌀국수": [95, 15, 5, 1.5],
    "샌드위치": [230, 25, 11, 9], "떡": [230, 50, 4, 0.5], "요거트(가당)": [95, 15, 3, 2.5], "에너지바": [400, 55, 10, 15], "초콜릿": [540, 57, 7, 31],
    "감자칩": [540, 50, 6, 35], "아이스크림": [200, 24, 3.5, 11], "아메리카노": [2, 0.3, 0.1, 0], "카페라떼": [55, 4.5, 3, 3], "콜라": [42, 10.6, 0, 0],
    "제로콜라": [0, 0, 0, 0], "맥주": [43, 3.6, 0.5, 0], "소주": [115, 0, 0, 0]
  };
  var MEAL_LS = "ptnote:" + SLUG + ":meal", MEAL = {}, MEAL_D = "", MEAL_T = ["아침", "점심", "저녁", "간식", "운동 후"];
  try { MEAL = JSON.parse(localStorage.getItem(MEAL_LS) || "{}") || {}; } catch (e) { MEAL = {}; }
  function mealServer(kv) {
    if (!kv) return;
    var o = {}, pre = "mw:" + SLUG + ":meal:";
    Object.keys(kv).forEach(function (k) { if (k.indexOf(pre) === 0 && Array.isArray(kv[k]) && kv[k].length) o[k.slice(pre.length)] = kv[k]; });
    if (JSON.stringify(o) === JSON.stringify(MEAL)) return;
    MEAL = o; try { localStorage.setItem(MEAL_LS, JSON.stringify(MEAL)); } catch (e) {}
    if (/^#diet$/.test(location.hash || "")) route();
  }
  function r1(v) { return Math.round((+v || 0) * 10) / 10; }
  function mealSum(items) {
    var s = { kcal: 0, c: 0, p: 0, f: 0 };
    (items || []).forEach(function (x) { s.kcal += +x.kcal || 0; s.c += +x.c || 0; s.p += +x.p || 0; s.f += +x.f || 0; });
    s.kcal = Math.round(s.kcal); s.c = r1(s.c); s.p = r1(s.p); s.f = r1(s.f); return s;
  }
  function mealMacro(s, big) {
    var ck = s.c * 4, pk = s.p * 4, fk = s.f * 9, all = ck + pk + fk || 1;
    function bar(cls, lb, g, k) { return '<div class="mm ' + cls + '"><span>' + lb + '</span><b>' + g + 'g</b><i style="--w:' + Math.round(k / all * 100) + '%"></i><small>' + Math.round(k / all * 100) + '%</small></div>'; }
    return '<div class="ml-mac' + (big ? ' big' : '') + '">' + bar("c", "순탄수", s.c, ck) + bar("p", "순단백", s.p, pk) + bar("f", "지방", s.f, fk) + '</div>';
  }
  function mealSection() {
    var today = xdToday(), d = MEAL_D || today, L = MEAL[d] || [], all = [];
    L.forEach(function (e) { all = all.concat(e.items || []); });
    var S = mealSum(all);
    var h = '<section id="meal">' + head("", "먹은 것 기록", "사진 찍어 올리면 양·칼로리·탄단지를 계산해요") +
      '<div class="ml-day"><button type="button" data-mday="-1" aria-label="전날">‹</button><b>' + (d === today ? '오늘 · ' : '') + esc(dayLabel(d)) + '</b>' +
      '<button type="button" data-mday="1" aria-label="다음 날"' + (d >= today ? ' disabled' : '') + '>›</button></div>' +
      '<div class="panel ml-tot"><div class="ml-kcal"><small>' + (d === today ? '오늘' : '이날') + ' 먹은 칼로리</small><b>' + S.kcal.toLocaleString() + '</b><i>kcal</i>' +
      '<span>' + L.length + '끼 기록</span></div>' + mealMacro(S, true) + '</div>';
    if (!DEMO) h += '<button type="button" class="ml-add" data-madd>📷 사진 찍어 기록하기 <small>' + (COACH_MODE ? '선생님이 대신 기록해도 돼요' : '사진만 올려도, 글로만 써도 돼요') + '</small></button>';
    L.slice().sort(function (a, b) { return MEAL_T.indexOf(a.t) - MEAL_T.indexOf(b.t) || a.at - b.at; }).forEach(function (e) {
      var s = mealSum(e.items), tm = new Date(e.at || 0);
      h += '<div class="panel ml-card">' +
        '<div class="ml-top"><span class="ml-t">' + esc(e.t || "식사") + '</span><small>' + (e.by === "c" ? '선생님 기록' : '회원님 기록') + ' · ' + ("0" + tm.getHours()).slice(-2) + ':' + ("0" + tm.getMinutes()).slice(-2) + '</small>' +
        (s.kcal ? '<b class="ml-ck">' + s.kcal + ' kcal</b>' : '') + '</div>' +
        (e.img ? '<a class="ml-img" href="' + fmImg(e.img, 1600) + '" target="_blank" rel="noopener"><img src="' + fmImg(e.img, 720) + '" alt="' + esc(e.t || "식사") + ' 사진" loading="lazy"></a>' : '') +
        ((e.items || []).length ? '<div class="ml-its">' + e.items.map(function (x) {
          return '<div class="ml-it"><div><b>' + esc(x.n) + '</b>' + (x.g ? '<i>' + r1(x.g) + 'g</i>' : '') + '</div><span>' + Math.round(x.kcal || 0) + 'kcal · 탄 ' + r1(x.c) + ' · 단 ' + r1(x.p) + ' · 지 ' + r1(x.f) + '</span></div>';
        }).join("") + '</div>' + mealMacro(s) : '') +
        (e.memo ? '<p class="ml-memo">' + esc(e.memo) + '</p>' : '') +
        (e.note ? '<p class="ml-note">💬 ' + esc(e.note) + '</p>' : '') +
        (DEMO ? '' : '<div class="ml-act"><button type="button" data-medit="' + esc(e.id) + '">✎ 고치기</button><button type="button" data-mdel="' + esc(e.id) + '">삭제</button></div>') + '</div>';
    });
    if (!L.length) h += '<p class="ml-empty">' + (d === today ? '아직 오늘 기록이 없어요. 한 끼만 찍어 올려도 좋아요!' : '이날은 기록이 없어요') + '</p>';
    return h + '</section>';
  }
  function mealSave(d, arr, sh, ok) {
    var key = "mw:" + SLUG + ":meal:" + d, items = {}; items[key] = arr.length ? arr : null;
    if (JSON.stringify(arr).length > 3900) { if (sh) sh.msg("하루에 적을 수 있는 양을 넘었어요 — 메모를 줄이거나 끼니를 합쳐 주세요"); return; }
    if (sh) sh.msg("저장하는 중…");
    rtPost({ a: "kv_set", items: items }).then(function (j) {
      if (!j || !j.ok) { var m = j && j.error === "action" ? "창고를 새 버전으로 다시 배포해야 해요" : "저장이 안 됐어요 — 다시 눌러 주세요"; if (sh) sh.msg(m); else attToast(m); return; }
      if (arr.length) MEAL[d] = arr; else delete MEAL[d];
      try { localStorage.setItem(MEAL_LS, JSON.stringify(MEAL)); } catch (e) {}
      if (sh) sh.close(); route(); attToast(ok);
    }).catch(function () { if (sh) sh.msg(rtNetMsg()); else attToast(rtNetMsg()); });
  }
  function mealRow(x) {
    x = x || {};
    return '<div class="ml-row"><input class="mn" list="mlFoods" placeholder="음식 이름" value="' + esc(x.n || "") + '" maxlength="30">' +
      '<label><input class="mg" type="number" inputmode="decimal" min="0" value="' + (x.g || "") + '" placeholder="양">g</label>' +
      '<label><input class="mk" type="number" inputmode="decimal" min="0" value="' + (x.kcal || x.kcal === 0 ? Math.round(x.kcal) : "") + '">kcal</label>' +
      '<label>탄<input class="mc" type="number" inputmode="decimal" min="0" value="' + (x.c === undefined ? "" : r1(x.c)) + '"></label>' +
      '<label>단<input class="mp" type="number" inputmode="decimal" min="0" value="' + (x.p === undefined ? "" : r1(x.p)) + '"></label>' +
      '<label>지<input class="mf" type="number" inputmode="decimal" min="0" value="' + (x.f === undefined ? "" : r1(x.f)) + '"></label>' +
      '<button type="button" class="mx" aria-label="이 음식 빼기">×</button></div>';
  }
  function mealSheet(edit) {
    var d = MEAL_D || xdToday(), hr = new Date().getHours(), b64 = "", e0 = edit || {};
    var t0 = e0.t || (hr < 10 ? "아침" : hr < 15 ? "점심" : hr < 17 ? "간식" : "저녁");
    var body = '<div class="ml-chips">' + MEAL_T.map(function (t) { return '<button type="button" class="' + (t === t0 ? 'on' : '') + '" data-mt="' + t + '">' + t + '</button>'; }).join("") + '</div>' +
      '<label class="ml-ph"><input type="file" accept="image/*" id="mlFile" hidden><span id="mlPhT">' + (e0.img ? '📷 사진 바꾸기' : '📷 사진 찍기 · 앨범에서 고르기') + '</span>' +
      '<img id="mlPrev" alt=""' + (e0.img ? ' src="' + fmImg(e0.img, 720) + '"' : ' hidden') + '></label>' +
      '<button type="button" class="ml-ai" id="mlAi">✨ 사진 보고 자동 분석 <small>음식·양·칼로리·탄단지</small></button>' +
      '<label>메모 <small>선택 · 예) 밥 반 공기만, 소스 따로</small><textarea id="mlMemo" rows="2" maxlength="200">' + esc(e0.memo || "") + '</textarea></label>' +
      '<div class="ml-ed"><div class="ml-edh"><b>먹은 음식</b><small>이름·양을 넣으면 칼로리·탄단지가 자동으로 계산돼요(대략값)</small></div><div id="mlItems">' +
      ((e0.items || []).length ? e0.items.map(mealRow).join("") : mealRow()) + '</div>' +
      '<button type="button" class="ml-more" id="mlMore">＋ 음식 추가</button><div class="ml-sum" id="mlSum"></div></div>' +
      '<datalist id="mlFoods">' + Object.keys(FOOD_DB).map(function (n) { return '<option value="' + esc(n) + '">'; }).join("") + '</datalist>';
    var note = e0.note || "";
    var sh = rtSheet(edit ? "기록 고치기" : "먹은 것 기록하기", body, function (sh) {
      var t = (sh.querySelector(".ml-chips .on") || {}).getAttribute ? sh.querySelector(".ml-chips .on").getAttribute("data-mt") : t0;
      var items = rows().filter(function (x) { return x.n; }), memo = fv(sh, "mlMemo");
      if (!items.length && !b64 && !e0.img && !memo) return "사진이나 음식, 메모 중 하나는 넣어 주세요";
      function done(img) {
        var e = { id: e0.id || ("m" + Date.now().toString(36)), t: t, img: img || "", memo: memo, note: note, items: items, by: e0.by || (COACH_MODE ? "c" : "m"), at: e0.at || Date.now() };
        var arr = (MEAL[d] || []).filter(function (x) { return x.id !== e.id; }).concat([e]);
        mealSave(d, arr, sh, edit ? "고쳤어요" : "기록했어요 · " + mealSum(items).kcal + " kcal");
      }
      if (!b64) { done(e0.img); return true; }
      sh.msg("사진 올리는 중…");
      rtPost({ a: "meal_img", data: b64 }).then(function (j) {
        if (j && j.ok && j.id) done(j.id);
        else sh.msg(j && j.error === "action" ? "사진 저장은 창고를 새 버전으로 배포해야 돼요 — 사진 빼고 저장하려면 사진을 지워 주세요" : "사진이 안 올라갔어요 — 다시 눌러 주세요");
      }).catch(function () { sh.msg(rtNetMsg()); });
      return true;
    }, "저장");
    function rows() {
      return Array.prototype.map.call(sh.querySelectorAll(".ml-row"), function (r) {
        function v(c) { var x = parseFloat(r.querySelector(c).value); return isFinite(x) ? x : 0; }
        return { n: r.querySelector(".mn").value.trim().slice(0, 30), g: v(".mg"), kcal: Math.round(v(".mk")), c: r1(v(".mc")), p: r1(v(".mp")), f: r1(v(".mf")) };
      });
    }
    function sum() { var s = mealSum(rows()); sh.querySelector("#mlSum").innerHTML = '<b>' + s.kcal + ' kcal</b>' + mealMacro(s); }
    function calc(r, by) {   /* 이름이 표에 있으면 양으로 계산, 자동 분석 값이 있으면 양이 바뀐 만큼 비례 */
      var n = r.querySelector(".mn").value.trim(), g = parseFloat(r.querySelector(".mg").value), db = FOOD_DB[n], base = r.getAttribute("data-base");
      if (db && (by === "n" || by === "g")) {
        if (!(g > 0)) { g = n === "계란" ? 50 : n === "프로틴 쉐이크" ? 30 : 100; r.querySelector(".mg").value = g; }
        set(r, [db[0] * g / 100, db[1] * g / 100, db[2] * g / 100, db[3] * g / 100]); r.setAttribute("data-base", JSON.stringify(db.map(function (x) { return x / 100; })));
      } else if (base && by === "g" && g > 0) {
        var b = JSON.parse(base); set(r, [b[0] * g, b[1] * g, b[2] * g, b[3] * g]);
      }
    }
    function set(r, v) { r.querySelector(".mk").value = Math.round(v[0]); r.querySelector(".mc").value = r1(v[1]); r.querySelector(".mp").value = r1(v[2]); r.querySelector(".mf").value = r1(v[3]); }
    function per(r, x) { if (x.g > 0) r.setAttribute("data-base", JSON.stringify([x.kcal / x.g, x.c / x.g, x.p / x.g, x.f / x.g])); }
    Array.prototype.forEach.call(sh.querySelectorAll(".ml-row"), function (r, i) { per(r, (e0.items || [])[i] || {}); });
    sh.addEventListener("click", function (ev) {
      var c = ev.target.closest("[data-mt]");
      if (c) { Array.prototype.forEach.call(sh.querySelectorAll("[data-mt]"), function (b) { b.classList.toggle("on", b === c); }); return; }
      if (ev.target.closest(".mx")) { var rr = ev.target.closest(".ml-row"); rr.remove(); if (!sh.querySelector(".ml-row")) sh.querySelector("#mlItems").insertAdjacentHTML("beforeend", mealRow()); sum(); return; }
      if (ev.target.closest("#mlMore")) { sh.querySelector("#mlItems").insertAdjacentHTML("beforeend", mealRow()); sh.querySelector(".ml-row:last-child .mn").focus(); return; }
      if (ev.target.closest("#mlAi")) {
        if (!b64) { sh.msg(e0.img ? "자동 분석은 새로 찍은 사진으로만 돼요" : "먼저 사진을 넣어 주세요"); return; }
        var btn = sh.querySelector("#mlAi"); btn.disabled = true; btn.classList.add("busy"); sh.msg("사진을 보고 분석하는 중… (5~15초)");
        rtPost({ a: "meal_ai", data: b64, hint: fv(sh, "mlMemo") }).then(function (j) {
          btn.disabled = false; btn.classList.remove("busy");
          if (j && j.ok && (j.items || []).length) {
            sh.querySelector("#mlItems").innerHTML = j.items.map(mealRow).join("");
            Array.prototype.forEach.call(sh.querySelectorAll(".ml-row"), function (r, i) { per(r, j.items[i]); });
            note = j.note || ""; sum(); sh.msg("분석했어요 — 양이 다르면 g만 고치면 다시 계산돼요" + (note ? " · " + note : ""));
          } else if (j && (j.error === "nokey" || j.error === "action")) sh.msg("자동 분석은 아직 준비 중이에요 — 음식 이름과 양을 넣으면 계산돼요");
          else sh.msg("분석이 잘 안 됐어요 — 다시 눌러 보거나 음식 이름·양을 직접 넣어 주세요");
        }).catch(function () { btn.disabled = false; btn.classList.remove("busy"); sh.msg(rtNetMsg()); });
      }
    });
    sh.addEventListener("input", function (ev) {
      var r = ev.target.closest(".ml-row");
      if (r) { if (ev.target.classList.contains("mn")) calc(r, "n"); else if (ev.target.classList.contains("mg")) calc(r, "g"); else if (/\bm[kcpf]\b/.test(ev.target.className)) r.removeAttribute("data-base"); }
      sum();
    });
    sh.querySelector("#mlFile").addEventListener("change", function () {
      var f = this.files && this.files[0]; if (!f) return;
      sh.msg("사진 준비 중…");
      ibShrink(f, 1280).then(function (x) {
        b64 = x; var im = sh.querySelector("#mlPrev"); im.src = "data:image/jpeg;base64," + x; im.hidden = false;
        sh.querySelector("#mlPhT").textContent = "📷 사진 바꾸기"; sh.msg("사진을 넣었어요 — ✨ 자동 분석을 눌러 보세요");
      }).catch(function () { sh.msg("사진을 열 수 없어요"); });
    });
    sum();
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-madd],[data-mday],[data-mdel],[data-medit]");
    if (!a || !document.getElementById("meal")) return;
    var d = MEAL_D || xdToday();
    if (a.hasAttribute("data-madd")) { mealSheet(); return; }
    if (a.hasAttribute("data-mday")) {
      var p = d.split("-"), dt = new Date(+p[0], +p[1] - 1, +p[2] + (+a.getAttribute("data-mday")));
      var k = dt.getFullYear() + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-" + ("0" + dt.getDate()).slice(-2);
      if (k > xdToday()) return; MEAL_D = k === xdToday() ? "" : k; route(); return;
    }
    var id = a.getAttribute("data-mdel") || a.getAttribute("data-medit"), e0 = (MEAL[d] || []).filter(function (x) { return x.id === id; })[0];
    if (!e0) return;
    if (a.hasAttribute("data-medit")) { mealSheet(e0); return; }
    if (!a.classList.contains("sure")) { a.classList.add("sure"); a.textContent = "한 번 더 누르면 삭제"; setTimeout(function () { a.classList.remove("sure"); a.textContent = "삭제"; }, 3000); return; }
    mealSave(d, (MEAL[d] || []).filter(function (x) { return x.id !== id; }), null, "지웠어요");
  });
  function renderDiet() {
    var D = M.diet;
    if (CAN_EDIT) return mealSection() + dietBar() + renderDiet0();
    return mealSection() + renderDiet0();
  }
  function renderDiet0() {
    var D = M.diet;
    if (!D || typeof D === "string") {
      var h = '<section>' + head("", "식단표", "");
      if (!D) {
        h += '<div class="panel empty"><svg viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="25" fill="var(--tint)"/><circle cx="27" cy="29" r="12" fill="#fff" stroke="var(--primary)" stroke-width="3"/><path d="M12 14v12M15 14v12M12 20h3M41 14c-3 2-3 8 0 10v12" stroke="var(--primary)" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>' +
          '<h3>식단표 준비 중이에요</h3><p>선생님이 회원님 식단을 짜면 여기에 올려드릴게요</p></div>';
      } else h += D;
      return h + '</section>' + remember();
    }
    var who = D.member || M.name;
    var h = '<div class="hero"><div class="hero-main split"><div class="hero-l">' +
      '<div class="eyebrow">MY MEAL NOTE <b>· 식단</b></div><h1>' + esc(D.title) + '</h1><div class="en">' + esc(D.title_en || "") + '</div>' +
      '<div class="who"><strong>' + esc(who) + ' 회원님</strong>' + (D.updated ? '<span>' + esc(D.updated) + ' 업데이트</span>' : '') + '</div></div>' +
      '<div class="hero-r"><div class="eyebrow">식단 규칙</div><ul class="dots small">' +
      (D.rules || []).map(function (r) { return '<li>' + esc(r) + '</li>'; }).join("") + '</ul>' +
      (D.rules_note ? '<p class="benefit">' + esc(D.rules_note) + '</p>' : '') + '</div></div>' +
      '<div class="keypoint"><small>KEY POINT</small><p>' + esc(D.key_point) + '</p></div></div>';
    if (D.stats) h += '<div class="dt-stats">' + D.stats.map(function (s) {
      return '<div><small>' + esc(s.label) + '</small><b>' + esc(s.value) + '</b><i>' + esc(s.unit) + '</i></div>';
    }).join("") + '</div>';

    var n = 0;
    function no() { n++; return (n < 10 ? "0" : "") + n; }
    if (D.formula) {
      h += '<section>' + head(no(), "한 끼는 이렇게", "아침·저녁은 이 공식대로 차려요") + '<div class="dt-formula">' +
        D.formula.map(function (f, i) {
          return (i ? '<span class="op">+</span>' : '') + '<div class="fm">' + foodImg(f.icon, "fm-img") + '<div><b>' + esc(f.title) + '</b><i>' + esc(f.sub) + '</i></div></div>';
        }).join("") + '<span class="op eq">=</span><div class="fm res"><b>' + esc(D.formula_result.title) + '</b><i>' + esc(D.formula_result.sub) + '</i></div></div></section>';
    }
    function foods(list, gold) {
      return '<div class="food-grid">' + list.map(function (f) {
        return '<div class="food">' + foodImg(f.icon) + '<b>' + esc(f.name) + '</b><span class="pill">' + esc(f.amount) + '</span></div>';
      }).join("") + (gold ? '<div class="food gold"><span class="g1">1종</span><b>한 끼에 딱 1종만</b><i>끼니마다 바꿔도 OK</i></div>' : '') + '</div>';
    }
    /* 끼니별로 정해진 식단 (2026-11-05 OO님): meals[{no, name?, tag?, note?, options[{label?, foods[{icon,name,amount?}]}]}] */
    if (D.meals) h += '<section>' + head(no(), D.meals_title || "하루 " + D.meals.length + "끼", D.meals_sub || "'또는'은 둘 중 하나만 골라요") + '<div class="mp-list">' +
      D.meals.map(function (ml) {
        return '<div class="mp' + (ml.tag ? ' hl' : '') + '"><div class="mp-h"><span class="mp-no">' + esc(ml.no) + '</span>' + (ml.name ? '<b>' + esc(ml.name) + '</b>' : '') +
          (ml.tag ? '<span class="mp-tag">' + esc(ml.tag) + '</span>' : '') + '</div>' +
          ml.options.map(function (op, i) {
            return (i ? '<div class="mp-or"><span>또는</span></div>' : '') + '<div class="mp-opt">' + (op.label ? '<small>' + esc(op.label) + '</small>' : '') +
              '<div class="mp-foods">' + op.foods.map(function (f) {
                return '<div class="mp-f">' + foodImg(f.icon, "mp-img") + '<b>' + esc(f.name) + '</b>' + (f.amount ? '<span class="pill">' + esc(f.amount) + '</span>' : '') + '</div>';
              }).join("") + '</div></div>';
          }).join("") + (ml.note ? '<p class="mp-note">' + esc(ml.note) + '</p>' : '') + '</div>';
      }).join("") + '</div></section>';
    if (D.carbs) h += '<section>' + head(no(), "탄수화물 고르기", "이 중 1종만, 적힌 양만큼") + foods(D.carbs) + '</section>';
    if (D.prots) h += '<section>' + head(no(), "단백질 고르기", "이 중 1종만, 적힌 양만큼") + foods(D.prots, true) + '</section>';
    if (D.day) h += '<section>' + head(no(), "하루는 이렇게", D.day_sub || "") + '<div class="meal-grid">' + D.day.map(function (d) {
      return '<div class="meal"><div class="meal-h">' + foodImg(d.icon, "meal-ic") + '<b>' + esc(d.name) + '</b></div><p>' + esc(d.line1) + '</p>' +
        '<i>' + esc(d.line2) + '</i>' + (d.line3 ? '<i>' + esc(d.line3) + '</i>' : '') + '</div>';
    }).join("") + '</div></section>';
    if (D.lunch_do) h += '<section>' + head(no(), "점심 일반식 가이드", "회사 밥·외식은 이렇게 골라요") + '<div class="ox">' +
      '<div class="oxbox o"><h3><svg class="mark" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.6" fill="none" stroke="currentColor" stroke-width="3.2"/></svg>이렇게 고르세요</h3><ul>' +
      D.lunch_do.map(function (t) { return '<li>' + CHECK + esc(t) + '</li>'; }).join("") + '</ul></div>' +
      '<div class="oxbox x"><h3><svg class="mark" viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 3.5l13 13M16.5 3.5l-13 13" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg>이건 피하세요</h3><ul>' +
      D.lunch_dont.map(function (t) { return '<li>' + XIC + esc(t) + '</li>'; }).join("") + '</ul></div></div></section>';
    if (D.extras) h += '<section>' + head(no(), "같이 먹어도 OK", "이건 더해도 괜찮아요") + '<div class="extra-list">' + D.extras.map(function (x) {
      return '<div class="extra">' + foodImg(x.icon, "ex-img") + '<div><div class="extra-h"><b>' + esc(x.name) + '</b><span class="pill">' + esc(x.tag) + '</span></div>' +
        x.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join("") + '</div></div>';
    }).join("") + '</div></section>';
    if (D.notes) h += '<section>' + head(no(), D.notes_title || "참고사항", D.notes_sub || "") + '<div class="dnotes">' + D.notes.map(function (s, i) {
      return (i ? '<span class="arr" aria-hidden="true">›</span>' : '') + '<div class="dnote"><div class="dn-h">' + foodImg(s.icon, "dn-ic") + '<small>STEP</small><b>0' + (i + 1) + '</b></div>' +
        '<h3>' + esc(s.title) + '</h3><span class="dchip">' + esc(s.chip) + '</span><p>' + esc(s.desc) + '</p></div>';
    }).join("") + '</div></section>';
    if (D.safety) h += '<div class="dsafety">' + XIC + '<b>잠깐!</b><span>' + esc(D.safety) + '</span></div>';
    return h + remember();
  }


  /* 배지·칩 글자 높낮이 자동 보정: 실제로 쓰인 글꼴의 글자 모양을 재서 상자 가운데로 옮김 */
  var ALIGN_SEL = ".jno, .ex-no, .mini .n, .today-ic > span, .today-day, .num, .tagc, .jb, .breath, .btn, .mchip, .jfocus li, .chip, .loop, .main-badge, .day-tile b, .tag, .oxbox h3";
  var mctx = null;
  function alignText(root) {
    try {
      mctx = mctx || document.createElement("canvas").getContext("2d");
      if (!mctx || !("actualBoundingBoxAscent" in mctx.measureText("1"))) return;
      Array.prototype.forEach.call((root || document).querySelectorAll(ALIGN_SEL), function (el) {
        var sp = null;
        for (var n = el.firstChild; n; n = n.nextSibling) {
          if (n.nodeType === 1 && n.classList.contains("tfix")) { sp = n; break; }
          if (n.nodeType === 3 && n.textContent.trim()) {
            sp = document.createElement("span"); sp.className = "tfix";
            el.insertBefore(sp, n); sp.appendChild(n); break;
          }
        }
        if (!sp) return;
        sp.style.top = "0px";
        var txt = sp.textContent.trim(), cs = getComputedStyle(sp);
        var probe = document.createElement("span");
        probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
        sp.insertBefore(probe, sp.firstChild);
        var base = probe.getBoundingClientRect().top;
        sp.removeChild(probe);
        mctx.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
        var m = mctx.measureText(txt);
        var ink = base + (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2;
        var r = el.getBoundingClientRect();
        if (!r.height) return;
        var off = ink - (r.top + r.height / 2);
        if (Math.abs(off) > 0.3 && Math.abs(off) < 6) sp.style.top = (-Math.round(off * 2) / 2) + "px";
      });
    } catch (e) {}
  }

  /* ---------------- 루틴 고치기 (2026-11-10, 선생님 휴대폰에서만)
     선생님 보기(COACH_MODE)에서 루틴 탭 위 "✎ 루틴 고치기" → 종목·세트·팁·순서·부위 이름을 고치고
     "저장 · 바로 반영" → 출석 창고(POST routine_save, 선생님 열쇠 확인) → 회원님이 노트를 열면 바로 바뀜.
     열쇠는 선생님 페이지 주소 끝 #key=… 로 한 번 열면 그 휴대폰에 저장(localStorage ptkey). */
  var RT_EN = {"고블릿 스쿼트":"Goblet Squat","이너타이":"Inner Thigh","아웃타이 머신":"Outer Thigh","레그프레스":"Leg Press","시티드 페이스풀":"Seated Face Pull","랫풀다운":"Lat Pulldown","뉴텍 시티드 로우 머신":"Seated Row","펙덱 플라이":"Pec Deck Fly","체스트 프레스 머신":"Chest Press","인클라인 덤벨 프레스":"Incline DB Press","케이블 푸쉬다운":"Cable Pushdown","플레이트 아웃타이":"Outer Thigh · Plate","힙쓰러스트 머신":"Hip Thrust","레그프레스 (발 높게)":"Leg Press · High","사이드 레터럴 레이즈 머신":"Standing Machine","숄더 프레스 머신":"Shoulder Press","사이드 레터럴 레이즈":"Lateral Raise","리버스 펙덱":"Reverse Pec Deck","케이블 시티드 로우":"Cable Seated Row","덤벨 컬":"Dumbbell Curl","오버헤드 익스텐션":"Overhead Ext.","벤치프레스":"Bench Press","체스트 프레스":"Chest Press","인클라인 프레스 머신":"Incline Machine Press","레그 익스텐션":"Leg Extension","스미스 스쿼트":"Smith Squat","라잉 레그컬":"Lying Leg Curl","스트레이트 암 풀다운":"Straight Arm Pulldown","원암 덤벨 로우":"One Arm DB Row","케이블 풀오버":"Cable Pullover","덤벨 슈러그":"DB Shrug","스미스 인클라인 프레스":"Smith Incline Press","덤벨 RDL":"Dumbbell RDL","힙 익스텐션":"Hip Extension","케이블 힙 킥백":"Cable Kickback","플랫 덤벨프레스":"Flat DB Press","핵스쿼트":"Hack Squat","해머 컬":"Hammer Curl","해머스트렝스 로우로우":"Low Row","언더그립 시티드 로우":"Underhand Seated Row","덤벨 숄더 프레스":"DB Shoulder Press","사이드 레터럴 레이즈 (덤벨)":"Lateral Raise","언더그립 랫풀다운":"Underhand Pulldown","뉴텍 체스트 프레스 머신":"Lying Chest Press","시티드 로우":"Seated Row","숄더 프레스":"Shoulder Press","플랭크":"Plank","스미스 슈러그":"Smith Shrug","스미스 숄더 프레스":"Smith Shoulder Press","인클라인 덤벨 컬":"Incline DB Curl","덤벨 오버헤드 익스텐션":"DB Overhead Ext","스미스 벤치프레스":"Smith Bench Press","랙 밴드 푸쉬업":"Rack Band Push-up","어시스트 친업":"Assisted Chin-up","리버스 펙덱 플라이":"Reverse Pec Deck Fly","케이블 체스트 프레스":"Cable Chest Press","뉴텍 엠토처 시티드 로우":"Seated Row Machine","핵프레스":"Hack Press","스파이더 컬":"Spider Curl","클로즈그립 랫풀다운":"Close-grip Pulldown","티바로우 머신":"T-bar Row Machine","페이스풀":"Face Pull","와이드 풀다운":"Wide Pulldown","프론트 로우 머신":"Front Row Machine","프리처 컬 머신":"Preacher Curl Machine"};
  var RT_PART_EN = {"하체":"Legs","등":"Back","가슴":"Chest","엉덩이":"Glute","어깨":"Shoulder","등 · 팔":"Back & Arms","가슴 · 팔":"Chest & Arms","로테이션":"Free Pick","휴식":"Rest","힙 A":"Glute A","가슴·어깨":"Chest · Shoulder","힙 B":"Glute B","힙 C":"Glute C","어깨·팔":"Shoulder · Arm","가슴·등":"Chest · Back","하체 B":"Legs B","등 A":"Back A","하체 A":"Legs A","등 B":"Back B","어깨 · 팔":"Shoulder & Arms","유산소":"Cardio","등·팔":"Back · Arms","팔":"Arm","가슴·삼두":"Chest · Triceps"};
  var CAN_EDIT = COACH_MODE && !DEMO;
  if (CAN_EDIT) document.documentElement.classList.add("can-edit");
  var RT_EDIT = null;   /* 고치는 중이면 { saved: 고치기 전 루틴, dirty: 고친 횟수 } */
  var RT_STALE = null;  /* data.js 루틴이 새로 올라와서 꺼진 '폰에서 고친 루틴' */
  function rtKey() { try { return localStorage.getItem("ptkey") || ""; } catch (e) { return ""; } }
  function rtToday() { var d = new Date(); return d.getFullYear() + ". " + (d.getMonth() + 1) + ". " + d.getDate(); }
  function vSig() { try { return attLoad().join(",") + JSON.stringify(attTimes); } catch (e) { return ""; } }
  function rerender() { VCACHE = {}; var y = window.scrollY; route(); window.scrollTo(0, y); }
  function rtServer(rec) {   /* 창고에서 받은 '폰에서 고친 루틴' (null = 없음) */
    var ok = rec && rec.routine && rec.base === RT_BASE ? rec : null;
    RT_STALE = rec && !ok ? rec : null;
    try { if (ok) localStorage.setItem(RT_LS, JSON.stringify(ok)); else localStorage.removeItem(RT_LS); } catch (e) {}
    if (JSON.stringify(ok) === JSON.stringify(RT_REC)) return;
    if (RT_EDIT) { var draft = M.routine; rtUse(ok); RT_EDIT.saved = M.routine; M.routine = draft; return; }
    rtUse(ok);
    if (view.getAttribute("data-tab") !== "body") rerender(); else litApply("body");
  }
  function bnServer(list) {   /* 창고에서 받은 전체 공지 */
    list = Array.isArray(list) ? list : [];
    if (JSON.stringify(list) === JSON.stringify(BN)) return;
    BN = list;
    try { localStorage.setItem("ptnote:bn", JSON.stringify(list)); } catch (e) {}
    nBuild(); nDot();
    var tb = view.getAttribute("data-tab");
    if (tb === "notice" || tb === "home") rerender();
    if (!DEMO && !document.querySelector(".npop-wrap")) showNoticePop();
  }
  function rtAt(rec) {   /* "11/10 14:32" */
    var m = String(rec && rec.at || "").match(/\d{4}-(\d{2})-(\d{2}) (\d{2}:\d{2})/);
    return m ? (+m[1]) + "/" + (+m[2]) + " " + m[3] : "";
  }
  function rtDirty() { if (RT_EDIT) RT_EDIT.dirty++; rerender(); }
  /* 유산소 고치기 (2026-11-12 트레이너 "유산소도 수정 가능하게") — 유산소 카드·STEP 03을 누르면 */
  function rtCardioSheet(dk) {
    var d = dk && dayByKey(dk), R = M.routine, C = R.cardio || { minutes: 15, options: "" };
    if (d && d.cardio_only) {
      rtSheet(dayName(dk) + " · 유산소만 하는 날",
        '<label>유산소 시간 <small>분</small><input id="cMin" inputmode="numeric" value="' + esc(d.cardio_only) + '"></label>' +
        '<label>종류·메모 <small>없어도 돼요</small><input id="cNote" maxlength="60" placeholder="예: 천국의 계단 · 사이클 중 택1" value="' + esc(d.note || "") + '" autocomplete="off"></label>',
        function (sh) {
          var m = sh.querySelector("#cMin").value.trim(); if (!/^\d+$/.test(m) || +m < 1) return "시간은 분 숫자로 넣어 주세요";
          d.cardio_only = +m; d.note = sh.querySelector("#cNote").value.trim(); if (!d.note) delete d.note; rtDirty();
        });
      return;
    }
    rtSheet("유산소 고치기",
      (d ? '<label class="rts-ck"><input type="checkbox" id="cOn"' + (d.cardio ? ' checked' : '') + '> ' + esc(dayName(dk)) + '에 마무리 유산소 하기</label>' : '') +
      '<label>유산소 시간 <small>분 · 유산소 하는 모든 요일에 같이 적용돼요</small><input id="cMin" inputmode="numeric" value="' + esc(C.minutes) + '"></label>' +
      '<label>종류 <small>예: 경사 걷기 · 천국의 계단 · 사이클 중 택1</small><input id="cOpt" maxlength="60" value="' + esc(C.options || "") + '" autocomplete="off"></label>' +
      '<p class="rts-l" style="margin:0"><small>시간을 비우면 모든 요일에서 유산소 줄이 없어져요</small></p>',
      function (sh) {
        var m = sh.querySelector("#cMin").value.trim();
        if (m && (!/^\d+$/.test(m) || +m < 1)) return "시간은 분 숫자로 넣어 주세요";
        R.cardio = m ? { minutes: +m, options: sh.querySelector("#cOpt").value.trim() } : null;
        var on = sh.querySelector("#cOn"); if (on && d) d.cardio = on.checked;
        rtDirty();
      });
  }
  function rtVerUp(v) { var m = String(v || "v0").match(/^(\D*)(\d+)(.*)$/); return m ? m[1] + (+m[2] + 1) + m[3] : "v2"; }
  function rtNewRoutine() {
    return { version: "v1", updated: rtToday(), title: "주간 루틴", plan: [], key_point: "", note: "",
      cardio: { minutes: 20, options: "경사 걷기 · 천국의 계단 · 사이클 중 택1" },
      days: ["월", "화", "수", "목", "금", "토", "일"].map(function (k) { return { day: k, part: "휴식", en: "Rest", rest: true, items: [] }; }) };
  }

  /* 루틴 탭 위 선생님 띠 */
  function rtTopBar() {
    if (!CAN_EDIT) return "";
    if (RT_EDIT) {   /* 2026-11-17 "글자가 잘리고 간섭" → 두 줄: 위 한 줄 안내, 아래 아이콘 칸 */
      var tool = function (k, t) { return '<button type="button" class="rtt" data-rt="' + k + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + RT_TIC[k] + '</svg><span>' + t + '</span></button>'; };
      return '<div class="rtbar2"><div class="rtb2-h"><b>✎ 고치는 중</b><span>카드를 꾹 눌러 끌면 순서·요일이 바뀌어요</span></div><div class="rtb2-t">' +
        tool("week", "요일 정리") + tool("info", "제목·계획") + tool("copy", "가져오기") + (RT_REC ? tool("reset", "처음으로") : '') + '</div></div>';
    }
    var st = RT_REC ? '폰에서 고친 루틴 · ' + rtAt(RT_REC) + ' 반영' : RT_STALE ? '새 루틴이 올라와서 예전에 폰에서 고친 것(' + rtAt(RT_STALE) + ')은 꺼졌어요' : '선생님 보기 · 고치면 회원님 노트에 바로 반영';
    return '<div class="rtbar"><div><b>선생님만 보여요</b><span>' + esc(st) + '</span></div>' +
      '<button type="button" class="rtb fill" data-rt="start">✎ 루틴 고치기</button></div>';
  }
  var RT_TIC = {"reset": "<path d=\"M4 12a8 8 0 1 0 2.4-5.7\"/><path d=\"M4 4v4.5h4.5\"/>", "week": "<rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15\" rx=\"2.5\"/><path d=\"M3.5 10h17M8 3v4M16 3v4\"/><path d=\"M8.5 15h7M13 13l2.5 2-2.5 2\"/>", "copy": "<rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2.5\"/><path d=\"M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8\"/>", "info": "<path d=\"M5 6h14M5 11h14M5 16h9\"/>"};
  function rtSaveBar() {
    if (!RT_EDIT) return "";
    return '<div class="rtsave"><div class="rtsave-in"><span>' + (RT_EDIT.dirty ? '고친 곳 <b>' + RT_EDIT.dirty + '</b>' : '아직 안 고침') + '</span>' +
      '<button type="button" class="rtb" data-rt="cancel">취소</button>' +
      '<button type="button" class="rtb fill" data-rt="save"' + (RT_EDIT.dirty ? '' : ' disabled') + '>저장 · 바로 반영</button></div></div>';
  }
  function rtItemCtl(i, n) {
    return '<span class="rtgrip" aria-hidden="true"><i></i><i></i><i></i></span><div class="rtctl"><button type="button" data-rt="item" data-i="' + i + '">✎ 고치기</button>' +
      '<button type="button" data-rt="more" data-i="' + i + '" aria-label="복제·다른 날로 옮기기">⋯ 더보기</button>' +
      '<button type="button" class="del" data-rt="del" data-i="' + i + '">삭제</button></div>';
  }

  /* 아래에서 올라오는 고치기 창 */
  function rtSheet(title, body, onOk, okText) {
    var bg = document.createElement("div");
    bg.className = "rtsheet-bg";
    bg.innerHTML = '<div class="rtsheet" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="rts-h"><b>' + esc(title) + '</b>' +
      '<button type="button" class="rts-x" data-close aria-label="닫기">×</button></div><div class="rts-body">' + body + '</div>' +
      '<p class="rts-msg" role="status"></p><div class="rts-foot' + (okText === false ? ' one' : '') + '"><button type="button" class="rtb" data-close>취소</button>' +
      (okText === false ? '' : '<button type="button" class="rtb fill" data-ok>' + esc(okText || "완료") + '</button>') + '</div></div>';
    document.body.appendChild(bg);
    document.documentElement.classList.add("rts-open");
    var sh = bg.firstChild;
    function close() { bg.remove(); if (!document.querySelector(".rtsheet-bg")) document.documentElement.classList.remove("rts-open"); }
    bg.addEventListener("click", function (e) {
      if (e.target === bg || e.target.closest("[data-close]")) close();
      else if (e.target.closest("[data-ok]")) {
        var msg = onOk(sh);
        if (msg === true) return;            /* 알아서 닫음(저장 중) */
        if (msg) { sh.querySelector(".rts-msg").textContent = msg; return; }
        close();
      }
    });
    sh.close = close;
    sh.msg = function (t) { sh.querySelector(".rts-msg").textContent = t; };
    return sh;
  }
  function fv(sh, id) { var el = sh.querySelector("#" + id); return el ? el.value.trim() : ""; }

  /* 종목 고치기 */
  function rtNames() {
    var o = {};
    Object.keys(ICON_BY_NAME).forEach(function (n) { o[n] = 1; });
    Object.keys(RT_EN).forEach(function (n) { o[n] = 1; });
    (M.routine.days || []).forEach(function (d) { (d.items || []).forEach(function (it) { if (it.name) o[it.name] = 1; }); });
    return Object.keys(o).sort(function (a, b) { return a.localeCompare(b, "ko"); });
  }

  /* 아이콘 눌러서 종목 고르기 (2026-11-11 "아이콘을 눌러서 추가하는 방식") — 도당점 종목 이름 그대로 */
  var RT_CAT = [
    ["가슴", ["벤치프레스", "플랫 덤벨프레스", "인클라인 덤벨 프레스", "스미스 벤치프레스", "스미스 인클라인 프레스", "인클라인 프레스 머신", "체스트 프레스 머신", "뉴텍 체스트 프레스 머신", "펙덱 플라이", "케이블 체스트 프레스", "랙 밴드 푸쉬업"]],
    ["등", ["랫풀다운", "와이드 풀다운", "클로즈그립 랫풀다운", "언더그립 랫풀다운", "어시스트 친업", "뉴텍 버티컬 풀다운", "뉴텍 시티드 로우 머신", "뉴텍 엠토처 시티드 로우", "케이블 시티드 로우", "언더그립 시티드 로우", "해머스트렝스 로우로우", "프론트 로우 머신", "티바로우 머신", "티바 로우", "원암 덤벨 로우", "스미스 벤트오버 로우", "스트레이트 암 풀다운", "케이블 풀오버", "덤벨 슈러그", "스미스 슈러그", "백 익스텐션"]],
    ["어깨", ["숄더 프레스 머신", "덤벨 숄더 프레스", "스미스 숄더 프레스", "사이드 레터럴 레이즈 머신", "사이드 레터럴 레이즈", "시티드 레터럴 레이즈", "시티드 페이스풀", "페이스풀", "리버스 펙덱"]],
    ["팔", ["덤벨 컬", "머신 암 컬", "해머 컬", "인클라인 덤벨 컬", "스파이더 컬", "프리처 컬 머신", "케이블 푸쉬다운", "오버헤드 익스텐션", "덤벨 오버헤드 익스텐션"]],
    ["하체", ["레그 익스텐션", "이너타이", "아웃타이 머신", "스탠딩 아웃타이", "플레이트 아웃타이", "레그프레스", "파워 레그프레스", "핵프레스", "핵스쿼트", "스미스 스쿼트", "고블릿 스쿼트", "라잉 레그컬", "덤벨 RDL"]],
    ["엉덩이", ["힙쓰러스트 머신", "몬스터 글루트", "케이블 힙 킥백", "힙 익스텐션"]],
    ["복근", ["플랭크"]]
  ];
  var RT_CAT_EN = { "몬스터 글루트": "Monster Glute", "파워 레그프레스": "Power Leg Press", "스탠딩 아웃타이": "Standing Hip Abduction", "머신 암 컬": "Machine Arm Curl", "티바 로우": "T-Bar Row", "스미스 벤트오버 로우": "Smith Bent-over Row", "뉴텍 버티컬 풀다운": "Vertical Pulldown", "시티드 레터럴 레이즈": "Seated Lateral Raise", "백 익스텐션": "Back Extension", "스미스 벤치프레스": "Smith Bench Press" };
  function rtEnOf(n) { return RT_EN[n] || RT_CAT_EN[n] || ""; }
  function rtMine() {   /* 이 회원님 루틴에 이미 있는 종목 (이름별 첫 번째) */
    var seen = {}, out = [];
    ((M.routine && M.routine.days) || []).forEach(function (d) { (d.items || []).forEach(function (it) { if (it.name && !seen[it.name]) { seen[it.name] = 1; out.push(it); } }); });
    return out;
  }
  function rtPicker(title, onPick, allowFree) {
    var mine = rtMine(), mineBy = {};
    mine.forEach(function (it) { mineBy[it.name] = it; });
    function tile(n) {
      return '<button type="button" class="rtp-t" data-n="' + esc(n) + '"><span class="rtp-ic">' + img(iconOf({ name: n }), "", true) + '</span><span class="rtp-n">' + esc(n) + '</span></button>';
    }
    var chips = [["", "전체"]].concat(mine.length ? [["mine", "이 회원님"]] : []).concat(RT_CAT.map(function (c) { return [c[0], c[0]]; }));
    var body = '<input class="rtp-q" type="search" placeholder="이름으로 찾기 (예: 로우, 레터럴)" aria-label="종목 이름으로 찾기">' +
      '<div class="rts-chips rtp-f">' + chips.map(function (c, i) { return '<button type="button" data-g="' + c[0] + '" aria-pressed="' + (i === 0) + '">' + c[1] + '</button>'; }).join("") + '</div>' +
      '<div class="rtp-list">' +
      (mine.length ? '<div class="rtp-sec" data-g="mine"><h4>이 회원님 루틴에 있는 종목</h4><div class="rtp-grid">' + mine.map(function (it) { return tile(it.name); }).join("") + '</div></div>' : '') +
      RT_CAT.map(function (c) { return '<div class="rtp-sec" data-g="' + c[0] + '"><h4>' + c[0] + '</h4><div class="rtp-grid">' + c[1].map(tile).join("") + '</div></div>'; }).join("") +
      '<p class="rtp-none" hidden>찾는 종목이 없어요. 아래 "직접 입력"으로 넣어 주세요</p></div>' +
      (allowFree ? '<button type="button" class="rtadd rtp-free">✎ 목록에 없는 종목 직접 입력</button>' : '');
    var sh = rtSheet(title, body, null, false);
    sh.classList.add("rtp");
    var q = sh.querySelector(".rtp-q"), g = "";
    function filt() {
      var k = fnorm(q.value), any = false;
      Array.prototype.forEach.call(sh.querySelectorAll(".rtp-sec"), function (sec) {
        var gs = sec.getAttribute("data-g"), vis = 0;
        var secOn = k ? gs !== "mine" : (!g || g === gs);
        Array.prototype.forEach.call(sec.querySelectorAll(".rtp-t"), function (t) {
          var on = secOn && (!k || fnorm(t.getAttribute("data-n")).indexOf(k) >= 0);
          t.hidden = !on; if (on) vis++;
        });
        sec.hidden = !vis; if (vis) any = true;
      });
      sh.querySelector(".rtp-none").hidden = any;
    }
    q.addEventListener("input", function () {   /* 찾을 땐 전체에서 */
      if (q.value && g) { g = ""; Array.prototype.forEach.call(sh.querySelectorAll(".rtp-f button"), function (o, j) { o.setAttribute("aria-pressed", String(!j)); }); }
      filt();
    });
    sh.querySelector(".rtp-f").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      g = b.getAttribute("data-g"); q.value = "";
      Array.prototype.forEach.call(this.children, function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      filt(); sh.querySelector(".rtp-list").scrollTop = 0;
    });
    sh.querySelector(".rtp-list").addEventListener("click", function (e) {
      var t = e.target.closest(".rtp-t"); if (!t) return;
      var n = t.getAttribute("data-n"), src = mineBy[n];
      sh.close();
      onPick({ name: n, en: (src && src.en) || rtEnOf(n), tip: src ? src.tip || "" : "", sets: src ? clone(src.sets) : null });
    });
    var fr = sh.querySelector(".rtp-free");
    if (fr) fr.addEventListener("click", function () { sh.close(); onPick(null); });
  }
  /* 세트 빠르게 넣기 (2026-11-11 "피라미드 3세트 4세트 5세트 다양하게") */
  var RT_PRESETS = {
    pyr: [
      { label: "3세트", reps: [12, 10, 8] },
      { label: "4세트", reps: [15, 12, 10, 8] },
      { label: "5세트", reps: [15, 12, 10, 8, 6] },
      { label: "5세트 고반복", reps: [20, 15, 12, 10, 8] }
    ],
    flat: [
      { label: "15회×3", reps: [15, 15, 15] },
      { label: "12회×3", reps: [12, 12, 12] },
      { label: "12회×4", reps: [12, 12, 12, 12] },
      { label: "10회×4", reps: [10, 10, 10, 10] },
      { label: "10회×5", reps: [10, 10, 10, 10, 10] },
      { label: "20회×3", reps: [20, 20, 20] }
    ]
  };
  function rtItemSheet(dk, i, pre) {
    var d = dayByKey(dk), isNew = i < 0;
    var it = isNew ? { name: pre ? pre.name : "", en: pre ? pre.en : "", tip: pre ? pre.tip : "", sets: pre && pre.sets && pre.sets.length ? pre.sets : [[15, null], [12, null], [10, null]] } : clone(d.items[i]);
    var sets = (it.sets || []).map(function (s) { return [s[0], s[1]]; });
    var body = '<div class="rts-name"><button type="button" class="rts-ic" id="fIc" aria-label="그림 눌러서 종목 바꾸기">' + img(iconOf(it), "", true) + '<i>바꾸기</i></button>' +
      '<label>종목 이름<input id="fName" list="rtNames" autocomplete="off" value="' + esc(it.name) + '" placeholder="예: 랫풀다운"></label></div>' +
      '<datalist id="rtNames">' + rtNames().map(function (n) { return '<option value="' + esc(n) + '">'; }).join("") + '</datalist>' +
      '<p class="rts-hint" id="fIcHint"></p>' +
      '<label>영어 이름 <small>제목 아래 작은 글자</small><input id="fEn" value="' + esc(it.en) + '"></label>' +
      '<div class="rts-l">구분</div><div class="rts-chips" id="fTag">' + [["", "없음"], ["워밍업", "워밍업"], ["선행", "선행"], ["메인", "메인 (금색)"]].map(function (t) {
        return '<button type="button" data-v="' + t[0] + '" aria-pressed="' + ((it.tag || "") === t[0]) + '">' + t[1] + '</button>';
      }).join("") + '</div>' +
      '<label>팁<textarea id="fTip" rows="3">' + esc(it.tip) + '</textarea></label>' +
      '<div class="rts-l">세트 <small>횟수에 "30초"처럼 글자도 돼요 · 무게를 비우면 맨몸</small></div><div class="rts-sets" id="fSets"></div>' +
      '<div class="rts-row"><button type="button" class="rtb" id="fAdd">+ 세트 추가</button></div>' +
      '<div class="rts-pre" id="fPre"><div class="rts-l">빠르게 넣기 <small>누르면 세트가 이 모양으로 바뀌어요</small></div>' +
      '<div class="rts-pg"><b>피라미드</b>' + RT_PRESETS.pyr.map(function (p, j) { return '<button type="button" data-p="pyr" data-j="' + j + '">' + p.label + '<small>' + p.reps.join("·") + '</small></button>'; }).join("") + '</div>' +
      '<div class="rts-pg"><b>같은 횟수</b>' + RT_PRESETS.flat.map(function (p, j) { return '<button type="button" data-p="flat" data-j="' + j + '">' + p.label + '<small>' + p.reps.length + '세트</small></button>'; }).join("") + '</div>' +
      '<div class="rts-pg"><b>무게</b><span class="rts-seg" id="fStep">' + [[0, "그대로"], [2, "+2kg씩"], [2.5, "+2.5kg씩"], [5, "+5kg씩"]].map(function (st, j) {
        return '<button type="button" data-s="' + st[0] + '" aria-pressed="' + (j === 0) + '">' + st[1] + '</button>'; }).join("") + '</span></div>' +
      '<p class="rts-hint2">무게는 1세트 칸 기준 — "+5kg씩"이면 세트마다 5kg 올라가요 (피라미드는 횟수가 줄 때 무게를 올리는 방식)</p></div>' +
      (M.forms && M.forms.length ? '<label>자세 복습지 연결 <small>자동 = 이름이 같은 복습지가 올라오면 알아서 붙음</small><select id="fForm"><option value="">자동</option><option value="-"' + (it.form === "-" ? ' selected' : '') + '>연결 안 함</option>' + M.forms.map(function (f) {
        return '<option value="' + esc(f.id) + '"' + (it.form === f.id ? ' selected' : '') + '>' + esc(f.exercise) + ' (' + esc(f.date) + ')</option>';
      }).join("") + '</select></label>' : '');
    var sh = rtSheet(isNew ? dayName(dk) + " · 새 종목 넣기" : "종목 고치기", body, function (sh) {
      readSets();
      var name = fv(sh, "fName");
      if (!name) return "종목 이름을 넣어 주세요";
      if (!sets.length) return "세트를 하나 이상 넣어 주세요";
      for (var k = 0; k < sets.length; k++) if (sets[k][0] === "" || sets[k][0] == null) return (k + 1) + "세트 횟수를 넣어 주세요";
      var out = { name: name, en: fv(sh, "fEn") };
      var tag = sh.querySelector('#fTag [aria-pressed="true"]'); tag = tag ? tag.getAttribute("data-v") : "";
      if (tag) out.tag = tag;
      out.tip = fv(sh, "fTip");
      out.sets = sets;
      var fm = fv(sh, "fForm"); if (fm) out.form = fm;
      if (it.icon && name === it.name) out.icon = it.icon;   /* data.js에서 따로 정한 그림은 이름이 그대로면 유지 */
      if (isNew) d.items.push(out); else d.items[i] = out;
      rtDirty();
    });
    var box = sh.querySelector("#fSets");
    function readSets() {
      sets = Array.prototype.map.call(box.querySelectorAll(".rts-set"), function (row) {
        var r = row.querySelector(".r").value.trim(), k = row.querySelector(".k").value.trim().replace(",", ".");
        return [/^\d+$/.test(r) ? +r : r, k === "" || isNaN(+k) ? null : +k];
      });
    }
    function drawSets() {
      box.innerHTML = sets.map(function (s, j) {
        return '<div class="rts-set"><small>' + (j + 1) + '세트</small><input class="r" inputmode="numeric" value="' + esc(s[0]) + '" aria-label="' + (j + 1) + '세트 횟수"><i>회</i>' +
          '<input class="k" inputmode="decimal" value="' + (s[1] == null ? "" : esc(s[1])) + '" placeholder="맨몸" aria-label="' + (j + 1) + '세트 무게"><i>kg</i>' +
          '<button type="button" class="x" data-j="' + j + '" aria-label="' + (j + 1) + '세트 빼기"' + (sets.length > 1 ? '' : ' disabled') + '>×</button></div>';
      }).join("");
    }
    drawSets();
    box.addEventListener("click", function (e) {
      var x = e.target.closest(".x"); if (!x) return;
      readSets(); sets.splice(+x.getAttribute("data-j"), 1); drawSets();
    });
    sh.querySelector("#fAdd").addEventListener("click", function () {
      readSets(); var last = sets[sets.length - 1] || [12, null]; sets.push([last[0], last[1]]); drawSets();
    });
    var step = 0;
    sh.querySelector("#fStep").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      step = +b.getAttribute("data-s");
      Array.prototype.forEach.call(this.children, function (o) { o.setAttribute("aria-pressed", String(o === b)); });
    });
    sh.querySelector("#fPre").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-p]"); if (!b) return;
      readSets();
      var reps = RT_PRESETS[b.getAttribute("data-p")][+b.getAttribute("data-j")].reps;
      var k0 = sets.length ? sets[0][1] : null;
      sets = reps.map(function (r, j) {
        var k = k0 == null ? null : step ? Math.round((k0 + step * j) * 10) / 10 : (sets[j] && sets[j][1] != null ? sets[j][1] : k0);
        return [r, k];
      });
      drawSets();
      Array.prototype.forEach.call(sh.querySelectorAll("#fPre button[data-p]"), function (o) { o.classList.toggle("on", o === b); });
    });
    sh.querySelector("#fTag").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      Array.prototype.forEach.call(this.children, function (o) { o.setAttribute("aria-pressed", String(o === b)); });
    });
    var nm = sh.querySelector("#fName"), en = sh.querySelector("#fEn"), hint = sh.querySelector("#fIcHint");
    function onName() {
      var n = nm.value.trim(), k = iconOf({ name: n, icon: n === it.name ? it.icon : null });
      sh.querySelector("#fIc").innerHTML = img(k, "", true) + '<i>바꾸기</i>';
      hint.textContent = n && k === "dumbbell" ? "이 이름은 운동 그림이 없어서 덤벨 그림으로 나와요" : "";
      if (n && RT_EN[n] && (!en.value.trim() || en.getAttribute("data-auto"))) { en.value = RT_EN[n]; en.setAttribute("data-auto", "1"); }
    }
    nm.addEventListener("input", onName);
    en.addEventListener("input", function () { en.removeAttribute("data-auto"); });
    sh.querySelector("#fIc").addEventListener("click", function () {
      rtPicker("종목 바꾸기", function (e) {
        if (!e) { nm.focus(); return; }
        nm.value = e.name; en.value = e.en; en.setAttribute("data-auto", "1"); onName();
      }, false);
    });
    onName();
    if (isNew && !it.name) setTimeout(function () { nm.focus(); }, 50);
  }

  /* 이날 정보 (부위 이름 · 유산소 · 쉬는 날) */
  function rtDaySheet(dk) {
    var d = dayByKey(dk), R = M.routine, plain = !d.pick && !d.cardio_only;
    var body = '<label>부위 이름<input id="dPart" value="' + esc(d.part) + '" placeholder="예: 등 · 팔"></label>' +
      '<label>영어 <small>오른쪽 작은 글자</small><input id="dEn" value="' + esc(d.en) + '"></label>' +
      (plain ? '<label class="rts-ck"><input type="checkbox" id="dCardio"' + (d.cardio ? ' checked' : '') + '> 마무리 유산소' +
        (R.cardio ? ' ' + R.cardio.minutes + '분' : ' (유산소는 제목·계획 고치기에서 정해요)') + '</label>' : '') +
      (d.items && d.items.length ? '<div class="rts-pre"><span class="rts-l">이날 전체 한 번에 <small>누르면 바로 바뀌어요</small></span>' +
        '<div class="rts-seg" id="dBulk"><button type="button" data-kg="-5">−5kg</button><button type="button" data-kg="-2.5">−2.5kg</button><button type="button" data-kg="2.5">+2.5kg</button><button type="button" data-kg="5">+5kg</button>' +
        '<button type="button" data-set="-1">세트 −1</button><button type="button" data-set="1">세트 +1</button></div></div>' : '') +
      '<button type="button" class="rtb" id="dWeek" style="width:100%">다른 날과 바꾸기 · 복사</button>' +
      (!ROT && !d.rest ? '<button type="button" class="rtb warn" id="dRest">이날을 쉬는 날로 바꾸기</button>' : '');
    var sh = rtSheet(dayName(dk) + " 정보", body, function (sh) {
      var part = fv(sh, "dPart");
      if (!part) return "부위 이름을 넣어 주세요";
      d.part = part; d.en = fv(sh, "dEn");
      var c = sh.querySelector("#dCardio"); if (c) d.cardio = c.checked;
      rtDirty();
    });
    var bk = sh.querySelector("#dBulk");
    if (bk) bk.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var kg = parseFloat(b.getAttribute("data-kg")), st = parseInt(b.getAttribute("data-set"), 10), n = 0;
      d.items.forEach(function (it) {
        if (!it.sets || !it.sets.length) return;
        if (kg) it.sets.forEach(function (x) { var v = parseFloat(x[1]); if (isFinite(v) && v > 0) { x[1] = Math.max(0, Math.round((v + kg) * 2) / 2); n++; } });
        else if (st > 0 && it.sets.length < 8) { it.sets.push(it.sets[it.sets.length - 1].slice()); n++; }
        else if (st < 0 && it.sets.length > 1) { it.sets.pop(); n++; }
      });
      if (!n) { sh.msg("바꿀 수 있는 세트가 없어요"); return; }
      rtDirty();
      sh.msg(kg ? "무게가 적힌 세트 " + n + "개를 " + (kg > 0 ? "+" : "−") + Math.abs(kg) + "kg 했어요" : n + "종목을 세트 " + (st > 0 ? "+1" : "−1") + " 했어요");
    });
    sh.querySelector("#dWeek").addEventListener("click", function () { sh.close(); rtWeekSheet(d); });
    var rb = sh.querySelector("#dRest");
    if (rb) rb.addEventListener("click", function () {
      if (!rb.classList.contains("sure")) { rb.classList.add("sure"); rb.textContent = "한 번 더 누르면 쉬는 날이 돼요 (종목도 지워져요)"; return; }
      d.rest = true; d.items = []; d.part = "휴식"; d.en = "Rest"; delete d.pick; delete d.cardio_only; d.cardio = false;
      sh.close(); rtDirty();
    });
    var pe = sh.querySelector("#dPart"), ee = sh.querySelector("#dEn");
    pe.addEventListener("input", function () { var p = pe.value.trim(); if (RT_PART_EN[p] && (!ee.value.trim() || ee.getAttribute("data-auto"))) { ee.value = RT_PART_EN[p]; ee.setAttribute("data-auto", "1"); } });
    ee.addEventListener("input", function () { ee.removeAttribute("data-auto"); });
  }
  function rtMakeWorkDay(dk) {
    var d = dayByKey(dk);
    if (!d) {
      d = { day: DAY_KO[dk], part: "", en: "", cardio: true, items: [] };
      M.routine.days.push(d);
      var ord = ["월", "화", "수", "목", "금", "토", "일"];
      M.routine.days.sort(function (a, b) { return ord.indexOf(a.day) - ord.indexOf(b.day); });
    }
    d.rest = false; delete d.rest; d.part = d.part === "휴식" ? "" : d.part; d.en = d.en === "Rest" ? "" : d.en; d.items = d.items || [];
    if (d.cardio == null) d.cardio = true;
    rtDirty();
    rtDaySheet(dk);
  }

  /* ---- 2026-11-17 장동욱 "루틴 항목 바꾸는 옵션 다양화(월↔목 요일 바꾸기 등), 세팅하기 편하게"
     요일 정리 창(rtWeekSheet: 두 날 서로 바꾸기 / 한 날을 다른 날에 복사) · 종목 ⋯ 창(rtMoreSheet: 복제·맨 위/아래·다른 날로 옮기기/복사) · 이날 정보 창의 무게·세트 한 번에(#dBulk) */
  function rtDayList() {   /* [{label, d}] — 요일 루틴은 월~일 7칸(없는 날 d=null), 순환 루틴은 DAY 1~N */
    var D = M.routine.days || [];
    if (ROT) return D.map(function (d, i) { return { label: "DAY " + (i + 1), d: d }; });
    return ["월", "화", "수", "목", "금", "토", "일"].map(function (k) { return { label: k + "요일", ko: k, d: D.filter(function (x) { return x.day === k; })[0] || null }; });
  }
  function rtDayEnsure(x) {
    if (x.d) return x.d;
    var d = { day: x.ko, part: "휴식", en: "Rest", rest: true, items: [] }, ord = ["월", "화", "수", "목", "금", "토", "일"];
    M.routine.days.push(d); M.routine.days.sort(function (a, b) { return ord.indexOf(a.day) - ord.indexOf(b.day); });
    return (x.d = d);
  }
  function rtDayBody(d) { var o = {}; for (var k in d) if (k !== "day") o[k] = clone(d[k]); return o; }
  function rtDayPut(d, body) { var k; for (k in d) if (k !== "day") delete d[k]; for (k in body) d[k] = clone(body[k]); }
  function rtDayLine(d) { return !d || d.rest ? "쉬는 날" : (d.part || "이름 없음") + " · " + ((d.items || []).length) + "종목"; }
  function rtWeekSheet(pre) {
    var mode = "swap", sel = -1, sure = -1;
    var sh = rtSheet("요일 정리", '<div class="rts-seg" id="wMode"><button type="button" data-m="swap" aria-pressed="true">서로 바꾸기</button><button type="button" data-m="copy" aria-pressed="false">복사하기</button></div>' +
      '<p class="rtw-tip" id="wTip"></p><div class="rtw-list" id="wList"></div>', function () {}, false);
    sh.querySelector(".rts-foot [data-close]").textContent = "닫기";
    function draw() {
      var L = rtDayList();
      sh.querySelector("#wTip").textContent = mode === "swap" ? (sel < 0 ? "바꿀 두 날을 차례로 눌러 주세요" : L[sel].label + "과 바꿀 날을 눌러 주세요") : (sel < 0 ? "복사할 날을 먼저 눌러 주세요" : L[sel].label + " 운동을 붙여 넣을 날을 눌러 주세요 (그날 내용은 덮어써요)");
      sh.querySelector("#wList").innerHTML = L.map(function (x, i) {
        return '<button type="button" class="rtw' + (i === sel ? ' on' : '') + (i === sure ? ' sure' : '') + (!x.d || x.d.rest ? ' rest' : '') + '" data-i="' + i + '"><b>' + x.label + '</b><span>' + esc(i === sure ? "한 번 더 누르면 덮어써요" : rtDayLine(x.d)) + '</span>' +
          (i === sel ? '<em>' + (mode === "swap" ? "선택" : "복사할 날") + '</em>' : '') + '</button>';
      }).join("");
    }
    if (pre) rtDayList().forEach(function (x, i) { if (x.d === pre) sel = i; });
    draw();
    sh.querySelector("#wMode").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      mode = b.getAttribute("data-m"); sure = -1;
      Array.prototype.forEach.call(sh.querySelectorAll("#wMode button"), function (x) { x.setAttribute("aria-pressed", x === b); });
      draw(); sh.msg("");
    });
    sh.querySelector("#wList").addEventListener("click", function (e) {
      var b = e.target.closest(".rtw"); if (!b) return;
      var i = +b.getAttribute("data-i"), L = rtDayList();
      if (sel < 0) { if (mode === "copy" && (!L[i].d || L[i].d.rest)) { sh.msg("쉬는 날은 복사할 게 없어요"); return; } sel = i; sure = -1; sh.msg(""); draw(); return; }
      if (i === sel) { sel = -1; sure = -1; draw(); return; }
      var A = L[sel], B = L[i];
      if (mode === "swap") {
        if ((!A.d || A.d.rest) && (!B.d || B.d.rest)) { sh.msg("둘 다 쉬는 날이에요"); sel = -1; draw(); return; }
        var a = rtDayEnsure(A), b2 = rtDayEnsure(B), t = rtDayBody(a);
        rtDayPut(a, rtDayBody(b2)); rtDayPut(b2, t);
        rtDirty(); sh.msg(A.label + " ↔ " + B.label + " 바꿨어요"); sel = -1; draw(); return;
      }
      if (B.d && !B.d.rest && (B.d.items || []).length && sure !== i) { sure = i; draw(); return; }
      rtDayPut(rtDayEnsure(B), rtDayBody(A.d));
      rtDirty(); sh.msg(A.label + " 운동을 " + B.label + "에 복사했어요"); sel = -1; sure = -1; draw();
    });
  }
  function rtMoreSheet(dk, i) {
    var d = dayByKey(dk), it = d.items[i], mode = "move";
    var L = rtDayList().filter(function (x) { return x.d !== d; });
    var sh = rtSheet(it.name, '<span class="rts-l">이날 안에서</span><div class="rts-seg" id="mIn"><button type="button" data-a="dup">복제</button>' +
      '<button type="button" data-a="top"' + (i ? '' : ' disabled') + '>맨 위로</button><button type="button" data-a="end"' + (i < d.items.length - 1 ? '' : ' disabled') + '>맨 아래로</button></div>' +
      '<span class="rts-l">다른 날로</span><div class="rts-seg" id="mMode"><button type="button" data-m="move" aria-pressed="true">옮기기</button><button type="button" data-m="copy" aria-pressed="false">복사하기</button></div>' +
      '<div class="rtw-list" id="mList">' + L.map(function (x, k) { return '<button type="button" class="rtw' + (!x.d || x.d.rest ? ' rest' : '') + '" data-i="' + k + '"><b>' + x.label + '</b><span>' + esc(rtDayLine(x.d)) + '</span></button>'; }).join("") + '</div>', function () {}, false);
    sh.querySelector(".rts-foot [data-close]").textContent = "닫기";
    sh.querySelector("#mIn").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || b.disabled) return;
      var a = b.getAttribute("data-a");
      if (a === "dup") d.items.splice(i + 1, 0, clone(it));
      else { d.items.splice(i, 1); if (a === "top") d.items.unshift(it); else d.items.push(it); }
      sh.close(); rtDirty();
    });
    sh.querySelector("#mMode").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      mode = b.getAttribute("data-m");
      Array.prototype.forEach.call(sh.querySelectorAll("#mMode button"), function (x) { x.setAttribute("aria-pressed", x === b); });
    });
    sh.querySelector("#mList").addEventListener("click", function (e) {
      var b = e.target.closest(".rtw"); if (!b) return;
      var x = L[+b.getAttribute("data-i")], t = rtDayEnsure(x);
      if (t.rest) { delete t.rest; t.part = d.part; t.en = d.en; t.items = []; if (t.cardio == null) t.cardio = true; }
      t.items = t.items || []; t.items.push(clone(it));
      if (mode === "move") d.items.splice(i, 1);
      sh.close(); rtDirty();
      attToast(it.name + " → " + x.label + (mode === "move" ? "로 옮겼어요" : "에 복사했어요"));
    });
  }

  /* ---- 꾹 눌러 끌기 (2026-11-17 장동욱 "종목을 꾹 누르면 끌고 와서 손을 떼면 버튼 안 눌러도 이동")
     종목 카드(.rtdr) 꾹 0.35초 → 떠오름 → 끌어서 순서 바꾸기 / 위 요일 칸에 놓으면 그날로 옮김
     요일 칸(.rtdk) 꾹 → 다른 요일 칸에 놓으면 두 날을 서로 바꿈. 떠다니는 복사본은 body에 붙임(.view엔 transform 안 씀) */
  var RT_DRAG = null, rtDragEnd = 0;
  function rtListByKey(k) { var L = rtDayList(); return L[ROT ? +k.slice(1) - 1 : ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].indexOf(k)] || null; }
  function rtDragDown(e) {
    if (!RT_EDIT || RT_DRAG || (e.button && e.button !== 0) || e.target.closest("button, input, .rtsheet")) return;
    var el = e.target.closest(".ex.rtdr, .day-tile.rtdk"); if (!el) return;
    var x0 = e.clientX, y0 = e.clientY, tm, pid = e.pointerId;
    function off() { clearTimeout(tm); document.removeEventListener("pointermove", mv0); document.removeEventListener("pointerup", off); document.removeEventListener("pointercancel", off); }
    function mv0(ev) { if (ev.pointerId === pid && Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) > 10) off(); }
    document.addEventListener("pointermove", mv0); document.addEventListener("pointerup", off); document.addEventListener("pointercancel", off);
    el.classList.add("rt-press");
    tm = setTimeout(function () { off(); el.classList.remove("rt-press"); rtDragStart(el, x0, y0, pid); }, 350);
    setTimeout(function () { el.classList.remove("rt-press"); }, 360);
  }
  function rtDragStart(el, x, y, pid) {
    var r = el.getBoundingClientRect(), fly = el.cloneNode(true), item = el.classList.contains("ex");
    fly.className += " rt-fly"; fly.removeAttribute("href");
    fly.style.cssText = "width:" + r.width + "px;height:" + r.height + "px;left:" + r.left + "px;top:" + r.top + "px";
    document.body.appendChild(fly);
    el.classList.add("rt-hold");
    document.documentElement.classList.add("rt-dragging");
    try { navigator.vibrate && navigator.vibrate(12); } catch (er) {}
    fly.style.transformOrigin = (x - r.left) + "px " + (y - r.top) + "px";
    RT_DRAG = { el: el, fly: fly, item: item, dx: x - r.left, dy: y - r.top, x: x, y: y, over: null, raf: 0 };
    function move(ev) { if (ev.pointerId !== pid) return; RT_DRAG.x = ev.clientX; RT_DRAG.y = ev.clientY; rtDragMove(); }
    function up(ev) { if (ev.pointerId !== pid) return; document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); document.removeEventListener("pointercancel", up); rtDragDrop(ev.type === "pointercancel"); }
    document.addEventListener("pointermove", move); document.addEventListener("pointerup", up); document.addEventListener("pointercancel", up);
    (function scroll() {   /* 화면 위·아래 끝에 가면 저절로 스크롤 */
      if (!RT_DRAG) return;
      var H = window.innerHeight, v = RT_DRAG.y < 110 ? -(110 - RT_DRAG.y) / 6 : RT_DRAG.y > H - 170 ? (RT_DRAG.y - (H - 170)) / 6 : 0;
      if (v) { window.scrollBy(0, v); rtDragMove(); }
      RT_DRAG.raf = requestAnimationFrame(scroll);
    })();
  }
  function rtDragMove() {
    var D = RT_DRAG; if (!D) return;
    D.fly.style.left = (D.x - D.dx) + "px"; D.fly.style.top = (D.y - D.dy) + "px";
    var hit = document.elementFromPoint(D.x, D.y), tile = hit && hit.closest(".day-tile.rtdk");
    if (tile === D.el || (tile && D.item && tile.getAttribute("data-dk") === view.getAttribute("data-day"))) tile = null;
    if (D.over !== tile) { if (D.over) D.over.classList.remove("rt-drop"); if (tile) tile.classList.add("rt-drop"); D.over = tile; }
    D.fly.classList.toggle("to-day", !!tile);
    if (!D.item || tile) return;
    var sibs = Array.prototype.filter.call(D.el.parentNode.children, function (c) { return c !== D.el && c.classList.contains("rtdr"); });
    if (!sibs.length) return;
    var before = null;
    for (var i = 0; i < sibs.length; i++) { var rr = sibs[i].getBoundingClientRect(); if (D.y < rr.top + rr.height / 2) { before = sibs[i]; break; } }
    if (before) { if (D.el.nextElementSibling !== before) D.el.parentNode.insertBefore(D.el, before); }
    else { var last = sibs[sibs.length - 1]; if (last.nextElementSibling !== D.el) last.parentNode.insertBefore(D.el, last.nextElementSibling); }
  }
  function rtDragDrop(cancel) {
    var D = RT_DRAG; if (!D) return;
    cancelAnimationFrame(D.raf); RT_DRAG = null; rtDragEnd = Date.now();
    D.fly.remove(); D.el.classList.remove("rt-hold"); document.documentElement.classList.remove("rt-dragging");
    if (D.over) D.over.classList.remove("rt-drop");
    if (cancel) { rerender(); return; }
    var sk = view.getAttribute("data-day"), src = rtListByKey(sk);
    if (D.item) {
      var i = +D.el.getAttribute("data-di"), sd = src && src.d; if (!sd) return;
      if (D.over) {   /* 다른 요일 칸에 놓음 → 그날로 옮기기 */
        var tx = rtListByKey(D.over.getAttribute("data-dk")); if (!tx) return;
        var t = rtDayEnsure(tx), it = sd.items[i];
        if (t.rest) { delete t.rest; t.part = sd.part; t.en = sd.en; t.items = []; if (t.cardio == null) t.cardio = true; }
        t.items = t.items || []; t.items.push(it); sd.items.splice(i, 1);
        rtDirty(); attToast(it.name + " → " + tx.label + "로 옮겼어요");
        return;
      }
      var ord = Array.prototype.map.call(D.el.parentNode.querySelectorAll(".rtdr"), function (c) { return +c.getAttribute("data-di"); });
      if (ord.every(function (v, k) { return v === k; })) return;
      var old = sd.items.slice(); sd.items = ord.map(function (k) { return old[k]; });
      rtDirty();
      return;
    }
    if (!D.over) return;   /* 요일 칸끼리 → 서로 바꾸기 */
    var A = rtListByKey(D.el.getAttribute("data-dk")), B = rtListByKey(D.over.getAttribute("data-dk"));
    if (!A || !B || ((!A.d || A.d.rest) && (!B.d || B.d.rest))) return;
    var a = rtDayEnsure(A), b = rtDayEnsure(B), tmp = rtDayBody(a);
    rtDayPut(a, rtDayBody(b)); rtDayPut(b, tmp);
    rtDirty(); attToast(A.label + " ↔ " + B.label + " 바꿨어요");
  }

  /* 제목·계획·KEY POINT·메모·유산소 */
  function rtInfoSheet() {
    var R = M.routine, C = R.cardio;
    var body = '<label>루틴 제목<input id="iTitle" value="' + esc(R.title) + '"></label>' +
      '<label>KEY POINT<textarea id="iKey" rows="2">' + esc(R.key_point) + '</textarea></label>' +
      '<label>이번 주 계획 <small>한 줄에 하나씩</small><textarea id="iPlan" rows="3">' + esc((R.plan || []).join("\n")) + '</textarea></label>' +
      '<label>종목 아래 메모 <small>비우면 안 보여요</small><textarea id="iNote" rows="2">' + esc(R.note) + '</textarea></label>' +
      '<div class="rts-l">마무리 유산소 <small>분을 비우면 유산소 줄이 안 나와요</small></div>' +
      '<div class="rts-two"><label>분<input id="iCm" inputmode="numeric" value="' + (C ? esc(C.minutes) : "") + '"></label>' +
      '<label>종류<input id="iCo" value="' + (C ? esc(C.options) : "") + '" placeholder="경사 걷기 · 사이클 중 택1"></label></div>';
    rtSheet("제목·계획 고치기", body, function (sh) {
      var t = fv(sh, "iTitle"); if (!t) return "루틴 제목을 넣어 주세요";
      R.title = t; R.key_point = fv(sh, "iKey");
      R.plan = fv(sh, "iPlan").split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
      R.note = fv(sh, "iNote");
      var cm = fv(sh, "iCm");
      if (cm && !/^\d+$/.test(cm)) return "유산소 분은 숫자로 넣어 주세요";
      R.cardio = cm ? { minutes: +cm, options: fv(sh, "iCo") } : null;
      rtDirty();
    });
  }


  /* 다른 회원 루틴 가져오기 (2026-11-11 "루틴 복사해서 시작") — 선생님 페이지 members.js 회원들의 data.js(+폰에서 고친 루틴)에서 골라 통째로 복사.
     복습지 연결(form)은 그 회원 것이라 빼고, 순환 루틴끼리 / 요일 루틴끼리만 */
  function rtDaySummary(R) {
    return (R.days || []).filter(function (d) { return !d.rest; }).map(function (d) { return (ROT ? d.day.replace("DAY ", "D") : d.day) + " " + d.part; }).join(" · ");
  }
  function rtLoadOthers() {
    var cp = ""; try { cp = localStorage.getItem("ptcoach") || ""; } catch (e) {}
    if (!/^\/coach-[a-z0-9]+\/$/.test(cp)) return Promise.reject(new Error("coach"));
    return fetch(cp + "members.js", { cache: "no-store" }).then(function (r) { return r.text(); }).then(function (t) {
      var w = {}; new Function("window", t)(w);
      var list = (w.COACH_MEMBERS || []).filter(function (sl) { return sl !== SLUG; });
      return Promise.all(list.map(function (sl) {
        return fetch("/m/" + sl + "/data.js", { cache: "no-store" }).then(function (r) { return r.text(); }).then(function (t2) {
          var w2 = {}; new Function("window", t2)(w2);
          var O = w2.MEMBER; if (!O || !O.routine) return null;
          var base = rtBase(O.routine);
          return (ATT_API ? fetch(ATT_API + "?m=" + encodeURIComponent(sl)).then(function (r) { return r.json(); }).catch(function () { return null; }) : Promise.resolve(null)).then(function (j) {
            var R = j && j.routine && j.routine.routine && j.routine.base === base ? j.routine.routine : O.routine;
            return { slug: sl, name: O.name, sex: O.sex, R: R, ed: R !== O.routine };
          });
        }).catch(function () { return null; });
      }));
    }).then(function (rows) {
      return rows.filter(function (x) { return x && !!x.R.rotation === ROT && (x.R.days || []).length; });
    });
  }
  function rtCopySheet() {
    var sh = rtSheet("다른 회원 루틴 가져오기", '<p class="rts-p">고른 회원님 루틴을 통째로 복사해 와요. 가져온 뒤 무게만 고치고 저장하면 돼요.</p><div class="rtcp-list"><p class="rts-p">회원님 루틴 불러오는 중…</p></div>', null, false);
    var box = sh.querySelector(".rtcp-list");
    rtLoadOthers().then(function (rows) {
      if (!rows.length) { box.innerHTML = '<p class="rts-p">가져올 수 있는 루틴이 없어요' + (ROT ? ' (순환 루틴 회원이 없어요)' : '') + '</p>'; return; }
      box.innerHTML = rows.map(function (x, i) {
        var nDays = (x.R.days || []).filter(function (d) { return !d.rest && !d.pick && !d.cardio_only; }).length;
        return '<button type="button" class="rtcp" data-i="' + i + '"><span class="av ' + (x.sex === "F" ? "F" : "M") + '">' + esc(String(x.name).charAt(0)) + '</span>' +
          '<span class="rtcp-t"><b>' + esc(x.name) + ' <small>' + esc(x.R.version || "") + (x.ed ? " ✎" : "") + ' · 주 ' + nDays + '회</small></b><small>' + esc(rtDaySummary(x.R)) + '</small></span><i aria-hidden="true">›</i></button>';
      }).join("");
      box.addEventListener("click", function (e) {
        var b = e.target.closest(".rtcp"); if (!b) return;
        var x = rows[+b.getAttribute("data-i")];
        sh.close();
        rtCopyConfirm(x);
      });
    }).catch(function () { box.innerHTML = '<p class="rts-p">불러오지 못했어요. 선생님 페이지를 한 번 열고 다시 해 주세요</p>'; });
  }
  function rtCopyConfirm(x) {
    var body = '<p class="rts-p"><b>' + esc(x.name) + '</b> 회원님 루틴(' + esc(x.R.version || "") + ')으로 지금 루틴을 바꿔요. 저장하기 전까진 회원님께 안 보여요.</p>' +
      '<div class="rtcp-pv">' + (x.R.days || []).map(function (d) {
        if (d.rest) return '<div class="rtcp-d rest"><b>' + esc(d.day) + '</b><span>쉬는 날</span></div>';
        return '<div class="rtcp-d"><b>' + esc(d.day) + '</b><span><em>' + esc(d.part) + '</em>' + esc((d.items || []).map(function (it) { return it.name; }).join(", ") || (d.pick ? "골라서 하는 날" : d.cardio_only ? "유산소만" : "")) + '</span></div>';
      }).join("") + '</div>';
    rtSheet("이 루틴으로 바꿀까요?", body, function () {
      var src = clone(x.R), cur = M.routine;
      (src.days || []).forEach(function (d) { (d.items || []).forEach(function (it) { delete it.form; }); });
      src.version = cur ? cur.version : "v1";
      src.updated = cur ? cur.updated : rtToday();
      M.routine = src;
      rtDirty();
      attToast(x.name + " 회원님 루틴을 가져왔어요 — 무게 고치고 저장하세요");
    }, "가져오기");
  }

  /* 저장 → 창고 */
  function rtCheck(R) {
    var days = R.days || [];
    for (var i = 0; i < days.length; i++) {
      var d = days[i], nm = ROT ? "DAY " + (i + 1) : d.day + "요일";
      if (d.rest || d.pick || d.cardio_only) continue;
      if (!d.part) return nm + " 부위 이름이 비어 있어요";
      if (!d.items || !d.items.length) return nm + "에 종목이 없어요 (쉬는 날이면 이날 정보 → 쉬는 날로 바꾸기)";
    }
    return "";
  }
  function rtPost(body) {
    if (!ATT_API) return Promise.reject(new Error("api"));
    body.m = SLUG; body.n = M._real || M.name;
    function once() { return fetch(ATT_API, { method: "POST", body: JSON.stringify(body) }).then(function (r) { return r.json(); }); }
    /* 창고가 다른 일로 바쁘면 한 번 실패할 수 있어서 2.5초 뒤 한 번 더 (같은 내용 덮어쓰기라 두 번 가도 괜찮음) */
    return once().catch(function () { return new Promise(function (ok) { setTimeout(ok, 2500); }).then(once); });
  }
  function rtNetMsg() { return navigator.onLine === false ? "인터넷 연결을 확인하고 다시 눌러 주세요" : "창고가 잠깐 바빠요. 몇 초 뒤 다시 눌러 주세요"; }
  function rtErr(j, sh) {
    var e = j && j.error;
    if (e === "key") { try { localStorage.removeItem("ptkey"); } catch (x) {} sh.msg("선생님 열쇠가 맞지 않아요. 다시 넣어 주세요"); var k = sh.querySelector("#sKeyWrap"); if (k) k.hidden = false; }
    else if (e === "action") sh.msg("창고(Apps Script)를 새 버전으로 다시 배포해야 저장돼요");
    else sh.msg("저장이 안 됐어요 (" + (e || "오류") + ") — 다시 눌러 주세요");
  }
  function rtSaveSheet() {
    var R = M.routine, bad = rtCheck(R);
    if (bad) { attToast(bad); return; }
    var nv = rtVerUp(R.version), hasKey = !!rtKey();
    var body = '<p class="rts-p">고친 곳 ' + RT_EDIT.dirty + '개 · 저장하면 회원님이 PT 노트를 열 때 바로 바뀌어요.</p>' +
      '<label class="rts-ck"><input type="checkbox" id="sVer"> 루틴 버전 올리기 <b>' + esc(R.version) + ' → ' + esc(nv) + '</b></label>' +
      '<label class="rts-ck"><input type="checkbox" id="sNt"> 회원님께 새 공지 띄우기 <small>(열 때 위에서 내려오는 알림)</small></label>' +
      '<div id="sNtBox" hidden><label>공지 제목<input id="sNtT" value=""></label><label>내용<textarea id="sNtB" rows="2"></textarea></label></div>' +
      '<label id="sKeyWrap"' + (hasKey ? ' hidden' : '') + '>선생님 열쇠 <small>처음 한 번만</small><input id="sKey" type="password" autocomplete="off"></label>';
    var sh = rtSheet("회원님께 반영할까요?", body, function (sh) {
      var key = fv(sh, "sKey") || rtKey();
      if (!key) { sh.querySelector("#sKeyWrap").hidden = false; return "선생님 열쇠를 넣어 주세요"; }
      var out = clone(R), up = sh.querySelector("#sVer").checked;
      if (up) out.version = nv;
      out.updated = rtToday();
      var nt = RT_REC && RT_REC.notice || null;
      if (sh.querySelector("#sNt").checked) {
        var t = fv(sh, "sNtT"); if (!t) return "공지 제목을 넣어 주세요";
        nt = { date: rtToday(), title: t, body: fv(sh, "sNtB"), link: "routine" };
      }
      var ok = sh.querySelector("[data-ok]"); ok.disabled = true; ok.textContent = "저장 중…"; sh.msg("");
      rtPost({ a: "routine_save", key: key, rec: { base: RT_BASE, routine: out, notice: nt } }).then(function (j) {
        if (!j || !j.ok || !j.routine) { ok.disabled = false; ok.textContent = "반영하기"; rtErr(j && j.ok ? { error: "action" } : j, sh); return; }
        try { localStorage.setItem("ptkey", key); localStorage.setItem(RT_LS, JSON.stringify(j.routine)); } catch (x) {}
        RT_EDIT = null; rtUse(j.routine); RT_STALE = null;
        grSeed(key);
        sh.close(); rerender();
        attToast("회원님 노트에 바로 반영됐어요");
      }).catch(function () { ok.disabled = false; ok.textContent = "반영하기"; sh.msg(rtNetMsg()); });
      return true;
    }, "반영하기");
    var ver = sh.querySelector("#sVer"), ntc = sh.querySelector("#sNt"), box = sh.querySelector("#sNtBox");
    function ntDefault() {
      var t = sh.querySelector("#sNtT"), b = sh.querySelector("#sNtB");
      if (t.getAttribute("data-user")) return;
      t.value = "루틴이 업데이트됐어요" + (ver.checked ? " (" + nv + ")" : "");
      b.value = "선생님이 루틴을 고쳤어요. 운동 전에 루틴 탭에서 한 번 확인해 주세요!";
    }
    sh.querySelector("#sNtT").addEventListener("input", function () { this.setAttribute("data-user", "1"); });
    ver.addEventListener("change", function () { if (ver.checked && !ntc.checked) { ntc.checked = true; box.hidden = false; } ntDefault(); });
    ntc.addEventListener("change", function () { box.hidden = !ntc.checked; ntDefault(); });
  }
  function rtResetSheet() {
    var hasKey = !!rtKey();
    var body = '<p class="rts-p">폰에서 고친 루틴(' + esc(rtAt(RT_REC)) + ')을 지우고, 처음 올린 루틴(' + esc(RT_ORIG ? RT_ORIG.version : "없음") + ')으로 돌아가요. 지운 내용은 시트 "루틴기록" 탭에 남아 있어요.</p>' +
      '<label id="sKeyWrap"' + (hasKey ? ' hidden' : '') + '>선생님 열쇠<input id="sKey" type="password" autocomplete="off"></label>';
    rtSheet("처음 루틴으로 되돌릴까요?", body, function (sh) {
      var key = fv(sh, "sKey") || rtKey();
      if (!key) { sh.querySelector("#sKeyWrap").hidden = false; return "선생님 열쇠를 넣어 주세요"; }
      var ok = sh.querySelector("[data-ok]"); ok.disabled = true; ok.textContent = "되돌리는 중…";
      rtPost({ a: "routine_reset", key: key }).then(function (j) {
        if (!j || !j.ok) { ok.disabled = false; ok.textContent = "되돌리기"; rtErr(j, sh); return; }
        try { localStorage.setItem("ptkey", key); localStorage.removeItem(RT_LS); } catch (x) {}
        RT_EDIT = null; rtUse(null);
        sh.close(); rerender();
        attToast("처음 루틴으로 돌아갔어요");
      }).catch(function () { ok.disabled = false; ok.textContent = "되돌리기"; sh.msg(rtNetMsg()); });
      return true;
    }, "되돌리기");
  }

  /* 버튼 */
  var rtDelTimer = null;
  function setupRtEdit() {
    if (!CAN_EDIT || view.getAttribute("data-rtbound")) return;
    view.setAttribute("data-rtbound", "1");
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-rt]");
      if (!b || b.disabled || b.closest(".rtsheet")) return;
      var act = b.getAttribute("data-rt"), i = +b.getAttribute("data-i"), dk = view.getAttribute("data-day");
      var d = dk && dayByKey(dk);
      if (act === "start" || act === "create") {
        if (act === "create") M.routine = rtNewRoutine();
        RT_EDIT = { saved: act === "create" ? null : clone(M.routine), dirty: act === "create" ? 1 : 0 };
        if (act === "create") { location.hash = "#routine-mon"; }
        rerender(); return;
      }
      if (act === "cancel") {
        if (RT_EDIT.dirty && !b.classList.contains("sure")) {
          b.classList.add("sure"); b.textContent = "버릴까요?";
          clearTimeout(rtDelTimer); rtDelTimer = setTimeout(function () { b.classList.remove("sure"); b.textContent = "취소"; }, 2500);
          return;
        }
        M.routine = RT_EDIT.saved; RT_EDIT = null; rerender(); return;
      }
      if (act === "save") { rtSaveSheet(); return; }
      if (act === "copy") { rtCopySheet(); return; }
      if (act === "createcopy") { RT_EDIT = { saved: null, dirty: 0 }; M.routine = rtNewRoutine(); location.hash = ROT ? "#routine" : "#routine-mon"; rerender(); rtCopySheet(); return; }
      if (act === "reset") { rtResetSheet(); return; }
      if (act === "info") { rtInfoSheet(); return; }
      if (act === "week") { rtWeekSheet(); return; }
      if (!d) return;
      if (act === "day") { rtDaySheet(dk); return; }
      if (act === "work") { rtMakeWorkDay(dk); return; }
      if (act === "add") { rtPicker(dayName(dk) + " · 종목 고르기", function (e) { rtItemSheet(dk, -1, e); }, true); return; }
      if (act === "item") { rtItemSheet(dk, i); return; }
      if (act === "more") { rtMoreSheet(dk, i); return; }
      if (act === "up" || act === "down") {
        var j = act === "up" ? i - 1 : i + 1, t = d.items[i]; d.items[i] = d.items[j]; d.items[j] = t; rtDirty(); return;
      }
      if (act === "del") {
        if (!b.classList.contains("sure")) {
          b.classList.add("sure"); b.textContent = "한 번 더";
          clearTimeout(rtDelTimer); rtDelTimer = setTimeout(function () { b.classList.remove("sure"); b.textContent = "삭제"; }, 2500);
          return;
        }
        d.items.splice(i, 1); rtDirty();
      }
    });
    document.addEventListener("click", function (e) {   /* 고치는 중 카드 빈 곳을 누르면 고치기 창 */
      if (!RT_EDIT || rtDragEnd > Date.now() - 400) return;
      var c = e.target.closest(".ex.rtdr");
      if (!c || e.target.closest("button, a")) return;
      rtItemSheet(view.getAttribute("data-day"), +c.getAttribute("data-di"));
    });
    document.addEventListener("click", function (e) { if (rtDragEnd > Date.now() - 400 && e.target.closest(".rtdr, .rtdk")) { e.preventDefault(); e.stopPropagation(); } }, true);
    document.addEventListener("contextmenu", function (e) { if (RT_EDIT && e.target.closest(".rtdr, .rtdk")) e.preventDefault(); });
    document.addEventListener("dragstart", function (e) { if (RT_EDIT && e.target.closest && e.target.closest(".rtdr, .rtdk")) e.preventDefault(); });
    document.addEventListener("touchmove", function (e) { if (RT_DRAG) e.preventDefault(); }, { passive: false });
    document.addEventListener("pointerdown", rtDragDown);
    window.addEventListener("beforeunload", function (e) { if (RT_EDIT && RT_EDIT.dirty) { e.preventDefault(); e.returnValue = ""; } });
  }

  /* ---------------- 칸 접기·펼치기 (2026-11-11 "회원 PT노트도 숨기기 펼치기 — 목표 그래프만 빼고")
     제목 줄(.head)이 있는 칸마다 오른쪽 ⌄ 버튼(제목 눌러도 됨). 접은 상태는 그 폰에 기억(ptnote:<주소>:fold, 탭+칸 이름).
     여정 그래프(.jpanel)가 든 칸은 빼고, 주소로 바로 찾아온 칸(#muscle·#goal-badges·요일)은 접혀 있어도 그 순간엔 펼침 */
  var FOLD_LS = "ptnote:" + SLUG + ":fold";
  function foldGet() { try { return JSON.parse(localStorage.getItem(FOLD_LS) || "{}") || {}; } catch (e) { return {}; } }
  function foldAnim(sec, body, f) {   /* 2026-11-16 장동욱 "토글 열고 닫을 때 애니메이션" — 칸 높이가 스르륵 접히고 펼쳐짐(.fbody 높이·투명도만, .view엔 효과 없음) */
    if (body._fa) { try { body._fa.cancel(); } catch (e) {} body._fa = null; }
    body.style.overflow = ""; body.style.display = "";
    var was = sec.classList.contains("folded");
    var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rm || !body.animate || was === f) { sec.classList.toggle("folded", f); return; }
    var h;
    if (f) { h = body.offsetHeight; sec.classList.add("folded"); body.style.display = "flex"; }
    else { sec.classList.remove("folded"); h = body.offsetHeight; }
    if (!h) { body.style.display = ""; return; }
    body.style.overflow = "hidden";
    var a = body.animate(f ? [{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }] : [{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }],
      { duration: Math.max(220, Math.min(380, 180 + h * 0.25)), easing: "cubic-bezier(.3,.7,.2,1)" });
    body._fa = a;
    a.onfinish = function () { if (body._fa === a) { body._fa = null; body.style.overflow = ""; body.style.display = ""; } };
  }
  function setupFold(tab, openId) {
    var F = foldGet();
    Array.prototype.forEach.call(view.querySelectorAll("section"), function (sec) {
      var head = sec.firstElementChild;
      if (!head || !head.classList.contains("head") || sec.querySelector(".jpanel") || head.querySelector(".fold-btn")) return;
      var h2 = head.querySelector("h2");
      var k = tab + ":" + (sec.id || (h2 ? h2.textContent : "")).replace(/\s+/g, " ").trim();
      var body = document.createElement("div");
      body.className = "fbody";
      while (head.nextSibling) body.appendChild(head.nextSibling);
      sec.appendChild(body);
      sec.setAttribute("data-fold", "");
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "fold-btn";
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
      head.appendChild(btn);
      function set(f, save) {
        if (save) foldAnim(sec, body, f); else sec.classList.toggle("folded", f);
        btn.setAttribute("aria-expanded", String(!f));
        btn.setAttribute("aria-label", (h2 ? h2.textContent : "칸") + (f ? " 펼치기" : " 접기"));
        if (save) { var G = foldGet(); if (f) G[k] = 1; else delete G[k]; try { localStorage.setItem(FOLD_LS, JSON.stringify(G)); } catch (e) {} }
      }
      set(!!F[k] && !(openId && sec.id === openId), false);
      function tg(e) { if (e.target.closest("a")) return; set(!sec.classList.contains("folded"), true); }
      btn.addEventListener("click", tg);
      if (h2) { h2.style.cursor = "pointer"; h2.addEventListener("click", tg); }
    });
  }

  /* ---------------- 라우터 */
  var TAB_OF = { home: "home", forms: "forms", form: "forms", exlib: "exlib", routine: "routine", diet: "diet", notice: "notice" };
  /* 뒤로 가기 (2026-11-12 장동욱 "태블릿·PC에서 종목 보다가 자세 복습지 누르면 뒤로가기가 없어서 다시 루틴 들어가야 함")
     본문 속 링크(루틴 → 복습지, 홈 → 루틴 요일, 리포트·배지 등)로 넘어가면 화면 위에 "‹ 뒤로 · 루틴" 버튼이 붙어 다님.
     누르면 직전 화면 + 보던 위치(스크롤)로 돌아감. 아래 탭·위 막대·나 탭 전환 칸을 누르면 새 출발이라 기록을 비움. */
  var NAVS = [], NAV_BACK = null, ZOOM = null, SOFT = 0, LINKAT = 0, SCR = {}, VCACHE = {};
  /* 화면마다 보던 스크롤 위치 기억 — 뒤로 오면 그 자리 그대로.
     history.scrollRestoration = "manual"은 쓰지 않음: 아이폰에서 밀어서 뒤로 갈 때 이전 화면 그림 대신 백지가 보였음(2026-11-12) */
  window.addEventListener("scroll", function () { if (route.lastH && Date.now() - (route.at || 0) > 400) SCR[route.lastH] = window.scrollY; }, { passive: true });
  function zoomRun(view) {   /* 화면(view) 중 지금 보이는 부분을 누른 칸 크기·자리에서 시작해 화면 가득 커지게 */
    var z = ZOOM; ZOOM = null;
    /* 2026-11-12 원래 B안(줄였다 키우기)으로 복구 — 시작 칸이 화면 밖에 걸쳐 있으면(옆으로 넘기는 아이콘) 화면 안으로 당겨서 시작 */
    if (z) { var cw = document.documentElement.clientWidth; z = { l: Math.max(0, Math.min(z.l, cw - z.w)), t: z.t, w: Math.min(z.w, cw), h: z.h, at: z.at }; }
    if (!z || Date.now() - z.at > 1500 || !view.animate) return false;
    try { if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return false; } catch (e) {}
    var W = window.innerWidth, H = window.innerHeight, vr = view.getBoundingClientRect();
    var ox = -vr.left, oy = -vr.top;
    var clip0 = "inset(" + Math.max(0, oy) + "px " + Math.max(0, vr.width - (W - vr.left)) + "px " + Math.max(0, vr.height - (H - vr.top)) + "px " + Math.max(0, ox) + "px round ";
    view.style.transformOrigin = ox + "px " + oy + "px";
    var an = view.animate([
      { transform: "translate(" + z.l + "px," + z.t + "px) scale(" + (z.w / W).toFixed(4) + "," + (z.h / H).toFixed(4) + ")", clipPath: clip0 + "60px)", opacity: 0.35 },
      { opacity: 1, offset: 0.45 },
      { transform: "none", clipPath: clip0 + "0px)", opacity: 1 }
    ], { duration: 460, easing: "cubic-bezier(.2,.85,.25,1)" });
    an.onfinish = an.oncancel = function () { view.style.transformOrigin = ""; };
    /* 2026-11-13 "복습지 종목 들어갔다 나오면 또 짤림": 아이폰에서 이 움직임이 끝나지 않고 중간(작게 줄어든 상태)에 멈춰
       화면 본문만 왼쪽에 작게 남는 일이 있었음 → 0.6초 뒤엔 무조건 끝내기 */
    setTimeout(function () { try { if (an.playState !== "finished") an.cancel(); } catch (e) {} view.style.transformOrigin = ""; }, 620);
    return true;
  }
  /* ---- 앱으로 설치 안내 (#app, 2026-11-12 장동욱 "회원들이 아이폰·갤럭시에서 주소를 어플화할 수 있게 튜토리얼") ----
     기기·브라우저를 알아서 골라 그림으로 단계 안내. 카톡 안에서 열었으면 먼저 사파리/크롬으로 열기. 안드로이드 크롬은 '앱 설치' 버튼 한 번(beforeinstallprompt). */
  var INST_EVT = null, INST_X = "ptnote:" + SLUG + ":instx";
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); INST_EVT = e;
    var b = document.getElementById("instGo"); if (b) b.hidden = false;
  });
  window.addEventListener("appinstalled", function () { INST_EVT = null; try { localStorage.setItem(INST_X, "1"); } catch (e) {} });
  function instEnv() {
    var ua = navigator.userAgent || "";
    var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var and = /Android/i.test(ua);
    var kakao = /KAKAOTALK/i.test(ua);
    var inapp = kakao || /NAVER\(inapp|Instagram|FBAN|FBAV|Line\/|DaumApps|everytimeApp/i.test(ua);
    var sam = /SamsungBrowser/i.test(ua);
    var standalone = !!((window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true);
    return { ios: ios, and: and, kakao: kakao, inapp: inapp, sam: sam, standalone: standalone, mobile: ios || and };
  }
  function instIcon() { return BASE + "icon-" + icv().toLowerCase() + "-192.png"; }
  var IN_SV = {
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
    dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
    hdots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15 9-2 4-4 2 2-4z"/></svg>'
  };
  /* 작은 폰 화면 그림: where = "bot"(아래 막대) / "top"(위 막대) / "sheet"(메뉴 목록) / "dlg"(확인 창) / "home"(홈 화면) */
  function instMock(kind, o) {
    var h = '<div class="imk k-' + kind + '" aria-hidden="true"><div class="imk-scr">';
    if (kind === "bot") h += '<div class="imk-page"><i></i><i></i><i class="s"></i></div><div class="imk-bar">' + o.items.map(function (x) { return '<span' + (x.on ? ' class="on"' : '') + '>' + x.ic + '</span>'; }).join("") + '</div>';
    else if (kind === "top") h += '<div class="imk-bar t"><span class="url">' + esc(location.host) + '</span>' + o.items.map(function (x) { return '<span' + (x.on ? ' class="on"' : '') + '>' + x.ic + '</span>'; }).join("") + '</div><div class="imk-page"><i></i><i></i><i class="s"></i></div>';
    else if (kind === "sheet") h += '<div class="imk-page dim"><i></i><i></i></div><div class="imk-list' + (o.top ? ' t' : '') + '">' + o.rows.map(function (r) { return '<div' + (r.on ? ' class="on"' : '') + '><b>' + esc(r.t) + '</b>' + (r.ic || '') + '</div>'; }).join("") + '</div>';
    else if (kind === "dlg") h += '<div class="imk-page dim"><i></i><i></i></div><div class="imk-dlg"><div class="dt">' + esc(o.title) + '</div><div class="dr"><img src="' + instIcon() + '" alt=""><span>PT노트</span></div><div class="db">' + (o.cancel ? '<em>' + esc(o.cancel) + '</em>' : '') + '<em class="on">' + esc(o.ok) + '</em></div></div>';
    else if (kind === "home") h += '<div class="imk-home"><i></i><i></i><i></i><span class="on"><img src="' + instIcon() + '" alt=""><b>PT노트</b></span><i></i><i></i><i></i><i></i></div>';
    return h + '</div></div>';
  }
  function instStep(n, title, desc, mock) {
    return '<li class="ist"><div class="ist-t"><span class="ist-n">' + n + '</span><div><b>' + title + '</b><p>' + desc + '</p></div></div>' + mock + '</li>';
  }
  var INST_GUIDES = {
    ios: function () {
      return instStep(1, '아래 <u>공유 버튼</u> 누르기', '사파리 아래 막대의 네모에 화살표(' + '<i class="iic">' + IN_SV.share + '</i>) 버튼이에요. 안 보이면 <b>···</b> 를 먼저 누르면 나와요.',
          instMock("bot", { items: [{ ic: '‹' }, { ic: '›' }, { ic: IN_SV.share, on: 1 }, { ic: '□' }, { ic: IN_SV.hdots }] })) +
        instStep(2, '<u>홈 화면에 추가</u> 누르기', '메뉴를 위로 조금 올리면 있어요.',
          instMock("sheet", { rows: [{ t: "복사" }, { t: "즐겨찾기에 추가" }, { t: "홈 화면에 추가", ic: '<i class="iic">' + IN_SV.plus + '</i>', on: 1 }, { t: "페이지에서 찾기" }] })) +
        instStep(3, '오른쪽 위 <u>추가</u> 누르기', '"웹 앱으로 열기"가 보이면 켜 둔 그대로 두세요.',
          instMock("dlg", { title: "홈 화면에 추가", cancel: "취소", ok: "추가" })) +
        instStep(4, '홈 화면의 <u>PT노트</u> 아이콘으로 열기', '이제 주소창 없이 앱처럼 열려요. 출석 도장도 여기서 꾹!', instMock("home", {}));
    },
    chrome: function () {
      return instStep(1, '오른쪽 위 <u>⋮</u> 누르기', '크롬 주소창 오른쪽 점 세 개 버튼이에요.',
          instMock("top", { items: [{ ic: '⌂' }, { ic: IN_SV.dots, on: 1 }] })) +
        instStep(2, '<u>홈 화면에 추가</u> (또는 앱 설치) 누르기', '메뉴를 조금 내리면 있어요.',
          instMock("sheet", { top: 1, rows: [{ t: "새 탭" }, { t: "북마크" }, { t: "홈 화면에 추가", ic: '<i class="iic">' + IN_SV.home + '</i>', on: 1 }, { t: "설정" }] })) +
        instStep(3, '<u>설치</u> (또는 추가) 누르기', '', instMock("dlg", { title: "앱 설치", cancel: "취소", ok: "설치" })) +
        instStep(4, '홈 화면의 <u>PT노트</u> 아이콘으로 열기', '이제 주소창 없이 앱처럼 열려요. 출석 도장도 여기서 꾹!', instMock("home", {}));
    },
    samsung: function () {
      return instStep(1, '오른쪽 아래 <u>≡ 메뉴</u> 누르기', '삼성 인터넷 아래 막대 맨 오른쪽이에요.',
          instMock("bot", { items: [{ ic: '‹' }, { ic: '›' }, { ic: '⌂' }, { ic: '☆' }, { ic: IN_SV.menu, on: 1 }] })) +
        instStep(2, '<u>현재 페이지 추가</u> 누르기', '(버전에 따라 "페이지 추가"로 보여요)',
          instMock("sheet", { rows: [{ t: "북마크" }, { t: "현재 페이지 추가", ic: '<i class="iic">' + IN_SV.plus + '</i>', on: 1 }, { t: "방문 기록" }, { t: "설정" }] })) +
        instStep(3, '<u>홈 화면</u> 고르고 <u>추가</u>', '', instMock("dlg", { title: "홈 화면에 추가", cancel: "취소", ok: "추가" })) +
        instStep(4, '홈 화면의 <u>PT노트</u> 아이콘으로 열기', '이제 주소창 없이 앱처럼 열려요. 출석 도장도 여기서 꾹!', instMock("home", {}));
    }
  };
  function instUrl() { return location.origin + location.pathname; }
  function renderInstall() {
    var E = instEnv(), pick = E.ios ? "ios" : (E.sam ? "samsung" : "chrome");
    var h = '<div class="ins-hero"><img src="' + instIcon() + '" alt=""><div><small>PT노트 앱으로 쓰기</small><h1>홈 화면에 PT노트 만들기</h1><p>한 번만 해 두면 카톡에서 링크 찾을 필요 없이<br>아이콘 하나로 바로 열려요. 1분이면 돼요.</p></div></div>';
    if (E.standalone) {
      h += '<section><div class="ins-done"><b>✓ 이미 앱으로 쓰고 있어요</b><p>지금 홈 화면 PT노트 아이콘으로 열었어요. 이대로 쓰시면 돼요!</p></div></section>';
      return h + remember();
    }
    if (E.inapp) {
      var ext = E.kakao ? "kakaotalk://web/openExternal?url=" + encodeURIComponent(instUrl()) :
        (E.and ? "intent://" + location.host + location.pathname + "#Intent;scheme=https;package=com.android.chrome;end" : "");
      h += '<section class="ins-warn">' + head("", "먼저 " + (E.ios ? "사파리" : "크롬") + "로 열어 주세요", (E.kakao ? "카톡" : "앱") + " 안에서는 홈 화면에 추가가 안 돼요") +
        (ext ? '<a class="btn fill ins-ext" href="' + esc(ext) + '">' + IN_SV.ext + (E.ios ? '사파리로 열기' : '크롬으로 열기') + '</a>' : '') +
        '<p class="ins-alt">버튼이 안 되면: ' + (E.ios ? '오른쪽 아래 <b>···</b> 또는 공유 버튼 → <b>Safari로 열기</b>' : '오른쪽 위 <b>⋮</b> → <b>다른 브라우저로 열기</b>') + '</p>' +
        '<p class="ins-alt">그래도 안 되면 주소를 복사해서 ' + (E.ios ? '사파리' : '크롬') + ' 주소창에 붙여 넣어요.</p>' +
        '<button type="button" class="btn ins-copy" id="instCopy">주소 복사하기</button></section>';
    }
    h += '<section>' + head("", "따라 하기", "내 폰에 맞는 걸 골라요") +
      '<div class="ins-seg" role="tablist">' + [["ios", "아이폰"], ["chrome", "갤럭시 · 크롬"], ["samsung", "삼성 인터넷"]].map(function (t) {
        return '<button type="button" role="tab" data-g="' + t[0] + '" aria-selected="' + (t[0] === pick) + '">' + t[1] + '</button>';
      }).join("") + '</div>' +
      (E.and && !E.inapp ? '<button type="button" class="btn fill ins-go" id="instGo"' + (INST_EVT ? '' : ' hidden') + '>' + IN_SV.plus + '한 번에 앱 설치하기</button>' : '') +
      '<ol class="ins-steps" id="instSteps">' + INST_GUIDES[pick]() + '</ol>' +
      (E.ios ? '<p class="ins-alt">아이폰은 <b>사파리</b>에서 하는 게 제일 확실해요. 크롬에서도 공유 버튼 → 홈 화면에 추가가 돼요.</p>' : '') +
      '</section>';
    h += '<section>' + head("", "알아 두면 좋아요") + '<ul class="ins-tip">' +
      '<li>아이콘으로 열어도 <b>출석·루틴·복습지</b>는 그대로예요.</li>' +
      '<li>선생님이 루틴·복습지를 올리면 <b>열 때마다 자동으로 최신</b>이 돼요. 따로 업데이트할 필요 없어요.</li>' +
      '<li>아이콘을 지워도 기록은 안 사라져요. 다시 추가하면 돼요.</li></ul>' +
      '<button type="button" class="btn ins-copy" id="instCopy2">내 PT노트 주소 복사</button></section>';
    return h + remember();
  }
  function setupInstall() {
    var seg = view.querySelector(".ins-seg"), box = document.getElementById("instSteps");
    if (seg && box) seg.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-g]"); if (!b) return;
      Array.prototype.forEach.call(seg.children, function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      box.innerHTML = INST_GUIDES[b.getAttribute("data-g")]();
    });
    var go = document.getElementById("instGo");
    if (go) go.addEventListener("click", function () {
      if (!INST_EVT) return;
      INST_EVT.prompt();
      (INST_EVT.userChoice || Promise.resolve({})).then(function (c) { if (c && c.outcome === "accepted") { go.hidden = true; attToast("PT노트 앱이 설치됐어요!"); } });
      INST_EVT = null;
    });
    ["instCopy", "instCopy2"].forEach(function (id) {
      var b = document.getElementById(id); if (!b) return;
      b.addEventListener("click", function () {
        var u = instUrl();
        function ok() { attToast("주소를 복사했어요"); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(ok, function () { window.prompt("주소를 길게 눌러 복사하세요", u); });
        else window.prompt("주소를 길게 눌러 복사하세요", u);
      });
    });
  }
  function instHomeCard() {   /* 홈: 아직 앱으로 안 쓰는 회원 폰에만 (닫으면 안 뜸) */
    var E = instEnv();
    if (E.standalone || !E.mobile || DEMO || COACH_MODE) return "";
    try { if (localStorage.getItem(INST_X)) return ""; } catch (e) {}
    return '<div class="ins-card"><a href="#app"><img src="' + instIcon() + '" alt=""><span><b>홈 화면에 PT노트 앱 만들기</b><em>아이콘 하나로 바로 열려요 · 1분</em></span><i aria-hidden="true">›</i></a>' +
      '<button type="button" class="ins-x" aria-label="닫기" onclick="try{localStorage.setItem(\'' + INST_X + '\',\'1\')}catch(e){};this.parentNode.remove()">×</button></div>';
  }
  function instLink() {   /* 나 탭 */
    if (instEnv().standalone || DEMO) return "";
    return '<a class="rp-home ins-link" href="#app"><span class="rh-ic" aria-hidden="true">' + IN_SV.plus + '</span><span class="rh-t"><small>APP</small><b>PT노트를 앱처럼 쓰기</b><em>홈 화면에 아이콘 추가하는 법</em></span><span class="rh-go" aria-hidden="true">›</span></a>';
  }
  function navName(h) {
    h = String(h || "").replace(/^#/, "") || "home";
    if (/^routine/.test(h)) return "루틴"; if (/^form-/.test(h)) return "자세 복습지"; if (h === "forms") return "복습지"; if (h === "exlib") return "운동 목록";
    if (h === "diet") return "식단"; if (/^goal/.test(h)) return "목표"; if (h === "body") return "몸변화"; if (h === "notice") return "공지";
    if (/^report/.test(h)) return "리포트"; if (h === "growth") return "성장 기록"; if (h === "app") return "앱으로 쓰기"; if (h === "muscle") return "근육 지도"; return "홈";
  }
  document.addEventListener("touchstart", function () {}, { passive: true });   /* 아이폰에서 :active(살짝 눌림)가 먹게 */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    LINKAT = Date.now();
    var to = a.getAttribute("href"), cur = location.hash || "#home";
    if (to === "#" || to === cur) return;
    if (a.closest(".tabs") || a.closest(".bar") || a.closest(".meseg")) { NAVS = []; return; }
    /* 루틴 안에서 요일 바꾸기(일주일 한눈에 칸·로테이션 고르기)는 뒤로 버튼·커지는 효과 없이 그날 칸만 은은하게 (2026-11-12 "요일별 눌러서 들어가는 칸은 별로 — 은은하게") */
    if (/^#routine/.test(cur) && /^#routine/.test(to)) { SOFT = Date.now(); return; }
    NAVS.push({ h: cur, y: window.scrollY });
    /* B안 (2026-11-12 "아이콘이 퍼지며 화면 들어가기 — B안으로"): 누른 칸 자리에서 다음 화면이 커지며 열림 → 그 칸 위치를 기억 */
    var zEl = a.closest(".th-tile, .card-link, .hw, .ex, .thero, .stamp, .ibstrip, .rp-home") || ((a.offsetHeight < 56) && a.closest(".panel, section")) || a;
    var zr = zEl.getBoundingClientRect();
    /* 커지며 열리기(B안) — 2026-11-12 다시 켬: transform 없이 clip-path만 써서 화면 폭에 영향 없음 */
    /* 2026-11-14 끔: 아이폰에서 다음 화면이 작게·왼쪽으로 쏠린 채 시작해 커지는 게 "화면 쏠림"으로 보임 → 다른 화면처럼 차례로 올라오기(D안)만 */
    void zr;
    if (NAVS.length > 20) NAVS.shift();
  }, true);
  function navBackDraw(view) {
    if (!NAVS.length) return;
    var top = NAVS[NAVS.length - 1], bar = document.querySelector(".bar");
    view.insertAdjacentHTML("afterbegin", '<button type="button" class="navback" id="navBack" aria-label="' + navName(top.h) + '(으)로 돌아가기"><span aria-hidden="true">‹</span> 뒤로 <b>· ' + navName(top.h) + '</b></button>');
    var nb = document.getElementById("navBack");
    if (bar) nb.style.top = (Math.round(bar.getBoundingClientRect().height) + 8) + "px";
    nb.addEventListener("click", function () {
      var want = NAVS[NAVS.length - 1].h, was = location.hash;
      history.back();
      setTimeout(function () { if (location.hash === was) location.hash = want; }, 350);
    });
  }
  function tabInd() {   /* 아래 탭 밑 빨간 막대 — 고른 탭으로 미끄러져 감 (D안) */
    var tin = document.querySelector(".tabs-in"); if (!tin) return;
    var bar = tin.querySelector(".tind"); if (!bar) { bar = document.createElement("i"); bar.className = "tind"; bar.setAttribute("aria-hidden", "true"); tin.appendChild(bar); }
    var a = tin.querySelector('a[aria-current="page"]');
    if (!a) { bar.style.opacity = "0"; return; }
    bar.style.opacity = "1"; bar.style.transform = "translateX(" + Math.round(a.offsetLeft + a.offsetWidth / 2 - 11) + "px)";
  }
  window.addEventListener("resize", function () { tabInd(); });
  /* ---------------- 처음 쓰는 회원 둘러보기(튜토리얼) (2026-11-13 장동욱 "처음 들어가면 튜토리얼, 다시 필요하면 옵션 칸에서")
     처음 연 폰에서 홈 화면일 때 한 번 — 실제 화면의 그 자리를 동그랗게 비춰 주며 차례로 설명. 끝나면 기억(ptnote:<주소>:tour).
     '나' 탭 맨 아래 "설정" 칸의 "앱 사용법 다시 보기"로 언제든 다시. 선생님 보기·안내서 데모·아이패드 칸 안에선 저절로 안 뜸. */
  var TOUR_K = "ptnote:" + SLUG + ":tour", TOUR_ON = false, TOUR_WANT = false;
  try { TOUR_WANT = !localStorage.getItem(TOUR_K) && !COACH_MODE && !DEMO && window.self === window.top; } catch (e) {}
  if (/[?&]tour\b/.test(location.search)) TOUR_WANT = true;
  function tourName() { var n = String(M.name || "").split("·")[0].trim(); return /·/.test(M.name || "") ? M.name.replace(/\s*·\s*/g, "·") : (n.length >= 3 ? n.slice(1) : n); }
  function tourSteps() {
    var E = typeof instEnv === "function" ? instEnv() : { standalone: true, mobile: false };
    var S = [
      { c: 1, t: tourName() + "님, 환영해요! 👋", b: TRN + " " + TRL() + "님과 함께하는 나만의 PT노트예요.\n어디에 뭐가 있는지 30초만 둘러볼까요?", ok: "둘러보기" },
      { s: "#attBtn", t: "운동 온 날엔 출석 도장 꾹", b: "헬스장에 온 날 여기를 꾹 누르면 출석이 찍혀요.\n출석이 쌓이면 배지와 월간 리포트가 생겨요." },
      { s: ".thero", t: "오늘 할 운동", b: "요일마다 오늘 할 운동이 여기 떠요.\n누르면 세트·무게까지 자세히 볼 수 있어요." },
      { s: '.tabs a[data-tab="routine"]', t: "운동", b: "루틴과 자세 복습지가 한 곳에 있어요.\n한 종목이 끝나면 ✓를 눌러 기록해요." },
      { s: '.tabs a[data-tab="diet"]', t: "식단", b: M.diet ? "선생님이 짜 준 식단이 여기 있어요." : "식단을 받으면 여기서 볼 수 있어요." },
      { s: '.tabs a[data-tab="log"]', t: "기록", b: "✓한 운동 · 첫날 vs 오늘 · 근육 지도 · 인바디가\n여기 쌓여요." },
      { s: '.tabs a[data-tab="me"]', t: "나", b: "출석률 · 배지 · PT 여정을\n한눈에 볼 수 있어요." },
      { s: ".bell", t: "선생님 공지", b: "선생님 소식이 오면 빨간 점이 떠요." },
      { c: 1, t: "준비 끝! 💪", b: "새 루틴이나 복습지가 올라오면 아래 아이콘에 불이 켜져요.\n사용법은 오른쪽 위 ⚙️ 설정에서 언제든 다시 볼 수 있어요.", ok: "시작하기", app: E.mobile && !E.standalone }
    ];
    return S.filter(function (x) { if (!x.s) return true; var el = document.querySelector(x.s); return el && el.getBoundingClientRect().width > 0; });
  }
  function tourStart() {
    if (TOUR_ON || !document.querySelector(".stamp, .thero")) return;
    TOUR_ON = true; TOUR_WANT = false;
    document.querySelectorAll(".npop-wrap").forEach(function (x) { x.remove(); });
    var S = tourSteps(), i = 0;
    var w = document.createElement("div"); w.className = "tour"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true");
    w.innerHTML = '<div class="tour-hole"></div><div class="tour-card"><button type="button" class="tour-skip">건너뛰기</button><div class="tour-dots"></div><b class="tour-t"></b><p class="tour-b"></p><div class="tour-btns"></div></div>';
    document.body.appendChild(w);
    var hole = w.querySelector(".tour-hole"), card = w.querySelector(".tour-card");
    function end() {
      try { localStorage.setItem(TOUR_K, "1"); } catch (e) {}
      w.classList.remove("on"); setTimeout(function () { w.remove(); }, 260);
      TOUR_ON = false; setTimeout(function () { if (!DEMO) showNoticePop(); }, 600);
    }
    function place() {
      var x = S[i], vw = window.innerWidth, vh = window.innerHeight;
      if (x.c) { hole.style.cssText = "left:" + vw / 2 + "px;top:" + vh / 2 + "px;width:0;height:0;border-radius:50%"; card.style.top = Math.max(80, vh / 2 - card.offsetHeight / 2) + "px"; card.classList.add("mid"); return; }
      var el = document.querySelector(x.s); if (!el) return;
      var r = el.getBoundingClientRect(), pad = el.closest(".tabs") ? 4 : 8, rad = getComputedStyle(el).borderRadius;
      hole.style.cssText = "left:" + (r.left - pad) + "px;top:" + (r.top - pad) + "px;width:" + (r.width + pad * 2) + "px;height:" + (r.height + pad * 2) + "px;border-radius:" + (el.closest(".tabs") ? "18px" : (parseFloat(rad) ? (parseFloat(rad) + pad) + "px" : "18px"));
      card.classList.remove("mid");
      var ch = card.offsetHeight, below = r.bottom + pad + 14;
      card.style.top = (below + ch < vh - 12 ? below : Math.max(12, r.top - pad - 14 - ch)) + "px";
    }
    function show() {
      var x = S[i];
      card.querySelector(".tour-dots").innerHTML = S.map(function (_, k) { return '<i' + (k === i ? ' class="on"' : '') + '></i>'; }).join("");
      card.querySelector(".tour-t").textContent = x.t;
      card.querySelector(".tour-b").textContent = x.b;
      card.querySelector(".tour-skip").hidden = i === S.length - 1;
      card.querySelector(".tour-btns").innerHTML = (x.app ? '<a class="tb-app" href="#app">📲 홈 화면에 앱으로 추가하기</a>' : '') +
        (i > 0 && !x.c ? '<button type="button" class="tb-prev">이전</button>' : '') +
        '<button type="button" class="tb-next">' + (x.ok || (i === S.length - 2 ? "마지막" : "다음") + ' <small>' + i + '/' + (S.length - 2) + '</small>') + '</button>';
      card.classList.remove("in"); void card.offsetWidth; card.classList.add("in");
      if (x.s) {
        var el = document.querySelector(x.s);
        if (el && !el.closest(".tabs, .bar")) {
          var r = el.getBoundingClientRect();
          if (r.top < 70 || r.bottom > window.innerHeight - 220) { window.scrollTo({ top: window.scrollY + r.top - 110, behavior: "smooth" }); setTimeout(place, 420); return; }
        }
      }
      place();
    }
    w.addEventListener("click", function (e) {
      if (e.target.closest(".tour-skip")) return end();
      if (e.target.closest(".tb-app")) return end();
      if (e.target.closest(".tb-prev")) { i = Math.max(0, i - 1); return show(); }
      if (e.target.closest(".tb-next") || e.target === hole || e.target === w) { if (i >= S.length - 1) return end(); i++; show(); }
    });
    window.addEventListener("resize", function rs() { if (!w.isConnected) return window.removeEventListener("resize", rs); place(); });
    requestAnimationFrame(function () { w.classList.add("on"); show(); });
  }
  function tourMaybe() {   /* route()가 홈을 그린 뒤 */
    if (!TOUR_WANT || TOUR_ON) return;
    var h = location.hash.replace("#", "");
    if (h && h !== "home") return;
    setTimeout(function () { if (TOUR_WANT && (!location.hash || location.hash === "#home")) tourStart(); }, document.body.classList.contains("ready") ? 450 : 1300);
  }
  /* 위 막대 ⚙️ 설정 (2026-11-13 "상단 지수 아이콘 옆에 설정 아이콘 — 앱 사용법·홈 화면 앱 추가, 기존 항목 없애고") */
  function gearMenu() {
    var old = document.getElementById("gearMenu"); if (old) { old.remove(); return; }
    var E = typeof instEnv === "function" ? instEnv() : { standalone: true }, g = document.getElementById("gearBtn");
    var m = document.createElement("div"); m.id = "gearMenu"; m.className = "gmenu"; m.setAttribute("role", "menu");
    m.innerHTML = '<a href="#home" role="menuitem" data-tour="1"><span>🧭</span><b>앱 사용법 다시 보기</b></a>' +
      '<a href="#app" role="menuitem"><span>📲</span><b>' + (E.standalone ? '홈 화면 앱 설치 안내' : '홈 화면에 앱으로 추가하기') + '</b></a>';   /* 2026-11-13 "앱아이콘 설치 옵션 왜 뺐냐" — 앱으로 열었어도 항상 보이게 */
    document.body.appendChild(m);
    var r = g.getBoundingClientRect();
    m.style.top = (r.bottom + 8) + "px"; m.style.right = Math.max(10, window.innerWidth - r.right - 40) + "px";
    requestAnimationFrame(function () { m.classList.add("on"); });
    setTimeout(function () {
      document.addEventListener("click", function cl(e) { if (!e.target.closest("#gearMenu a")) { m.remove(); } else setTimeout(function () { m.remove(); }, 50); document.removeEventListener("click", cl, true); }, true);
    }, 0);
  }
  (function () { var g = document.getElementById("gearBtn"); if (g) g.addEventListener("click", function (e) { e.stopPropagation(); gearMenu(); }); })();
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-tour]"); if (!a) return;
    TOUR_WANT = true;
    if (!location.hash || location.hash === "#home") { e.preventDefault(); window.scrollTo(0, 0); tourMaybe(); }
  });

  function zoomReset() {   /* 화면이 바뀔 때 남아 있는 확대·축소 움직임은 모두 지움 */
    var v = document.getElementById("view"); if (!v) return;
    try { if (v.getAnimations) v.getAnimations().forEach(function (a) { a.cancel(); }); } catch (e) {}
    v.style.transform = ""; v.style.transformOrigin = ""; v.style.clipPath = "";
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) zoomReset(); });
  window.addEventListener("pageshow", zoomReset);
  function route() {
    zoomReset();
    var hsh = (location.hash || "").replace(/^#/, "");
    var navTop = NAVS[NAVS.length - 1];
    if (navTop && navTop.h === (location.hash || "#home")) NAV_BACK = NAVS.pop();
    /* 뒤로 가기(뒤로 버튼·아이폰 밀어서 뒤로·브라우저 뒤로)는 새로고침처럼 보이지 않게 차례 등장 없이 그대로 (2026-11-12 "눌렀을 때 어쩔 땐 새로고침") */
    var goingBack = !!NAV_BACK || (route.lastH !== undefined && Date.now() - LINKAT > 1000);
    /* 뒤로 갈 땐 다시 그리지 않고 아까 그 화면(DOM)을 그대로 다시 붙임 (2026-11-12 "특정 아이콘만 들어갔다 돌아오면 깜빡임")
       — 새로 그리면 아이폰이 그림·움직이는 아이콘을 처음부터 다시 칠하느라 한 순간 하얗게 비었음 */
    var curH0 = location.hash || "#home", prevH = route.lastH;
    if (prevH !== undefined && prevH !== curH0 && view.firstChild) {
      /* 2026-11-13 "복습지 종목 들어갔다 나오면 화면 짤림": 떼어 둔 화면의 영상이 계속 재생돼서 아이폰이 PiP(옆에 회색 손잡이)로 빼고 화면 배율이 꼬였음
         → 떼어 둘 땐 영상을 멈추고, 다시 붙일 때 이어서 재생 */
      Array.prototype.forEach.call(view.querySelectorAll("video"), function (v) { try { v.setAttribute("data-was", v.paused ? "" : "1"); v.pause(); } catch (e) {} });
      var fr = document.createDocumentFragment(); while (view.firstChild) fr.appendChild(view.firstChild);
      VCACHE[prevH] = { fr: fr, tab: view.getAttribute("data-tab"), day: view.getAttribute("data-day"), at: Date.now(), sig: vSig() };
      Object.keys(VCACHE).forEach(function (k) { if (Date.now() - VCACHE[k].at > 180000) delete VCACHE[k]; });
    }
    var hit = goingBack && prevH !== undefined && prevH !== curH0 && VCACHE[curH0];
    if (hit) {
      delete VCACHE[curH0];
      view.appendChild(hit.fr);
      Array.prototype.forEach.call(view.querySelectorAll('video[data-was="1"]'), function (v) { try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} });
      var ob = view.querySelector("#navBack"); if (ob) ob.remove();
      view.setAttribute("data-tab", hit.tab || "home");
      if (hit.day) view.setAttribute("data-day", hit.day); else view.removeAttribute("data-day");
      route.lastH = curH0; route.at = Date.now();
      view.classList.remove("enter"); view.classList.add("back");
      var t0 = tabOf(hit.tab);
      Array.prototype.forEach.call(document.querySelectorAll(".tabs a"), function (a) {
        if (a.getAttribute("data-tab") === t0) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
      });
      tabInd(); litApply(hit.tab); navBackDraw(view);
      if (hit.sig !== vSig()) attRefresh();   /* 그사이 출석 기록이 바뀌었으면 그 부분만 새로 */
      var by0 = NAV_BACK ? NAV_BACK.y : SCR[curH0]; NAV_BACK = null; ZOOM = null;
      if (by0 != null) window.scrollTo(0, by0);
      return;
    }
    var html, tab = "home", after = null, scrollDay = false, jumpTo = null;
    if (!hsh || hsh === "home") { html = renderHome(); }
    else if (hsh === "forms") { html = renderForms(); tab = "forms"; after = setupForms; }
    else if (hsh === "exlib") { html = renderExlib(); tab = "exlib"; after = setupExlib; }
    else if (hsh.indexOf("form-") === 0) {
      var f = findForm(hsh.slice(5));
      html = f ? renderForm(f) : renderForms(); tab = "forms"; if (f) after = setupPlayer;
    }
    else if (hsh === "routine") { html = renderRoutine(); tab = "routine"; }
    else if (hsh.indexOf("routine-") === 0 && (DAY_KO[hsh.slice(8)] || isRotKey(hsh.slice(8)))) { html = renderRoutine(hsh.slice(8)); tab = "routine"; scrollDay = true; }
    else if (hsh === "diet") { html = renderDiet(); tab = "diet"; }
    else if (hsh === "notice") { html = renderNotice(); tab = "notice"; }
    else if (hsh === "goal" || hsh === "journey") { html = renderGoal(); tab = "goal"; }
    else if (hsh === "goal-badges" || hsh === "badges") { html = renderGoal(); tab = "goal"; jumpTo = "badges"; }
    else if (hsh === "log") { html = renderLog(); tab = "log"; }
    else if (hsh === "muscle") { html = renderLog(); tab = "log"; jumpTo = "muscle"; }
    else if (hsh === "growth") { html = renderGrowth(); tab = "log"; after = setupGrowth; }
    else if (hsh === "app") { html = renderInstall(); tab = "home"; after = setupInstall; }
    else if (hsh === "report" || /^report-\d{4}-\d{2}$/.test(hsh)) { html = renderReport(hsh.slice(7)); tab = "log"; after = setupReport; }
    else if ((hsh === "body" || hsh === "inbody") && IB_ON) { html = renderBody(); tab = "body"; }
    else { html = renderHome(); }
    var prevTab = view.getAttribute("data-tab");
    var wasRoutine = prevTab === "routine";
    if (tab !== "routine") view.removeAttribute("data-day");
    view.innerHTML = html + rtSaveBar();
    view.setAttribute("data-tab", tab);
    /* 화면 넘어갈 때 효과 D안 (2026-11-12 "D안으로 가자"): 칸들이 위에서부터 차례로 톡톡 올라옴 — 주소가 바뀔 때만(같은 화면 다시 그리기는 X) */
    var curH = location.hash || "#home";
    var hashChanged = route.lastH !== undefined && route.lastH !== curH;
    var soft = SOFT && Date.now() - SOFT < 1500; SOFT = 0;
    if (route.lastH !== undefined && route.lastH !== curH && !soft && !goingBack && !(ZOOM && Date.now() - ZOOM.at < 1500)) {
      view.classList.remove("enter"); void view.offsetWidth; view.classList.add("enter");
      clearTimeout(route.enterT); route.enterT = setTimeout(function () { view.classList.remove("enter"); }, 900);
    }
    route.lastH = curH; route.at = Date.now();
    view.classList.toggle("back", !!(goingBack && hashChanged));
    Array.prototype.forEach.call(document.querySelectorAll(".tabs a"), function (a) {
      if (a.getAttribute("data-tab") === tabOf(tab)) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    tabInd();
    alignText(document);
    if (/^form-/.test(hsh) && !DEMO) { lsAdd(FOPEN_KEY, [hsh.slice(5)]); seenMark(hsh.slice(5)); }
    litApply(tab);
    setupFold(tab, jumpTo || (scrollDay ? "day" : null));
    setupAttCheck(); setupCal(); setupIb(); setupBadges(); setupMuscle(); setupRtEdit();
    if (after) after();
    setupFold(hsh, jumpTo);
    var flashEl = null;
    if (tab === "notice") {
      nMarkSeen();
      if (pendingNotice) {
        Array.prototype.forEach.call(document.querySelectorAll(".notice[data-nkey]"), function (el) {
          if (!flashEl && el.getAttribute("data-nkey") === pendingNotice) flashEl = el;
        });
        pendingNotice = null;
      }
    }
    navBackDraw(view);
    var jumpEl = jumpTo && document.getElementById(jumpTo);
    if (NAV_BACK || (goingBack && hashChanged && SCR[curH] != null)) {
      var by = NAV_BACK ? NAV_BACK.y : SCR[curH]; NAV_BACK = null;
      window.scrollTo(0, by); setTimeout(function () { window.scrollTo(0, by); }, 60);
    } else if (jumpEl) {
      jumpEl.scrollIntoView({ block: "start" });
    } else if (flashEl) {
      flashEl.scrollIntoView({ block: "center" });
      flashEl.classList.add("flash");
    } else if (scrollDay && wasRoutine) {
      var el = document.getElementById("day");
      if (el) el.scrollIntoView({ block: "start" });
    } else {
      window.scrollTo(0, 0);
    }
    if (ZOOM) { if (hashChanged) zoomRun(view); else ZOOM = null; }
    if (soft && hashChanged) {
      var dEl = document.getElementById("day");
      if (dEl && dEl.animate) { try { if (!matchMedia("(prefers-reduced-motion: reduce)").matches) dEl.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 280, easing: "ease-out" }); } catch (e) {} }
    }
  }
  /* vpFix(뷰포트 다시 맞추기)는 2026-11-12 뺐음 — 아이폰에서 오히려 화면이 옆으로 점점 늘어났음. 뷰포트 meta를 코드로 건드리지 말 것 */
  /* 화면 잘림 진단 (2026-11-12) — 선생님 보기에서만: 페이지 폭이 폰 화면보다 넓어지면 위에 빨간 띠로 범인 칸을 알려 줌 + 맨 아래 버전 표시 */
  function ovDiag() {
    if (!COACH_MODE || DEMO) return;
    var sw = Math.min(screen.width, screen.height) <= 500 && window.matchMedia("(orientation: portrait)").matches ? screen.width : window.innerWidth;
    var cw = document.documentElement.clientWidth, bad = [];
    Array.prototype.forEach.call(document.querySelectorAll("body *"), function (e) {
      var r = e.getBoundingClientRect(); if (!r.width || r.right <= sw + 1) return;
      var p = e.parentElement, clipped = false;
      while (p && p !== document.body) { var cs = getComputedStyle(p); if (cs.overflowX !== "visible" && p.getBoundingClientRect().right <= sw + 1) { clipped = true; break; } p = p.parentElement; }
      if (!clipped) bad.push(e);
    });
    var box = document.getElementById("ovdiag");
    if (cw <= sw + 1 && !bad.length) { if (box) box.remove(); return; }
    if (!box) { box = document.createElement("div"); box.id = "ovdiag"; box.style.cssText = "position:fixed;left:8px;right:8px;top:calc(env(safe-area-inset-top,0px) + 6px);z-index:999;background:#C9A227;color:#fff;font:700 11px/1.4 sans-serif;padding:6px 9px;border-radius:10px;word-break:break-all"; document.body.appendChild(box); box.addEventListener("click", function () { box.remove(); }); }
    box.textContent = "[선생님만 보임] 화면 넘침: 페이지 " + cw + " / 폰 " + sw + " · " + bad.slice(0, 4).map(function (e) {
      var c = typeof e.className === "string" ? e.className : (e.className && e.className.baseVal) || "";
      return e.tagName.toLowerCase() + (c ? "." + c.split(" ").join(".") : "") + "(" + Math.round(e.getBoundingClientRect().right) + ")";
    }).join(", ") + " — 이 화면 캡처해서 보내 주세요";
  }
  window.addEventListener("hashchange", function () { setTimeout(ovDiag, 900); });
  [1500, 4000, 8000].forEach(function (t) { setTimeout(ovDiag, t); });
  if (COACH_MODE && !DEMO) {
    var vm = (SCRIPT && SCRIPT.src.match(/[?&]v=(\w+)/) || [])[1] || "?";
    var vt = document.createElement("div"); vt.style.cssText = "text-align:center;font-size:10px;color:#B4B4BE;padding:4px 0 110px;white-space:pre-line"; vt.textContent = "PT노트 버전 " + vm;
    document.body.appendChild(vt);
  }
  /* 2026-11-13 "또 짤림": 본문(view)이 화면 가운데 자리에서 벗어나 있으면(오른쪽만 비거나 넘침) 남은 움직임을 지우고 다시 그리게 함.
     선생님 폰엔 맨 아래 회색 글씨로 화면 숫자를 같이 보여 줌 → 또 생기면 그 줄을 캡처해서 원인 확인 */
  var HEAL = 0;
  function viewHeal(why) {
    var v = document.getElementById("view"); if (!v) return;
    var w = document.documentElement.clientWidth, r = v.getBoundingClientRect(), vv = window.visualViewport;
    var off = r.left < -1 || r.right > w + 1 || Math.abs((w - r.right) - r.left) > 8;
    if (off) {
      HEAL++;
      try { if (v.getAnimations) v.getAnimations().forEach(function (a) { a.cancel(); }); } catch (e) {}
      v.style.transform = ""; v.style.transformOrigin = ""; v.style.clipPath = "";
      void v.offsetWidth;   /* (2026-11-14) display none 껐다 켜기는 뺌 — 아이폰에서 본문 폭이 줄어든 채 남는 원인 후보 */
    }
    if (COACH_MODE && !DEMO && vt) {
      var r2 = v.getBoundingClientRect(), tb = document.querySelector(".tabs");
      vt.textContent = "PT노트 버전 " + vm + "\n화면 " + window.innerWidth + "/" + w + "/" + screen.width + (vv ? " · 배율 " + vv.scale.toFixed(2) + " " + Math.round(vv.width) : "") +
        " · 본문 " + Math.round(r2.left) + "~" + Math.round(r2.right) + " · 아래탭 " + (tb ? Math.round(tb.getBoundingClientRect().width) : "-") + " · 고침 " + HEAL + (off ? " (" + why + ": " + Math.round(r.left) + "~" + Math.round(r.right) + ")" : "");
    }
  }
  /* ---------------- 터치해서 고치기 (2026-11-12 트레이너 "루틴이랑 식단도 그 항목 터치해서 그 부분 고치는 식으로") — 선생님 보기(CAN_EDIT)에서만
     루틴: 종목 카드를 누르면 고치기 모드로 들어가며 그 종목 고치기 창 / 제목 카드를 누르면 제목·계획 창 → 저장은 아래 "저장 · 바로 반영"(기존 그대로).
     식단: 표 식단은 보이는 글자를 누르면 식단 데이터에서 같은 글자를 찾아 그 칸만 고침(dPaths) → 창고 pub:m:<주소>:diet 에 바로 저장. 글 식단은 통째로 쓰기. */
  function dPaths(o, pre, out) {
    out = out || [];
    if (typeof o === "string" || typeof o === "number") out.push({ p: pre, v: String(o) });
    else if (o && typeof o === "object") Object.keys(o).forEach(function (k) { if (k !== "updated" && k !== "_at" && k !== "icon") dPaths(o[k], pre.concat(k), out); });
    return out;
  }
  function dSet(o, p, v) { for (var i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = typeof o[p[p.length - 1]] === "number" && v !== "" && !isNaN(+v) ? +v : v; }
  function dToday() { var t = new Date(); return t.getFullYear() + ". " + (t.getMonth() + 1) + ". " + t.getDate(); }
  function dietSave(rec, sh, okMsg) {
    var key = (sh.querySelector("#sKey") && sh.querySelector("#sKey").value || "").trim() || rtKey();
    if (!key) { var w = sh.querySelector("#sKeyWrap"); if (w) w.hidden = false; return sh.msg("선생님 열쇠를 넣어 주세요"); }
    sh.msg("저장하는 중…");
    var items = {}; items["pub:m:" + SLUG + ":diet"] = rec;
    rtPost({ a: "kv_set", key: key, items: items }).then(function (j) {
      if (!j || !j.ok) { rtErr(j, sh); return; }
      try { localStorage.setItem("ptkey", key); if (rec) localStorage.setItem(DIET_LS, JSON.stringify(rec)); else localStorage.removeItem(DIET_LS); } catch (x) {}
      DIET_REC = rec && dietApply(rec) ? rec : (dietApply(null), null);
      sh.close(); rerender(); attToast(okMsg || "저장했어요 · 회원님 노트에 바로 보여요");
    }).catch(function () { sh.msg(rtNetMsg()); });
  }
  var KEYF = function () { return '<label id="sKeyWrap"' + (rtKey() ? ' hidden' : '') + '>선생님 열쇠 <small>처음 한 번만</small><input id="sKey" type="password" autocomplete="off"></label>'; };
  document.addEventListener("click", function (e) {
    if (!CAN_EDIT || !e.target.closest) return;
    var tab = view.getAttribute("data-tab");
    if (e.target.closest(".rtsheet, .rtsheet-bg, .tabs, .bar")) return;
    /* 루틴 */
    if (tab === "routine" && M.routine) {
      if (e.target.closest("a, button, [data-rt], input, select, textarea")) return;
      var ex = e.target.closest(".ex[data-exi]"), dk = view.getAttribute("data-day");
      var cd = !ex && e.target.closest("[data-cardio]");
      var hero = !ex && !cd && e.target.closest("#view > .hero");
      if (!ex && !hero && !cd) return;
      var auto = !RT_EDIT;
      if (auto) { RT_EDIT = { saved: clone(M.routine), dirty: 0 }; rerender(); }
      if (ex && dk) rtItemSheet(dk, +ex.getAttribute("data-exi"));
      else if (cd) rtCardioSheet(dk);
      else if (hero) rtInfoSheet();
      if (auto && window.MutationObserver) {   /* 눌러서 열었는데 아무것도 안 고치고 닫으면 고치기 모드도 같이 끝냄 */
        var mo = new MutationObserver(function () {
          if (document.querySelector(".rtsheet-bg")) return;
          mo.disconnect();
          if (RT_EDIT && !RT_EDIT.dirty) { RT_EDIT = null; rerender(); }
        });
        mo.observe(document.body, { childList: true });
      }
      return;
    }
    /* 식단 */
    if (tab !== "diet") return;
    var dt = e.target.closest("[data-dt]");
    if (dt) {
      var act = dt.getAttribute("data-dt");
      if (act === "reset") {
        var sr = rtSheet("처음 식단으로", '<p style="margin:0">폰에서 고친 식단을 지우고 처음(Claude가 올린) 식단으로 돌릴까요?</p>' + KEYF(), function (sh) { dietSave(null, sh, "처음 식단으로 돌렸어요"); return true; }, "돌리기");
        return;
      }
      var cur = DIET_REC && typeof DIET_REC.text === "string" ? DIET_REC.text : (typeof DIET_ORIG === "string" ? DIET_ORIG.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "") : "");
      rtSheet("식단 글로 쓰기", '<label>회원님 식단 탭에 그대로 보여요 <small>줄바꿈 그대로</small><textarea id="dtIn" rows="10" maxlength="3000" placeholder="예)\n아침: 오트밀 50g + 프로틴\n점심: 일반식 (밥 반 공기)\n저녁: 닭가슴살 150g + 고구마 1개\n물 2L 이상">' + esc(cur) + '</textarea></label>' + KEYF(),
        function (sh) { dietSave({ base: DIET_BASE, text: sh.querySelector("#dtIn").value.trim(), at: Date.now() }, sh); return true; }, "저장 · 바로 반영");
      return;
    }
    var D = M.diet;
    if (!D || typeof D !== "object" || e.target.closest("a, button, input, .dtbar")) return;
    var all = dPaths(D, []), hit = null, el = e.target;
    for (var up = 0; up < 4 && el && el !== view && !hit; up++, el = el.parentElement) {
      var t = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (!t || t.length > 400) continue;
      for (var q = 0; q < all.length; q++) if (all[q].v.replace(/\s+/g, " ").trim() === t) { hit = all[q]; break; }
    }
    if (!hit) { attToast("이 부분은 여기서 못 고쳐요 · Claude에게 말해 주세요"); return; }
    var same = all.filter(function (x) { return x.v === hit.v; }).length;
    var lab = { title: "제목", title_en: "영어 제목", key_point: "KEY POINT", name: "이름", amount: "양", line1: "첫 줄", line2: "둘째 줄", line3: "셋째 줄", desc: "설명", label: "항목", value: "숫자", unit: "단위", sub: "작은 글씨", tag: "꼬리표", chip: "꼬리표", safety: "주의", no: "끼니", note: "메모" }[hit.p[hit.p.length - 1]] || "내용";
    rtSheet("식단 고치기 · " + lab,
      '<label>' + esc(lab) + (same > 1 ? ' <small>같은 글자 ' + same + '곳이 한꺼번에 바뀌어요</small>' : '') + '<textarea id="dtIn" rows="' + (hit.v.length > 40 ? 4 : 2) + '" maxlength="600">' + esc(hit.v) + '</textarea></label>' + KEYF(),
      function (sh) {
        var v = sh.querySelector("#dtIn").value.trim();
        var nd = clone(M.diet);
        dPaths(nd, []).forEach(function (x) { if (x.v === hit.v) dSet(nd, x.p, v); });
        nd.updated = dToday(); nd._at = Date.now();
        dietSave({ base: DIET_BASE, diet: nd, at: Date.now() }, sh); return true;
      }, "저장 · 바로 반영");
    var ta = document.getElementById("dtIn"); if (ta) { ta.focus(); ta.select(); }
  });

  /* ---------------- 복습지 사진·영상 올리기 (선생님 보기) */
  function fmSaveKv(items, key) { return rtPost({ a: "kv_set", key: key, items: items }); }
  /* 영상 자동으로 줄이기 (2026-11-12 "영상 올리면 알아서 크기 맞추고") — 폰 브라우저에서 영상을 한 번 재생하면서 긴 쪽 960px · 초당 30장 · 소리 없이 다시 녹화(MediaRecorder).
     줄인 게 더 크거나 이 브라우저가 못 하면 원본 그대로. 시간 = 영상 길이만큼. 결과: mp4(아이폰·최신 크롬) 또는 webm */
  function fmShrink(file, prog) {
    return new Promise(function (ok, bad) {
      var cand = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"], mt = "";
      if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return bad("nosupport");
      for (var i = 0; i < cand.length; i++) if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(cand[i])) { mt = cand[i]; break; }
      if (!mt) return bad("nosupport");
      var v = document.createElement("video"), url = URL.createObjectURL(file);
      v.muted = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", ""); v.preload = "auto";
      v.style.cssText = "position:fixed;left:0;bottom:0;width:2px;height:2px;opacity:.01;pointer-events:none;z-index:-1";
      document.body.appendChild(v);
      function clean() { try { v.pause(); } catch (e) {} v.remove(); URL.revokeObjectURL(url); }
      v.onerror = function () { clean(); bad("open"); };
      v.onloadedmetadata = function () {
        if (!v.videoWidth || !isFinite(v.duration)) { clean(); return bad("open"); }
        if (v.duration > 120) { clean(); return bad("long"); }
        var k = Math.min(1, 960 / Math.max(v.videoWidth, v.videoHeight)), c = document.createElement("canvas");
        c.width = Math.round(v.videoWidth * k / 2) * 2; c.height = Math.round(v.videoHeight * k / 2) * 2;
        var g = c.getContext("2d"), st = c.captureStream(30), chunks = [], rec;
        try { rec = new MediaRecorder(st, { mimeType: mt, videoBitsPerSecond: 1600000 }); } catch (e) { clean(); return bad("nosupport"); }
        rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = function () { clean(); var b = new Blob(chunks, { type: mt.split(";")[0] }); b.size > 1000 ? ok(b) : bad("empty"); };
        var raf = window.requestVideoFrameCallback ? function (f) { v.requestVideoFrameCallback(f); } : function (f) { requestAnimationFrame(f); };
        function draw() { if (v.ended || rec.state !== "recording") return; g.drawImage(v, 0, 0, c.width, c.height); prog && prog(v.currentTime, v.duration); raf(draw); }
        v.onended = function () { g.drawImage(v, 0, 0, c.width, c.height); setTimeout(function () { if (rec.state === "recording") rec.stop(); }, 150); };
        v.currentTime = 0;
        var p = v.play();
        (p && p.then ? p : Promise.resolve()).then(function () { rec.start(500); raf(draw); }).catch(function () { clean(); bad("play"); });
      };
      v.src = url;
    });
  }
  function fmB64(file, cb, err) {
    if (/^image\//.test(file.type) && !/gif$/.test(file.type)) {   /* 사진은 긴 쪽 1600px JPEG로 줄여서 */
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        cb(c.toDataURL("image/jpeg", 0.85).split(",")[1], "image/jpeg");
      };
      img.onerror = function () { err("사진을 열 수 없어요"); }; img.src = url; return;
    }
    var r = new FileReader();
    r.onload = function () { cb(String(r.result).split(",")[1], file.type || "video/mp4"); };
    r.onerror = function () { err("파일을 읽을 수 없어요"); };
    r.readAsDataURL(file);
  }
  document.addEventListener("click", function (e) {
    if (!CAN_EDIT || !e.target.closest) return;
    var fx = e.target.closest("[data-fx]"), add = e.target.closest("[data-fmadd]"), del = e.target.closest("[data-fmdel]");
    if (!fx && !add && !del) return;
    if (fx) {
      var act = fx.getAttribute("data-fx"), id = fx.getAttribute("data-id"), cur = null;
      FX.forEach(function (x) { if (x.id === id) cur = x; });
      if (act === "del") {
        if (!fx.classList.contains("sure")) { fx.classList.add("sure"); fx.textContent = "한 번 더 누르면 지워져요"; return; }
        var nfx = FX.filter(function (x) { return x.id !== id; }), nfm = clone(FMEDIA); var gone = nfm[id] || []; delete nfm[id];
        var it = {}; it["pub:m:" + SLUG + ":fx"] = nfx; it["pub:m:" + SLUG + ":fmedia"] = nfm;
        fmSaveKv(it, rtKey()).then(function (j) {
          if (!j || !j.ok) { attToast("저장이 안 됐어요 — 선생님 열쇠·인터넷을 확인해 주세요"); return; }
          gone.forEach(function (x) { rtPost({ a: "media_del", key: rtKey(), id: x.id }).catch(function () {}); });
          try { localStorage.setItem(FX_LS, JSON.stringify(nfx)); localStorage.setItem(FM_LS, JSON.stringify(nfm)); } catch (x) {}
          FMEDIA = nfm; fxApply(nfx); location.hash = "#forms"; attToast("지웠어요");
        }).catch(function () { attToast(rtNetMsg()); });
        return;
      }
      rtSheet(cur ? "복습지 이름 · 메모" : "사진·영상 복습지 만들기",
        '<label>운동 이름<input id="fxN" maxlength="40" placeholder="예: 스미스 스쿼트" value="' + esc(cur ? cur.exercise : "") + '" autocomplete="off"></label>' +
        '<label>부위 <small>없어도 돼요</small><input id="fxP" maxlength="20" placeholder="예: 하체" value="' + esc(cur ? cur.part || "" : "") + '" autocomplete="off"></label>' +
        '<label>메모 <small>KEY POINT 칸에 보여요 · 없어도 돼요</small><textarea id="fxM" rows="3" maxlength="400" placeholder="예: 무릎이 발끝 방향으로, 내려갈 때 3초">' + esc(cur ? cur.note || "" : "") + '</textarea></label>' + KEYF(),
        function (sh) {
          var n = sh.querySelector("#fxN").value.trim(); if (!n) return "운동 이름을 넣어 주세요";
          var key = (sh.querySelector("#sKey").value || "").trim() || rtKey(); if (!key) { sh.querySelector("#sKeyWrap").hidden = false; return "선생님 열쇠를 넣어 주세요"; }
          var nfx = FX.map(function (x) { return x; }), rec;
          if (cur) { rec = {}; for (var k in cur) rec[k] = cur[k]; nfx = nfx.map(function (x) { return x.id === cur.id ? rec : x; }); }
          else { rec = { id: "x" + Date.now().toString(36), date: dToday() }; nfx.unshift(rec); }
          rec.exercise = n; rec.part = sh.querySelector("#fxP").value.trim(); rec.note = sh.querySelector("#fxM").value.trim();
          var it = {}; it["pub:m:" + SLUG + ":fx"] = nfx;
          sh.msg("저장하는 중…");
          fmSaveKv(it, key).then(function (j) {
            if (!j || !j.ok) { rtErr(j, sh); return; }
            try { localStorage.setItem("ptkey", key); localStorage.setItem(FX_LS, JSON.stringify(nfx)); } catch (x) {}
            fxApply(nfx); sh.close();
            if (location.hash === "#form-" + rec.id) rerender(); else location.hash = "#form-" + rec.id;
            if (!cur) attToast("복습지를 만들었어요 · 이제 사진·영상을 올려요");
          }).catch(function () { sh.msg(rtNetMsg()); });
          return true;
        }, cur ? "저장" : "만들기");
      return;
    }
    var fidEl = add || del, fid = add ? add.getAttribute("data-fmadd") : (location.hash.match(/^#form-(.+)$/) || [])[1];
    if (!fid) return;
    if (del) {
      if (!del.classList.contains("sure")) { del.classList.add("sure"); del.textContent = "한 번 더"; return; }
      var i = +del.getAttribute("data-fmdel"), nfm2 = clone(FMEDIA), L = (nfm2[fid] || []).slice(), x = L.splice(i, 1)[0];
      nfm2[fid] = L; if (!L.length) delete nfm2[fid];
      var it2 = {}; it2["pub:m:" + SLUG + ":fmedia"] = nfm2;
      fmSaveKv(it2, rtKey()).then(function (j) {
        if (!j || !j.ok) { attToast("저장이 안 됐어요 — 선생님 열쇠·인터넷을 확인해 주세요"); return; }
        if (x) rtPost({ a: "media_del", key: rtKey(), id: x.id }).catch(function () {});
        try { localStorage.setItem(FM_LS, JSON.stringify(nfm2)); } catch (y) {}
        FMEDIA = nfm2; rerender(); attToast("지웠어요");
      }).catch(function () { attToast(rtNetMsg()); });
      return;
    }
    rtSheet("사진 · 영상 올리기",
      '<label class="fmpick"><input type="file" id="fmFile" accept="image/*,video/*"><span>📷 사진 · 영상 고르기 <small>찍거나 앨범에서 · 큰 영상은 자동으로 줄여서 올려요 (2분 이하)</small></span></label>' +
      '<p class="fmname" id="fmName"></p>' +
      '<label>설명 <small>없어도 돼요 · 사진 아래 작은 글씨</small><input id="fmCap" maxlength="80" placeholder="예: 내려갈 때 무릎 방향 체크" autocomplete="off"></label>' + KEYF(),
      function (sh) {
        var f = sh.querySelector("#fmFile").files[0];
        if (!f) return "사진이나 영상을 골라 주세요";
        if (!/^(image|video)\//.test(f.type)) return "사진이나 영상만 올릴 수 있어요";
        if (/^video\//.test(f.type) && f.size > 600 * 1024 * 1024) return "영상이 너무 커요 (" + Math.round(f.size / 1048576) + "MB) — 2분 이하로 잘라서 올려 주세요";
        var key = (sh.querySelector("#sKey").value || "").trim() || rtKey(); if (!key) { sh.querySelector("#sKeyWrap").hidden = false; return "선생님 열쇠를 넣어 주세요"; }
        var cap = sh.querySelector("#fmCap").value.trim(), isV = /^video\//.test(f.type);
        sh.querySelector("[data-ok]").disabled = true;
        var LIM = 35 * 1024 * 1024;
        function go(file) {
          sh.msg(isV ? "영상 올리는 중… (" + (file.size / 1048576).toFixed(1) + "MB · 30초~1분)" : "사진 올리는 중…");
          upload(file);
        }
        if (isV && (f.size > 6 * 1024 * 1024)) {
          sh.msg("영상 크기 맞추는 중… 화면을 켜 둔 채 기다려 주세요");
          fmShrink(f, function (t, d) { sh.msg("영상 크기 맞추는 중… " + Math.floor(t) + " / " + Math.round(d) + "초 (화면을 켜 둔 채 기다려 주세요)"); })
            .then(function (b) {
              var use = b.size < f.size ? b : f;
              if (use.size > LIM) { sh.querySelector("[data-ok]").disabled = false; return sh.msg("줄여도 너무 커요 (" + Math.round(use.size / 1048576) + "MB) — 영상을 짧게 잘라서 올려 주세요"); }
              go(use === f ? f : new File([b], "form." + (b.type.indexOf("mp4") > -1 ? "mp4" : "webm"), { type: b.type }));
            })
            .catch(function (why) {
              if (why === "long") { sh.querySelector("[data-ok]").disabled = false; return sh.msg("2분이 넘는 영상은 잘라서 올려 주세요"); }
              if (f.size > LIM) { sh.querySelector("[data-ok]").disabled = false; return sh.msg("이 브라우저에선 영상을 줄일 수 없어요 (" + Math.round(f.size / 1048576) + "MB) — 30초 이하로 잘라 올리거나, Claude에게 영상을 보내 주세요"); }
              go(f);
            });
          return true;
        }
        go(f);
        return true;
        function upload(f) {
        fmB64(f, function (b64, mime) {
          fetch(ATT_API, { method: "POST", body: JSON.stringify({ a: "media_add", m: SLUG, key: key, data: b64, mime: mime, name: f.name }) })
            .then(function (r) { return r.json(); }).then(function (j) {
              if (!j || !j.ok) {
                sh.querySelector("[data-ok]").disabled = false;
                if (j && j.error === "action") return sh.msg("창고(Apps Script)를 새 버전으로 다시 배포해야 올릴 수 있어요 — Claude에게 '창고 배포해줘'라고 말해 주세요");
                return rtErr(j, sh);
              }
              var nfm = clone(FMEDIA); (nfm[fid] = nfm[fid] || []).push({ id: j.id, t: isV ? "vid" : "img", cap: cap, at: Date.now() });
              var it = {}; it["pub:m:" + SLUG + ":fmedia"] = nfm;
              return fmSaveKv(it, key).then(function (j2) {
                sh.querySelector("[data-ok]").disabled = false;
                if (!j2 || !j2.ok) return rtErr(j2, sh);
                try { localStorage.setItem("ptkey", key); localStorage.setItem(FM_LS, JSON.stringify(nfm)); } catch (y) {}
                FMEDIA = nfm; sh.close(); rerender(); attToast(isV ? "영상을 올렸어요 · 몇 분 뒤부터 재생돼요" : "사진을 올렸어요");
              });
            }).catch(function () { sh.querySelector("[data-ok]").disabled = false; sh.msg(rtNetMsg()); });
        }, function (m) { sh.querySelector("[data-ok]").disabled = false; sh.msg(m); });
        }
      }, "올리기");
    var fi = document.getElementById("fmFile");
    if (fi) fi.addEventListener("change", function () { var f = fi.files[0]; document.getElementById("fmName").textContent = f ? "고른 파일: " + f.name + " (" + (f.size / 1048576).toFixed(1) + "MB)" : ""; });
  });

  window.addEventListener("hashchange", function () { setTimeout(function () { viewHeal("주소"); }, 700); });
  window.addEventListener("pageshow", function () { setTimeout(function () { viewHeal("열기"); }, 300); });
  window.addEventListener("resize", function () { viewHeal("크기"); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) setTimeout(function () { viewHeal("돌아옴"); }, 300); });
  [800, 2500].forEach(function (t) { setTimeout(function () { viewHeal("처음"); }, t); });
  /* 가볍게 (2026-11-17 팀장 "홈페이지·핸드폰 전체가 렉"): 화면 밖으로 나간 칸의 움직임(CSS 애니메이션·움직이는 SVG 아이콘)은 멈추고,
     앱을 안 보고 있을 땐(다른 앱·화면 꺼짐) 전부 멈춤 → 폰 그래픽 부담·배터리 줄임. 보이면 다시 움직임. */
  (function () {
    if (!window.IntersectionObserver) return;
    function svgs(el, on) { Array.prototype.forEach.call(el.querySelectorAll("svg"), function (g) { try { on ? g.unpauseAnimations() : g.pauseAnimations(); } catch (e) {} }); }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var on = e.isIntersecting; e.target.classList.toggle("offv", !on); svgs(e.target, on); });
    }, { rootMargin: "120px 0px" });
    function watch() { Array.prototype.forEach.call(view.children, function (c) { if (!c.__io) { c.__io = 1; io.observe(c); } }); }
    new MutationObserver(watch).observe(view, { childList: true }); watch();
    document.addEventListener("visibilitychange", function () {
      document.documentElement.classList.toggle("hid", document.hidden);
      svgs(document, !document.hidden);
    });
  })();
  window.addEventListener("hashchange", function () { route(); tourMaybe(); });
  route(); tourMaybe();
  cmemoFill();
  (function () {   /* 로딩 화면 걷기 — 앱 아이콘으로 열었을 때 0.6초는 보이게, 그 밖(아이패드 칸 안·안내서 데모)은 바로 */
    var t0 = (window.performance && performance.timing && performance.timing.navigationStart) || Date.now();
    var wait = window.self !== window.top || DEMO ? 0 : Math.max(0, 350 - (Date.now() - t0));   /* 2026-11-17 "렉" — 로딩 화면 최소 1초 → 0.35초 */
    setTimeout(function () { document.body.classList.add("ready"); }, wait);
  })();
  nDot();
  if (!DEMO) setTimeout(showNoticePop, 800);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { alignText(document); });
  if (!window.EXI) {   /* 옛 껍데기(index.html에 exicons.js 줄이 없는 회원)도 움직이는 아이콘이 나오게 */
    var exs = document.createElement("script"); exs.src = BASE + "exicons.js"; exs.onload = function () { route(); }; document.head.appendChild(exs);
  }
  attSync(); ibSync();
  if (!ATT_API) setTimeout(badgeCheck, 1500);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { attSync(); ibSync(); } });
  window.addEventListener("load", function () { alignText(document); });
})();
