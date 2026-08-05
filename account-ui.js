/* =========================================================
   一个月学会基础日语 · 账户 UI（登录/注册/游客）+ 弹窗
   独立于 app.js 的渲染逻辑，通过 window.Account 通信。
   加载顺序: 在 account.js 之后加载。
   ========================================================= */
(function () {
  "use strict";

  var cfg = null; // template
  var systemReady = false;

  function $(sel, scope) { return (scope || document).querySelector(sel); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- 自建弹窗工具 (避免与页面内部组件冲突) ---------------- */
  var modalStack = [];
  function openModal(html) {
    var backdrop = document.createElement("div");
    backdrop.className = "acc-modal-backdrop";
    backdrop.innerHTML = html;
    document.body.appendChild(backdrop);
    var panel = backdrop.querySelector(".acc-modal");
    modalStack.push(backdrop);
    // 点背景关闭
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closeTopModal();
    });
    return panel;
  }
  function closeTopModal() {
    var b = modalStack.pop();
    if (b) b.parentNode && b.parentNode.removeChild(b);
  }

  /* ---------------- Toast ---------------- */
  function toast(msg, type) {
    var t = document.createElement("div");
    t.className = "acc-toast" + (type ? " acc-toast-" + type : "");
    t.innerHTML = esc(msg);
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add("show"); }, 10);
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { t.parentNode && t.parentNode.removeChild(t); }, 300);
    }, 4200);
  }

  /* ---------------- 游客 24h 倒计时 ---------------- */
  var guestClock = null;
  function startGuestClock() {
    stopGuestClock();
    guestClock = setInterval(updateGuestBadge, 1000);
    updateGuestBadge();
  }
  function stopGuestClock() { if (guestClock) { clearInterval(guestClock); guestClock = null; } }
  function fmtHMS(sec) {
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    function p(x) { return (x < 10 ? "0" : "") + x; }
    return p(h) + ":" + p(m) + ":" + p(s);
  }
  function updateGuestBadge() {
    var el = $("#accGuestBadge");
    if (!el || !window.Account) return;
    var remaining = window.Account.guestRemainingSeconds && window.Account.guestRemainingSeconds();
    if (remaining == null) return;
    el.textContent = "游客 · 剩余 " + fmtHMS(remaining);
  }

  /* ---------------- 渲染顶部入口 ---------------- */
  function renderNav(account) {
    var user = account.getUser();
    var holder = $("#accAccountSlot");
    if (!holder) return;
    if (!user) {
      holder.innerHTML =
        '<button class="acc-btn acc-btn-ghost" id="accLoginBtn">登录 / 注册</button>';
      $("#accLoginBtn").addEventListener("click", openLoginModal);
    } else if (user.isAnonymous) {
      // 游客
      holder.innerHTML =
        '<div class="acc-pill acc-pill-guest" title="游客模式：学习记录将在24小时后删除">' +
        '<span id="accGuestBadge">游客</span>' +
        '<button class="acc-mini" id="accGuestMenu" aria-label="账户">·</button></div>';
      var menu = $("#accGuestMenu");
      if (menu) menu.addEventListener("click", openGuestMenu);
      startGuestClock();
      // 游客横幅
      ensureGuestBanner("游客模式 · 你的学习记录 24 小时后自动删除 <button class='acc-link' data-act='upgrade'>转为正式账号</button>");
    } else {
      // 正式用户
      holder.innerHTML =
        '<div class="acc-pill" title="已登录"><span class="acc-dot"></span>' +
        '<span class="acc-uname">' + esc(user.email || user.id.slice(0, 8)) + '</span>' +
        '<button class="acc-mini" id="accUserMenu" aria-label="账户">·</button></div>';
      $("#accUserMenu").addEventListener("click", openUserMenu);
      removeGuestBanner();
    }
  }

  function ensureGuestBanner(html) {
    if ($("#accGuestBanner")) return;
    var b = document.createElement("div");
    b.id = "accGuestBanner";
    b.className = "acc-guest-banner";
    b.innerHTML = html;
    (document.querySelector(".site-header") || document.body).after(b);
    bindBannerActions(b);
  }
  function removeGuestBanner() {
    var b = $("#accGuestBanner");
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }
  function bindBannerActions(b) {
    b.querySelectorAll("[data-act]").forEach(function (el) {
      el.addEventListener("click", function () { openLoginModal(); });
    });
  }

  /* ---------------- 游客菜单 ---------------- */
  function openGuestMenu(e) {
    var rect = (e && e.currentTarget) ? e.currentTarget.getBoundingClientRect() : null;
    var menu = document.createElement("div");
    menu.className = "acc-menu";
    menu.style.top = (rect ? rect.bottom + 8 : 56) + "px";
    menu.style.right = (rect ? document.body.clientWidth - rect.right + 12 : 20) + "px";
    menu.innerHTML =
      '<div class="acc-menu-title">游客模式</div>' +
      '<div class="acc-menu-note">学习记录将在 24 小时后自动删除。<br>转为正式账号可永久保存个人进度。</div>' +
      '<button class="acc-menu-item" data-act="upgrade">转为正式账号</button>' +
      '<button class="acc-menu-item acc-menu-danger" data-act="logout">退出游客</button>';
    document.body.appendChild(menu);
    var closer = function (ev) {
      if (!menu.contains(ev.target)) { menu.parentNode && menu.parentNode.removeChild(menu); document.removeEventListener("click", closer); }
    };
    setTimeout(function () { document.addEventListener("click", closer); }, 0);
    menu.querySelector('[data-act="upgrade"]').addEventListener("click", function () {
      menu.parentNode && menu.parentNode.removeChild(menu);
      openLoginModal();
    });
    menu.querySelector('[data-act="logout"]').addEventListener("click", function () {
      menu.parentNode && menu.parentNode.removeChild(menu);
      doSignOut();
    });
  }
  function openUserMenu(e) {
    var rect = (e && e.currentTarget) ? e.currentTarget.getBoundingClientRect() : null;
    var menu = document.createElement("div");
    menu.className = "acc-menu";
    menu.style.top = (rect ? rect.bottom + 8 : 56) + "px";
    menu.style.right = (rect ? document.body.clientWidth - rect.right + 12 : 20) + "px";
    menu.innerHTML = '<div class="acc-menu-title">已登录</div>' +
      '<button class="acc-menu-item" data-act="logout">退出登录</button>';
    document.body.appendChild(menu);
    var closer = function (ev) {
      if (!menu.contains(ev.target)) { menu.parentNode && menu.parentNode.removeChild(menu); document.removeEventListener("click", closer); }
    };
    setTimeout(function () { document.addEventListener("click", closer); }, 0);
    menu.querySelector('[data-act="logout"]').addEventListener("click", function () {
      menu.parentNode && menu.parentNode.removeChild(menu);
      doSignOut();
    });
  }

  /* ---------------- 登录弹窗 ---------------- */
  function openLoginModal() {
    // 未接入 Supabase 配置时，提示离线演示版
    if (!window.Account.configured()) {
      toast("当前为离线演示版，登录功能尚未启用。等待接入云端即可使用。", "info");
      return;
    }
    var panel = openModal(
      '<div class="acc-modal">' +
      '<button class="acc-modal-close" aria-label="关闭">&times;</button>' +
      '<div class="acc-modal-head"><span class="acc-modal-brand">日</span><h2>登录 · 注册</h2>' +
      '<p class="acc-modal-sub">登录后，学习记录将安全保存到云端，换设备不丢失。</p></div>' +
      '<div class="acc-tabs" id="accTabs">' +
      '<button class="acc-tab acc-tab-on" data-tab="login">登录</button>' +
      '<button class="acc-tab" data-tab="signup">注册</button>' +
      '</div>' +
      '<form class="acc-form" id="accForm" autocomplete="on">' +
      '<label>邮箱<input type="email" id="accEmail" placeholder="you@example.com" required></label>' +
      '<label>密码<input type="password" id="accPass" placeholder="至少 6 位" required minlength="6"></label>' +
      '<button type="submit" class="acc-btn acc-btn-primary" id="accSubmit">登录</button>' +
      '<div class="acc-error" id="accError"></div>' +
      '</form>' +
      '<div class="acc-divider"><span>或</span></div>' +
      '<button class="acc-btn acc-btn-guest" id="accGuestBtn">🎒 以游客身份进入（试玩，24小时后删除）</button>' +
      '<p class="acc-modal-foot">继续即表示同意匿名体验模式。</p>' +
      '</div>'
    );
    panel.querySelector(".acc-modal-close").addEventListener("click", closeTopModal);
    var tab = "login";
    function setTab(t) {
      tab = t;
      panel.querySelectorAll(".acc-tab").forEach(function (b) { b.classList.toggle("acc-tab-on", b.dataset.tab === t); });
      $("#accSubmit", panel).textContent = t === "login" ? "登录" : "注册";
    }
    panel.querySelectorAll(".acc-tab").forEach(function (b) {
      b.addEventListener("click", function () { setTab(b.dataset.tab); });
    });
    panel.querySelector(".acc-modal-close").addEventListener("click", closeTopModal);
    // 关闭按钮 (重复绑定去重)
    panel.querySelectorAll(".acc-modal-close").forEach(function (b) {
      b.addEventListener("click", function (e) { e.stopPropagation(); closeTopModal(); });
    });
    $("#accForm", panel).addEventListener("submit", function (e) {
      e.preventDefault();
      var email = $("#accEmail", panel).value.trim();
      var pass = $("#accPass", panel).value;
      if (!email || pass.length < 6) { showErr(panel, "请输入有效邮箱和至少6位密码。"); return; }
      clearErr(panel);
      $("#accSubmit", panel).disabled = true;
      var call = tab === "signup" ? window.Account.signUp(email, pass) : window.Account.signIn(email, pass);
      call.then(function (res) {
        if (tab === "signup" && res && !res.session) {
          toast("注册成功！请到邮箱确认验证邮件后再登录。", "success");
          setTab("login");
          $("#accSubmit", panel).disabled = false;
          return;
        }
        closeTopModal();
        toast("🎉 欢迎回来，登录成功！", "success");
        window.Account.loadProgress().then(function () { refreshAll(); });
      }).catch(function (err) {
        $("#accSubmit", panel).disabled = false;
        showErr(panel, friendlyErr(err));
      });
    });
    $("#accGuestBtn", panel).addEventListener("click", function () {
      confirmGuestEntry();
    });
  }
  function showErr(panel, msg) { var el = $("#accError", panel); if (el) { el.textContent = msg; el.classList.add("visible"); } }
  function clearErr(panel) { var el = $("#accError", panel); if (el) { el.classList.remove("visible"); el.textContent = ""; } }
  function friendlyErr(err) {
    var m = err && (err.message || err.error_description) || "操作失败，请重试。";
    m = String(m);
    if (m.indexOf("already registered") >= 0 || m.indexOf("already exists") >= 0) return "该邮箱已注册，请直接登录或换一个。";
    if (m.indexOf("Invalid login") >= 0 || m.indexOf("invalid_credentials") >= 0) return "邮箱或密码不正确。";
    if (m.indexOf("Password should be") >= 0 || m.indexOf("password") >= 0) return "密码至少需要 6 位。";
    if (m.indexOf("rate") >= 0) return "操作过于频繁，请稍后再试。";
    return "操作失败：" + m;
  }

  /* ---------------- 游客 24h 确认弹窗 ---------------- */
  function confirmGuestEntry() {
    closeTopModal();
    var panel = openModal(
      '<div class="acc-modal acc-modal-warn">' +
      '<button class="acc-modal-close" aria-label="关闭">&times;</button>' +
      '<div class="acc-warn-ico">⏰</div>' +
      '<h2 class="acc-warn-title">游客模式说明</h2>' +
      '<div class="acc-warn-body">' +
      '<p>以游客身份进入仅供<b>试玩体验</b>：</p>' +
      '<ul>' +
      '<li>你的学习记录会临时保存在本设备；</li>' +
      '<li><b>24 小时后该游客账号将被自动删除</b>，学习记录<b>无法恢复</b>；</li>' +
      '<li>随时可在顶部转为正式账号永久保存。</li>' +
      '</ul>' +
      '</div>' +
      '<div class="acc-warn-actions">' +
      '<button class="acc-btn acc-btn-guest-ok" id="accGuestOk">知道了，以游客进入</button>' +
      '<button class="acc-btn acc-btn-muted" id="accGuestCancel">取消，我来注册</button>' +
      '</div>' +
      '</div>'
    );
    panel.querySelector(".acc-modal-close").addEventListener("click", closeTopModal);
    $("#accGuestCancel", panel).addEventListener("click", function () { closeTopModal(); openLoginModal(); });
    $("#accGuestOk", panel).addEventListener("click", function () {
      closeTopModal();
      $("#accGuestBtn").disabled = true;
      window.Account.signInAnonymous().then(function (u) {
        toast("已进入游客模式。学习记录将在 24 小时后删除。", "info");
        refreshAll();
      }).catch(function (err) {
        toast("游客登录失败：" + (err && err.message || ""), "err");
      });
    });
  }

  /* ---------------- 退出 ---------------- */
  function doSignOut() {
    if (window.Account.isGuest()) {
      if (!confirm("退出游客后，本设备的游客记录将清空(云端24h后删除)。确定退出?")) return;
    }
    window.Account.signOut().then(function () {
      stopGuestClock();
      removeGuestBanner();
      refreshAll();
      toast("已退出登录。", "info");
      if (window.location.hash === "#today") { /* 保持当前页 */ }
    }).catch(function () { toast("退出失败，请重试。", "err"); });
  }

  /* ---------------- 刷新所有视图 ---------------- */
  function refreshAll() {
    if (typeof window.showPageForAccount === "function") window.showPageForAccount();
    renderNav(window.Account);
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    if (!window.Account) { console.warn("[账户UI] Account 服务层未加载"); return; }
    window.Account.onReady(function () {
      systemReady = true;
      renderNav(window.Account);
    });
    // 无 Supabase 配置时(占位)也显示未登录态；点击登录会在 openLoginModal 内提示离线版
    setTimeout(function () {
      if (!systemReady && window.Account && !window.Account.configured()) {
        renderNav(window.Account);
      }
    }, 800);
  }

  // 等 DOM 就绪
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();