/* =========================================================
   一个月学会基础日语 · 账户与云端同步服务层
   依赖: Supabase JS SDK (通过 <script> 引入)
   加载顺序: supabase.js → account.js （在 data/app/voice 之后）
   ========================================================= */
(function () {
  "use strict";

  /* ---------------- 配置 (Supabase 项目密钥) ---------------- */
  var CONFIG = {
    url: "https://helfpbkaucrwulonlemv.supabase.co",   // Project URL
    anonKey: "sb_publishable_do9eBb7eyruxLBVuN2Aqsw_Uz2T538S", // publishable key (前端公钥)
  };

  /* ---------------- 内部状态 ---------------- */
  var client = null;
  var user = null;           // { id, email?, isAnonymous?, created_at }
  var guestExpiryMs = 24 * 60 * 60 * 1000; // 游客 24 小时
  var readyCallbacks = [];
  var booted = false;

  /* ---------------- 工具 ---------------- */
  function configured() {
    return CONFIG.url.indexOf("__SUPABASE") !== 0;
  }

  // 进度键统一加命名空间，游客与真实用户彻底隔离，避免互相污染
  function nsKey(day) {
    var uid = (user && user.id) || "local";
    return "nihongo_" + uid + "_done_" + day;
  }

  function readLocal(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeLocal(key, val) {
    try { if (val == null) localStorage.removeItem(key); else localStorage.setItem(key, val); } catch (e) {}
  }

  /* ---------------- SDK 初始化 ---------------- */
  function init() {
    if (!configured()) return;
    if (!window.supabase) { console.warn("[账户] Supabase SDK 未加载"); return; }
    client = window.supabase.createClient(CONFIG.url, CONFIG.anonKey);
    // 恢复会话
    client.auth.getSession().then(function (res) {
      var s = res.data && res.data.session;
      if (s) { user = mapUser(s.user); }
      fireReady();
    });
  }

  function mapUser(u) {
    return {
      id: u.id,
      email: u.email || null,
      isAnonymous: !!u.is_anonymous || !!u.aud && u.aud === "authenticated" && u.email == null,
      created_at: u.created_at || null,
    };
  }

  /* ---------------- 就绪回调 ---------------- */
  function onReady(cb) {
    if (booted) { cb(); return; }
    readyCallbacks.push(cb);
  }
  function fireReady() {
    if (booted) return;
    booted = true;
    var q = readyCallbacks; readyCallbacks = [];
    q.forEach(function (cb) { try { cb(); } catch (e) { console.error(e); } });
  }

  /* ---------------- 鉴权方法 ---------------- */
  function guardAvailable() {
    if (!configured()) { return { error: { message: "云端登录尚未启用（离线演示版）。" } }; }
    if (!client) { return { error: { message: "云端服务未初始化。" } }; }
    return null;
  }

  // 邮箱注册/登录
  function signUp(email, password) {
    var g = guardAvailable();
    if (g) return Promise.resolve(g);
    return client.auth.signUp({ email: email, password: password }).then(function (res) {
      if (res.error) throw res.error;
      if (res.data && res.data.user) user = mapUser(res.data.user);
      if (res.data && res.data.session) {
        // 已直接进入会话
        // 若需邮箱验证, 则 session 为 null, 提示用户查收确认邮件
      }
      return { session: !!(res.data && res.data.session), user: user };
    });
  }
  function signIn(email, password) {
    var g = guardAvailable();
    if (g) { var e = new Error(g.error.message); throw e; }
    return client.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
      if (res.error) throw res.error;
      user = mapUser(res.data.user);
      return user;
    });
  }
  // 游客匿名登录
  function signInAnonymous() {
    var g = guardAvailable();
    if (g) { var e = new Error(g.error.message); throw e; }
    return client.auth.signInAnonymously().then(function (res) {
      if (res.error) throw res.error;
      user = mapUser(res.data.user);
      return user;
    });
  }
  function signOut() {
    return client.auth.signOut().then(function () {
      user = null;
    });
  }

  /* ---------------- 游客 24h 检查 ---------------- */
  function guestExpiredAt(u) {
    if (!u || !u.created_at) return null;
    return new Date(u.created_at).getTime() + guestExpiryMs;
  }
  function guestRemainingSeconds() {
    if (!user || !user.isAnonymous || !user.created_at) return null;
    var ms = guestExpiredAt(user) - Date.now();
    return ms > 0 ? Math.floor(ms / 1000) : 0;
  }

  /* ---------------- 进度数据: localStorage 抽象 ----------------
     统一读写入口，让 app.js 的既有同步逻辑无痛复用。
     云端同步在 set 时异步触发，get 时优先本地(已同步过)。
  ---------------------------------------------------------------- */
  function getDone(day) { return readLocal(nsKey(day)) === "1"; }
  function setDone(day, val) {
    writeLocal(nsKey(day), val ? "1" : null);
    // 有会话(游客或正式用户均) → 异步同步到云端；游客 24h 后由清理函数级联删除
    if (user && client) {
      syncProgressToCloud();
    }
  }
  function isGuest() { return !!(user && user.isAnonymous); }

  /* ---------------- 云端同步 (有会话的用户) ---------------- */
  function syncProgressToCloud() {
    if (!user || !client) return;
    var days = (window.NihongoData && window.NihongoData.days) || [];
    var doneSet = {};
    days.forEach(function (d) {
      if (getDone(d.day)) doneSet[d.day] = true;
    });
    var doneList = Object.keys(doneSet).map(Number);
    var payload = { user_id: user.id, done: doneList, updated_at: new Date().toISOString() };
    // upsert 到 progress 表 (user_id 主键)
    client.from("progress").upsert(payload, { onConflict: "user_id" }).then(function (res) {
      if (res.error) console.warn("[账户] 进度云端同步失败", res.error);
    });
  }

  function loadProgressFromCloud() {
    if (!user || !client) return Promise.resolve();
    return client.from("progress").select("done").eq("user_id", user.id).maybeSingle().then(function (res) {
      if (res.error) throw res.error;
      if (res.data && res.data.done && Array.isArray(res.data.done)) {
        res.data.done.forEach(function (day) { writeLocal(nsKey(day), "1"); });
      }
      return res.data || null;
    });
  }

  /* ---------------- 公开 API ---------------- */
  window.Account = {
    configured: configured,
    getClient: function () { return client; },
    getUser: function () { return user; },
    getConfig: function () { return CONFIG; },
    onReady: onReady,
    signUp: signUp,
    signIn: signIn,
    signInAnonymous: signInAnonymous,
    signOut: signOut,
    isGuest: isGuest,
    getDone: getDone,
    setDone: setDone,
    guestRemainingSeconds: guestRemainingSeconds,
    syncProgress: syncProgressToCloud,
    loadProgress: loadProgressFromCloud,
    // 供 UI 在拿到用户密钥后调用一次将配置写入 (也做了占位保护)
    configure: function (url, key) {
      CONFIG.url = url; CONFIG.anonKey = key;
      init();
    },
  };

  // 自动加载已有配置(占位时自动跳过)
  init();
})();