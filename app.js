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
  /* 已背词汇数: 仅统计已完成天数中学到的词（未完成不计，避免加载即虚高）。
     每完成一天，计入该天的生词 + 必背句数。 */
  function memorizedWordCount() {
    const done = new Set(completedDays());
    let count = 0;
    window.NihongoData.days.forEach(d => {
      if (done.has(d.day)) {
        count += (d.vocab || []).length;
        count += (d.sentences || []).length;
      }
    });
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
      home: renderHome, intro: renderIntro, today: renderToday, kana: renderKana,
      vocab: renderVocab, grammar: renderGrammar, phrases: renderPhrases, progress: renderProgress
    };
    if (renderers[name]) renderers[name]();
    // 同步地址栏 hash（成为一条可回退的历史记录；由 hashchange 触发的渲染不重复入栈）
    const targetHash = "#/" + name;
    if (location.hash !== targetHash) {
      history.pushState({ page: name }, "", targetHash);
    }
  }

  /* 解析当前 hash 对应的页面 */
  function pageFromHash() {
    const h = location.hash || "";
    const m = h.match(/^#\/([a-z]+)/);
    const name = m ? m[1] : "home";
    const renderers = {
      home: 1, intro: 1, today: 1, kana: 1,
      vocab: 1, grammar: 1, phrases: 1, progress: 1
    };
    return renderers[name] ? name : "home";
  }

  function bindNav() {
    document.querySelectorAll(".nav-link").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        const page = el.dataset.nav;
        if (page) showPage(page);
      });
    });
    // 顶栏移动端折叠开关
    const navToggle = document.getElementById("navToggle");
    const navLinksEl = document.getElementById("navLinks");
    if (navToggle && navLinksEl) {
      navToggle.addEventListener("click", () => {
        const open = navLinksEl.classList.toggle("open");
        navToggle.classList.toggle("open", open);
      });
    }
    // 顶栏导航的事件委托
    document.getElementById("mainNav").addEventListener("click", e => {
      const el = e.target.closest("[data-nav]");
      if (el) { e.preventDefault(); if (el.dataset.nav) showPage(el.dataset.nav); }
    });
    // 页面内动态渲染的「data-nav」按钮(如 日语简介 底部按钮、闯关页返回)也可跳转
    document.addEventListener("click", e => {
      const el = e.target.closest("[data-nav]");
      if (!el) return;
      // 已由 mainNav 委托处理的顶栏链接不再重复触发
      if (document.getElementById("mainNav").contains(el)) return;
      e.preventDefault();
      if (el.dataset.nav) showPage(el.dataset.nav);
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
     日语简介
     ========================================================= */
  function renderIntro() {
    const el = pageEls.intro;
    const kana = (window.NihongoData.kanaTable || []);
    const hiraganaSample = kana.slice(0, 5).map(x => x.h).join("");
    const katakanaSample = kana.slice(0, 5).map(x => x.k).join("");
    el.innerHTML = `
      <div class="hero hero-sm">
        <div class="eyebrow">はじめての日本語</div>
        <h1 class="hero-title">先认识一下 · 日语是怎么构成的</h1>
        <p class="hero-intro">别怕，日语看着复杂，其实就「三套字 + 一个辅助」。这篇文章用生活里的例子带你 <span class="nowrap">3 分钟</span>看懂，之后学起来就不慌。</p>
      </div>

      <div class="card">
        <div class="card-title">🇯🇵 一句话总纲</div>
        <p style="line-height:1.9">日语的文字 = <b>汉字</b> + <b>平假名</b> + <b>片假名</b> 写出来，再用 <b>罗马字</b> 标读音（给外国人看的）。一句话，<b>假名是骨架，汉字是骨头，罗马字是拐杖。</b></p>
        <p style="line-height:1.9">很多新手会以为单词是「用片假名一个个拼出来的」——方向没错，但更准确的讲法是：<b>日语单词由「假名」拼成，而假名分「平假名」和「片假名」两套，发音一一对应。</b>日常本国词偏用平假名，外来语（英文等音译）专用片假名。下面逐个看。</p>
      </div>

      <div class="card">
        <div class="card-title">🗺️ 五十音 就是「音的表格」——先搞懂它，后面都好说</div>
        <p style="line-height:1.9">日语里每一个<b>「音」</b>都有两个写法：圆圆的叫<b>平假名</b>，方方的叫<b>片假名</b>。把这两套排成格子，就是「五十音」。其中「五十音」是<b>统称</b>，不是单独第三种文字。</p>
        <div class="intro-examples" style="gap:var(--sp-2)">
          <div class="intro-ex"><span>あ / ア</span><small>音 = a（"啊"）</small></div>
          <div class="intro-ex"><span>い / イ</span><small>音 = i（"衣"）</small></div>
          <div class="intro-ex"><span>う / ウ</span><small>音 = u（"乌"）</small></div>
          <div class="intro-ex"><span>え / エ</span><small>音 = e（"诶"）</small></div>
          <div class="intro-ex"><span>お / オ</span><small>音 = o（"哦"）</small></div>
        </div>
        <p style="line-height:1.9;margin-top:var(--sp-2)">看到没：<b>あ</b>（平）和<b>ア</b>（片）都是读 <b>a</b>，只是形状不同。<b>平假名拼本国词，片假名拼外来语，发音完全一样。</b>再加上从中国来的<b>汉字</b>（表意字，如山、水、学生），三种字在日文里一起用。而<b>罗马字</b>（a、i、u…）只是外国人注音用的拐杖。</p>
      </div>

      <div class="card">
        <div class="card-title">🎴 一、平假名 ひらがな —— 最常用，先学它</div>
        <p style="font-family:var(--font-jp);font-size:1.6rem;letter-spacing:.3rem;color:var(--c-primary)">${esc(hiraganaSample)}</p>
        <p style="line-height:1.9"><b>圆润、柔软</b>，像中国的草书。用来写语法助词、本国词、给汉字标音。日本人日常写词，大部分是平假名。</p>
        <div class="intro-examples">
          <div class="intro-ex"><span>わたし</span><small>我</small></div>
          <div class="intro-ex"><span>がくせい</span><small>学生</small></div>
          <div class="intro-ex"><span>たべる</span><small>吃</small></div>
          <div class="intro-ex"><span>は・を・が</span><small>语法小字（助词）</small></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🎴 二、片假名 カタカナ —— 写外来语，超市菜单常撞见</div>
        <p style="font-family:var(--font-jp);font-size:1.6rem;letter-spacing:.3rem;color:var(--c-primary)">${esc(katakanaSample)}</p>
        <p style="line-height:1.9"><b>方折、硬朗</b>。平假名和片假名读音<b>完全相同</b>，只是用途不同。片假名主要写<b>外来语</b>（从欧美音译来的词），你去日本看菜单、店名、车站，遍地都是！</p>
        <div class="intro-examples">
          <div class="intro-ex"><span>コーヒー</span><small>咖啡 ☕</small></div>
          <div class="intro-ex"><span>ホテル</span><small>酒店 🏨</small></div>
          <div class="intro-ex"><span>タクシー</span><small>出租车 🚕</small></div>
          <div class="intro-ex"><span>コンビニ</span><small>便利店 🏪</small></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🧱 三、汉字 漢字 —— 从中国来的，看着亲切</div>
        <p style="font-family:var(--font-jp);font-size:1.6rem;letter-spacing:.3rem;color:var(--c-primary)">日本語 学生 電車 音楽</p>
        <p style="line-height:1.9">从中国传入的表意字，一个字可能有多个读音（音读/训读）。好处是：<b>就算读不出来，你也大概猜得到意思</b>（山、水、人、学生）。对中文母语者是巨大优势。</p>
        <div class="intro-examples">
          <div class="intro-ex"><span>本</span><small>书（ほん）</small></div>
          <div class="intro-ex"><span>電車</span><small>电车（でんしゃ）</small></div>
          <div class="intro-ex"><span>高い</span><small>贵/高（たかい）</small></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🔤 四、罗马字 —— 你的拐杖</div>
        <p style="line-height:1.9">用拉丁字母拼读音，主要在给外国人认读时用（车站名、街名）。学的时候用它辅助记发音，但别再依赖它，尽快过渡到假名。</p>
        <div class="intro-examples">
          <div class="intro-ex"><span>watashi</span><small>わたし 我</small></div>
          <div class="intro-ex"><span>arigatou</span><small>ありがとう 谢谢</small></div>
          <div class="intro-ex"><span>Shibuya</span><small>渋谷 涩谷</small></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🧩 它们怎么合着用？看一个真实句子</div>
        <p class="pattern" style="font-family:var(--font-jp)">わたし は 学生 です。</p>
        <p style="line-height:1.9">
          <b>わたし</b>（平假名=我）+ <b>は</b>（平假名=语法小字，标主题）+ <b>学生</b>（汉字=学生）+ <b>です</b>（平假名=「是」的礼貌说法）<br>
          👉 整句意思「我是学生」。
        </p>
        <p style="line-height:1.9;color:var(--c-text-weak)">可以看到：<b>汉字表实义，平假名补语法、串句子</b>。这就是日语的样子。</p>
      </div>

      <div class="card">
        <div class="card-title">🗺️ 那这 30 天我该怎么学？</div>
        <div class="intro-timeline">
          <div class="tl-item"><div class="tl-week">第一周</div><div>学平假名→片假名，边认字边学「机场、酒店、点餐」张口就能用的词</div></div>
          <div class="tl-item"><div class="tl-week">第二周</div><div>名词句「AはBです」，学会自我介绍、问路、点餐点单</div></div>
          <div class="tl-item"><div class="tl-week">第三周</div><div>动词活用「～ます／～ました」，购物结账、打电话、日期时间</div></div>
          <div class="tl-item"><div class="tl-week">第四周</div><div>形容词 + 场景串讲，求助、告别、闲聊，开口不慌</div></div>
        </div>
        <p style="line-height:1.9;margin-top:var(--sp-3)">每节课最后都有一场<b>小闯关</b>——答对当天的内容才能算学完。答错的题会<b>随机再考你</b>，直到你真正记住为止。</p>
      </div>

      <div style="margin-top:var(--sp-4)"><button class="btn" data-nav="today">明白了，开始今天的学习 →</button></div>
    `;
  }

  /* =========================================================
     考核闯关引擎 —— 逐题闯关、答错穿插重考、选项打乱
     ========================================================= */
  // 打乱数组(原地)后返回
  function shuffleArr(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // 从池中取 n 个不同的干扰项(排除正确项)
  function pickDistractors(pool, correct, n) {
    const cands = pool.filter(x => x !== correct);
    const seen = [];
    while (seen.length < n && cands.length) {
      const idx = Math.floor(Math.random() * cands.length);
      seen.push(cands.splice(idx, 1)[0]);
    }
    return seen;
  }

  // 由一天的内容自动生成考核题队列
  function buildDayQuiz(day) {
    if (!day) return [];
    const Q = [];                       // 题目队列
    const allZh = [];                   // 中义池(用于干扰项)
    const allJa = [];                   // 日文池
    const kanaTable = window.NihongoData.kanaTable || [];

    (day.vocab || []).forEach(v => {
      if (v.zh) allZh.push(v.zh);
      if (v.ja) allJa.push(v.ja);
    });
    (day.sentences || []).forEach(s => {
      const zh = typeof s === "string" ? "" : (s.zh || "");
      if (zh) allZh.push(zh);
    });

    // 1) 生词：日文 → 中文
    (day.vocab || []).forEach(v => {
      if (!v.zh || !v.ja) return;
      const distract = pickDistractors(allZh, v.zh, 3);
      if (distract.length >= 2) {
        Q.push({ type: "词义", prompt: `${v.ja}  ${v.kana || ""}`, answer: v.zh,
          explain: v.example ? `${v.ja} = ${v.exampleZh || v.zh}` : v.zh,
          options: shuffleArr([v.zh].concat(distract)).slice(0, 4), speak: v.ja });
      }
    });

    // 2) 生词反向：中文 → 日文
    (day.vocab || []).forEach(v => {
      if (!v.ja || !v.zh) return;
      const distract = pickDistractors(allJa, v.ja, 3);
      if (distract.length >= 2) {
        Q.push({ type: "词", prompt: `“${v.zh}”用日语怎么说？`, answer: v.ja,
          explain: `${v.ja}（${v.kana || ""}）＝${v.zh}`,
          options: shuffleArr([v.ja].concat(distract)).slice(0, 4), speak: v.ja });
      }
    });

    // 3) 必背句：日文 → 中文意思
    (day.sentences || []).forEach(s => {
      const text = typeof s === "string" ? s : (s.ja || "");
      const zh = typeof s === "string" ? "" : (s.zh || "");
      if (!text || !zh) return;
      const distract = pickDistractors(allZh, zh, 3);
      if (distract.length >= 2) {
        Q.push({ type: "句意", prompt: `这句是什么意思？  ${text}`, answer: zh,
          explain: `${text} ＝ ${zh}`,
          options: shuffleArr([zh].concat(distract)).slice(0, 4), speak: text });
      }
    });

    // 4) 语法：given explain → 选对应句型
    (day.grammar || []).forEach(g => {
      if (!g.pattern || !g.explain) return;
      Q.push({ type: "语法", prompt: `语法理解：${g.title || g.pattern}`, answer: g.pattern,
        explain: `${g.pattern}\n${g.explain}`,
        options: shuffleArr([g.pattern].concat(pickDistractors(allJa.concat(allZh), g.pattern, 3))).slice(0, 4) });
    });

    // 5) 五十音(前3天)：平假名 → 罗马音 / 片假名
    if (day.day <= 3 && kanaTable.length) {
      const target = kanaTable.slice(0, day.day === 1 ? 10 : day.day === 2 ? 24 : 30);
      target.forEach(k => {
        const distractR = pickDistractors(kanaTable.map(x => x.r), k.r, 3);
        if (distractR.length >= 2) {
          Q.push({ type: "假名", prompt: `${k.h} 读做什么？${k.k ? `（片假名：${k.k}）` : ""}`, answer: k.r,
            explain: `${k.h}（${k.k}）读 ${k.r}`,
            options: shuffleArr([k.r].concat(distractR)).slice(0, 4), speak: k.h });
        }
      });
    }

    if (Q.length < 4) {
      (day.grammar || []).forEach(g => {
        if (g.example) Q.push({ type: "应用", prompt: `选出能以「${g.title || "本课语法"}」造出的句子。`, answer: g.example,
          explain: `${g.example}\n${g.exampleZh || ""}`,
          options: [] });
      });
    }
    return Q;
  }

  // 为缺选项的题补充干扰项(来自全课程词汇与例句)
  function ensureOptions(Q) {
    const pool = [];
    (window.NihongoData.days || []).forEach(d => (d.vocab || []).forEach(v => { if (v.ja) pool.push(v.ja); }));
    (window.NihongoData.days || []).forEach(d => (d.sentences || []).forEach(s => { if (s && s.ja) pool.push(s.ja); }));
    Q.forEach(q => {
      if (q.type === "应用" && !q.options.length) {
        q.options = shuffleArr([q.answer].concat(pickDistractors(pool, q.answer, 3))).slice(0, 4);
      }
    });
    return Q;
  }

  /* ---------------- 闯关 UI ---------------- */
  function renderQuiz(day, onFinish) {
    let qs = ensureOptions(buildDayQuiz(day));
    if (!qs.length) { onFinish && onFinish(false); renderToday(); return; }
    if (qs.length > 16) qs = qs.slice(0, 16);
    const el = pageEls.today;
    const dayNum = day.day;
    let idx = 0;
    const soFar = {};      // 已答对的知识点
    const stats = { total: qs.length, wrong: 0 };

    function showQ() {
      if (idx >= qs.length) {
        setDone(dayNum, true);
        el.innerHTML = `
          <div class="quiz-done">
            <div class="quiz-done-icon">🎉</div>
            <h2>第${dayNum}天闯关成功！</h2>
            <p>你已掌握本课 ${Object.keys(soFar).length} 个知识点，恭喜通关。</p>
            <div class="quiz-done-stats">共 ${qs.length} 题</div>
            <div style="margin-top:var(--sp-4);display:flex;gap:var(--sp-2)">
              ${dayNum < (window.NihongoData.days||[]).length ? `<button class="btn" id="qNextDay">下一课 →</button>` : ""}
              <button class="btn btn-ghost" data-nav="home">返回首页</button>
            </div>
          </div>`;
        const nx = el.querySelector("#qNextDay");
        if (nx) nx.onclick = () => { state.currentDay = dayNum + 1; renderToday(); };
        bindSpeak(el);
        onFinish && onFinish(true);
        return;
      }
      const q = qs[idx];
      if (soFar[q.prompt + "◆" + q.answer]) { idx++; showQ(); return; }
      const opt = (q.options || []).map((o, i) =>
        `<button class="quiz-opt" data-i="${i}">${esc(String(o))}</button>`).join("");
      el.innerHTML = `
        <div class="quiz-box">
          <div class="quiz-head">
            <span class="quiz-tag">📝 第${dayNum}天闯关</span>
            <span class="quiz-pos">${idx + 1} / ${qs.length}</span>
          </div>
          <div class="quiz-prompt">${speakBtn(q.speak || q.prompt)} <span>${esc(q.prompt)}</span></div>
          <div class="quiz-options">${opt}</div>
          <div class="quiz-feedback"></div>
        </div>
        <div style="margin-top:var(--sp-3)"><button class="btn btn-ghost" id="qAbort">退出闯关</button></div>`;
      bindSpeak(el);
      el.querySelectorAll(".quiz-opt").forEach(btn => btn.addEventListener("click", () => {
        const val = (q.options || [])[parseInt(btn.dataset.i, 10)];
        grade(val, q);
      }));
      el.querySelector("#qAbort").onclick = () => renderToday();
    }

    function grade(val, q) {
      const fb = el.querySelector(".quiz-feedback");
      const isRight = String(val).trim() === String(q.answer).trim();
      const lbl = q.prompt + "◆" + q.answer;
      if (isRight) {
        if (!soFar[lbl]) soFar[lbl] = true;
        fb.innerHTML = `<div class="quiz-fb good">✅ 正确！${q.explain ? `<div class="quiz-explain">${esc(q.explain)}</div>` : ""}</div>`;
        const nx = document.createElement("button");
        nx.className = "btn btn-ghost"; nx.textContent = "下一题 →";
        fb.appendChild(nx);
        nx.onclick = () => { idx++; showQ(); };
      } else {
        stats.wrong++;
        const insert = idx + 1 + Math.floor(Math.random() * Math.max(1, qs.length - idx - 1));
        qs.splice(Math.min(insert, qs.length), 0, q);
        fb.innerHTML = `<div class="quiz-fb bad">❌ 不对，正确答案是：<b>${esc(String(q.answer))}</b><div class="quiz-explain">${esc(q.explain || "")}</div></div>
          <p class="quiz-hint">这道题稍后<b>会重新考你</b>，先做下一题加深印象~</p>`;
        const nx = document.createElement("button");
        nx.className = "btn btn-ghost"; nx.textContent = "继续答题 →";
        fb.appendChild(nx);
        nx.onclick = () => { idx++; showQ(); };
      }
      fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    showQ();
  }

  function renderToday() {
    const el = pageEls.today;
    const days = window.NihongoData.days;
    if (!days.length) { el.innerHTML = `<div class="empty-state">暂无课程数据</div>`; return; }
    const day = days[state.currentDay - 1] || days[0];
    const dayNum = day.day;
    const total = window.NihongoData.meta.totalDays || days.length;
    const done = isDone(dayNum);

    let points = (day.points || []).map(p => `<li>${esc(p)}</li>`).join("");

    // 前3天为五十音基础日：优先展示本课要学的假名
    let kanaSection = "";
    if (day.day <= 3) {
      const kt = window.NihongoData.kanaTable || [];
      const target = kt.slice(0, day.day === 1 ? 10 : day.day === 2 ? 24 : 30);
      const showKatakana = day.day === 3;
      // 朗读文本：平假名日读平假名，片假名日读片假名，两者发音一致
      const cells = target.map(k => {
        const speakChar = showKatakana ? k.k : k.h;
        return `
        <div class="kana-learn-cell" title="读作 ${esc(k.r)}">
          <button class="speak-btn" data-speak="${esc(speakChar)}" title="发音">♪</button>
          <span class="klh">${esc(k.h)}</span>
          ${showKatakana ? `<span class="klk">${esc(k.k)}</span>` : ""}
          <span class="klr">${esc(k.r)}</span>
        </div>`;
      }).join("");
      kanaSection = `
        <div class="card kana-primer">
          <div class="card-head">
            <div class="card-title">🔤 本课假名${showKatakana ? " · 片假名" : " · 平假名"}</div>
            <span class="tag" style="background:var(--c-primary-tint);color:var(--c-primary)">先认假名再学词</span>
          </div>
          <p class="hint" style="margin-bottom:var(--sp-3)">${showKatakana ? "片假名多用于外来语，如コーヒー(咖啡)、ホテル(酒店)。" : "每个假名对应一个音节，练熟读音再学下面的词更轻松。"}</p>
          <div class="kana-learn-grid">${cells}</div>
        </div>`;
    }

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

    let grammar = (day.grammar || []).map(g => {
    const breakdown = (g.breakdown || []).map(b => `<span class="g-token"><b>${esc(b.token)}</b><em>${esc(b.zh)}</em></span>`).join("");
    return `
      <div class="grammar-block">
        <div class="card-title" style="font-family:var(--font-jp)">${esc(g.title || "")}</div>
        ${g.pattern ? `<div class="pattern">${esc(g.pattern)}${g.patternZh ? `<span class="pattern-zh">（${esc(g.patternZh)}）</span>` : ""}</div>` : ""}
        ${breakdown ? `<div class="g-breakdown">${breakdown}</div>` : ""}
        ${g.explain ? `<div class="explain">${esc(g.explain)}</div>` : ""}
        ${g.example ? `<div class="eg">${speakBtn(g.example)} ${esc(g.example)}</div><div class="eg-zh">${esc(g.exampleZh || "")}</div>` : ""}
      </div>
    `;
  }).join("");

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
        ${done ? "🔄 重新闯关" : "📝 学完了？开始今日闯关"}
      </button>
      ${!done ? `<p class="hint" style="margin-top:-var(--sp-2);margin-bottom:var(--sp-4)">通过本课闯关才能标记完成并解锁下一课。</p>` : ""}

      ${kanaSection}
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
      // 改为闯关通关制：点击启动考核，通过后由系统自动标记完成
      renderQuiz(day, function (passed) {
        if (!passed) { /* 未通过则留在当前页 */ }
      });
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
    // 按「行」(type=a,k,s,t…) 分组；每行含同一音的 平假名(.h) 与 片假名(.k)
    const groups = {};
    table.forEach(k => {
      (groups[k.type] = groups[k.type] || []).push(k);
    });

    const groupTitles = {
      a: "あ行", k: "か行", s: "さ行", t: "た行", n: "な行",
      h: "は行", m: "ま行", y: "や行", r: "ら行", w: "わ行", nn: "ん"
    };

    let groupHtml = Object.keys(groups).map(type => {
      const items = groups[type];
      const cells = items.map(k => {
        // 每个格子：读音(罗马音) + 平假名 + 片假名，三种一起
        const hira = esc(k.h), kata = esc(k.k), roma = esc(k.r);
        const dimH = !state.kanaShow.hiragana ? " dim" : "";
        const dimK = !state.kanaShow.katakana ? " dim" : "";
        return `<div class="kana-cell clickable-kana" data-type="${esc(type)}" data-h="${hira}" data-k="${kata}" data-r="${roma}">
          <button class="speak-btn" data-speak="${hira}" title="发音">♪</button>
          <div class="r">${roma}<em>读</em></div>
          <div class="k-row">
            <span class="k kl-h${dimH}">${hira}</span>
            <span class="k kl-k${dimK}">${kata}</span>
          </div>
        </div>`;
      }).join("");
      const examples = items.slice(0, 2).map(x => x.r).join("・");
      const title = `${groupTitles[type] || esc(type) + "行"} · 读 <span class="jp">${esc(examples)}</span>`;
      return `<div class="kana-group"><div class="kana-group-title">${title}</div><div class="kana-grid">${cells}</div></div>`;
    }).join("");

    el.innerHTML = `
      <div class="page-head">
        <div class="eyebrow">Kana</div>
        <h1 class="page-title">五十音图</h1>
        <p class="page-desc">每个格子都给出了<b>这个音的读法（罗马音）</b>、<b>平假名</b>和<b>片假名</b>。点 ♪ 听发音，点头一个假名可练习。</p>
      </div>

      <div class="kana-toolbar">
        <div class="toggle-group">
          <button class="tgl ${state.kanaShow.hiragana ? "on" : ""}" data-tgl="hiragana">平假名</button>
          <button class="tgl ${state.kanaShow.katakana ? "on" : ""}" data-tgl="katakana">片假名</button>
          <button class="tgl on disabled-tgl" title="罗马音始终显示">罗马音</button>
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

    // 随机选一个目标音
    const shuffled = table.slice().sort(() => Math.random() - 0.5);
    const target = forcedRomaji ? shuffled.find(k => k.r === forcedRomaji) || shuffled[0] : shuffled[0];
    if (!target) return;

    // 随机决定本轮考「平假名」还是「片假名」，避免两个写法都算对
    const script = Math.random() < 0.5 ? "h" : "k"; // h=平假名, k=片假名
    const scriptLabel = script === "h" ? "平假名" : "片假名";
    const targetChar = script === "h" ? target.h : target.k;

    // 从同一种字体的所有音中，随机取 4 个作为选项(含正确项)
    const pool = table.filter(x => script === "h" ? x.h && x.k : x.k); // 同 script 的候选
    const chance = pool.slice().sort(() => Math.random() - 0.5);
    const options = [];
    // 先保证放入正确项
    options.push({ char: targetChar, correct: true });
    chance.forEach(x => {
      if (options.length >= 4) return;
      const c = script === "h" ? x.h : x.k;
      if (c && c !== targetChar) options.push({ char: c, correct: false });
    });
    // 打乱选项顺序
    options.sort(() => Math.random() - 0.5);

    state.quiz = { target, script, scriptLabel, answerSet: options, answered: null, correct: false };

    // 进入答题：推一条 #/kana/quiz 历史记录，方便用浏览器←退出答题回到五十音表格
    // (重复出题/下一题时不重复入栈)
    if (location.hash !== "#/kana/quiz") {
      history.pushState({ page: "kana", quiz: true }, "", "#/kana/quiz");
    }

    const optionsHtml = state.quiz.answerSet.map((op, i) =>
      `<button class="quiz-option" data-i="${i}" data-correct-to="${esc(op.char)}">${esc(op.char)}</button>`
    ).join("");

    const area = el.querySelector("#quizArea");
    area.innerHTML = `
      <div class="card quiz-card">
        <div class="quiz-info">听读音，选出对应的 <b>${scriptLabel}</b></div>
        <div class="quiz-prompt"><button class="speak-btn" data-speak="${esc(target.r)}">♪</button> 读音 ${esc(target.r)}（${scriptLabel}）</div>
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
        const isCorrect = !!picked.correct;
        state.quiz.correct = isCorrect;
        if (isCorrect) {
          btn.classList.add("correct");
          fb.className = "quiz-feedback ok";
          fb.innerHTML = `正确！「${esc(targetChar)}」是 ${scriptLabel}，就读 <span class="jp">${esc(target.r)}</span>`;
        } else {
          btn.classList.add("wrong");
          fb.className = "quiz-feedback no";
          fb.innerHTML = `不对，${scriptLabel}「${esc(targetChar)}」才读 <span class="jp">${esc(target.r)}</span>`;
        }
        speak(target.r);
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
    const startPage = pageFromHash();
    // 用 replaceState 同步初始 hash，避免多出一条多余的首页历史记录
    history.replaceState({ page: startPage }, "", "#/" + startPage);
    showPage(startPage);
    const loading = document.getElementById("appLoading");
    if (loading) loading.classList.add("hidden");
  }

  function init() {
    bindNav();
    // 浏览器前进/后退/直接改 hash：根据 hash 渲染对应页面并清掉子状态(如答题中的 quiz)
    window.addEventListener("hashchange", () => {
      showPage(pageFromHash());
    });
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