/* =====================================================================
   data.js — 一个月学会基础日语（JLPT N5 程度）教学内容数据
   定义全局对象 window.NihongoData
   作者：Hermes 内容 Agent
   所有日语：汉字为日文汉字，假名为标准读音，罗马音统一使用平文式。
   说明：内容中如需引用中文短语，均使用全角书名号「」括起，以避免
        引号嵌套。该文件末尾会触发 app.js 的 ready 回调保证时序安全。
   ===================================================================== */

(function () {
  // ---------------- 1. 五十音表（清音，含 わ / を / ん） ----------------
  var kanaTable = [
    { h: "あ", k: "ア", r: "a", type: "a" }, { h: "い", k: "イ", r: "i", type: "i" },
    { h: "う", k: "ウ", r: "u", type: "u" }, { h: "え", k: "エ", r: "e", type: "e" },
    { h: "お", k: "オ", r: "o", type: "o" },
    { h: "か", k: "カ", r: "ka", type: "k" }, { h: "き", k: "キ", r: "ki", type: "k" },
    { h: "く", k: "ク", r: "ku", type: "k" }, { h: "け", k: "ケ", r: "ke", type: "k" },
    { h: "こ", k: "コ", r: "ko", type: "k" },
    { h: "さ", k: "サ", r: "sa", type: "s" }, { h: "し", k: "シ", r: "shi", type: "s" },
    { h: "す", k: "ス", r: "su", type: "s" }, { h: "せ", k: "セ", r: "se", type: "s" },
    { h: "そ", k: "ソ", r: "so", type: "s" },
    { h: "た", k: "タ", r: "ta", type: "t" }, { h: "ち", k: "チ", r: "chi", type: "t" },
    { h: "つ", k: "ツ", r: "tsu", type: "t" }, { h: "て", k: "テ", r: "te", type: "t" },
    { h: "と", k: "ト", r: "to", type: "t" },
    { h: "な", k: "ナ", r: "na", type: "n" }, { h: "に", k: "ニ", r: "ni", type: "n" },
    { h: "ぬ", k: "ヌ", r: "nu", type: "n" }, { h: "ね", k: "ネ", r: "ne", type: "n" },
    { h: "の", k: "ノ", r: "no", type: "n" },
    { h: "は", k: "ハ", r: "ha", type: "h" }, { h: "ひ", k: "ヒ", r: "hi", type: "h" },
    { h: "ふ", k: "フ", r: "fu", type: "h" }, { h: "へ", k: "ヘ", r: "he", type: "h" },
    { h: "ほ", k: "ホ", r: "ho", type: "h" },
    { h: "ま", k: "マ", r: "ma", type: "m" }, { h: "み", k: "ミ", r: "mi", type: "m" },
    { h: "む", k: "ム", r: "mu", type: "m" }, { h: "め", k: "メ", r: "me", type: "m" },
    { h: "も", k: "モ", r: "mo", type: "m" },
    { h: "や", k: "ヤ", r: "ya", type: "y" }, { h: "ゆ", k: "ユ", r: "yu", type: "y" },
    { h: "よ", k: "ヨ", r: "yo", type: "y" },
    { h: "ら", k: "ラ", r: "ra", type: "r" }, { h: "り", k: "リ", r: "ri", type: "r" },
    { h: "る", k: "ル", r: "ru", type: "r" }, { h: "れ", k: "レ", r: "re", type: "r" },
    { h: "ろ", k: "ロ", r: "ro", type: "r" },
    { h: "わ", k: "ワ", r: "wa", type: "w" }, { h: "を", k: "ヲ", r: "o", type: "w" },
    { h: "ん", k: "ン", r: "n", type: "nn" }
  ];

  // ---------------- 2. 30 天课程 ----------------
  var days = [
    // ======== 第一周：五十音 + 基础寒暄 + 名词句 ========
    { day: 1, title: "五十音入门 · 平假名(上)", points: ["日语有平假名(ひらがな)与片假名(カタカナ)两套假名", "今天先掌握あ行~か行的平假名及其发音", "每个假名对应一个音节，元音只有 a i u e o 五个"], vocab: [
      { ja: "本", kana: "ほん", romaji: "hon", zh: "书", example: "これは本です", exampleZh: "这是书" },
      { ja: "人", kana: "ひと", romaji: "hito", zh: "人", example: "あの人は先生です", exampleZh: "那个人是老师" },
      { ja: "水", kana: "みず", romaji: "mizu", zh: "水", example: "水をください", exampleZh: "请给我水" },
      { ja: "山", kana: "やま", romaji: "yama", zh: "山", example: "富士山は高いです", exampleZh: "富士山很高" },
      { ja: "川", kana: "かわ", romaji: "kawa", zh: "河、川", example: "川があります", exampleZh: "有河流" },
      { ja: "犬", kana: "いぬ", romaji: "inu", zh: "狗", example: "犬が好きです", exampleZh: "喜欢狗" },
      { ja: "猫", kana: "ねこ", romaji: "neko", zh: "猫", example: "猫がいます", exampleZh: "有猫" }
    ], grammar: [
      { title: "名词谓语句", pattern: "A は B です / じゃありません", explain: "「です」表肯定判断，也有礼貌语气。否定用「じゃありません」或「ではありません」。", example: "私は学生です", exampleZh: "我是学生" }
    ], sentences: [
      { ja: "私は学生です", kana: "わたしはがくせいです", romaji: "watashi wa gakusei desu", zh: "我是学生" },
      { ja: "これは本です", kana: "これはほんです", romaji: "kore wa hon desu", zh: "这是书" },
      { ja: "私は学生じゃありません", kana: "わたしはがくせいじゃありません", romaji: "watashi wa gakusei ja arimasen", zh: "我不是学生" }
    ], todos: ["背熟あ~か行平假名", "抄写 10 个单词各 3 遍", "用「これは…です」造 3 个句子"], story: false },

    { day: 2, title: "五十音入门 · 平假名(下)", points: ["继续学习さ行至わ・ん的平假名", "注意 し(shi)、ち(chi)、つ(tsu)、ふ(fu) 发音特殊", "ん 是鼻音，不独立成音"], vocab: [
      { ja: "時", kana: "とき", romaji: "toki", zh: "时间、时候", example: "今は何時ですか", exampleZh: "现在几点？" },
      { ja: "天気", kana: "てんき", romaji: "tenki", zh: "天气", example: "今日はいい天気ですね", exampleZh: "今天天气真好" },
      { ja: "国", kana: "くに", romaji: "kuni", zh: "国家", example: "日本はきれいな国です", exampleZh: "日本是个美丽的国家" },
      { ja: "名前", kana: "なまえ", romaji: "namae", zh: "名字", example: "お名前は何ですか", exampleZh: "你叫什么名字？" },
      { ja: "花", kana: "はな", romaji: "hana", zh: "花", example: "花がきれいです", exampleZh: "花很漂亮" },
      { ja: "友達", kana: "ともだち", romaji: "tomodachi", zh: "朋友", example: "友達がいます", exampleZh: "有朋友" },
      { ja: "店", kana: "みせ", romaji: "mise", zh: "店、商店", example: "店に行きます", exampleZh: "去商店" }
    ], grammar: [
      { title: "疑问句", pattern: "A は B ですか？", explain: "句尾加「か」并升调即变成疑问句。", example: "あなたは日本人ですか", exampleZh: "你是日本人吗？" }
    ], sentences: [
      { ja: "今日はいい天気ですね", kana: "きょうはいいてんきですね", romaji: "kyou wa ii tenki desu ne", zh: "今天天气真好呢" },
      { ja: "お名前は何ですか", kana: "おなまえはなんですか", romaji: "o-namae wa nan desu ka", zh: "你叫什么名字？" },
      { ja: "あなたは日本人ですか", kana: "あなたはにほんじんですか", romaji: "anata wa nihonjin desu ka", zh: "你是日本人吗？" }
    ], todos: ["背完剩余平假名", "重点练习し・ち・つ・ふ四个特殊音", "默写整张平假名表"], story: false },

    { day: 3, title: "五十音入门 · 片假名", points: ["片假名用于外来语、拟声词、强调等", "片假名与平假名发音一一对应", "掌握片假名写法和外来语常用词"], vocab: [
      { ja: "コーヒー", kana: "こーひー", romaji: "koohii", zh: "咖啡(外来语)", example: "コーヒーを飲みます", exampleZh: "喝咖啡" },
      { ja: "テレビ", kana: "てれび", romaji: "terebi", zh: "电视(外来语)", example: "テレビを見ます", exampleZh: "看电视" },
      { ja: "ラジオ", kana: "らじお", romaji: "rajio", zh: "收音机(外来语)", example: "ラジオを聞きます", exampleZh: "听收音机" },
      { ja: "アメリカ", kana: "あめりか", romaji: "amerika", zh: "美国(外来语)", example: "アメリカから来ました", exampleZh: "从美国来" },
      { ja: "パン", kana: "ぱん", romaji: "pan", zh: "面包(外来语)", example: "朝ごはんはパンを食べます", exampleZh: "早餐吃面包" },
      { ja: "タクシー", kana: "たくしー", romaji: "takushii", zh: "出租车(外来语)", example: "タクシーで行きます", exampleZh: "坐出租车去" }
    ], grammar: [
      { title: "片假名外来语", pattern: "外来语用片假名书写", explain: "源自英语等外语的词用片假名，如コーヒー(coffee)、テレビ(television)。", example: "これはペンです", exampleZh: "这是钢笔" }
    ], sentences: [
      { ja: "コーヒーを飲みます", kana: "こーひーをのみます", romaji: "koohii o nomimasu", zh: "喝咖啡" },
      { ja: "テレビを見ます", kana: "てれびをみます", romaji: "terebi o mimasu", zh: "看电视" },
      { ja: "タクシーで行きます", kana: "たくしーでいきます", romaji: "takushii de ikimasu", zh: "坐出租车去" }
    ], todos: ["背熟全部片假名", "记下 6 个外来语单词", "对照平假名默写片假名表"], story: false },

    { day: 4, title: "初次见面 · 寒暄用语", points: ["日语寒暄是社交第一步，礼貌用语重要", "掌握早、中、晚的问候", "学会自我介绍的基本句式"], vocab: [
      { ja: "おはよう", kana: "おはよう", romaji: "ohayou", zh: "早上好", example: "おはようございます", exampleZh: "早上好(礼貌)" },
      { ja: "こんにちは", kana: "こんにちは", romaji: "konnichiwa", zh: "你好(白天)", example: "こんにちは、元気ですか", exampleZh: "你好，你好吗？" },
      { ja: "こんばんは", kana: "こんばんは", romaji: "konbanwa", zh: "晚上好", example: "こんばんは", exampleZh: "晚上好" },
      { ja: "はじめまして", kana: "はじめまして", romaji: "hajimemashite", zh: "初次见面", example: "はじめまして", exampleZh: "初次见面" },
      { ja: "よろしく", kana: "よろしく", romaji: "yoroshiku", zh: "请多关照", example: "よろしくお願いします", exampleZh: "请多关照" },
      { ja: "お願いします", kana: "おねがいします", romaji: "onegaishimasu", zh: "拜托了、麻烦了", example: "お願いします", exampleZh: "拜托了" }
    ], grammar: [
      { title: "自我介绍句式", pattern: "私は [名字] と言います", explain: "自我介绍用「と言います」(或「です」)。", example: "私は田中と言います", exampleZh: "我叫田中" }
    ], sentences: [
      { ja: "はじめまして、田中です", kana: "はじめまして、たなかです", romaji: "hajimemashite, Tanaka desu", zh: "初次见面，我是田中" },
      { ja: "どうぞよろしくお願いします", kana: "どうぞよろしくおねがいします", romaji: "douzo yoroshiku onegaishimasu", zh: "请多多关照" },
      { ja: "こちらこそ、よろしく", kana: "こちらこそ、よろしく", romaji: "kochira koso, yoroshiku", zh: "我才是，请多关照" }
    ], todos: ["练习见面与告别寒暄", "用自我介绍句式口头介绍自己", "背熟 6 个寒暄词"], story: false },

    { day: 5, title: "名词句 · 「は」主题助词", points: ["「は」标记主题，作助词时读作 wa", "「です」表判定与礼貌", "掌握「これは～です」指示词句"], vocab: [
      { ja: "これ", kana: "これ", romaji: "kore", zh: "这个(离说话人近)", example: "これは本です", exampleZh: "这是书" },
      { ja: "それ", kana: "それ", romaji: "sore", zh: "那个(离听话人近)", example: "それは何ですか", exampleZh: "那是什么？" },
      { ja: "あれ", kana: "あれ", romaji: "are", zh: "那个(离双方都远)", example: "あれは山です", exampleZh: "那是山" },
      { ja: "この本", kana: "このほん", romaji: "kono hon", zh: "这本书", example: "この本は面白いです", exampleZh: "这本书很有趣" },
      { ja: "その人", kana: "そのひと", romaji: "sono hito", zh: "那个人", example: "その人は誰ですか", exampleZh: "那个人是谁？" },
      { ja: "あの店", kana: "あのみせ", romaji: "ano mise", zh: "那家店", example: "あの店は高いです", exampleZh: "那家店很贵" }
    ], grammar: [
      { title: "指示代词 これ/それ/あれ", pattern: "これ・それ・あれ + は + 名词 + です", explain: "これ近指，それ中指，あれ远指。修饰名词时用この/その/あの。", example: "それは日本語の本です", exampleZh: "那是日语书" }
    ], sentences: [
      { ja: "これは何ですか", kana: "これはなんですか", romaji: "kore wa nan desu ka", zh: "这是什么？" },
      { ja: "それは本です", kana: "それはほんです", romaji: "sore wa hon desu", zh: "那是书" },
      { ja: "あれは富士山です", kana: "あれはふじさんです", romaji: "are wa Fujisan desu", zh: "那是富士山" }
    ], todos: ["区分これ・それ・あれ的远近用法", "自问自答练「这是什么」5 次", "掌握この・その・あの修饰用法"], story: false },

    { day: 6, title: "名词句 · 肯定与否定", points: ["否定句用「じゃありません」，口语更常用", "「ですか」构成疑问句", "「はい」「いいえ」回答肯定否定疑问"], vocab: [
      { ja: "はい", kana: "はい", romaji: "hai", zh: "是、对", example: "はい、そうです", exampleZh: "是的" },
      { ja: "いいえ", kana: "いいえ", romaji: "iie", zh: "不、不是", example: "いいえ、違います", exampleZh: "不，不对" },
      { ja: "先生", kana: "せんせい", romaji: "sensei", zh: "老师", example: "私は先生です", exampleZh: "我是老师" },
      { ja: "学生", kana: "がくせい", romaji: "gakusei", zh: "学生", example: "彼は学生です", exampleZh: "他是学生" },
      { ja: "会社員", kana: "かいしゃいん", romaji: "kaishain", zh: "公司职员", example: "私は会社員です", exampleZh: "我是公司职员" },
      { ja: "医者", kana: "いしゃ", romaji: "isha", zh: "医生", example: "父は医者です", exampleZh: "父亲是医生" }
    ], grammar: [
      { title: "名词句否定", pattern: "A は B じゃありません", explain: "否定判断用「じゃありません」(口语)或「ではありません」(书面)。", example: "私は医者じゃありません", exampleZh: "我不是医生" }
    ], sentences: [
      { ja: "はい、そうです", kana: "はい、そうです", romaji: "hai, sou desu", zh: "是的" },
      { ja: "いいえ、私は学生じゃありません", kana: "いいえ、わたしはがくせいじゃありません", romaji: "iie, watashi wa gakusei ja arimasen", zh: "不，我不是学生" },
      { ja: "あなたは先生ですか", kana: "あなたはせんせいですか", romaji: "anata wa sensei desu ka", zh: "你是老师吗？" }
    ], todos: ["掌握肯定・否定・疑问三种结构", "练熟はい/いいえ应答", "自我职业介绍练习"], story: false },

    { day: 7, title: "周复习 · 五十音与名词句", points: ["系统复习平假名与片假名", "复习名词句的肯定・否定・疑问", "挑战不看表默写五十音"], vocab: [
      { ja: "日本語", kana: "にほんご", romaji: "nihongo", zh: "日语", example: "日本語を勉強します", exampleZh: "学日语" },
      { ja: "英語", kana: "えいご", romaji: "eigo", zh: "英语", example: "英語がわかります", exampleZh: "懂英语" },
      { ja: "中国語", kana: "ちゅうごくご", romaji: "chuugokugo", zh: "中文", example: "中国語を話します", exampleZh: "说中文" },
      { ja: "学校", kana: "がっこう", romaji: "gakkou", zh: "学校", example: "学校に行きます", exampleZh: "去学校" },
      { ja: "会社", kana: "かいしゃ", romaji: "kaisha", zh: "公司", example: "会社で働きます", exampleZh: "在公司工作" },
      { ja: "家", kana: "いえ", romaji: "ie", zh: "家", example: "家に帰ります", exampleZh: "回家" }
    ], grammar: [
      { title: "综合复习", pattern: "五十音 + 名词句", explain: "本周核心：五十音认读 + 名词谓语句的肯定、否定、疑问。", example: "私は日本語の学生です", exampleZh: "我是日语学生" }
    ], sentences: [
      { ja: "私は日本語を勉強します", kana: "わたしはにほんごをべんきょうします", romaji: "watashi wa nihongo o benkyou shimasu", zh: "我学日语" },
      { ja: "学校に何がありますか", kana: "がっこうになにがありますか", romaji: "gakkou ni nani ga arimasu ka", zh: "学校有什么？" }
    ], todos: ["默写五十音(平假名＋片假名)", "把前 6 天词汇过一遍", "用名词句写 5 句自我介绍"], story: true },

    // ======== 第二周：基础动词 + 句型 ========
    { day: 8, title: "动词入门 · ます形(礼貌形)", points: ["动词原形(辞书形)变为ます形", "ます形是礼貌用语的基本形式", "动词一般位于句末"], vocab: [
      { ja: "行きます", kana: "いきます", romaji: "ikimasu", zh: "去(行く)", example: "学校へ行きます", exampleZh: "去学校" },
      { ja: "来ます", kana: "きます", romaji: "kimasu", zh: "来(来る)", example: "日本へ来ます", exampleZh: "来日本" },
      { ja: "帰ります", kana: "かえります", romaji: "kaerimasu", zh: "回去(帰る)", example: "家へ帰ります", exampleZh: "回家" },
      { ja: "食べます", kana: "たべます", romaji: "tabemasu", zh: "吃(食べる)", example: "ご飯を食べます", exampleZh: "吃饭" },
      { ja: "飲みます", kana: "のみます", romaji: "nomimasu", zh: "喝(飲む)", example: "お茶を飲みます", exampleZh: "喝茶" },
      { ja: "見ます", kana: "みます", romaji: "mimasu", zh: "看(見る)", example: "映画を見ます", exampleZh: "看电影" }
    ], grammar: [
      { title: "动词ます形", pattern: "動詞ます形(辞書形变化)", explain: "动词分三类。一类动词(五段)词尾う段变い段＋ます；二类动词(一段)去る＋ます；三类动词する→します、来る→来ます。", example: "行く→行きます、食べる→食べます", exampleZh: "去→去、吃→吃(礼貌形)" }
    ], sentences: [
      { ja: "学校へ行きます", kana: "がっこうへいきます", romaji: "gakkou e ikimasu", zh: "去学校" },
      { ja: "ご飯を食べます", kana: "ごはんをたべます", romaji: "gohan o tabemasu", zh: "吃饭" },
      { ja: "映画を見ます", kana: "えいがをみます", romaji: "eiga o mimasu", zh: "看电影" }
    ], todos: ["记牢一类・二类・三类动词的概念", "掌握 6 个动词的ます形", "每个动词各造一句"], story: false },

    { day: 9, title: "动词否定与过去", points: ["「ません」表否定，「ました」表过去", "过去否定「ませんでした」", "动词时态由句尾变化表达"], vocab: [
      { ja: "行きません", kana: "いきません", romaji: "ikimasen", zh: "不去", example: "今日学校へ行きません", exampleZh: "今天不去学校" },
      { ja: "行きました", kana: "いきました", romaji: "ikimashita", zh: "去过了", example: "昨日行きました", exampleZh: "昨天去了" },
      { ja: "食べません", kana: "たべません", romaji: "tabemasen", zh: "不吃", example: "朝ごはんを食べません", exampleZh: "不吃早餐" },
      { ja: "飲みません", kana: "のみません", romaji: "nomimasen", zh: "不喝", example: "お酒を飲みません", exampleZh: "不喝酒" },
      { ja: "買いました", kana: "かいました", romaji: "kaimashita", zh: "买了(買う)", example: "本を買いました", exampleZh: "买了书" },
      { ja: "見ました", kana: "みました", romaji: "mimashita", zh: "看了", example: "テレビを見ました", exampleZh: "看电视了" }
    ], grammar: [
      { title: "动词时态", pattern: "ます / ません / ました / ませんでした", explain: "ます表现在・将来，ません表否定，ました表过去，ませんでした表过去否定。", example: "昨日映画を見ませんでした", exampleZh: "昨天没看电影" }
    ], sentences: [
      { ja: "昨日映画を見ました", kana: "きのうえいがをみました", romaji: "kinou eiga o mimashita", zh: "昨天看了电影" },
      { ja: "今日は学校へ行きません", kana: "きょうはがっこうへいきません", romaji: "kyou wa gakkou e ikimasen", zh: "今天不去学校" },
      { ja: "昨日ご飯を食べませんでした", kana: "きのうごはんをたべませんでした", romaji: "kinou gohan o tabemasen deshita", zh: "昨天没吃饭" }
    ], todos: ["记住四种时态形式", "把 6 个词变成否定和过去式", "用时间词昨日/今日各造 2 句"], story: false },

    { day: 10, title: "形容词入门 · い形容词", points: ["い形容词以「い」结尾，可直接修饰名词", "否定把「い」变「くない」，过去变「かった」", "形容词也可构成礼貌句(加です)"], vocab: [
      { ja: "大きい", kana: "おおきい", romaji: "ookii", zh: "大的", example: "大きい犬です", exampleZh: "大狗" },
      { ja: "小さい", kana: "ちいさい", romaji: "chiisai", zh: "小的", example: "小さい猫です", exampleZh: "小猫" },
      { ja: "高い", kana: "たかい", romaji: "takai", zh: "高、贵的", example: "高い山です", exampleZh: "高山" },
      { ja: "安い", kana: "やすい", romaji: "yasui", zh: "便宜的", example: "安い店です", exampleZh: "便宜的店" },
      { ja: "新しい", kana: "あたらしい", romaji: "atarashii", zh: "新的", example: "新しい本です", exampleZh: "新书" },
      { ja: "古い", kana: "ふるい", romaji: "furui", zh: "旧的", example: "古い車です", exampleZh: "旧车" }
    ], grammar: [
      { title: "い形容词", pattern: "い形容詞 + 名词", explain: "い形容词直接放在名词前修饰，作谓语时句末加です。", example: "高い山です", exampleZh: "高山" }
    ], sentences: [
      { ja: "この本は新しいです", kana: "このほんはあたらしいです", romaji: "kono hon wa atarashii desu", zh: "这本书是新的" },
      { ja: "富士山は高いです", kana: "ふじさんはたかいです", romaji: "Fujisan wa takai desu", zh: "富士山很高" },
      { ja: "この店は安いです", kana: "このみせはやすいです", romaji: "kono mise wa yasui desu", zh: "这家店很便宜" }
    ], todos: ["背熟 6 个い形容词", "学会い形容词的否定与过去变化", "用い形容词描述身边事物"], story: false },

    { day: 11, title: "な形容词与名词修饰", points: ["な形容词修饰名词时加「な」", "な形容词词干＋です 作谓语", "区分い形容词与な形容词"], vocab: [
      { ja: "きれい", kana: "きれい", romaji: "kirei", zh: "漂亮、干净(な形)", example: "きれいな花です", exampleZh: "漂亮的花" },
      { ja: "静か", kana: "しずか", romaji: "shizuka", zh: "安静的", example: "静かな部屋です", exampleZh: "安静的房间" },
      { ja: "有名", kana: "ゆうめい", romaji: "yuumei", zh: "有名的", example: "有名な歌手です", exampleZh: "有名的歌手" },
      { ja: "好き", kana: "すき", romaji: "suki", zh: "喜欢的", example: "日本語が好きです", exampleZh: "喜欢日语" },
      { ja: "嫌い", kana: "きらい", romaji: "kirai", zh: "讨厌的", example: "野菜が嫌いです", exampleZh: "讨厌蔬菜" },
      { ja: "便利", kana: "べんり", romaji: "benri", zh: "方便的", example: "便利な道具です", exampleZh: "方便的工具" }
    ], grammar: [
      { title: "な形容词", pattern: "な形容詞(词干)＋な＋名词", explain: "な形容词修饰名词时在词干后加「な」。注意「きれい」虽以い结尾却是な形容词。", example: "きれいな花です", exampleZh: "漂亮的花" }
    ], sentences: [
      { ja: "この部屋は静かです", kana: "このへやはしずかです", romaji: "kono heya wa shizuka desu", zh: "这个房间很安静" },
      { ja: "日本語が好きです", kana: "にほんごがすきです", romaji: "nihongo ga suki desu", zh: "喜欢日语" },
      { ja: "ここは便利です", kana: "ここはべんりです", romaji: "koko wa benri desu", zh: "这里很方便" }
    ], todos: ["区分い形容词和な形容词", "记牢 6 个な形容词", "用な形容词造 4 句"], story: false },

    { day: 12, title: "形容词的否定与过去", points: ["い形容词否定「くない」、过去「かった」", "な形容词否定「じゃありません」「ではありません」", "过去否定与现在否定对比"], vocab: [
      { ja: "高くありません", kana: "たかくありません", romaji: "takaku arimasen", zh: "不高、不贵", example: "この本は高くありません", exampleZh: "这本书不贵" },
      { ja: "高かったです", kana: "たかかったです", romaji: "takakatta desu", zh: "过去高、贵", example: "昔の家は高かったです", exampleZh: "以前的房价高" },
      { ja: "新しくありません", kana: "あたらしくありません", romaji: "atarashiku arimasen", zh: "不新", example: "この車は新しくありません", exampleZh: "这辆车不新" },
      { ja: "静かじゃありません", kana: "しずかじゃありません", romaji: "shizuka ja arimasen", zh: "不安静", example: "この場所は静かじゃありません", exampleZh: "这个地方不安静" },
      { ja: "きれいじゃありません", kana: "きれいじゃありません", romaji: "kirei ja arimasen", zh: "不漂亮、不干净", example: "この部屋はきれいじゃありません", exampleZh: "这个房间不干净" },
      { ja: "好きじゃありません", kana: "すきじゃありません", romaji: "suki ja arimasen", zh: "不喜欢", example: "お酒が好きじゃありません", exampleZh: "不喜欢酒" }
    ], grammar: [
      { title: "形容词否定与过去", pattern: "い形容詞→くない/かった；な形容詞→じゃありません/でした", explain: "い形容词否定变词干「くない」，过去「かった」；な形容词用「じゃありません」「でした」。", example: "昨日は暑かったです", exampleZh: "昨天很热" }
    ], sentences: [
      { ja: "この店は高くありません", kana: "このみせはたかくありません", romaji: "kono mise wa takaku arimasen", zh: "这家店不贵" },
      { ja: "昨日は暑かったです", kana: "きのうはあつかったです", romaji: "kinou wa atsukatta desu", zh: "昨天很热" },
      { ja: "この部屋は静かじゃありません", kana: "このへやはしずかじゃありません", romaji: "kono heya wa shizuka ja arimasen", zh: "这个房间不安静" }
    ], todos: ["学会い形容词变化「くない/かった」", "学会な形容词的否定", "用昨天/今天对比造 3 句"], story: false },

    { day: 13, title: "周复习 · 动词与形容词", points: ["综合复习动词ます形及时态变化", "复习い形容词・な形容词的变形", "运用到实际生活描述中"], vocab: [
      { ja: "勉強します", kana: "べんきょうします", romaji: "benkyou shimasu", zh: "学习(勉強する)", example: "日本語を勉強します", exampleZh: "学日语" },
      { ja: "仕事", kana: "しごと", romaji: "shigoto", zh: "工作", example: "仕事をします", exampleZh: "工作" },
      { ja: "買い物", kana: "かいもの", romaji: "kaimono", zh: "购物", example: "買い物に行きます", exampleZh: "去买东西" },
      { ja: "楽しい", kana: "たのしい", romaji: "tanoshii", zh: "开心的(い形)", example: "楽しい時間でした", exampleZh: "是快乐的时光" },
      { ja: "忙しい", kana: "いそがしい", romaji: "isogashii", zh: "忙的", example: "今日は忙しいです", exampleZh: "今天很忙" },
      { ja: "暇", kana: "ひま", romaji: "hima", zh: "空闲的(な形)", example: "今暇ですか", exampleZh: "现在有空吗？" }
    ], grammar: [
      { title: "综合复习", pattern: "動詞＋形容詞", explain: "本周核心：动词四种时态、い形容词与な形容词的变形。", example: "昨日は忙しかったです", exampleZh: "昨天很忙" }
    ], sentences: [
      { ja: "昨日は忙しかったです", kana: "きのうはいそがしかったです", romaji: "kinou wa isogashikatta desu", zh: "昨天很忙" },
      { ja: "今、暇ですか", kana: "いま、ひまですか", romaji: "ima, hima desu ka", zh: "现在有空吗？" },
      { ja: "買い物に行きます", kana: "かいものにいきます", romaji: "kaimono ni ikimasu", zh: "去买东西" }
    ], todos: ["自测：把 6 个动词变否定和过去", "区分い形容词和な形容词的否定", "写一段关于昨天的简短日语"], story: true },

    // ======== 第三周：助词与语法深化 ========
    { day: 14, title: "助词「を・に・で・へ」", points: ["「を」标宾语，「に・へ」标方向目的地", "「で」标手段、场所或行为发生地", "「に」还表时间点、存在地"], vocab: [
      { ja: "を", kana: "を", romaji: "o", zh: "宾格助词", example: "本を読みます", exampleZh: "读书" },
      { ja: "に", kana: "に", romaji: "ni", zh: "方向/时间/存在助词", example: "7時に起きます", exampleZh: "7点起床" },
      { ja: "で", kana: "で", romaji: "de", zh: "方式/地点助词", example: "電車で行きます", exampleZh: "坐电车去" },
      { ja: "へ", kana: "へ", romaji: "e", zh: "方向助词(读e)", example: "日本へ行きます", exampleZh: "去日本" },
      { ja: "電車", kana: "でんしゃ", romaji: "densha", zh: "电车", example: "電車で通勤します", exampleZh: "坐电车通勤" },
      { ja: "バス", kana: "ばす", romaji: "basu", zh: "公共汽车(外来语)", example: "バスで買い物に行きます", exampleZh: "坐公交去买东西" }
    ], grammar: [
      { title: "助词を・に・で・へ", pattern: "を(宾语)、に・へ(方向)、で(手段/地点)", explain: "を标记动作对象；に指处所或时间；へ指方向；で表方式手段。", example: "電車で東京へ行きます", exampleZh: "坐电车去东京" }
    ], sentences: [
      { ja: "電車で東京へ行きます", kana: "でんしゃでとうきょうへいきます", romaji: "densha de Toukyou e ikimasu", zh: "坐电车去东京" },
      { ja: "毎朝7時に起きます", kana: "まいあさしちじに おきます", romaji: "maiasa shichiji ni okimasu", zh: "每天早上7点起床" },
      { ja: "図書館で勉強します", kana: "としょかんでべんきょうします", romaji: "toshokan de benkyou shimasu", zh: "在图书馆学习" }
    ], todos: ["区分を・に・で・へ的用法", "背熟 6 个助词与词", "各造一个例句"], story: false },

    { day: 15, title: "存在句 · あります/います", points: ["「あります」用于无生命物，「います」用于有生命物", "存在句常用「場所に…があります/います」", "询问存在用「ありますか/いますか」"], vocab: [
      { ja: "あります", kana: "あります", romaji: "arimasu", zh: "有、在(无生命)", example: "机の上に本があります", exampleZh: "桌上有书" },
      { ja: "います", kana: "います", romaji: "imasu", zh: "有、在(有生命)", example: "部屋に猫がいます", exampleZh: "房间里有猫" },
      { ja: "部屋", kana: "へや", romaji: "heya", zh: "房间", example: "部屋がきれいです", exampleZh: "房间很干净" },
      { ja: "机", kana: "つくえ", romaji: "tsukue", zh: "桌子", example: "机の上にあります", exampleZh: "在桌子上" },
      { ja: "いす", kana: "いす", romaji: "isu", zh: "椅子", example: "いすの下に猫がいます", exampleZh: "椅子下有猫" },
      { ja: "上", kana: "うえ", romaji: "ue", zh: "上面", example: "テレビの上にあります", exampleZh: "在电视上面" }
    ], grammar: [
      { title: "存在句", pattern: "場所＋に＋物/人＋が＋あります/います", explain: "无生命物用あります，有生命物(人、动物)用います。", example: "公園に人がいます", exampleZh: "公园里有人" }
    ], sentences: [
      { ja: "机の上に本があります", kana: "つくえのうえにほんがあります", romaji: "tsukue no ue ni hon ga arimasu", zh: "桌上有书" },
      { ja: "部屋に猫がいます", kana: "へやにねこがいます", romaji: "heya ni neko ga imasu", zh: "房间里有猫" },
      { ja: "公園に人がいます", kana: "こうえんにひとがいます", romaji: "kouen ni hito ga imasu", zh: "公园里有人" }
    ], todos: ["区分あります/います的使用对象", "掌握场所＋に＋名词＋が＋存在", "描述自己房间摆设写 3 句"], story: false },

    { day: 16, title: "助词「から・まで」表范围", points: ["「から」表起点，「まで」表终点", "可用于时间或空间范围", "「から…まで」常搭配使用"], vocab: [
      { ja: "から", kana: "から", romaji: "kara", zh: "从", example: "9時から働きます", exampleZh: "从9点开始工作" },
      { ja: "まで", kana: "まで", romaji: "made", zh: "到", example: "5時まで働きます", exampleZh: "工作到5点" },
      { ja: "朝", kana: "あさ", romaji: "asa", zh: "早晨", example: "朝から仕事です", exampleZh: "从早上开始工作" },
      { ja: "夜", kana: "よる", romaji: "yoru", zh: "晚上", example: "夜まで働きます", exampleZh: "工作到晚上" },
      { ja: "昼", kana: "ひる", romaji: "hiru", zh: "中午", example: "昼12時に食べます", exampleZh: "中午12点吃饭" },
      { ja: "午前", kana: "ごぜん", romaji: "gozen", zh: "上午", example: "午前中に終わります", exampleZh: "上午结束" }
    ], grammar: [
      { title: "から・まで", pattern: "A から B まで", explain: "から表起点，まで表终点，一起使用表示「从…到…」。", example: "私は9時から5時まで働きます", exampleZh: "我从9点工作到5点" }
    ], sentences: [
      { ja: "9時から5時まで働きます", kana: "くじからごじまではたらきます", romaji: "kuji kara goji made hatarakimasu", zh: "从9点工作到5点" },
      { ja: "朝から夜まで勉強します", kana: "あさからよるまでべんきょうします", romaji: "asa kara yoru made benkyou shimasu", zh: "从早到晚学习" },
      { ja: "銀行は9時から3時までです", kana: "ぎんこうはくじからさんじまでです", romaji: "ginkou wa kuji kara sanji made desu", zh: "银行从9点到3点" }
    ], todos: ["掌握から・まで表时间/范围", "背熟时间词", "用から…まで写自己一天安排"], story: false },

    { day: 17, title: "「て形」连接 · 请求与许可", points: ["て形连接两个动作表顺序", "「てください」表请求", "「てもいいですか」询问许可"], vocab: [
      { ja: "見てください", kana: "みてください", romaji: "mite kudasai", zh: "请看", example: "写真を見てください", exampleZh: "请看照片" },
      { ja: "聞いてください", kana: "きいてください", romaji: "kiite kudasai", zh: "请听", example: "音楽を聞いてください", exampleZh: "请听音乐" },
      { ja: "話してください", kana: "はなしてください", romaji: "hanashite kudasai", zh: "请说", example: "日本語で話してください", exampleZh: "请用日语说" },
      { ja: "書いてください", kana: "かいてください", romaji: "kaite kudasai", zh: "请写", example: "名前を書いてください", exampleZh: "请写下名字" },
      { ja: "入ってください", kana: "はいってください", romaji: "haite kudasai", zh: "请进", example: "どうぞ入ってください", exampleZh: "请进" },
      { ja: "食べてください", kana: "たべてください", romaji: "tabete kudasai", zh: "请吃", example: "どうぞ食べてください", exampleZh: "请吃吧" }
    ], grammar: [
      { title: "て形", pattern: "動詞て形＋ください", explain: "て形是动词的重要连接形式。一类动词变化特殊，需按结尾音变化为て/で。", example: "この本を読んでください", exampleZh: "请读这本书" }
    ], sentences: [
      { ja: "日本語で話してください", kana: "にほんごではなしてください", romaji: "nihongo de hanashite kudasai", zh: "请用日语说" },
      { ja: "写真を見てください", kana: "しゃしんをみてください", romaji: "shashin o mite kudasai", zh: "请看照片" },
      { ja: "ここへ来てください", kana: "ここへきてください", romaji: "koko e kite kudasai", zh: "请到这里来" }
    ], todos: ["掌握て形变化(一类动词规律)", "背熟 6 个てください例句", "学会请求说法"], story: false },

    { day: 18, title: "「て形」连接两个动作", points: ["て形连接两个连续动作，表做完A再做B", "て形也用于状态持续", "连接多个动作时主题不必重复"], vocab: [
      { ja: "起きて", kana: "おきて", romaji: "okite", zh: "起床(然后)", example: "起きて顔を洗います", exampleZh: "起床后洗脸" },
      { ja: "食べて", kana: "たべて", romaji: "tabete", zh: "吃(然后)", example: "朝ごはんを食べて学校へ行きます", exampleZh: "吃完早饭去学校" },
      { ja: "行って", kana: "いって", romaji: "itte", zh: "去(然后)", example: "駅へ行って電車に乗ります", exampleZh: "去车站坐电车" },
      { ja: "読んで", kana: "よんで", romaji: "yonde", zh: "读(然后)", example: "本を読んで寝ます", exampleZh: "读书后睡觉" },
      { ja: "顔", kana: "かお", romaji: "kao", zh: "脸", example: "顔を洗います", exampleZh: "洗脸" },
      { ja: "洗います", kana: "あらいます", romaji: "araimasu", zh: "洗", example: "手を洗います", exampleZh: "洗手" }
    ], grammar: [
      { title: "て形连接", pattern: "動詞て形＋動詞", explain: "用て形连接两个动作表顺序，非句末动词用て形。", example: "お風呂に入って寝ます", exampleZh: "泡澡后睡觉" }
    ], sentences: [
      { ja: "朝ごはんを食べて学校へ行きます", kana: "あさごはんをたべてがっこうへいきます", romaji: "asagohan o tabete gakkou e ikimasu", zh: "吃完早饭去学校" },
      { ja: "本を読んで寝ます", kana: "ほんをよんでねます", romaji: "hon o yonde nemasu", zh: "读书后睡觉" },
      { ja: "駅へ行って電車に乗ります", kana: "えきへいってでんしゃにのります", romaji: "eki e itte densha ni norimasu", zh: "去车站坐电车" }
    ], todos: ["注意一类动词て形的音便规律", "用て形描述自己一天的顺序", "背 6 个词"], story: false },

    { day: 19, title: "「ない形」否定与禁止", points: ["「ない」表否定(辞书形变ない形)", "「ないでください」表禁止", "区分ません与ない形的语气"], vocab: [
      { ja: "行かない", kana: "いかない", romaji: "ikanai", zh: "不去(否定形)", example: "今日は行かない", exampleZh: "今天不去" },
      { ja: "食べない", kana: "たべない", romaji: "tabenai", zh: "不吃", example: "昼ごはんを食べない", exampleZh: "不吃午饭" },
      { ja: "話さない", kana: "はなさない", romaji: "hanasanai", zh: "不说", example: "何も話さない", exampleZh: "什么都不说" },
      { ja: "来ない", kana: "こない", romaji: "konai", zh: "不来", example: "彼は来ない", exampleZh: "他不来" },
      { ja: "しない", kana: "しない", romaji: "shinai", zh: "不做", example: "仕事をしない", exampleZh: "不工作" },
      { ja: "行かないでください", kana: "いかないでください", romaji: "ikanaide kudasai", zh: "请别去", example: "危ないから行かないでください", exampleZh: "危险，请别去" }
    ], grammar: [
      { title: "ない形", pattern: "動詞ない形＋ないでください", explain: "ない形是动词否定的基础，ないでください表示「请不要…」。", example: "ここでタバコを吸わないでください", exampleZh: "请别在这里吸烟" }
    ], sentences: [
      { ja: "ここで写真を撮らないでください", kana: "ここでしゃしんをとらないでください", romaji: "koko de shashin o toranaide kudasai", zh: "请别在这里拍照" },
      { ja: "今日は学校へ行かない", kana: "きょうはがっこうへいかない", romaji: "kyou wa gakkou e ikanai", zh: "今天不去学校" },
      { ja: "遅く来ないでください", kana: "おそくこないでください", romaji: "osoku konaide kudasai", zh: "请别来晚" }
    ], todos: ["掌握ない形变化规律", "学会ないでください(禁止表达)", "把学过动词变ない形"], story: false },

    { day: 20, title: "过去式「た形」", points: ["た形表过去完成，变化与て形一致", "た形也用于经验、回忆", "用过去式表达昨天做过的事"], vocab: [
      { ja: "行った", kana: "いった", romaji: "itta", zh: "去了", example: "昨日東京へ行った", exampleZh: "昨天去了东京" },
      { ja: "食べた", kana: "たべた", romaji: "tabeta", zh: "吃了", example: "朝ごはんを食べた", exampleZh: "吃了早饭" },
      { ja: "見た", kana: "みた", romaji: "mita", zh: "看了", example: "映画を見た", exampleZh: "看了电影" },
      { ja: "読んだ", kana: "よんだ", romaji: "yonda", zh: "读了", example: "本を読んだ", exampleZh: "读了书" },
      { ja: "飲んだ", kana: "のんだ", romaji: "nonda", zh: "喝了", example: "お茶を飲んだ", exampleZh: "喝了茶" },
      { ja: "した", kana: "した", romaji: "shita", zh: "做了", example: "宿題をした", exampleZh: "做了作业" }
    ], grammar: [
      { title: "た形", pattern: "動詞た形", explain: "た形表过去完成，变化规则与て形相同(以い→った，に→んだ等)。", example: "昨日友達に会った", exampleZh: "昨天见了朋友" }
    ], sentences: [
      { ja: "昨日東京へ行った", kana: "きのうとうきょうへいった", romaji: "kinou Toukyou e itta", zh: "昨天去了东京" },
      { ja: "映画を見た", kana: "えいがをみた", romaji: "eiga o mita", zh: "看了电影" },
      { ja: "昨日友達に会った", kana: "きのうともだちにあった", romaji: "kinou tomodachi ni atta", zh: "昨天见了朋友" }
    ], todos: ["掌握て形转た形的规则", "用过去式写昨天 3 件事", "背 6 个动词的た形"], story: false },

    { day: 21, title: "周复习 · 助词与变化", points: ["复习助词をにでへからまで", "复习て形・ない形・た形三种变化", "综合运用于描述一天生活"], vocab: [
      { ja: "昨日", kana: "きのう", romaji: "kinou", zh: "昨天", example: "昨日何をしましたか", exampleZh: "昨天做了什么？" },
      { ja: "今日", kana: "きょう", romaji: "kyou", zh: "今天", example: "今日はいい天気です", exampleZh: "今天天气好" },
      { ja: "明日", kana: "あした", romaji: "ashita", zh: "明天", example: "明日会社へ行きます", exampleZh: "明天去公司" },
      { ja: "毎日", kana: "まいにち", romaji: "mainichi", zh: "每天", example: "毎日日本語を勉強します", exampleZh: "每天学日语" },
      { ja: "夕方", kana: "ゆうがた", romaji: "yuugata", zh: "傍晚", example: "夕方家に帰ります", exampleZh: "傍晚回家" },
      { ja: "今朝", kana: "けさ", romaji: "kesa", zh: "今天早上", example: "今朝早く起きました", exampleZh: "今天早上起得早" }
    ], grammar: [
      { title: "综合复习", pattern: "助詞＋動詞変化", explain: "本周核心：助词用法 + て形/ない形/た形变化。", example: "昨日友達と映画を見ました", exampleZh: "昨天和朋友看了电影" }
    ], sentences: [
      { ja: "昨日友達と映画を見ました", kana: "きのうともだちとえいがをみました", romaji: "kinou tomodachi to eiga o mimashita", zh: "昨天和朋友看了电影" },
      { ja: "毎日日本語を勉強します", kana: "まいにちにほんごをべんきょうします", romaji: "mainichi nihongo o benkyou shimasu", zh: "每天学日语" },
      { ja: "明日、何をしますか", kana: "あした、なにをしますか", romaji: "ashita, nani o shimasu ka", zh: "明天做什么？" }
    ], todos: ["用助词正确造句", "自测三种动词变化", "写中文简述并尝试译成日语"], story: true },

    // ======== 第四周：综合运用与测试 ========
    { day: 22, title: "愿望表达 · たい形", points: ["「たい」表「想…」的愿望", "助词常把を变为が", "たい形后接です表示礼貌"], vocab: [
      { ja: "行きたい", kana: "いきたい", romaji: "ikitai", zh: "想去", example: "日本へ行きたいです", exampleZh: "想去日本" },
      { ja: "食べたい", kana: "たべたい", romaji: "tabetai", zh: "想吃", example: "寿司が食べたいです", exampleZh: "想吃寿司" },
      { ja: "見たい", kana: "みたい", romaji: "mitai", zh: "想看", example: "富士山が見たいです", exampleZh: "想看富士山" },
      { ja: "会いたい", kana: "あいたい", romaji: "aitai", zh: "想见", example: "友達に会いたいです", exampleZh: "想见朋友" },
      { ja: "知りたい", kana: "しりたい", romaji: "shiritai", zh: "想知道", example: "あなたのことが知りたい", exampleZh: "想知道你的事" },
      { ja: "飲みたい", kana: "のみたい", romaji: "nomitai", zh: "想喝", example: "お茶が飲みたいです", exampleZh: "想喝茶" }
    ], grammar: [
      { title: "たい形", pattern: "動詞ます形(去ます)＋たい", explain: "表愿望「想…」。对象语常用が。", example: "日本料理を食べたいです", exampleZh: "想吃日本菜" }
    ], sentences: [
      { ja: "日本へ行きたいです", kana: "にほんへいきたいです", romaji: "nihon e ikitai desu", zh: "想去日本" },
      { ja: "寿司が食べたいです", kana: "すしがたべたいです", romaji: "sushi ga tabetai desu", zh: "想吃寿司" },
      { ja: "富士山が見たいです", kana: "ふじさんがみたいです", romaji: "Fujisan ga mitai desu", zh: "想看富士山" }
    ], todos: ["掌握たい形变化", "用たい形表达 3 个愿望", "注意对象语を→が的变化"], story: false },

    { day: 23, title: "时间与日期表达", points: ["掌握数字 1-10 与时间点数", "星期、月份的说法", "询问时间「何時ですか」"], vocab: [
      { ja: "何時", kana: "なんじ", romaji: "nanji", zh: "几点", example: "今何時ですか", exampleZh: "现在几点？" },
      { ja: "時", kana: "じ", romaji: "ji", zh: "…点", example: "3時です", exampleZh: "3点" },
      { ja: "分", kana: "ふん", romaji: "fun", zh: "…分", example: "10時15分です", exampleZh: "10点15分" },
      { ja: "曜日", kana: "ようび", romaji: "youbi", zh: "星期", example: "今日は月曜日です", exampleZh: "今天是星期一" },
      { ja: "午前", kana: "ごぜん", romaji: "gozen", zh: "上午", example: "午前9時です", exampleZh: "上午9点" },
      { ja: "午後", kana: "ごご", romaji: "gogo", zh: "下午", example: "午後2時です", exampleZh: "下午2点" }
    ], grammar: [
      { title: "时间表达", pattern: "数字＋時/分", explain: "时间询问用何時/何分。注意4時(よじ)、7時(しちじ)、9時(くじ)等特殊读音。", example: "今、午後3時です", exampleZh: "现在是下午3点" }
    ], sentences: [
      { ja: "今、何時ですか", kana: "いま、なんじですか", romaji: "ima, nanji desu ka", zh: "现在几点？" },
      { ja: "今日は何曜日ですか", kana: "きょうはなんようびですか", romaji: "kyou wa nan'youbi desu ka", zh: "今天是星期几？" },
      { ja: "明日は水曜日です", kana: "あしたはすいようびです", romaji: "ashita wa suiyoubi desu", zh: "明天是星期三" }
    ], todos: ["背熟数字 1-10 与时间表达", "记特殊读音(4时/7时/9时/分)", "练习询问时间对话"], story: false },

    { day: 24, title: "购物与点餐场景", points: ["购物用「いくらですか」询问价格", "点餐用「～をください」", "学会感谢与结账表达"], vocab: [
      { ja: "いくら", kana: "いくら", romaji: "ikura", zh: "多少钱", example: "これはいくらですか", exampleZh: "这个多少钱？" },
      { ja: "ください", kana: "ください", romaji: "kudasai", zh: "请给我", example: "水をください", exampleZh: "请给我水" },
      { ja: "円", kana: "えん", romaji: "en", zh: "日元", example: "100円です", exampleZh: "100日元" },
      { ja: "払います", kana: "はらいます", romaji: "haraimasu", zh: "支付", example: "カードで払います", exampleZh: "用卡支付" },
      { ja: "お勘定", kana: "おかんじょう", romaji: "okanjou", zh: "结账", example: "お勘定をお願いします", exampleZh: "请结账" },
      { ja: "いくつ", kana: "いくつ", romaji: "ikutsu", zh: "几个", example: "いくつください", exampleZh: "要几个" }
    ], grammar: [
      { title: "购物点餐", pattern: "名詞＋をください / いくらですか", explain: "点餐购物用「～をください」请求，价格用「いくらですか」询问。", example: "この本をください", exampleZh: "请给我这本书" }
    ], sentences: [
      { ja: "これはいくらですか", kana: "これはいくらですか", romaji: "kore wa ikura desu ka", zh: "这个多少钱？" },
      { ja: "水をください", kana: "みずをください", romaji: "mizu o kudasai", zh: "请给我水" },
      { ja: "カードで払います", kana: "かーどではらいます", romaji: "kaado de haraimasu", zh: "用卡支付" }
    ], todos: ["掌握问价与请求句式", "模拟一次买水对话", "记住円・払う等关键词"], story: false },

    { day: 25, title: "问路与交通", points: ["问路用「～はどこですか」", "交通方式用「で」＋工具", "方位词 右・左・前・後 等"], vocab: [
      { ja: "どこ", kana: "どこ", romaji: "doko", zh: "哪里", example: "駅はどこですか", exampleZh: "车站在哪里？" },
      { ja: "右", kana: "みぎ", romaji: "migi", zh: "右", example: "右に曲がります", exampleZh: "向右转" },
      { ja: "左", kana: "ひだり", romaji: "hidari", zh: "左", example: "左にあります", exampleZh: "在左边" },
      { ja: "前", kana: "まえ", romaji: "mae", zh: "前面", example: "駅の前です", exampleZh: "车站前面" },
      { ja: "後ろ", kana: "うしろ", romaji: "ushiro", zh: "后面", example: "学校の後ろにあります", exampleZh: "在学校后面" },
      { ja: "駅", kana: "えき", romaji: "eki", zh: "车站", example: "駅へ行きます", exampleZh: "去车站" }
    ], grammar: [
      { title: "问路", pattern: "場所＋は＋どこですか", explain: "询问位置用どこ，方位词前后左右等配の连接。", example: "トイレはどこですか", exampleZh: "厕所在哪里？" }
    ], sentences: [
      { ja: "駅はどこですか", kana: "えきはどこですか", romaji: "eki wa doko desu ka", zh: "车站在哪里？" },
      { ja: "右に曲がってください", kana: "みぎにまがってください", romaji: "migi ni magatte kudasai", zh: "请向右转" },
      { ja: "銀行の前にあります", kana: "ぎんこうのまえにあります", romaji: "ginkou no mae ni arimasu", zh: "在银行前面" }
    ], todos: ["掌握问路与方位表达", "背熟方位词", "模拟问路对话"], story: false },

    { day: 26, title: "常见疑问词与应答", points: ["疑问词 何・誰・いつ・どこ・どう", "区分含义并选择应答", "学会委婉提问与确认"], vocab: [
      { ja: "誰", kana: "だれ", romaji: "dare", zh: "谁", example: "あの人は誰ですか", exampleZh: "那个人是谁？" },
      { ja: "何", kana: "なに", romaji: "nani", zh: "什么", example: "これは何ですか", exampleZh: "这是什么？" },
      { ja: "いつ", kana: "いつ", romaji: "itsu", zh: "什么时候", example: "いつ来ますか", exampleZh: "什么时候来？" },
      { ja: "どう", kana: "どう", romaji: "dou", zh: "怎样", example: "日本語はどうですか", exampleZh: "日语怎么样？" },
      { ja: "なぜ", kana: "なぜ", romaji: "naze", zh: "为什么", example: "なぜ日本語を勉強しますか", exampleZh: "为什么学日语？" },
      { ja: "どのくらい", kana: "どのくらい", romaji: "donokurai", zh: "多少、多久", example: "日本にどのくらいいますか", exampleZh: "在日本待多久？" }
    ], grammar: [
      { title: "疑问词", pattern: "何/誰/いつ/どこ/どう/なぜ", explain: "疑问词放句中，回答对应具体内容。", example: "それは誰のものですか", exampleZh: "那是谁的东西？" }
    ], sentences: [
      { ja: "あの人は誰ですか", kana: "あのひとはだれですか", romaji: "ano hito wa dare desu ka", zh: "那个人是谁？" },
      { ja: "日本語はどうですか", kana: "にほんごはどうですか", romaji: "nihongo wa dou desu ka", zh: "日语怎么样？" },
      { ja: "いつ日本へ来ましたか", kana: "いつにほんへきましたか", romaji: "itsu nihon e kimashita ka", zh: "你什么时候来日本的？" }
    ], todos: ["背熟 6 个疑问词", "区分不同询问口径", "练问答对话"], story: false },

    { day: 27, title: "动词句综合运用", points: ["综合运用所有时态与变化", "动词＋助词组合", "描述日常活动的完整句子"], vocab: [
      { ja: "起きます", kana: "おきます", romaji: "okimasu", zh: "起床", example: "毎朝6時に起きます", exampleZh: "每天早上6点起床" },
      { ja: "寝ます", kana: "ねます", romaji: "nemasu", zh: "睡觉", example: "夜11時に寝ます", exampleZh: "晚上11点睡觉" },
      { ja: "働きます", kana: "はたらきます", romaji: "hatarakimasu", zh: "工作", example: "会社で働きます", exampleZh: "在公司工作" },
      { ja: "休みます", kana: "やすみます", romaji: "yasumimasu", zh: "休息", example: "日曜日に休みます", exampleZh: "星期天休息" },
      { ja: "会います", kana: "あいます", romaji: "aimasu", zh: "见面", example: "友達に会います", exampleZh: "和朋友见面" },
      { ja: "読みます", kana: "よみます", romaji: "yomimasu", zh: "阅读", example: "新聞を読みます", exampleZh: "读报" }
    ], grammar: [
      { title: "综合复习", pattern: "動詞＋助詞＋時態", explain: "把时间词、助词、时态组合成完整句子表达日常活动。", example: "毎朝6時に起きて朝ごはんを食べます", exampleZh: "每天早上6点起床吃早饭" }
    ], sentences: [
      { ja: "毎日6時に起きます", kana: "まいにちろくじに おきます", romaji: "mainichi rokuji ni okimasu", zh: "每天6点起床" },
      { ja: "会社で働きました", kana: "かいしゃではたらきました", romaji: "kaisha de hatarakimashita", zh: "在公司工作了" },
      { ja: "明日友達に会います", kana: "あしたともだちにあいます", romaji: "ashita tomodachi ni aimasu", zh: "明天见朋友" }
    ], todos: ["用完整句型描述一天", "写 5 句日常安排", "注意时间助词的搭配"], story: false },

    { day: 28, title: "常用动词语法汇总", points: ["归纳本阶段学会的核心动词", "复习五种活用形", "理解动词在句中的核心地位"], vocab: [
      { ja: "します", kana: "します", romaji: "shimasu", zh: "做(する)", example: "宿題をします", exampleZh: "做作业" },
      { ja: "来ます", kana: "きます", romaji: "kimasu", zh: "来(来る)", example: "日本へ来ます", exampleZh: "来日本" },
      { ja: "帰ります", kana: "かえります", romaji: "kaerimasu", zh: "回去", example: "家へ帰ります", exampleZh: "回家" },
      { ja: "話します", kana: "はなします", romaji: "hanashimasu", zh: "说话", example: "日本語で話します", exampleZh: "用日语说" },
      { ja: "書きます", kana: "かきます", romaji: "kakimasu", zh: "写", example: "手紙を書きます", exampleZh: "写信" },
      { ja: "休みます", kana: "やすみます", romaji: "yasumimasu", zh: "休息、请假", example: "今日は休みます", exampleZh: "今天休息" }
    ], grammar: [
      { title: "动词活用归纳", pattern: "辞書形・ます形・て形・ない形・た形・たい形", explain: "一个动词六种基本形态是日语学习的核心框架。", example: "行く→行きます→行って→行かない→行った→行きたい", exampleZh: "去→去(礼貌)→去(连接)→不去→去了→想去" }
    ], sentences: [
      { ja: "手紙を書きます", kana: "てがみをかきます", romaji: "tegami o kakimasu", zh: "写信" },
      { ja: "日本語で話します", kana: "にほんごではなします", romaji: "nihongo de hanashimasu", zh: "用日语说话" },
      { ja: "家へ帰りたいです", kana: "いえへかえりたいです", romaji: "ie e kaeritai desu", zh: "想回家" }
    ], todos: ["整理动词活用表", "每个活用形各取一动词练习", "掌握本计划动词的活用转换"], story: false },

    { day: 29, title: "模拟小测验 · 自我检测", points: ["检测前面 28 天掌握情况", "覆盖假名・名词句・动词・形容词・助词", "通过测验查漏补缺"], vocab: [
      { ja: "問題", kana: "もんだい", romaji: "mondai", zh: "问题", example: "問題がわかります", exampleZh: "明白问题" },
      { ja: "答え", kana: "こたえ", romaji: "kotae", zh: "答案", example: "答えを書きます", exampleZh: "写答案" },
      { ja: "正しい", kana: "ただしい", romaji: "tadashii", zh: "正确", example: "正しい答えです", exampleZh: "正确的答案" },
      { ja: "間違い", kana: "まちがい", romaji: "machigai", zh: "错误", example: "間違いがあります", exampleZh: "有错误" },
      { ja: "復習", kana: "ふくしゅう", romaji: "fukushuu", zh: "复习", example: "復習が必要です", exampleZh: "需要复习" },
      { ja: "自信", kana: "じしん", romaji: "jishin", zh: "自信", example: "自信があります", exampleZh: "有自信" }
    ], grammar: [
      { title: "测验范围", pattern: "N5 基础综合", explain: "综合检测五十音、名词句、动词五种活用、形容词、常用助词。", example: "試しに書いてください", exampleZh: "请试着写写看" }
    ], sentences: [
      { ja: "私は毎朝6時に起きます", kana: "わたしはまいあさろくじに おきます", romaji: "watashi wa maiasa rokuji ni okimasu", zh: "我每天早上6点起床" },
      { ja: "これは本ではありません", kana: "これはほんではありません", romaji: "kore wa hon dewa arimasen", zh: "这不是书" },
      { ja: "日本語を勉強したいです", kana: "にほんごをべんきょうしたいです", romaji: "nihongo o benkyou shitai desu", zh: "想学日语" }
    ], todos: ["完成模拟测验", "标出薄弱点", "针对性复习 3 天内容"], story: true },

    { day: 30, title: "结业 · 综合运用与展望", points: ["总结一个月所学全部内容", "用所学日语做自我介绍", "展望下一步学习方向"], vocab: [
      { ja: "がんばります", kana: "がんばります", romaji: "ganbarimasu", zh: "加油、努力", example: "日本語の勉強をがんばります", exampleZh: "努力学习日语" },
      { ja: "頑張って", kana: "がんばって", romaji: "ganbatte", zh: "加油！", example: "頑張ってください", exampleZh: "加油！" },
      { ja: "ありがとう", kana: "ありがとう", romaji: "arigatou", zh: "谢谢", example: "ありがとうございます", exampleZh: "谢谢(礼貌)" },
      { ja: "さようなら", kana: "さようなら", romaji: "sayounara", zh: "再见", example: "さようなら", exampleZh: "再见" },
      { ja: "またね", kana: "またね", romaji: "matane", zh: "回头见", example: "またね", exampleZh: "回头见" },
      { ja: "上手", kana: "じょうず", romaji: "jouzu", zh: "擅长", example: "日本語が上手です", exampleZh: "日语很好" }
    ], grammar: [
      { title: "结业总结", pattern: "一个月核心语法回顾", explain: "名词句、动词活用、形容词、助词、愿望、时间等完整体系。", example: "私は日本語を勉強して上手になりたいです", exampleZh: "我想学日语并变得擅长" }
    ], sentences: [
      { ja: "日本語の勉強をがんばります", kana: "にほんごのべんきょうをがんばります", romaji: "nihongo no benkyou o ganbarimasu", zh: "我会努力学习日语" },
      { ja: "これからも日本語を勉強します", kana: "これからもにほんごをべんきょうします", romaji: "korekara mo nihongo o benkyou shimasu", zh: "今后也会继续学日语" },
      { ja: "みなさん、ありがとうございました", kana: "みなさん、ありがとうございました", romaji: "minasan, arigatou gozaimashita", zh: "谢谢大家" }
    ], todos: ["完成结业自评", "用日语做一段 30 秒自我介绍", "为下个月制定复习与进阶计划"], story: true }
  ];

  // ---------------- 3. 语法索引（覆盖全部主要语法点） ----------------
  var grammar = [
    { title: "名词谓语句", pattern: "A は B です", explain: "「は」标主题，读作wa，「です」表肯定与礼貌。", example: "私は学生です", exampleZh: "我是学生" },
    { title: "名词句否定", pattern: "A は B じゃありません/ではありません", explain: "否定判断用じゃありません(口语)或ではありません(书面)。", example: "私は医者じゃありません", exampleZh: "我不是医生" },
    { title: "疑问句", pattern: "…ですか？", explain: "句末加「か」并升调表示疑问。", example: "これは本ですか", exampleZh: "这是书吗？" },
    { title: "指示代词 これ/それ/あれ", pattern: "これ・それ・あれ＋は", explain: "これ近指、それ中指、あれ远指。修饰名词用この/その/あの。", example: "それは何ですか", exampleZh: "那是什么？" },
    { title: "主题助词 は", pattern: "A は …", explain: "は标记句子主题，与が(强调/主语)相对。", example: "私は日本語を勉強します", exampleZh: "我学日语" },
    { title: "宾格助词 を", pattern: "動作の対象＋を", explain: "を标记动作的直接对象。", example: "ご飯を食べます", exampleZh: "吃饭" },
    { title: "方向助词 に/へ", pattern: "場所＋に/へ＋動詞", explain: "に・へ表方向、目的地。へ读作e。", example: "学校へ行きます", exampleZh: "去学校" },
    { title: "手段助词 で", pattern: "工具/場所＋で", explain: "で表方式手段或动作发生的场所。", example: "電車で行きます", exampleZh: "坐电车去" },
    { title: "存在助词 に", pattern: "場所＋に＋物/人＋が＋ある/いる", explain: "に表存在处所。无生命用あります，有生命用います。", example: "部屋に猫がいます", exampleZh: "房间里有猫" },
    { title: "范围 から・まで", pattern: "A から B まで", explain: "から表起点，まで表终点，表时间或空间范围。", example: "9時から5時まで働きます", exampleZh: "从9点工作到5点" },
    { title: "动词ます形", pattern: "動詞ます形", explain: "三类动词变形：五段-い段＋ます；一段去る＋ます；する→します、来る→来ます。礼貌体。", example: "行きます・食べます・来ます", exampleZh: "去・吃・来(礼貌体)" },
    { title: "动词时态", pattern: "ます/ません/ました/ませんでした", explain: "现在将来、否定、过去、过去否定。", example: "昨日行きました", exampleZh: "昨天去了" },
    { title: "い形容词", pattern: "い形容詞＋です/名词", explain: "い形容词直接修饰名词，作谓语加です。", example: "高い山です", exampleZh: "高山" },
    { title: "な形容词", pattern: "な形容詞(词干)＋な＋名词", explain: "な形容词修饰名词加な。注意きれい等以い结尾却是な形容词。", example: "きれいな花です", exampleZh: "漂亮的花" },
    { title: "形容词否定与过去", pattern: "い→くない/かった；な→じゃありません/でした", explain: "い形容词词尾变化，な形容词用判断助词。", example: "暑かったです", exampleZh: "(昨天)很热" },
    { title: "て形", pattern: "動詞て形", explain: "表连接、请求、状态持续。一类动词有五段音便规则。", example: "行って・食べて・来て", exampleZh: "去(连接)・吃(连接)・来(连接)" },
    { title: "てください", pattern: "動詞て形＋ください", explain: "请求、命令对方做某事(礼貌)。", example: "見てください", exampleZh: "请看" },
    { title: "たい形(愿望)", pattern: "動詞ます形(去ます)＋たい", explain: "表「想…」。对象语常用が。", example: "日本へ行きたい", exampleZh: "想去日本" },
    { title: "ない形(否定)", pattern: "動詞ない形", explain: "动词否定形式，也是其他语法的基础形。", example: "行かない・食べない", exampleZh: "不去・不吃" },
    { title: "ないでください(禁止)", pattern: "動詞ない形＋でください", explain: "请求对方不要做某事。", example: "写真を撮らないでください", exampleZh: "请别拍照" },
    { title: "た形(过去)", pattern: "動詞た形", explain: "表过去完成，与て形变化一致。", example: "行った・食べた", exampleZh: "去了・吃了" },
    { title: "存在 あります/います", pattern: "あります(无生命) / います(有生命)", explain: "有生命物(人和动物)用います，无生命物用あります。", example: "公園に人がいます", exampleZh: "公园里有人" },
    { title: "时间表达", pattern: "何時/何分/何曜日", explain: "时间与星期的询问与表达。注意4時(よじ)等特殊读音。", example: "今、何時ですか", exampleZh: "现在几点？" },
    { title: "购物点餐", pattern: "～をください / いくらですか", explain: "请求购买或点餐用～をください，问价用いくらですか。", example: "水をください", exampleZh: "请给我水" },
    { title: "问路", pattern: "～はどこですか / 前・後・右・左", explain: "询问位置用どこ，方位词表示方向。", example: "駅はどこですか", exampleZh: "车站在哪里？" },
    { title: "疑问词", pattern: "何・誰・いつ・どこ・どう・なぜ", explain: "疑问词引导特殊疑问句，回答具体内容。", example: "これは何ですか", exampleZh: "这是什么？" },
    { title: "并列・列举 と", pattern: "名詞＋と＋名詞", explain: "と连接两个名词表并列「和」。", example: "本とペンを見ました", exampleZh: "看了书和笔" }
  ];

  // ---------------- 4. 高频常用表达（按场景） ----------------
  var phrases = [
    { ja: "おはようございます", kana: "おはようございます", romaji: "ohayou gozaimasu", zh: "早上好(礼貌)", scene: "寒暄" },
    { ja: "こんにちは", kana: "こんにちは", romaji: "konnichiwa", zh: "你好(白天)", scene: "寒暄" },
    { ja: "こんばんは", kana: "こんばんは", romaji: "konbanwa", zh: "晚上好", scene: "寒暄" },
    { ja: "はじめまして", kana: "はじめまして", romaji: "hajimemashite", zh: "初次见面", scene: "寒暄" },
    { ja: "さようなら", kana: "さようなら", romaji: "sayounara", zh: "再见", scene: "告别" },
    { ja: "またね", kana: "またね", romaji: "matane", zh: "回头见(亲近)", scene: "告别" },
    { ja: "おやすみなさい", kana: "おやすみなさい", romaji: "oyasuminasai", zh: "晚安", scene: "告别" },
    { ja: "ありがとうございます", kana: "ありがとうございます", romaji: "arigatou gozaimasu", zh: "非常感谢", scene: "感谢" },
    { ja: "ありがとう", kana: "ありがとう", romaji: "arigatou", zh: "谢谢(随意)", scene: "感谢" },
    { ja: "どういたしまして", kana: "どういたしまして", romaji: "dou itashimashite", zh: "不客气", scene: "感谢" },
    { ja: "すみません", kana: "すみません", romaji: "sumimasen", zh: "对不起、打扰一下", scene: "道歉" },
    { ja: "ごめんなさい", kana: "ごめんなさい", romaji: "gomennasai", zh: "对不起(口语)", scene: "道歉" },
    { ja: "申し訳ありません", kana: "もうしわけありません", romaji: "moushiwake arimasen", zh: "非常抱歉(正式)", scene: "道歉" },
    { ja: "どうぞ", kana: "どうぞ", romaji: "douzo", zh: "请(请进/请用)", scene: "请求" },
    { ja: "お願いします", kana: "おねがいします", romaji: "onegaishimasu", zh: "拜托了", scene: "请求" },
    { ja: "助けてください", kana: "たすけてください", romaji: "tasukete kudasai", zh: "请帮帮我", scene: "求助" },
    { ja: "ちょっと待ってください", kana: "ちょっとまってください", romaji: "chotto matte kudasai", zh: "请稍等", scene: "请求" },
    { ja: "元気ですか", kana: "げんきですか", romaji: "genki desu ka", zh: "你好吗？", scene: "寒暄" },
    { ja: "元気です", kana: "げんきです", romaji: "genki desu", zh: "我很好", scene: "寒暄" },
    { ja: "わかりません", kana: "わかりません", romaji: "wakarimasen", zh: "不明白", scene: "求助" },
    { ja: "もう一度お願いします", kana: "もういちどおねがいします", romaji: "mou ichido onegaishimasu", zh: "请再说一遍", scene: "求助" },
    { ja: "ゆっくり話してください", kana: "ゆっくりはなしてください", romaji: "yukkuri hanashite kudasai", zh: "请慢点说", scene: "求助" },
    { ja: "いただきます", kana: "いただきます", romaji: "itadakimasu", zh: "我开动了(饭前)", scene: "日常" },
    { ja: "ごちそうさまでした", kana: "ごちそうさまでした", romaji: "gochisousama deshita", zh: "我吃好了(饭后)", scene: "日常" },
    { ja: "ただいま", kana: "ただいま", romaji: "tadaima", zh: "我回来了", scene: "日常" },
    { ja: "おかえりなさい", kana: "おかえりなさい", romaji: "okaerinasai", zh: "欢迎回来", scene: "日常" },
    { ja: "いってきます", kana: "いってきます", romaji: "itte kimasu", zh: "我出门了", scene: "日常" },
    { ja: "いってらっしゃい", kana: "いってらっしゃい", romaji: "itterasshai", zh: "慢走", scene: "日常" },
    { ja: "おめでとうございます", kana: "おめでとうございます", romaji: "omedetou gozaimasu", zh: "恭喜", scene: "祝福" },
    { ja: "お疲れ様でした", kana: "おつかれさまでした", romaji: "otsukaresama deshita", zh: "辛苦了", scene: "日常" },
    { ja: "大丈夫ですか", kana: "だいじょうぶですか", romaji: "daijoubu desu ka", zh: "没事吧？", scene: "关心" }
  ];

  // ---------------- 5. meta ----------------
  var meta = {
    title: "日本語 · 一个月学会基础日语",
    subtitle: "日本語を一ヶ月で学ぼう",
    totalDays: 30,
    intro: "用 30 天系统掌握日语基础(JLPT N5 程度)。从五十音开始，每天一小步，逐步学会基础寒暄、名词句、动词活用、形容词、常用助词与实用表达。配合发音、书写与实战场景，学完可进行简单的日常对话、自我介绍、购物问路，为继续冲刺 N5/N4 打下坚实基础。坚持就是胜利——頑張って！"
  };

  // 组装最终对象
  window.NihongoData = {
    kanaTable: kanaTable,
    days: days,
    grammar: grammar,
    phrases: phrases,
    meta: meta
  };

  // 通知 app.js 数据已就绪(时序安全)
  if (window.__nihongoReadyQueue) {
    window.__nihongoReadyQueue.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
    window.__nihongoReadyQueue = [];
  }

  // 自检输出
  console.log("[NihongoData] loaded: kana=" + kanaTable.length + ", days=" + days.length + ", grammar=" + grammar.length + ", phrases=" + phrases.length);
})();