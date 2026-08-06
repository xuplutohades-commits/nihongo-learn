/**
 * voice.js —— 日语语音朗读模块（自包含，无外部依赖）
 *
 * 功能：
 *  - window.speakJapanese(text, opts)   朗读指定文本（优先使用 ja-JP 语音）
 *  - window.stopSpeaking()              立即停止当前朗读
 *  - window.ttsAvailable()              返回布尔值，表示 TTS 是否可用于朗读
 *
 * 设计要点：
 *  - 处理 getVoices() 异步加载（首次可能为空 / 之后触发 voiceschanged）
 *  - 找不到日文语音时友好降级：仍尝试朗读，失败时弹出提示（页面 toast 或 console.warn）
 *  - 防抖 + 去重叠：短时间内连续调用只执行最后一次，且打断上一条仍在合成的语音
 *  - SpeechSynthesis API 不可用时统一 console.warn 并返回 false
 */

(function () {
  'use strict';

  // ------------------------------------------------------------------
  // 常量与状态
  // ------------------------------------------------------------------

  /** 找到可用的日文语音后，是否已触发回调（避免重复来回朗读） */
  var voicesReady = false;

  /** 最近一次朗读的 SpeechSynthesisUtterance 实例，用于暂停/取消 */
  var currentUtterance = null;

  /** 防抖定时器与最小间隔（毫秒）：在间隔内再次调用会重置定时器，只播最后一次 */
  var debounceTimer = null;
  var DEBOUNCE_MS = 400;

  /** 是否有用户/系统回调需要执行（保留为未来可能的回调队列扩展位） */
  var _noop = function () {};

  // ------------------------------------------------------------------
  // 内部工具
  // ------------------------------------------------------------------

  /**
   * 获取当前浏览器支持的语音列表。兼容旧版 Chrome 的
   * speechSynthesis.onvoiceschanged 一次性加载模式。
   * @returns {Array<SpeechSynthesisVoice>}
   */
  function getVoices() {
    if (typeof window.speechSynthesis === 'undefined') {
      return [];
    }
    try {
      return window.speechSynthesis.getVoices() || [];
    } catch (e) {
      console.warn('[voice.js] 获取语音列表失败:', e);
      return [];
    }
  }

  /**
   * 从语音列表中挑选最合适、音色最自然的日文语音。
   * 1) 优先匹配 lang 以「ja-JP」开头（精确语区）
   * 2) 其次匹配以「ja」开头
   * 在候选里，优先选名字偏「自然/真人感」的语音（如 Google 日本語、Azure/Kyoko 等），
   * 避免默认的机械感音色。
   * @returns {SpeechSynthesisVoice|null} 找不到返回 null
   */
  function pickJapaneseVoice() {
    var voices = getVoices();
    // 常见较自然的日文语音名关键词（尽力而为，命中即优先）
    var NATURAL_KEYS = ['google', 'azure', 'kyoko', 'nanami', 'sayaka', 'yuna', 'haruka',
      'natural', 'neural', 'premium', 'オンライン', '日本語'];

    function rank(v) {
      var name = (v.name || '').toLowerCase();
      var score = 0;
      for (var i = 0; i < NATURAL_KEYS.length; i++) {
        // 命中多个自然语音关键词则累加，好音色(如 Google 日本語)会更高分
        if (name.indexOf(NATURAL_KEYS[i]) !== -1) score++;
      }
      // 带名字的具体语音（非纯 lang 标签）得分略高，通常音色更真实
      if (name.length > 8) score += 0.5;
      return score;
    }

    function bestOf(list) {
      var best = null, bestScore = -1;
      for (var i = 0; i < list.length; i++) {
        var sc = rank(list[i]);
        if (sc > bestScore) { bestScore = sc; best = list[i]; }
      }
      return best;
    }

    // 精确语区候选
    var exact = [];
    for (var i = 0; i < voices.length; i++) {
      var lang = (voices[i].lang || '').toLowerCase().replace(/_/g, '-');
      if (lang === 'ja-jp' || lang.indexOf('ja-jp-') === 0) exact.push(voices[i]);
    }
    if (exact.length) return bestOf(exact);

    // 回退：任何以 ja 开头的语音
    var any = [];
    for (var k = 0; k < voices.length; k++) {
      var lang2 = (voices[k].lang || '').toLowerCase().replace(/_/g, '-');
      if (lang2 === 'ja' || lang2.indexOf('ja-') === 0) any.push(voices[k]);
    }
    if (any.length) return bestOf(any);
    return null;
  }

  /**
   * 在页面上展示一条轻量 toast（顶部居中、短暂显示）。若页面没有可用的
   * 容器/样式，则回退到 console.warn，保证不崩、不遮挡内容。
   * @param {string} message 提示文本
   */
  function showToast(message) {
    try {
      var existing = document.getElementById('nihongo-tts-toast');
      if (existing) existing.remove();

      var toast = document.createElement('div');
      toast.id = 'nihongo-tts-toast';
      toast.textContent = message;
      toast.style.cssText =
        'position:fixed;top:16px;left:50%;transform:translateX(-50%);' +
        'z-index:99999;background:rgba(0,0,0,0.85);color:#fff;' +
        'padding:10px 16px;border-radius:8px;font-size:14px;' +
        'box-shadow:0 2px 10px rgba(0,0,0,0.3);max-width:80%;';

      document.body.appendChild(toast);
      // 3 秒后自动移除
      setTimeout(function () { toast.remove(); }, 3000);
    } catch (e) {
      console.warn('[voice.js] 无法展示提示:', message, e);
    }
  }

  /**
   * 统一的用户提示入口：调用方可通过 opts.onHint 自定义，否则使用页面 toast。
   * @param {string} message 提示文本
   * @param {Object} opts    调用参数（可选）
   */
  function notify(message, opts) {
    if (opts && typeof opts.onHint === 'function') {
      opts.onHint(message);
      return;
    }
    showToast(message);
  }

  // ------------------------------------------------------------------
  // 公开 API 实现
  // ------------------------------------------------------------------

  /**
   * 判断当前环境是否具备可用语音合成能力（只检测 API 存在，不保证有日文语音）。
   * @returns {boolean}
   */
  function ttsAvailable() {
    return typeof window.speechSynthesis !== 'undefined' &&
           typeof window.speechSynthesis.speak === 'function';
  }

  /**
   * 保留一次语音加载完成的标记（在 speakJapanese 已发生voicesReady时避免重复逻辑）。
   */
  function markVoicesReady() {
    voicesReady = true;
  }

  /**
   * 正在朗读的中途停止朗读：
   *  - 取消当前 utterance 的 onend/onerror 回调，避免误触
   *  - 调用 speechSynthesis.cancel() 立即移除所有排队语音
   */
  function stopSpeaking() {
    if (!ttsAvailable()) return;
    if (currentUtterance) {
      // 解绑，避免取消产生的 onerror 触发外层提示
      currentUtterance.onend = null;
      currentUtterance.onerror = null;
      currentUtterance = null;
    }
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('[voice.js] 停止朗读失败:', e);
    }
  }

  /**
   * 核心朗读函数：朗读指定的日文文本。
   *
   * @param {string} text  要朗读的文本
   * @param {Object} [opts] 可选参数：
   *   - rate   {number} 语速（0.1~10，默认 1，适合初学者可设为 0.8）
   *   - pitch  {number} 音调（0~2，默认 1）
   *   - volume {number} 音量（0~1，默认 1）
   *   - onstart {Function} 朗读开始回调
   *   - onend   {Function} 正常结束回调
   *   - onerror {Function} 发生错误回调（含降级失败）
   *   - onHint  {Function} 自定义提示（覆盖默认 toast）
   * @returns {boolean} 是否成功发起朗读
   */
  function speakJapanese(text, opts) {
    opts = opts || {};

    // 1. 校验文本
    if (!text || String(text).trim() === '') {
      console.warn('[voice.js] 空文本，跳过朗读');
      return false;
    }

    // 2. 环境不支持
    if (!ttsAvailable()) {
      console.warn('[voice.js] 当前浏览器不支持 SpeechSynthesis，无法朗读: ' + text);
      return false;
    }

    // 3. 去重叠 + 防抖：先停掉正在读的，再把本次请求放入防抖队列
    stopSpeaking();
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // 4. 稍作防抖延迟执行（确保短时间内反复点击只播最后一次）
    debounceTimer = setTimeout(function () {
      debounceTimer = null;
      doSpeak(text, opts);
    }, DEBOUNCE_MS);

    return true;
  }

  /**
   * 防抖延迟后的真正朗读步骤（与 speakJapanese 分离，便于独立复用/测试）。
   */
  function doSpeak(text, opts) {
    // 再次确认 TTS 仍可用（可能在延迟期间被禁用）
    if (!ttsAvailable()) {
      console.warn('[voice.js] 朗读执行阶段 TTS 不可用');
      return false;
    }

    var utterance = new SpeechSynthesisUtterance(String(text));

    // 选用日文语音（找不到则保持浏览器默认语音，走降级分支提示）
    var voice = pickJapaneseVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      // 找不到日文语音：仍尝试朗读，但给用户友好提示
      console.warn('[voice.js] 未找到 ja-JP 语音，将使用浏览器默认语音朗读');
      notify('未找到日语语音包，正在用默认语音朗读（音色可能不标准）', opts);
      utterance.lang = 'ja-JP'; // 仍尝试指定语言，部分实现可加载对应音色
    }

    // 应用可调参数（默认略慢、自然，便于初学跟学；调用方可覆盖）
    utterance.rate = (typeof opts.rate === 'number') ? opts.rate : 0.9;
    utterance.pitch = (typeof opts.pitch === 'number') ? opts.pitch : 1.02;
    utterance.volume = (typeof opts.volume === 'number') ? opts.volume : 1;

    // 记录当前 utterance 以便 stopSpeaking 清理
    currentUtterance = utterance;

    // 事件绑定（内部先处理再透传给调用方）
    utterance.onstart = function () {
      if (typeof opts.onstart === 'function') opts.onstart();
    };
    utterance.onend = function () {
      if (currentUtterance === utterance) currentUtterance = null;
      if (typeof opts.onend === 'function') opts.onend();
    };
    utterance.onerror = function (event) {
      if (currentUtterance === utterance) currentUtterance = null;
      // 被取消的 error 属于预期行为，不提示
      if (event && event.error === 'canceled') {
        if (typeof opts.onend === 'function') opts.onend();
        return;
      }
      console.warn('[voice.js] 朗读出错:', event && event.error);
      notify('朗读失败：浏览器未安装可用 TTS 或已被停止', opts);
      if (typeof opts.onerror === 'function') opts.onerror(event);
    };

    try {
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.warn('[voice.js] 调用 speak() 抛出异常:', e);
      if (currentUtterance === utterance) currentUtterance = null;
      notify('朗读失败：TTS 引擎不可用', opts);
      if (typeof opts.onerror === 'function') opts.onerror(e);
      return false;
    }
  }

  // ------------------------------------------------------------------
  // 处理 getVoices 异步加载
  // ------------------------------------------------------------------

  /**
   * 立即加载一次语音列表；某些浏览器首次访问时列表为空，
   * 需在 voiceschanged 事件后再次加载（见下方事件监听）。
   */
  function warmUpVoices() {
    try {
      getVoices();
    } catch (e) {
      console.warn('[voice.js] 预热语音列表失败:', e);
    }
  }

  if (ttsAvailable()) {
    warmUpVoices();

    if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
      // 主流做法：监听 voiceschanged，语音列表就绪后更新标记，便于后续读取
      window.speechSynthesis.onvoiceschanged = function () {
        markVoicesReady();
        getVoices(); // 触发真正加载
      };
    }
    // 另设兼容兜底：部分浏览器不会触发事件，主动再拉取一次
    setTimeout(function () {
      warmUpVoices();
      markVoicesReady();
    }, 250);
  }

  // ------------------------------------------------------------------
  // 挂载到 window
  // ------------------------------------------------------------------

  window.speakJapanese = speakJapanese;
  window.stopSpeaking = stopSpeaking;
  window.ttsAvailable = ttsAvailable;
  // 暴露一个内部测试钩子（非强制，仅供调试）
  window.__ttsVoicesReady = function () { return voicesReady; };
})();