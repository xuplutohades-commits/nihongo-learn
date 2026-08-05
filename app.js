/* =========================================================
   一个月学会基础日语 · SPA 前端逻辑
   时序安全: 等待 window.NihongoData 就绪后渲染
   ========================================================= */

(function () {
  "use strict";

  /* ---------- 时序安全: 数据就绪回调 ---------- */
  function whenDataReady(cb) {
    if (window.NihongoData) { cb(); }
    else {
      (window.__nihongoReadyQueue = window.__nihongoReadyQueue || []).push(cb);
    }
  }

  /* ---------- 发音封装 ---------- */
  function speak(text) {
    if (!text) return;
    if (typeof window.speakJapanese === "function") {
      try { window.speakJapanese(text); } catch (e) { console.warn("speakJapanese 调用失败", e); }
    } else {
      console.warn("speakJapanese 未定义，无法发音:", text);
    }
  }

  /* ---------- 进度存取：优先账号层(云端/游客)，本地兜底 ----------
     通过 window.Account 委托；SDK 未配置/未加载时自动回落 localStorage。
     ------------------------------------------------------------ */
  const DONE_PREFIX = "nihongo_";
  function keyFor(day) { return DONE_PREFIX + "done_" + day; }
  function isDone(day) {
    if (window.Account && window.Account.getDone) {
      try { return window.Account.getDone(day); } catch (e) {}
    }
    return localStorage.getItem(keyFor(day)) === "1";
  }
  function setDone(day, val) {
    if (window.Account && window.Account.setDone) {
      try { window.Account.setDone(day, val); return; } catch (e) {}
    }
    if (val) localStorage.setItem(keyFor(day), "1");
    else localStorage.removeItem(keyFor(day));
  }
  function completedDays() {
    const days = window.NihongoData.days;
    return days.filter(d => isDone(d.day)).map(d => d.day);
  }
  /* 连胜(自今天起连续完成天数) */
  function streakCount() {
    let streak = 0;
    const total = window.NihongoData.days.length;
    for (let i = total; i >= 1; i--) {
      if (isDone(i)) streak++; else break;
    }
    return streak;
  }
  /* 已背词汇数: 已完成天数的 vocab 总和 + phrases */
  function memorizedWordCount() {
    const done = completedDays();
    let count = 0;
    window.NihongoData.days.forEach(d => {
      if (done.includes(d.day)) count += (d.vocab || []).length;
    });
    if (window.NihongoData.phrases) count += window.NihongoData.phrases.length;
    return count;
  }

  /* ---------- 应用状态 ---------- */
  const state = {
    currentDay: 1,      // 今日学习当前显示第几天
    currentPage: "home",
    kanaShow: { hiragana: true, katakana: true, romaji: true },
    quiz: null,         // 五十音测验状态
  };

  /* ---------- HTML 转义 ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  /* ---------- DOM 引用 ---------- */
  const $ = sel => document.querySelector(sel);
  const main = $("#main");
  const pageEls = {};
  document.querySelectorAll(".page").forEach(p => { pageEls[p.dataset.page] = p; });
  const navLinks = document.querySelectorAll(".nav-link");
  const navToggle = $("#navToggle");
  const navLinksEl = $("#navLinks");

  /* ---------- 导航 ---------- */
  function showPage(name) {
    state.currentPage = name;
    Object.keys(pageEls).forEach(k => {
      pageEls[k].classList.toggle("active", k === name);
    });
    navLinks.forEach(link => {
      link.classList.toggle("active", link.dataset.nav === name);
    });
    navLinksEl.classList.remove("open");
    navToggle.classList.remove("open");
    document.body.scrollIntoView({ behavior: "smooth", block: "start" });
    // 渲染对应页面
    const renderers = {
      home: renderHome, today: renderToday, kana: renderKana,
      vocab: renderVocab, grammar: renderGrammar, phrases: renderPhrases, progress: renderProgress
    };
    if (renderers[name]) renderers[name]();
  }

  function bindNav() {
    document.querySelectorAll(".nav-link, [data-nav]").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        const page = el.dataset.nav;
        if (page) showPage(page);
      });
    });
    navToggle.addEventListener("click", () => {
      const open = navLinksEl.classList.toggle("open");
      navToggle.classList.toggle("open", open);
    });
    document.getElementById("mainNav").addEventListener("click", e => {
      const el = e.target.closest("[data-nav]");
      if (el) { e.preventDefault(); if (el.dataset.nav) showPage(el.dataset.nav); }
    });
  }

  /* ---------- 通用小块 ---------- */
  function speakBtn(text) {
    return `<button class="speak-btn" data-speak="${esc(text)}" title="发音">♪</button>`;
  }
  function bindSpeak(scope) {
    scope.querySelectorAll("[data-speak]").forEach(b => {
      b.addEventListener("click", e => { e.stopPropagation(); speak(b.dataset.speak); });
    });
  }

  /* =========================================================
     首页 Dashboard
     ========================================================= */
  function renderHome() {
    const el = pageEls.home;
    const meta = window.NihongoData.meta || {};
    const total = meta.totalDays || (window.NihongoData.days || []).length;
    const done = completedDays();
    const rate = total ? Math.round(done.length / total * 100) : 0;

    let grid = window.NihongoData.days.map(d => {
      const cls = ["day-cell"];
      if (isDone(d.day)) cls.push("done");
      if (d.day === state.currentDay) cls.push("current");
      return `<div class="${cls.join(" ")}" data-day="${d.day}" title="${esc(d.title)}">
        <div class="dnum">${d.day}</div><div class="dtitle">${esc(d.title)}</div>
      </div>`;
    }).join("");

    el.innerHTML = `
      <div class="hero">
        <div class="eyebrow" style="color:rgba(255,255,255,0.75)">Month of Japanese</div>
        <h1 class="hero-title">${esc(meta.title || "一个月学会基础日语")}</h1>
        <div class="hero-sub">根性で、一ヶ月。</div>
        <p class="hero-intro">${esc(meta.intro || "每天一课，从五十音到日常会话，用三十天打好基础日语。")}</p>
        <div class="hero-actions">
          <button class="btn" id="btnStartToday">开始今天学习 →</button>
        </div>
      </div>

      <div class="overview-strip">
        <div class="overview-item"><div class="num">${total}</div><div class="label">总天数</div></div>
        <div class="overview-item"><div class="num">${done.length}</div><div class="label">已完成</div></div>
        <div class="overview-item"><div class="num">${rate}%</div><div class="label">完成率</div></div>
        <div class="overview-item"><div class="num">${memorizedWordCount()}</div><div class="label">已背词数</div></div>
        <div class="overview-item"><div class="num">${streakCount()}</div><div class="label">连胜天数</div></div>
      </div>

      <div class="card">
        <div class="card-head">
          <div class="card-title">📚 三十天课程</div>
          <button class="btn btn-sm btn-ghost" data-nav="progress">查看进度</button>
        </div>
        <div class="days-grid">${grid}</div>
      </div>
    `;

    const btnStart = el.querySelector("#btnStartToday");
    if (btnStart) {
      btnStart.addEventListener("click", () => {
        const startDay = done.length ? done.length + 1 : 1;
        state.currentDay = Math.min(startDay, total);
        showPage("today");
      });
    }
    bindDayCells(el);
  }

  function bindDayCells(scope) {
    scope.querySelectorAll("[data-day]").forEach(cell => {
      cell.addEventListener("click", () => {
        state.currentDay = parseInt(cell.dataset.day, 10);
        showPage("today");
      });
    });
  }

  /* =========================================================
     今日学习
     ========================================================= */
  function renderToday() {
    const el = pageEls.today;
    const days = window.NihongoData.days;
    if (!days.length) { el.innerHTML = `<div class="empty-state">暂无课程数据</div>`; return; }
    const day = days[state.currentDay - 1] || days[0];
    const dayNum = day.day;
    const total = window.NihongoData.meta.totalDays || days.length;
    const done = isDone(dayNum);

    let points = (day.points || []).map(p => `<li>${esc(p)}</li>`).join("");

    let vocab = (day.vocab || []).map((v, i) => `
      <div class="card vocab-card hoverable" data-vindex="${i}">
        <div class="vocab-front">
          <div class="vocab-ja">${speakBtn(v.ja)} ${esc(v.ja)}</div>
          <div class="vocab-romaji">${esc(v.kana || "")} · ${esc(v.romaji || "")}</div>
          <div class="hint">点击卡片查看中文</div>
        </div>
        <div class="vocab-back">
          <div class="vocab-zh">${esc(v.zh || "")}</div>
          ${v.example ? `<div class="vocab-example">${exec(v)}</div><div class="vocab-example-zh">${esc(v.exampleZh || "")}</div>` : ""}
        </div>
      </div>
    `).join("");

    let grammar = (day.grammar || []).map(g => `
      <div class="grammar-block">
        <div class="card-title" style="font-family:var(--font-jp)">${esc(g.title || "")}</div>
        ${g.pattern ? `<div class="pattern">${esc(g.pattern)}</div>` : ""}
        ${g.explain ? `<div class="explain">${esc(g.explain)}</div>` : ""}
        ${g.example ? `<div class="eg">${speakBtn(g.example)} ${esc(g.example)}</div><div class="eg-zh">${esc(g.exampleZh || "")}</div>` : ""}
      </div>
    `).join("");

    let sentences = (day.sentences || []).map(s => {
      const text = typeof s === "string" ? s : (s.ja || s.text || "");
      const zh = typeof s === "string" ? "" : (s.zh || "");
      const kana = typeof s === "string" ? "" : (s.kana || "");
      return `<div class="sentence-item">${speakBtn(text)} <span>${esc(text)}${kana ? ` <span class="kana">${esc(kana)}</span>` : ""}</span>${zh ? `<span class="zh">${esc(zh)}</span>` : ""}</div>`;
    }).join("");

    let todos = (day.todos || []).map((t, i) => `
      <label class="todo-item"><input type="checkbox" data-todo="${i}"> <span>${esc(t)}</span></label>
    `).join("");

    el.innerHTML = `
      <div class="today-nav">
        <button class="btn btn-ghost btn-sm nav-btn" id="prevDay">← 第${dayNum - 1}天</button>
        <div class="day-heading">
          <h1>第${dayNum}天 · ${esc(day.title)}</h1>
          <div class="sub">${day.story ? "📖 本篇为语境故事章节" : ""}</div>
        </div>
        <button class="btn btn-ghost btn-sm nav-btn" id="nextDay">第${dayNum + 1}天 →</button>
      </div>

      ${done ? `<div class="done-banner">🎉 本日已完成，辛苦了！</div>` : ""}

      <button class="btn ${done ? "btn-ghost" : "btn-success"}" id="btnDone" style="margin-bottom:var(--sp-4)">
        ${done ? "取消完成" : "✓ 标记本日完成"}
      </button>

      ${points ? `<div class="card"><div class="card-title">🎯 今日要点</div><ul class="points-list">${points}</ul></div>` : ""}

      ${vocab ? `<div class="card" id="vocabCard"><div class="card-head"><div class="card-title">🗣 生词</div><span class="tag" style="background:var(--c-primary-tint);color:var(--c-primary)">${(day.vocab||[]).length} 词</span></div>
        <div class="vocab-cards" id="vocabCards">${vocab}</div><div class="hint" style="margin-top:var(--sp-3)">提示: 点击词汇卡或按空格键翻卡</div>
      </div>` : ""}

      ${grammar ? `<div class="card"><div class="card-title">📐 语法</div><div style="display:flex;flex-direction:column;gap:var(--sp-3)">${grammar}</div></div>` : ""}

      ${sentences ? `<div class="card"><div class="card-title">📌 必背句</div>${sentences}</div>` : ""}

      ${todos ? `<div class="card" id="todosCard"><div class="card-title">✅ 今日待办</div>${todos}</div>` : ""}

      <div style="margin-top:var(--sp-5)">
        <button class="btn btn-ghost" data-nav="home">← 返回首页</button>
      </div>
    `;

    bindSpeak(el);

    const btnDoneEl = el.querySelector("#btnDone");
    btnDoneEl.addEventListener("click", () => {
      setDone(dayNum, !isDone(dayNum));
      renderToday();
    });

    const prevBtn = el.querySelector("#prevDay");
    const nextBtn = el.querySelector("#nextDay");
    if (dayNum > 1) prevBtn.onclick = () => { state.currentDay--; renderToday(); };
    else prevBtn.disabled = true;
    if (dayNum < total) nextBtn.onclick = () => { state.currentDay++; renderToday(); };
    else nextBtn.disabled = true;

    if (vocab) {
      const vocabCards = el.querySelector("#vocabCards");
      vocabCards.addEventListener("click", e => {
        const card = e.target.closest(".vocab-card");
        if (card) card.classList.toggle("flipped");
      });
      state.flippedVocabCards = [];
    }

    if (todos) {
      el.querySelectorAll("[data-todo]").forEach(cb => {
        cb.addEventListener("change", () => {
          const v = el.querySelector("#todosCard");
          // 无需持久化待办，仅即时交互
        });
      });
    }

    bindDayCells(el);
  }

  function exec(v) { return `${esc(v.example)}`; }

  /* =========================================================
     五十音
     ========================================================= */
  const KANA_TIMES = { "hiragana": "平", "katakana": "片" };

  function renderKana() {
    const el = pageEls.kana;
    const table = window.NihongoData.kanaTable || [];
    const groups = {};
    table.forEach(k => {
      (groups[k.type] = groups[k.type] || []).push(k);
    });

    const typeLabels = { hiragana: "平假名", katakana: "片假名" };

    const showK = state.kanaShow.hiragana && state.kanaShow.katakana;
    const showH = state.kanaShow.hiragana;
    const showKt = state.kanaShow.katakana;
    const showR = state.kanaShow.romaji;

    let groupHtml = Object.keys(groups).map(type => {
      const items = groups[type];
      const showThis = type === "hiragana" ? showH : (type === "katakana" ? showKt : true);
      if (!showThis) return "";
      const cells = items.map(k => {
        let html = `<div class="kana-cell" data-k="<span>${esc(k.h)}</span>${esc(k.k)}" data-r="${esc(k.r)}" data-h="${esc(k.h)}" data-kk="${esc(k.k)}">`;
        // 显示假名: 平/片取各自 —— 展示该组自己的假名
        const char = type === "hiragana" ? k.h : k.k;
        html = `<div class="kana-cell clickable-kana" data-type="${esc(type)}" data-h="${esc(k.h)}" data-k="${esc(k.k)}" data-r="${esc(k.r)}">`;
        html += `<div class="k">${esc(char)}</div>`;
        if (showR) html += `<div class="r">${esc(k.r)}</div>`;
        // 若两种假名都显示，则给出对应的另一种假名小字
        if (showK && type === "hiragana") html += `<div class="h">${esc(k.k)}</div>`;
        if (showK && type === "katakana") html += `<div class="h">${esc(k.h)}</div>`;
        html += `</div>`;
        return html;
      }).join("");
      return `<div class="kana-group"><div class="kana-group-title">${esc(typeLabels[type] || type)} <span class="jp">${type === "hiragana" ? "ひらがな" : "カタカナ"}</span></div><div class="kana-grid">${cells}</div></div>`;
    }).join("");

    el.innerHTML = `
      <div class="page-head">
        <div class="eyebrow">Kana</div>
        <h1 class="page-title">五十音图</h1>
        <p class="page-desc">平假名 · 片假名 · 罗马音，点击即可发音，点击假名开始随机测验。</p>
      </div>

      <div class="kana-toolbar">
        <div class="toggle-group">
          <button class="tgl ${state.kanaShow.hiragana ? "on" : ""}" data-tgl="hiragana">平假名</button>
          <button class="tgl ${state.kanaShow.katakana ? "on" : ""}" data-tgl="katakana">片假名</button>
          <button class="tgl ${state.kanaShow.romaji ? "on" : ""}" data-tgl="romaji">罗马音</button>
        </div>
        <button class="btn btn-primary btn-sm" id="btnQuiz">随机测验</button>
      </div>

      <div id="quizArea"></div>

      ${groupHtml}
    `;

    el.querySelectorAll("[data-tgl]").forEach(t => {
      t.addEventListener("click", () => {
        const k = t.dataset.tgl;
        state.kanaShow[k] = !state.kanaShow[k];
        renderKana();
      });
    });

    el.querySelector("#btnQuiz").addEventListener("click", () => startQuiz(el));

    // 点击某个假名单元格开始测验，提示为该假名
    el.querySelectorAll(".clickable-kana").forEach(cell => {
      cell.addEventListener("click", () => {
        startQuizAt(el, cell.dataset.r);
      });
    });
    bindSpeak(el);
  }

  /* 随机测验: 给罗马音，选对应假名 */
  function startQuiz(el) { startQuizAt(el, null); }

  function startQuizAt(el, forcedRomaji) {
    const table = window.NihongoData.kanaTable || [];
    if (!table.length) return;
    // 随机取罗马音
    const shuffled = table.slice().sort(() => Math.random() - 0.5);
    const target = forcedRomaji ? shuffled.find(k => k.r === forcedRomaji) || shuffled[0] : shuffled[0];
    if (!target) return;
    const options = table.slice().sort(() => Math.random() - 0.5).slice(0, 4);
    if (!options.find(o => o.h === target.h)) { options[Math.floor(Math.random() * options.length)] = target; }
    const optionList = table.filter(k => k.r === target.r && (k.h === target.h || k.k === target.k));
    let candidates = optionList.length ? optionList : [target];
    const chars = [];
    candidates.forEach(c => { if (!chars.includes(c.h)) chars.push({ c: c, char: c.h }); if (!chars.includes(c.k)) chars.push({ c: c, char: c.k }); });
    // 简化: 用前4个候选
    const answerSet = chars.slice(0, 4);
    state.quiz = { target, answerSet, answered: null, correct: false };

    const optionsHtml = state.quiz.answerSet.map((op, i) =>
      `<button class="quiz-option" data-i="${i}">${esc(op.char)}</button>`
    ).join("");

    const area = el.querySelector("#quizArea");
    area.innerHTML = `
      <div class="card quiz-card">
        <div class="quiz-info">听读音，选出对应的假名</div>
        <div class="quiz-prompt"><button class="speak-btn" data-speak="${esc(target.r)}">♪</button> ${esc(target.r)}</div>
        <div class="quiz-options">${optionsHtml}</div>
        <div class="quiz-feedback" id="quizFeedback"></div>
        <button class="btn btn-ghost btn-sm" id="quizNext">下一题 →</button>
      </div>
    `;

    const fb = area.querySelector("#quizFeedback");
    area.querySelectorAll(".quiz-option").forEach(btn => {
      btn.addEventListener("click", () => {
        if (state.quiz.answered !== null) return;
        state.quiz.answered = parseInt(btn.dataset.i, 10);
        const picked = state.quiz.answerSet[state.quiz.answered];
        const isCorrect = picked.char === state.quiz.target.h || picked.char === state.quiz.target.k;
        state.quiz.correct = isCorrect;
        if (picked.char === state.quiz.target.h || picked.char === state.quiz.target.k) {
          btn.classList.add("correct");
          fb.className = "quiz-feedback ok";
          fb.innerHTML = `正确！${esc(state.quiz.target.h)} ${esc(state.quiz.target.k)}`;
        } else {
          btn.classList.add("wrong");
          fb.className = "quiz-feedback no";
          fb.innerHTML = `不对，正确答案是 <span class="jp">${esc(state.quiz.target.h)} ${esc(state.quiz.target.k)}</span>`;
        }
        speak(state.quiz.target.r);
      });
    });

    area.querySelector("#quizNext").addEventListener("click", () => startQuizAt(el, null));
    bindSpeak(area);
    speak(target.r);
  }

  /* =========================================================
     词汇页
     ========================================================= */
  function renderVocab() {
    const el = pageEls.vocab;
    const days = window.NihongoData.days || [];
    const phrases = window.NihongoData.phrases || [];
    const all = [];
    days.forEach(d => {
      (d.vocab || []).forEach(v => {
        all.push({ ...v, src: `第${d.day}天` });
      });
    });
    phrases.forEach(p => {
      all.push({ ja: p.ja, kana: p.kana, romaji: p.romaji, zh: p.zh, src: "常用表达" });
    });
    state.__vocabAll = all;

    el.innerHTML = `
      <div class="page-head">
        <div class="eyebrow">Vocabulary</div>
        <h1 class="page-title">词汇</h1>
        <p class="page-desc">搜索并复习全部生词与常用表达。</p>
      </div>
      <div class="search-box">
        <span class="icon">🔍</span>
        <input type="text" id="vocabSearch" placeholder="按日语 / 罗马音 / 中文搜索…" autocomplete="off" />
      </div>
      <div class="results-count" id="vocabCount">共 ${all.length} 个词条</div>
      <div class="vocab-search-list" id="vocabResults"></div>
    `;
    renderVocabResults(all);
    const input = el.querySelector("#vocabSearch");
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      const filtered = all.filter(item => {
        return (item.ja && item.ja.toLowerCase().includes(q)) ||
               (item.kana && item.kana.toLowerCase().includes(q)) ||
               (item.romaji && item.romaji.toLowerCase().includes(q)) ||
               (item.zh && item.zh.toLowerCase().includes(q));
      });
      renderVocabResults(filtered);
      el.querySelector("#vocabCount").textContent = `共 ${filtered.length} 个词条`;
    });
  }

  function renderVocabResults(list) {
    const box = document.querySelector("#vocabResults");
    if (!box) return;
    if (!list.length) { box.innerHTML = `<div class="empty-state"><div class="big">🔍</div>没有找到匹配的词条</div>`; return; }
    box.innerHTML = list.map(item => `
      <div class="card v-search-item">
        <div class="row1">${speakBtn(item.ja)} <span class="ja">${esc(item.ja)}</span> <span class="zh">${esc(item.zh || "")}</span></div>
        <div class="meta">${esc(item.kana || "")} · ${esc(item.romaji || "")} · ${esc(item.src || "")}</div>
      </div>
    `).join("");
    bindSpeak(box);
  }

  /* =========================================================
     语法页
     ========================================================= */
  function renderGrammar() {
    const el = pageEls.grammar;
    const grams = window.NihongoData.grammar || [];
    const items = grams.map((g, i) => `
      <div class="card grammar-item" data-gi="${i}">
        <div class="title-row">
          <span class="gi-title">${esc(g.title || "语法点")}</span>
          ${g.pattern ? `<span class="gi-parenthesis">${esc(g.pattern)}</span>` : ""}
          <span class="chevron">▾</span>
        </div>
        <div class="gi-body">
          ${g.pattern ? `<div class="gi-pattern">${esc(g.pattern)}</div>` : ""}
          ${g.explain ? `<div class="gi-explain">${esc(g.explain)}</div>` : ""}
          ${g.example ? `<div class="gi-example">${speakBtn(g.example)} ${esc(g.example)}</div><div class="gi-example-zh">${esc(g.exampleZh || "")}</div>` : ""}
        </div>
      </div>
    `).join("");

    el.innerHTML = `
      <div class="page-head">
        <div class="eyebrow">Grammar</div>
        <h1 class="page-title">语法</h1>
        <p class="page-desc">点击卡片展开语法详解。</p>
      </div>
      <div class="grammar-list">${items || `<div class="empty-state"><div class="big">📐</div>暂无语法数据</div>`}</div>
    `;

    el.querySelectorAll(".grammar-item").forEach(item => {
      item.addEventListener("click", () => {
        item.classList.toggle("open");
      });
    });
    bindSpeak(el);
  }

  /* =========================================================
     常用表达页
     ========================================================= */
  function renderPhrases() {
    const el = pageEls.phrases;
    const phrases = window.NihongoData.phrases || [];
    const scenes = {};
    phrases.forEach(p => {
      const sc = p.scene || "其他";
      (scenes[sc] = scenes[sc] || []).push(p);
    });

    let html = `
      <div class="page-head">
        <div class="eyebrow">Phrases</div>
        <h1 class="page-title">常用表达</h1>
        <p class="page-desc">按场景分类的日常实用表达，直接可开口说。</p>
      </div>
    `;

    const sceneKeys = Object.keys(scenes);
    if (!sceneKeys.length) html += `<div class="empty-state"><div class="big">💬</div>暂无常用表达</div>`;

    html += sceneKeys.map(sc => `
      <div class="scene-group">
        <div class="scene-title">${esc(sc)}</div>
        <div class="phrase-list">${scenes[sc].map(p => `
          <div class="card phrase-item">
            <div class="pja">${speakBtn(p.ja)} ${esc(p.ja)}</div>
            <div class="pzh">${esc(p.zh || "")}</div>
            ${(p.kana || p.romaji) ? `<div class="pmeta">${esc(p.kana || "")} ${esc(p.romaji || "")}</div>` : ""}
          </div>
        `).join("")}</div>
      </div>
    `).join("");

    el.innerHTML = html;
    bindSpeak(el);
  }

  /* =========================================================
     进度页
     ========================================================= */
  function renderProgress() {
    const el = pageEls.progress;
    const days = window.NihongoData.days || [];
    const total = window.NihongoData.meta.totalDays || days.length;
    const done = completedDays();
    const rate = total ? Math.round(done.length / total * 100) : 0;
    const words = memorizedWordCount();
    const streak = streakCount();

    const pills = days.map(d => `
      <span class="progress-day-pill ${isDone(d.day) ? "done" : ""}" data-day="${d.day}">${d.day}${isDone(d.day) ? " ✓" : ""}</span>
    `).join("");

    el.innerHTML = `
      <div class="page-head">
        <div class="eyebrow">Progress</div>
        <h1 class="page-title">学习进度</h1>
        <p class="page-desc">每日完成情况与坚持记录。</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><div class="num warm">${done.length}<small style="font-size:15px">/ ${total}</small></div><div class="label">已完成天数</div></div>
        <div class="stat-card"><div class="num warm">${rate}%</div><div class="label">完成率</div></div>
        <div class="stat-card"><div class="num green">${words}</div><div class="label">已背词数</div></div>
        <div class="stat-card"><div class="num warm">${streak}<small style="font-size:15px">天</small></div><div class="label">当前连胜</div></div>
      </div>

      <div class="card">
        <div class="card-title">整体完成率</div>
        <div class="progress-bar-wrap"><div class="progress-bar" style="width:${rate}%"></div></div>
        <div class="results-count">已完成 ${done.length} / ${total} 天</div>
        <div style="margin-top:var(--sp-3)"><div class="card-title" style="margin-bottom:var(--sp-2)">各日状态</div>
          <div class="progress-strip">${pills}</div>
        </div>
      </div>

      ${done.length === 0 ? `<div class="empty-state" style="margin-top:var(--sp-4)"><div class="big">🌱</div>还没有完成任何一天，从今天开始吧！<br><br><button class="btn btn-primary" data-nav="today">开始学习</button></div>` : ""}
    `;

    el.querySelectorAll(".progress-day-pill").forEach(p => {
      p.addEventListener("click", () => {
        state.currentDay = parseInt(p.dataset.day, 10);
        showPage("today");
      });
    });
  }

  /* ---------- 键盘支持: 空格翻当前词汇卡 ---------- */
  document.addEventListener("keydown", e => {
    if (e.code === "Space" && state.currentPage === "today") {
      const target = e.target;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isInput) return;
      e.preventDefault();
      const cards = pageEls.today.querySelectorAll(".vocab-card.flipped");
      if (cards.length) { // 已翻开的卡收回
        cards.forEach(c => c.classList.remove("flipped"));
      } else {
        const all = pageEls.today.querySelectorAll(".vocab-card");
        all.forEach(c => c.classList.add("flipped"));
      }
    }
  });

  /* ---------- 初始化 ---------- */
  function boot() {
    renderHome();
    showPage("home");
    const loading = document.getElementById("appLoading");
    if (loading) loading.classList.add("hidden");
  }

  function init() {
    bindNav();
    let booted = false;
    function doBoot() {
      if (booted || !window.NihongoData) return;
      booted = true;
      boot();
    }
    whenDataReady(doBoot);   // 数据已就绪则立即执行；未就绪则排队，待 data.js 末尾冲刷队列
    // 兜底: 延迟再检查一次队列机制，避免 data.js 若未触发队列冲刷也能启动
    setTimeout(doBoot, 150);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();