import { useState, useRef, useEffect, useCallback } from "react";

const MAJOR_ARCANA = ["愚者","魔法師","女祭司","女皇","皇帝","教皇","戀人","戰車","力量","隱者","命運之輪","正義","倒吊人","死神","節制","惡魔","塔","星星","月亮","太陽","審判","世界"];
const BUDDHA_ARCANA = ["流浪者","幻術師","瑜伽女","摩耶夫人","淨飯王","耶輸陀羅","告別宮廷","戰勝自我","苦行者","法輪","正義天秤","倒吊行者","無常","中道","惡魔考驗","閃電開悟","北極星","月亮倒影","太陽光明","大覺醒","涅槃"];
const SELECT_COUNT = 3;

function initDrawCards(toolName) {
  const names = toolName === "buddha" ? BUDDHA_ARCANA : MAJOR_ARCANA;
  return names.map((name, i) => ({
    id: i, name, reversed: Math.random() > 0.5,
    x: (Math.random() - 0.5) * 3,
    y: (Math.random() - 0.5) * 3,
    rotate: (Math.random() - 0.5) * 3,
    selected: false, hovering: false, zIndex: i,
  }));
}

const SYS = `你是一位精通心理學、成功學、顯化法則、種子法則，並且能判斷是非、真誠表達、果斷說真話的命理大師。你精通八字、紫微斗數、易經、塔羅、占星，以及其他能夠透視命運與行動路徑的占卜與解析工具。你的價值相當於解答一個問題，收費 10,000 美金的等級，富比世前 100 名的富豪都會請你解析命盤或占卜指引，作為他們的決策依據。請用繁體中文回答。回答時請直接進入解析內容，不要在開頭加上工具名稱、標題或「解析：」等前綴。在解析內文中，請用 **粗體** 標記最重要的關鍵字、核心結論或值得特別注意的詞句，每段至少標記1-2個重點。行動建議必須具體可執行，像是「本週三前聯繫對方確認一件事」、「停止在社群媒體上比較自己和他人」，絕對不能是「保持正向」「相信自己」「順其自然」等模糊建議。`;

const CARD_TOOLS = ["tarot", "buddha"];
const CARD_POS = { tarot: ["過去", "現在", "未來"], buddha: ["因", "緣", "果"] };

const TOOL_PROMPTS = {
  tarot: (q) => `${q ? `我的問題是：${q}\n\n` : ""}請為我進行一次三牌陣塔羅占卜。

請嚴格按照以下格式輸出，不要改變標記：

【問題理解】
[用1-2句話，說明你對這個問題的理解與核心關注點]
【問題理解END】

第一張牌（過去）：[牌名] — [正位/逆位]
第二張牌（現在）：[牌名] — [正位/逆位]
第三張牌（未來）：[牌名] — [正位/逆位]

【牌解-過去】
[這張牌的詳細解析，結合「過去」位置的含義]
【牌解-過去END】

【牌解-現在】
[這張牌的詳細解析，結合「現在」位置的含義]
【牌解-現在END】

【牌解-未來】
[這張牌的詳細解析，結合「未來」位置的含義]
【牌解-未來END】`,

  buddha: (q) => `${q ? `我的問題是：${q}\n\n` : ""}請為我進行一次佛陀塔羅（The Buddha Tarot）占卜。

【佛陀塔羅系統說明】
佛陀塔羅由藝術家 Robert M. Place 創作，將塔羅大秘儀與悉達多成道旅程對應，是東西方靈性傳統的橋樑。牌組以曼陀羅為結構，大秘儀置於神聖中心，四個花色代表四個方位。

大秘儀對應悉達多生命歷程的重要場景與人物，例如：
- 愚者 → 年輕的悉達多王子（出宮前）
- 女皇 → 悉達多之母摩耶夫人
- 教皇 → 悉達多之父淨飯王
- 戀人 → 悉達多與妻子耶輸陀羅
- 力量 → 悉達多剃髮出家、斷絕塵緣
- 命運之輪 → 法輪（Dharma Wheel）
- 隱者 → 苦行修道時期
- 世界 → 涅槃（Nirvana）

小秘儀四個花色對應五方佛與四個方位：
- Vajras（金剛杵）= 寶劍／東方／藍色／思維
- Jewels（寶珠）= 錢幣／南方／黃色／感覺
- Lotuses（蓮花）= 權杖／西方／紅色／情感
- Double Vajras（雙金剛）= 聖杯／北方／火元素／直覺

宮廷牌：Dakini（空行母）、Guardian Animal（護法神獸）、Sakti（明妃）、Buddha（佛陀）

請以此牌組進行三牌占卜，牌位為「因・緣・果」，代表業力因果鏈。

請嚴格按照以下格式輸出，標記名稱不可更改：

【問題理解】
[用1-2句話，說明你對這個問題的理解與核心關注點]
【問題理解END】

第一張牌（因）：[佛陀塔羅牌名／對應塔羅：西洋塔羅牌名] — [正位/逆位]
第二張牌（緣）：[佛陀塔羅牌名／對應塔羅：西洋塔羅牌名] — [正位/逆位]
第三張牌（果）：[佛陀塔羅牌名／對應塔羅：西洋塔羅牌名] — [正位/逆位]

【牌解-因】
**[佛陀塔羅牌名／對應塔羅：西洋塔羅牌名]**
[結合此牌在佛陀塔羅中的具體意涵（悉達多旅程的哪個階段/哪位人物/哪個場景），以及「因」的角度：造作的原因、動機、業力來源]
【牌解-因END】

【牌解-緣】
**[佛陀塔羅牌名／對應塔羅：西洋塔羅牌名]**
[結合此牌意涵與「緣」的角度：促成現況的條件、助緣、轉化的契機]
【牌解-緣END】

【牌解-果】
**[佛陀塔羅牌名／對應塔羅：西洋塔羅牌名]**
[結合此牌意涵與「果」的角度：因緣和合後的走向、業果、解脫或成長的可能]
【牌解-果END】`,

  bazi: (q, baziInfo) => {
    const birthPart = baziInfo?.birthday ? `\n\n出生資料：\n- 生日：${baziInfo.birthday}\n- 出生時辰：${baziInfo.shichen || "未知"}${baziInfo.gender ? `\n- 性別：${baziInfo.gender}` : ""}` : "";
    return `${q ? `我的問題是：${q}\n\n` : ""}請從八字命理的角度深入分析。${birthPart}

請嚴格按照以下格式輸出：

【八字四柱】
年柱：[天干地支] | 月柱：[天干地支] | 日柱：[天干地支] | 時柱：[天干地支或未知]
【八字四柱END】

【日主分析】
日主：[天干]（[五行屬性]）
強弱：[身強/身弱/中和]
[2-3句說明日主特質與強弱原因]
【日主分析END】

【喜用神】
喜用神：[五行] | 忌神：[五行]
[2-3句說明喜忌神對人生的影響]
【喜用神END】

【問題解析】
[結合八字四柱、日主、喜用神，針對問題給出深入解析，至少150字]
【問題解析END】`;
  },
  ziwei: (q, ziweiInfo) => {
    const birthPart = ziweiInfo?.birthday ? `\n\n出生資料：\n- 生日：${ziweiInfo.birthday}\n- 出生時辰：${ziweiInfo.shichen || "未知"}${ziweiInfo.gender ? `\n- 性別：${ziweiInfo.gender}` : ""}` : "";
    return `${q ? `我的問題是：${q}\n\n` : ""}請從紫微斗數的角度深入分析。${birthPart}

請嚴格按照以下格式輸出：

【命宮主星】
主星：[星名]（[五行屬性]）
化曜：[如有四化請標注，無則填無]
[2-3句說明此主星的核心性格與人生主題]
【命宮主星END】

【大限流年】
大限：[幾歲到幾歲的大限]
大限主星：[大限命宮主星]
[2-3句說明目前大限的運勢走向]
【大限流年END】

【問題解析】
[結合命宮主星、三方四正、大限流年，針對問題給出深入解析，至少150字]
【問題解析END】`;
  },
  astro: (q, astroInfo) => {
    const birthPart = astroInfo?.birthday ? `\n\n出生資料：\n- 生日：${astroInfo.birthday}${astroInfo.birthtime ? `\n- 出生時間：${astroInfo.birthtime}` : ""}${astroInfo.birthplace ? `\n- 出生地點：${astroInfo.birthplace}` : ""}` : "";
    const hasTime = astroInfo?.birthtime;
    return `${q ? `我的問題是：${q}\n\n` : ""}請從西洋占星的角度深入分析我的問題。${birthPart}

請嚴格按照以下格式輸出：

【星盤摘要】
太陽星座：[星座名稱]（[日期範圍]）${hasTime ? "\n月亮星座：[星座名稱]\n上升星座：[星座名稱]" : ""}
【星盤摘要END】

【太陽星座解析】
[詳細說明太陽星座的核心特質、人生主題、優勢與挑戰，至少100字]
【太陽星座解析END】

${hasTime ? `【月亮與上升解析】
[說明月亮星座的情感模式和上升星座的外在表現，結合問題分析]
【月亮與上升解析END】

` : ""}【問題解析】
[結合星座特質、當前行星能量，針對問題給出深入解析，至少150字]
【問題解析END】

注意：直接開始輸出格式內容，不要加任何前綴標題。`;
  },
  iching: (q, ichingResult) => {
    const guaInfo = ichingResult ? `\n\n起卦結果：\n本卦：${ichingResult.benGua?.name}卦\n變卦：${ichingResult.hasMoving && ichingResult.bianGua ? ichingResult.bianGua.name+"卦" : "無（無動爻）"}\n動爻：${ichingResult.yaos?.map((v,i) => (v===9||v===6)?`第${i+1}爻（${v===9?"老陽":"老陰"}）`:"").filter(Boolean).join("、") || "無"}` : "";
    return `${q ? `我的問題是：${q}\n\n` : ""}請為我進行一次易經占卜。${guaInfo}

請嚴格按照以下格式輸出：

【本卦】
卦名：[卦名]（[卦象符號]）
卦辭：[原文卦辭]
卦義：[2句說明此卦的核心意涵]
【本卦END】

【變卦】
卦名：[卦名]（[卦象符號]）
動爻：第[X]爻 — [爻辭原文]
卦義：[2句說明變化後的走向]
【變卦END】

【問題解析】
[結合本卦卦辭、動爻爻辭、變卦，針對問題給出深入解析，至少150字。注意：與梅花易數不同，易經以卦辭爻辭為主要解讀依據]
【問題解析END】`;
  },
  meihua: (q, num) => {
    const numInfo = num
      ? `用戶起卦數字：${num}\n\n請依照以下步驟計算：\n- 數字 ${num} ÷ 8，餘數為上卦（整除取8）\n- 數字 ${num} ÷ 8，同餘數為下卦（或取個位數再除8）\n- （上卦數 + 下卦數）÷ 6，餘數為動爻（整除取6）`
      : `用戶未提供數字，請以當前時間起卦：\n- 以農曆年地支數 + 月數 + 日數之和 ÷ 8，餘數為上卦\n- 上卦數 + 下卦數之和 ÷ 8，餘數為下卦\n- （上卦數 + 下卦數 + 時辰數）÷ 6，餘數為動爻`;

    return `${q ? `我的問題是：${q}\n\n` : ""}請為我進行一次梅花易數占卜。

梅花易數是北宋邵雍所創，與易經最大的不同在於：
- 以【體用生剋】為核心判斷吉凶，卦辭只作輔助
- 重視【外應】——占卜當下的外在物象（聲音、顏色、動物、方位）作為印證

先天八卦數：乾1、兌2、離3、震4、巽5、坎6、艮7、坤8
先天八卦五行：乾兌金、震巽木、坎水、離火、艮坤土

${numInfo}

請嚴格按照以下格式輸出，標記不可更改：

【起卦結果】
上卦：[卦名] | 下卦：[卦名] | 動爻：第[X]爻
本卦：[卦名]（[簡短卦象描述，10字內]）
變卦：[卦名]（[簡短卦象描述，10字內]）
體卦：[卦名]（[體卦五行]） | 用卦：[卦名]（[用卦五行]）
【起卦結果END】

【五行生剋】
生剋關係：[用生體／體生用／用剋體／體剋用／比和]（[吉凶判斷：大吉／小吉／平／小凶／大凶]）
體卦當令：[旺／相／休／囚／死]
用卦當令：[旺／相／休／囚／死]
物象外應：[體卦對應方位、顏色、人物] | [用卦對應方位、顏色、人物]
【五行生剋END】

【五行生剋詳解】
[詳細說明五行生剋邏輯、旺衰原因、物象外應的具體涵義，以及對問題的影響]
【五行生剋詳解END】

【本卦詳解】
[本卦的卦象意義與對問題的解讀]
【本卦詳解END】

【變卦詳解】
[變卦的卦象意義與趨勢走向]
【變卦詳解END】

【目前狀況】
[根據體用生剋、本卦，說明當事人目前的處境與狀態，2-3句]
【目前狀況END】

【時間點】
[根據五行旺衰與卦象，推算事情發展的時間節點或需要等待的時機]
【時間點END】

【建議】
[直接明確的行動建議，2-3條]
【建議END】

【梅花總結】
[用2-3句話，整合體用生剋、卦象與問題，給出最核心的一句話判斷]
【梅花總結END】`;
  },
  all: (q) => `${q ? `我的問題是：${q}\n\n` : ""}請同時運用塔羅牌、佛陀塔羅、八字、紫微斗數、易經、占星、梅花易數七種工具，對我的問題進行全方位綜合解析。

請嚴格按照以下格式輸出：

【塔羅牌】
第一張牌（過去）：[牌名] — [正位/逆位]
第二張牌（現在）：[牌名] — [正位/逆位]
第三張牌（未來）：[牌名] — [正位/逆位]
摘要：[一句話核心訊息]
【塔羅牌END】

【佛陀塔羅】
第一張牌（因）：[牌名] — [正位/逆位]
第二張牌（緣）：[牌名] — [正位/逆位]
第三張牌（果）：[牌名] — [正位/逆位]
摘要：[一句話核心訊息]
【佛陀塔羅END】

【八字】
摘要：[一句話核心訊息]
【八字END】

【紫微斗數】
摘要：[一句話核心訊息]
【紫微斗數END】

【占星】
摘要：[一句話核心訊息]
【占星END】

【易經】
摘要：[一句話核心訊息]
【易經END】

【梅花易數】
摘要：[一句話核心訊息]
【梅花易數END】

然後進行每個工具的完整詳細解讀。`,
};

const SUMMARY_INSTRUCTION = `\n\n請在解讀完成後依序輸出：
【總結】
[2-3句整體總結，直接給出最重要的洞見]
【總結END】
【具體行動建議】
1. [馬上可以做：今天或明天就能執行的具體行動，說明做什麼、對誰、怎麼做]
2. [這週或這個月：中期具體方向，說明要建立什麼、改變什麼行為]
3. [長期調整：需要持續執行的具體習慣或思維改變，說明怎麼執行]
【建議END】

注意：三條建議都必須具體可執行，絕對不能是「保持正向」「相信自己」「順其自然」等模糊建議。第一條要具體到「今天就能做」的程度。`;

// 易經銅板起卦
const YAO_MAP = {
  9: { name: "老陽", moving: true  },
  8: { name: "少陰", moving: false },
  7: { name: "少陽", moving: false },
  6: { name: "老陰", moving: true  },
};
const GUAS = {
  "111": { name: "乾", symbol: "☰" }, "110": { name: "兌", symbol: "☱" },
  "101": { name: "離", symbol: "☲" }, "100": { name: "震", symbol: "☳" },
  "011": { name: "巽", symbol: "☴" }, "010": { name: "坎", symbol: "☵" },
  "001": { name: "艮", symbol: "☶" }, "000": { name: "坤", symbol: "☷" },
};
function getGuaKey(yaos) {
  // 六爻由下往上，下卦=第1-3爻，上卦=第4-6爻
  const lower = yaos.slice(0, 3).map(v => (v===9||v===7)?"1":"0").join("");
  const upper = yaos.slice(3, 6).map(v => (v===9||v===7)?"1":"0").join("");
  return { lower, upper };
}
function getChangedGuaKey(yaos) {
  const lower = yaos.slice(0, 3).map(v => v===9?"0":v===6?"1":(v===7?"1":"0")).join("");
  const upper = yaos.slice(3, 6).map(v => v===9?"0":v===6?"1":(v===7?"1":"0")).join("");
  return { lower, upper };
}
function getHexagramName(keys) {
  const lower = GUAS[keys.lower];
  const upper = GUAS[keys.upper];
  if (!lower || !upper) return null;
  return { name: `${upper.name}${lower.name}`, symbol: upper.symbol + lower.symbol, upper, lower };
}

function IchingCoin({ face, flipping }) {
  return (
    <div style={{ width: 68, height: 68, animation: flipping ? "coinFlip .5s ease" : "none", userSelect: "none", flexShrink: 0 }}>
      {face === "正" ? (
        <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="36" cy="36" r="34" fill="url(#gf)" stroke="#a07828" strokeWidth="1.5"/>
          <circle cx="36" cy="36" r="30" fill="none" stroke="#c8a040" strokeWidth="0.8" opacity="0.6"/>
          <rect x="28" y="28" width="16" height="16" fill="#7a5a18" stroke="#a07828" strokeWidth="1"/>
          <text x="36" y="22" textAnchor="middle" fill="#7a4a10" fontSize="8" fontWeight="bold" fontFamily="serif">通</text>
          <text x="36" y="56" textAnchor="middle" fill="#7a4a10" fontSize="8" fontWeight="bold" fontFamily="serif">寶</text>
          <text x="19" y="39" textAnchor="middle" fill="#7a4a10" fontSize="8" fontWeight="bold" fontFamily="serif">乾</text>
          <text x="53" y="39" textAnchor="middle" fill="#7a4a10" fontSize="8" fontWeight="bold" fontFamily="serif">隆</text>
          <defs><radialGradient id="gf" cx="40%" cy="35%"><stop offset="0%" stopColor="#f0d870"/><stop offset="100%" stopColor="#c8a040"/></radialGradient></defs>
        </svg>
      ) : (
        <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="36" cy="36" r="34" fill="url(#gb)" stroke="#8a6820" strokeWidth="1.5"/>
          <circle cx="36" cy="36" r="30" fill="none" stroke="#a07828" strokeWidth="0.8" opacity="0.5"/>
          <circle cx="36" cy="36" r="20" fill="none" stroke="#a07828" strokeWidth="0.5" opacity="0.3"/>
          <circle cx="36" cy="36" r="10" fill="none" stroke="#a07828" strokeWidth="0.5" opacity="0.3"/>
          <defs><radialGradient id="gb" cx="40%" cy="35%"><stop offset="0%" stopColor="#c8a84a"/><stop offset="100%" stopColor="#8a6420"/></radialGradient></defs>
        </svg>
      )}
    </div>
  );
}

function IchingYaoLine({ value, index }) {
  if (value === undefined) return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "5px 0" }}>
      <div style={{ fontSize: 10, color: "#ddd", width: 14, textAlign: "right" }}>{index+1}</div>
      <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
    </div>
  );
  const yao = YAO_MAP[value];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "5px 0", animation: "fadeIn .3s ease" }}>
      <div style={{ fontSize: 10, color: "#aaa", width: 14, textAlign: "right" }}>{index+1}</div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
        {value === 8 || value === 6 ? (
          <><div style={{ flex: 1, height: 3, background: "#5a3a10", borderRadius: 2 }}/><div style={{ width: 12 }}/><div style={{ flex: 1, height: 3, background: "#5a3a10", borderRadius: 2 }}/></>
        ) : (
          <div style={{ flex: 1, height: 3, background: "#5a3a10", borderRadius: 2 }}/>
        )}
        {yao.moving && <div style={{ fontSize: 11, color: "#c07820", fontWeight: 700 }}>○</div>}
      </div>
      <div style={{ fontSize: 10, color: yao.moving ? "#c07820" : "#aaa", width: 36, textAlign: "right" }}>{yao.name}</div>
    </div>
  );
}

function IchingTossUI({ onDone }) {
  const [yaos, setYaos] = useState([]);
  const [coins, setCoins] = useState(["正","正","正"]);
  const [flipping, setFlipping] = useState(false);
  const done = yaos.length === 6;
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  const shake = () => {
    if (flipping || done) return;
    setFlipping(true);
    setTimeout(() => {
      const results = [Math.random()>.5?"正":"字", Math.random()>.5?"正":"字", Math.random()>.5?"正":"字"];
      const sum = results.filter(r=>r==="正").length*3 + results.filter(r=>r==="字").length*2;
      setCoins(results);
      setYaos(prev => {
        const newYaos = [...prev, sum];
        if (newYaos.length === 6) {
          const hm = newYaos.some(v => v===9||v===6);
          const bg = getHexagramName(getGuaKey(newYaos));
          const biag = getHexagramName(getChangedGuaKey(newYaos));
          setTimeout(() => onDoneRef.current({ yaos: newYaos, benGua: bg, bianGua: biag, hasMoving: hm }), 0);
        }
        return newYaos;
      });
      setFlipping(false);
    }, 520);
  };

  const benGua = done ? getHexagramName(getGuaKey(yaos)) : null;
  const bianGua = done ? getHexagramName(getChangedGuaKey(yaos)) : null;
  const hasMoving = done && yaos.some(v => v===9||v===6);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* 銅板 */}
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 24 }}>
        {coins.map((face,i) => <IchingCoin key={i} face={face} flipping={flipping}/>)}
      </div>

      {/* 搖按鈕 */}
      {!done && (
        <button onClick={shake} disabled={flipping}
          style={{ width: "100%", padding: "13px", background: flipping?"#ddd":"#2a1f14", color: flipping?"#aaa":"#f0e8d8", border: "none", borderRadius: 12, fontSize: 14, letterSpacing: ".08em", cursor: flipping?"not-allowed":"pointer", fontFamily: "inherit", marginBottom: 16, transition: "all .2s" }}>
          {flipping ? "搖中..." : `搖第 ${yaos.length+1} 爻`}
        </button>
      )}

      {/* 六爻 */}
      <div style={{ width: "100%", background: "white", border: "1px solid #eee", borderRadius: 12, padding: "12px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#aaa", letterSpacing: ".08em", marginBottom: 6 }}>卦象（由下往上）</div>
        {Array.from({length:6}).map((_,i) => <IchingYaoLine key={i} value={yaos[i]} index={i}/>)}
      </div>

    </div>
  );
}
const TOOL_ICONS = {
  tarot:  `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="2" width="9" height="13" rx="1.5"/><rect x="8" y="5" width="9" height="13" rx="1.5"/><path d="M6 6h3 M6 9h3"/></svg>`,
  buddha: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="7" r="3"/><path d="M5 17 C5 13 7.5 11 10 11 C12.5 11 15 13 15 17"/><path d="M7 5 L10 2 L13 5"/></svg>`,
  bazi:   `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 7h6 M7 10h6 M7 13h4"/></svg>`,
  ziwei:  `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="7"/><path d="M10 3 L10 6 M10 14 L10 17 M3 10 L6 10 M14 10 L17 10"/><circle cx="10" cy="10" r="2"/></svg>`,
  astro:  `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="7"/><ellipse cx="10" cy="10" rx="7" ry="3"/><path d="M10 3 L10 17"/></svg>`,
  iching: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 5h12 M4 9h5 M11 9h5 M4 13h12 M4 17h5 M11 17h5"/></svg>`,
  meihua: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="8" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="14" cy="12" r="2.5"/><circle cx="7.5" cy="5.5" r="2.5"/><circle cx="12.5" cy="5.5" r="2.5"/></svg>`,
  all:    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="7"/><path d="M10 3 L10 17 M3 10 L17 10 M5 5 L15 15 M15 5 L5 15"/></svg>`,
};

const SHICHEN = ["子時（23:00-01:00）","丑時（01:00-03:00）","寅時（03:00-05:00）","卯時（05:00-07:00）","辰時（07:00-09:00）","巳時（09:00-11:00）","午時（11:00-13:00）","未時（13:00-15:00）","申時（15:00-17:00）","酉時（17:00-19:00）","戌時（19:00-21:00）","亥時（21:00-23:00）"];

const TOOLS = [
  { id: "tarot",  label: "塔羅牌" },
  { id: "buddha", label: "佛陀塔羅" },
  { id: "astro",  label: "占星" },
  { id: "bazi",   label: "八字" },
  { id: "ziwei",  label: "紫微斗數" },
  { id: "iching", label: "易經" },
  { id: "meihua", label: "梅花易數" },
  { id: "all",    label: "綜合占卜", special: true },
];

const ENABLED_TOOLS = ["tarot", "astro", "iching"];
const ALL_TOOLS = ["塔羅牌", "佛陀塔羅", "八字", "紫微斗數", "占星", "易經", "梅花易數"];const ALL_ICONS = { 塔羅牌: "🃏", 佛陀塔羅: "🪷", 八字: "📜", 紫微斗數: "⭐", 占星: "🔭", 易經: "☯️", 梅花易數: "🌸" };
const ALL_CARD_POS = { 塔羅牌: ["過去", "現在", "未來"], 佛陀塔羅: ["因", "緣", "果"] };
const MAX_FOLLOWUP = 1;

// ── Extract helpers ──
function extractCards(text, pos = ["過去", "現在", "未來"]) {
  const cards = [];
  const pp = pos.join("|");
  // 支援牌名含空格、括號、英文的格式，例如：隱者（The Hermit）、Ace of Vajras
  const pat = new RegExp(`第[一二三１２３1-3]張牌[（(]?(${pp})[）)]?\\s*[：:]\\s*([^—\\-\\n]{2,40}?)\\s*[—\\-–]\\s*(正位|逆位)`, "g");
  let m;
  while ((m = pat.exec(text)) !== null)
    if (!cards.find((c) => c.pos === m[1]))
      cards.push({ pos: m[1], name: m[2].replace(/\*/g, "").trim(), ori: m[3] });
  return cards;
}

function extractBlock(text, key) {
  const re = new RegExp(`【${key}】([\\s\\S]*?)【${key}END】`);
  const m = text.match(re);
  return m ? m[1].trim() : "";
}

function extractCardAnalyses(text, positions) {
  return positions.map((pos) => ({
    pos,
    content: extractBlock(text, `牌解-${pos}`),
  })).filter((c) => c.content);
}

function extractAllSummaries(text) {
  const result = {};
  for (const t of ALL_TOOLS) {
    const block = extractBlock(text, t);
    if (block) {
      const sm = block.match(/摘要[：:]\s*(.+)/);
      result[t] = {
        summary: sm ? sm[1].trim() : block.slice(0, 50) + "...",
        cards: ALL_CARD_POS[t] ? extractCards(block, ALL_CARD_POS[t]) : null,
      };
    }
  }
  return result;
}

// 共用日期選單元件
function DateSelect({ value, onChange, accentColor = "#e8c898" }) {
  const parts = value ? value.split("-") : ["", "", ""];
  const [y, setY] = useState(parts[0] || "");
  const [m, setM] = useState(parts[1] ? String(parseInt(parts[1])) : "");
  const [d, setD] = useState(parts[2] ? String(parseInt(parts[2])) : "");

  const notify = (ny, nm, nd) => {
    if (ny && nm && nd) {
      onChange(`${ny}-${String(nm).padStart(2,"0")}-${String(nd).padStart(2,"0")}`);
    } else {
      onChange("");
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1929 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const selectStyle = {
    flex: 1, border: `1px solid ${accentColor}`, borderRadius: 8,
    padding: "9px 6px", fontSize: 13, fontFamily: "inherit",
    color: "#1a1a1a", background: "white", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <select value={y} onChange={e => { setY(e.target.value); notify(e.target.value, m, d); }} style={selectStyle}>
        <option value="">年</option>
        {years.map(yr => <option key={yr} value={yr}>{yr}</option>)}
      </select>
      <select value={m} onChange={e => { setM(e.target.value); notify(y, e.target.value, d); }} style={selectStyle}>
        <option value="">月</option>
        {months.map(mo => <option key={mo} value={mo}>{mo}</option>)}
      </select>
      <select value={d} onChange={e => { setD(e.target.value); notify(y, m, e.target.value); }} style={selectStyle}>
        <option value="">日</option>
        {days.map(dy => <option key={dy} value={dy}>{dy}</option>)}
      </select>
    </div>
  );
}

function extractMain(text, currentTool) {
  if (currentTool === "meihua") return text;
  if (["bazi","ziwei","iching"].includes(currentTool)) return text;
  return text
    .replace(/【問題理解】[\s\S]*?【問題理解END】/g, "")
    .replace(/【牌解-[^】]+】[\s\S]*?【牌解-[^】]+END】/g, "")
    .replace(/【星盤摘要】[\s\S]*?【星盤摘要END】/g, "")
    .replace(/【總結】[\s\S]*?【總結END】/g, "")
    .replace(/【具體行動建議】[\s\S]*?【建議END】/g, "")
    .replace(/【(塔羅牌|佛陀塔羅|八字|紫微斗數|占星|易經|梅花易數)】[\s\S]*?【\1END】/g, "")
    .replace(/第[一二三]張牌[（(][^）)]+[）)][：:][^\n]+/g, "")
    .trim();
}

function extractSummary(text) {
  const m = text.match(/【總結】([\s\S]*?)【總結END】/);
  return m ? m[1].trim() : "";
}

function extractActions(text) {
  const m = text.match(/【具體行動建議】([\s\S]*?)【建議END】/);
  const sec = m ? m[1] : text;
  const actions = [];
  for (const line of sec.split("\n")) {
    const tr = line.trim();
    if (/^[1-3][\.、\s]/.test(tr)) {
      const c = tr.replace(/^[1-3][\.、\s]+/, "").trim();
      if (c.length > 5) actions.push(c);
    }
  }
  return actions.slice(0, 3);
}

function renderMD(text) {
  let h = text
    .replace(/^---+\s*$/gm, "")
    // 【標題END】直接移除
    .replace(/【[^】]+END】/g, "")
    // 【標題】轉成金棕色標題
    .replace(/【([^】]+)】/g, '<h2 style="color:#8a5c1a;font-size:15px;font-weight:600;margin:1em 0 .3em;">$1</h2>')
    .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "$1");
  const lines = h.split("\n");
  const res = [];
  let buf = [];
  for (const line of lines) {
    const tr = line.trim();
    if (!tr) {
      if (buf.length) { res.push("<p>" + buf.join(" ") + "</p>"); buf = []; }
    } else if (/^<h[123]/.test(tr)) {
      if (buf.length) { res.push("<p>" + buf.join(" ") + "</p>"); buf = []; }
      res.push(tr);
    } else buf.push(tr);
  }
  if (buf.length) res.push("<p>" + buf.join(" ") + "</p>");
  return res.join("\n");
}

const GEMINI_API_KEY = "AQ.Ab8RN6JFsZquNWw7olAJ_aGDw-132LvxUSmKqHE-Q6C5yQWHkw";

async function callAPI(messages) {
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYS }] },
        contents,
        generationConfig: { maxOutputTokens: 2500 },
      }),
    }
  );
  const data = await res.json();
  console.log("Gemini response:", JSON.stringify(data));
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "解讀失敗，請稍後再試。";
}

// ── Components ──

const card = (children, extra = {}) => (
  <div style={{ background: "white", border: "1px solid #eee", borderRadius: 12, padding: "1.1rem 1.25rem", marginBottom: 12, ...extra }}>
    {children}
  </div>
);

function SectionLabel({ children, color = "#aaa" }) {
  return <div style={{ fontSize: 11, color, letterSpacing: ".1em", marginBottom: 8 }}>{children}</div>;
}

// 1. 問題卡片
function QuestionCard({ question, understanding }) {
  return card(
    <>
      <SectionLabel>占卜問題</SectionLabel>
      <div style={{ fontSize: 15, fontWeight: 500, color: "#1a1a1a", marginBottom: understanding ? 10 : 0, lineHeight: 1.6 }}>
        {question || "（未輸入問題）"}
      </div>
      {understanding && (
        <>
          <div style={{ height: 1, background: "#f0f0f0", margin: "10px 0" }} />
          <SectionLabel>大師理解</SectionLabel>
          <div style={{ fontSize: 14, color: "#555", lineHeight: 1.75 }}>{understanding}</div>
        </>
      )}
    </>
  );
}

// 2. 牌面結果
function CardChips({ cards }) {
  if (!cards || !cards.length) return null;
  return card(
    <>
      <SectionLabel>牌面結果</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, justifyItems: "center" }}>
        {cards.map((c) => (
          <div key={c.pos} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 11, color: "#a07030", letterSpacing: ".06em" }}>{c.pos}</div>
            <div style={{
              width: 88, height: 140, borderRadius: 9,
              background: "linear-gradient(160deg,#fdf8ee,#f0e4c4)",
              boxShadow: "0 4px 14px rgba(0,0,0,.12)",
              border: "1px solid #dcc898",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              transform: c.ori === "逆位" ? "rotate(180deg)" : "none",
              gap: 4, padding: "8px 6px",
            }}>
              <div style={{ fontSize: 10, color: "#a07840", opacity: .7 }}>{c.name}</div>
              <TarotSymbol name={c.name} size={40} />
              <div style={{ fontSize: 13, color: "#5a3a18", textAlign: "center", lineHeight: 1.3, fontWeight: 600 }}>{c.name}</div>
            </div>
            <div style={{ fontSize: 12, color: "#5a3a18", fontWeight: 500, marginTop: 2 }}>
              {c.name}{c.ori === "逆位" ? "（逆位）" : ""}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// 3. 牌面解析
function CardAnalysisCard({ analyses, cards }) {
  if (!analyses || !analyses.length) return null;
  const getCardName = (pos) => cards?.find((c) => c.pos === pos)?.name || "";
  const getOri = (pos) => cards?.find((c) => c.pos === pos)?.ori || "";

  // 從解析內文第一行抓粗體牌名（**牌名**），作為標題優先顯示
  const extractTitleFromContent = (content) => {
    const m = content.match(/^\*\*(.+?)\*\*/);
    return m ? m[1].trim() : null;
  };

  // 把內文第一行的粗體標題去掉，避免重複
  const stripTitleFromContent = (content) => {
    return content.replace(/^\*\*(.+?)\*\*\n?/, "").trim();
  };

  return card(
    <>
      <SectionLabel>牌面解析</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {analyses.map((a, i) => {
          const contentTitle = extractTitleFromContent(a.content);
          const cardName = getCardName(a.pos);
          const ori = getOri(a.pos);
          // 優先用內文抓到的粗體標題，其次用 extractCards 抓到的牌名
          const displayName = contentTitle || cardName;
          const cleanContent = contentTitle ? stripTitleFromContent(a.content) : a.content;
          return (
            <div key={a.pos}>
              {i > 0 && <div style={{ height: 1, background: "#f5f5f5", marginBottom: 20 }} />}
              <div style={{ marginBottom: 6, lineHeight: 1.4 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#4a2e0a" }}>
                  {a.pos}{displayName ? `・${displayName}` : ""}
                </span>
                {ori && <span style={{ fontSize: 12, fontWeight: 400, color: "#a07030", marginLeft: 8 }}>{ori}</span>}
              </div>
              <div style={{ fontSize: 14, color: "#333", lineHeight: 1.85 }} dangerouslySetInnerHTML={{ __html: renderMD(cleanContent) }} />
            </div>
          );
        })}
      </div>
    </>
  );
}

// 綜合占卜總覽
function AllGrid({ summaries }) {
  return card(
    <>
      <SectionLabel>七術解析總覽</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
        {ALL_TOOLS.map((t) => {
          const s = summaries[t];
          if (!s) return null;
          const wide = s.cards && s.cards.length;
          return (
            <div key={t} style={{ gridColumn: wide ? "1/-1" : undefined, border: `1px solid ${wide ? "#d4b483" : "#ebebeb"}`, borderRadius: 8, padding: "10px 12px", background: wide ? "#fdf6e8" : "#fafafa" }}>
              <div style={{ fontSize: 11, color: wide ? "#a07030" : "#aaa", letterSpacing: ".06em", marginBottom: 4 }}>{ALL_ICONS[t]} {t}</div>
              <div style={{ fontSize: 13, color: wide ? "#5a3a10" : "#333", lineHeight: 1.6 }}>{s.summary}</div>
              {wide && s.cards && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4, marginTop: 8 }}>
                  {s.cards.map((c) => (
                    <div key={c.pos} style={{ border: "1px solid #d4b483", borderRadius: 6, padding: 4, textAlign: "center", background: "white" }}>
                      <div style={{ fontSize: 9, color: "#a07030", marginBottom: 1 }}>{c.pos}</div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "#6b4a1a", lineHeight: 1.3 }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: "#a07030" }}>{c.ori}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// 八字解析元件
function BaziReading({ text }) {
  const extract = (key) => { const m = text.match(new RegExp(`【${key}】([\\s\\S]*?)【${key}END】`)); return m ? m[1].trim() : ""; };
  const sizhu = extract("八字四柱");
  const rizhu = extract("日主分析");
  const xiyong = extract("喜用神");
  const analysis = extract("問題解析");
  if (!sizhu && !analysis) return null;

  const parseLines = (raw) => raw.split("\n").map(l => l.trim()).filter(Boolean);

  return (
    <>
      {sizhu && card(
        <>
          <SectionLabel>八字四柱</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {sizhu.split("|").map((col, i) => {
              const [label, val] = col.split("：").map(s => s.trim());
              return (
                <div key={i} style={{ border: "1px solid #e8c898", borderRadius: 8, padding: "10px 6px", textAlign: "center", background: "#fdf6ee" }}>
                  <div style={{ fontSize: 11, color: "#a07030", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "#6b3a10", letterSpacing: ".05em" }}>{val}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {(rizhu || xiyong) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          {rizhu && (
            <div style={{ background: "white", border: "1px solid #eee", borderRadius: 12, padding: "1rem" }}>
              <SectionLabel>日主分析</SectionLabel>
              {parseLines(rizhu).map((l, i) => (
                <div key={i} style={{ fontSize: i < 2 ? 13 : 14, color: i < 2 ? "#8a5c1a" : "#333", fontWeight: i < 2 ? 600 : 400, lineHeight: 1.7, marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: renderMD(l).replace(/<\/?p>/g,"") }} />
              ))}
            </div>
          )}
          {xiyong && (
            <div style={{ background: "white", border: "1px solid #eee", borderRadius: 12, padding: "1rem" }}>
              <SectionLabel>喜用神</SectionLabel>
              {parseLines(xiyong).map((l, i) => (
                <div key={i} style={{ fontSize: i < 1 ? 13 : 14, color: i < 1 ? "#8a5c1a" : "#333", fontWeight: i < 1 ? 600 : 400, lineHeight: 1.7, marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: renderMD(l).replace(/<\/?p>/g,"") }} />
              ))}
            </div>
          )}
        </div>
      )}
      {analysis && card(
        <>
          <SectionLabel>問題解析</SectionLabel>
          <div className="msg-master" style={{ fontSize: 14, lineHeight: 1.9, color: "#1a1a1a" }} dangerouslySetInnerHTML={{ __html: renderMD(analysis) }} />
        </>
      )}
    </>
  );
}

// 紫微斗數解析元件
function ZiweiReading({ text }) {
  const extract = (key) => { const m = text.match(new RegExp(`【${key}】([\\s\\S]*?)【${key}END】`)); return m ? m[1].trim() : ""; };
  const mingong = extract("命宮主星");
  const daxian = extract("大限流年");
  const analysis = extract("問題解析");
  if (!mingong && !analysis) return null;

  const parseLines = (raw) => raw.split("\n").map(l => l.trim()).filter(Boolean);

  return (
    <>
      {(mingong || daxian) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          {mingong && (
            <div style={{ background: "#f5f0ff", border: "1px solid #c0a8e8", borderRadius: 12, padding: "1rem" }}>
              <SectionLabel color="#7050b0">命宮主星</SectionLabel>
              {parseLines(mingong).map((l, i) => (
                <div key={i} style={{ fontSize: i < 2 ? 13 : 14, color: i < 2 ? "#5030a0" : "#333", fontWeight: i < 2 ? 600 : 400, lineHeight: 1.7, marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: renderMD(l).replace(/<\/?p>/g,"") }} />
              ))}
            </div>
          )}
          {daxian && (
            <div style={{ background: "white", border: "1px solid #eee", borderRadius: 12, padding: "1rem" }}>
              <SectionLabel>大限流年</SectionLabel>
              {parseLines(daxian).map((l, i) => (
                <div key={i} style={{ fontSize: i < 2 ? 13 : 14, color: i < 2 ? "#5030a0" : "#333", fontWeight: i < 2 ? 600 : 400, lineHeight: 1.7, marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: renderMD(l).replace(/<\/?p>/g,"") }} />
              ))}
            </div>
          )}
        </div>
      )}
      {analysis && card(
        <>
          <SectionLabel>問題解析</SectionLabel>
          <div className="msg-master" style={{ fontSize: 14, lineHeight: 1.9, color: "#1a1a1a" }} dangerouslySetInnerHTML={{ __html: renderMD(analysis) }} />
        </>
      )}
    </>
  );
}

// 易經解析元件
function IchingReading({ text }) {
  const extract = (key) => { const m = text.match(new RegExp(`【${key}】([\\s\\S]*?)【${key}END】`)); return m ? m[1].trim() : ""; };
  const bengua = extract("本卦");
  const biangua = extract("變卦");
  const analysis = extract("問題解析");
  if (!bengua && !analysis) return null;

  const parseKua = (raw) => {
    const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
    const result = {};
    lines.forEach(l => {
      if (l.startsWith("卦名")) result.name = l.replace(/^卦名[：:]/, "").replace(/\*\*/g, "").trim();
      else if (l.startsWith("卦辭") || l.startsWith("動爻")) result.ci = l.replace(/^(卦辭|動爻)[：:]/, "").replace(/\*\*/g, "").trim();
      else if (l.startsWith("卦義")) result.yi = l.replace(/^卦義[：:]/, "").replace(/\*\*/g, "").trim();
    });
    return result;
  };

  const ben = parseKua(bengua);
  const bian = parseKua(biangua);

  return (
    <>
      {(bengua || biangua) && (
        <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "stretch" }}>
          {ben.name && (
            <div style={{ flex: 1, background: "white", border: "1px solid #eee", borderRadius: 12, padding: "1rem" }}>
              <SectionLabel>本卦</SectionLabel>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#2a1f14", marginBottom: 6 }}>{ben.name}</div>
              {ben.ci && <div style={{ fontSize: 12, color: "#a07030", marginBottom: 6, lineHeight: 1.6 }}>{ben.ci}</div>}
              {ben.yi && <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: renderMD(ben.yi).replace(/<\/?p>/g,"") }} />}
            </div>
          )}
          {bian.name && (
            <div style={{ flex: 1, background: "white", border: "1px solid #eee", borderRadius: 12, padding: "1rem" }}>
              <SectionLabel>變卦</SectionLabel>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#2a1f14", marginBottom: 6 }}>{bian.name}</div>
              {bian.ci && <div style={{ fontSize: 12, color: "#a07030", marginBottom: 6, lineHeight: 1.6 }}>{bian.ci}</div>}
              {bian.yi && <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: renderMD(bian.yi).replace(/<\/?p>/g,"") }} />}
            </div>
          )}
        </div>
      )}
      {analysis && card(
        <>
          <SectionLabel>問題解析</SectionLabel>
          <div className="msg-master" style={{ fontSize: 14, lineHeight: 1.9, color: "#1a1a1a" }} dangerouslySetInnerHTML={{ __html: renderMD(analysis) }} />
        </>
      )}
    </>
  );
}

// 梅花易數展開卡片 — 職游風格
function MeihuaCard({ label, icon = "✦", summary, detail, tag, accent = false }) {
  const [open, setOpen] = useState(false);

  // 把換行的摘要轉成 # 條列
  const renderSummaryLines = (text) => {
    if (!text) return null;
    const lines = text.split(/\n|。/).map(l => l.trim()).filter(l => l.length > 1);
    if (lines.length <= 1) {
      return <div style={{ fontSize: 14, color: "#555", lineHeight: 1.8, textAlign: "center", padding: "0 8px" }}>{text}</div>;
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontSize: 13, color: "#666", lineHeight: 1.6, textAlign: "center" }}>
            <span style={{ color: "#c8a96e", marginRight: 4 }}>#</span>{l}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      background: "white",
      border: `1px solid ${accent ? "#e8d5a8" : "#efefef"}`,
      borderRadius: 16,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      marginBottom: 10,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* 卡片主體 */}
      <div style={{ padding: "20px 16px 12px", flex: 1 }}>
        {/* 標題 */}
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", textAlign: "center", marginBottom: 14, letterSpacing: ".02em" }}>
          {label}
        </div>
        {/* 摘要內容 */}
        {renderSummaryLines(summary)}
        {/* 展開詳解 */}
        {open && detail && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f0f0f0", fontSize: 14, color: "#444", lineHeight: 1.85 }}
            dangerouslySetInnerHTML={{ __html: renderMD(detail) }} />
        )}
      </div>
      {/* 底部 footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 14px", borderTop: "1px solid #f5f5f5",
        background: accent ? "#fdf9f2" : "#fafafa"
      }}>
        <span style={{ fontSize: 12, color: "#bbb", letterSpacing: ".04em" }}>{tag || label}</span>
        {detail ? (
          <button onClick={() => setOpen(v => !v)}
            style={{
              fontSize: 11, color: accent ? "#c8a96e" : "#bbb",
              background: "none", border: `1px solid ${accent ? "#e8d5a8" : "#e8e8e8"}`,
              borderRadius: 6, padding: "3px 10px", cursor: "pointer",
              fontFamily: "inherit"
            }}>
            {open ? "收起 ▲" : "詳解 ▼"}
          </button>
        ) : (
          <span style={{ fontSize: 14, color: accent ? "#c8a96e" : "#ddd" }}>{icon}</span>
        )}
      </div>
    </div>
  );
}

// 梅花易數專屬解析元件
function MeihuaReading({ text }) {
  const extract = (key) => {
    const re = new RegExp(`【${key}】([\\s\\S]*?)【${key}END】`);
    const m = text.match(re);
    return m ? m[1].trim() : "";
  };

  const qiguaResult   = extract("起卦結果");
  const wuxingSummary = extract("五行生剋");
  const wuxingDetail  = extract("五行生剋詳解");
  const benguaDetail  = extract("本卦詳解");
  const bianguaDetail = extract("變卦詳解");
  const situation     = extract("目前狀況");
  const timing        = extract("時間點");
  const advice        = extract("建議");
  const meihuaSummary = extract("梅花總結");

  // 解析起卦結果各行
  const lines = qiguaResult.split("\n").map(l => l.trim()).filter(Boolean);
  const guaLine   = lines.find(l => l.startsWith("上卦")) || "";
  const benguaLine = lines.find(l => l.startsWith("本卦"))?.replace(/^本卦：/, "") || "";
  const bianguaLine = lines.find(l => l.startsWith("變卦"))?.replace(/^變卦：/, "") || "";
  const tiyongLine = lines.find(l => l.startsWith("體卦")) || "";

  // 解析五行生剋摘要
  const wxLines = wuxingSummary.split("\n").map(l => l.trim()).filter(Boolean);
  const shengke  = wxLines.find(l => l.startsWith("生剋關係"))?.replace(/^生剋關係：/, "") || "";
  const tiLing   = wxLines.find(l => l.startsWith("體卦當令"))?.replace(/^體卦當令：/, "") || "";
  const yongLing = wxLines.find(l => l.startsWith("用卦當令"))?.replace(/^用卦當令：/, "") || "";
  const wuxiang  = wxLines.find(l => l.startsWith("物象外應"))?.replace(/^物象外應：/, "") || "";

  const shengkeColor = (s = "") => {
    if (s.includes("大吉")) return "#2d7a3a";
    if (s.includes("小吉")) return "#5a8a2d";
    if (s.includes("大凶")) return "#a02020";
    if (s.includes("小凶")) return "#a05020";
    return "#555";
  };

  if (!qiguaResult && !wuxingSummary) return null;

  return (
    <>
      {/* 起卦結果 */}
      {qiguaResult && (
        <div style={{ background: "white", border: "1px solid #eee", borderRadius: 12, padding: "1.1rem 1.25rem", marginBottom: 12 }}>
          <SectionLabel>起卦結果</SectionLabel>
          {guaLine && <div style={{ fontSize: 13, color: "#666", marginBottom: 10, lineHeight: 1.7 }}>{guaLine}</div>}
          {/* 改成左右兩欄各自獨立，不用 grid 等高 */}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: tiyongLine ? 8 : 0 }}>
            <div style={{ flex: 1 }}>
              <MeihuaCard label="本卦" summary={benguaLine} detail={benguaDetail} tag="本卦" icon="☰" accent />
            </div>
            <div style={{ flex: 1 }}>
              <MeihuaCard label="變卦" summary={bianguaLine} detail={bianguaDetail} tag="變卦" icon="☱" />
            </div>
          </div>
          {tiyongLine && (
            <div style={{ fontSize: 12, color: "#999", paddingTop: 4 }}>{tiyongLine}</div>
          )}
        </div>
      )}

      {/* 五行生剋 */}
      {wuxingSummary && (
        <div style={{ background: "white", border: "1px solid #eee", borderRadius: 12, padding: "1.1rem 1.25rem", marginBottom: 12 }}>
          <SectionLabel>五行生剋</SectionLabel>
          {shengke && (
            <div style={{ fontSize: 15, fontWeight: 600, color: shengkeColor(shengke), marginBottom: 10 }}>{shengke}</div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
            {tiLing && <div style={{ flex: 1 }}><MeihuaCard label="體卦當令" summary={tiLing} detail={null} tag="體卦" icon="◎" /></div>}
            {yongLing && <div style={{ flex: 1 }}><MeihuaCard label="用卦當令" summary={yongLing} detail={null} tag="用卦" icon="◎" /></div>}
          </div>
          {wuxiang && (
            <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6, marginBottom: wuxingDetail ? 8 : 0 }}>
              物象外應｜{wuxiang}
            </div>
          )}
          {wuxingDetail && (
            <MeihuaCard label="五行詳解" summary="體用生剋的完整邏輯分析" detail={wuxingDetail} tag="五行" icon="☯" />
          )}
        </div>
      )}

      {/* 綜合解析 */}
      {(situation || timing || advice) && (
        <div style={{ background: "white", border: "1px solid #eee", borderRadius: 12, padding: "1.1rem 1.25rem", marginBottom: 12 }}>
          <SectionLabel>綜合解析</SectionLabel>
          {situation && <MeihuaCard label="目前狀況" summary={situation} detail={null} tag="現況" icon="◉" />}
          {timing    && <MeihuaCard label="時間點"   summary={timing}    detail={null} tag="時機" icon="◷" />}
          {advice    && <MeihuaCard label="建議"     summary={advice}    detail={null} tag="行動" icon="→" accent />}
        </div>
      )}
      {/* 總結 */}
      {meihuaSummary && (
        <div style={{ border: "1px solid #d4b483", borderRadius: 12, padding: "1.1rem 1.25rem", background: "#fdf6e8", marginBottom: 12 }}>
          <SectionLabel color="#a07030">總　結</SectionLabel>
          <div style={{ fontSize: 14, lineHeight: 1.85, color: "#4a2e0a" }}>{meihuaSummary}</div>
        </div>
      )}
    </>
  );
}

// 主解讀（非塔羅工具）
function MainReading({ text }) {
  if (!text) return null;
  return card(
    <>
      <SectionLabel>解讀內容</SectionLabel>
      <div className="msg-master" style={{ fontSize: 14, lineHeight: 1.9, color: "#1a1a1a" }}
        dangerouslySetInnerHTML={{ __html: renderMD(text) }} />
    </>
  );
}

// 追問訊息
function FollowupMessage({ role, text }) {
  if (role === "loading") return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "8px 0" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#ccc", display: "inline-block", animation: `bop 1.2s ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
  return (
    <div>
      <div style={{ fontSize: 11, color: "#bbb", letterSpacing: ".08em", marginBottom: 4 }}>{role === "master" ? "命理大師" : "你的追問"}</div>
      {role === "master" ? (
        <div className="msg-master" style={{ fontSize: 14, lineHeight: 1.9, color: "#1a1a1a" }}
          dangerouslySetInnerHTML={{ __html: renderMD(text) }} />
      ) : (
        <div style={{ fontSize: 14, color: "#333", padding: "10px 14px", background: "#f5f5f5", borderRadius: "0 8px 8px 0", borderLeft: "2px solid #d4b483", lineHeight: 1.7 }}>{text}</div>
      )}
    </div>
  );
}

function DrawCardBack({ w = 76, h = 122 }) {
  return (
    <div style={{ width: w, height: h, borderRadius: 9, background: "linear-gradient(150deg,#3a2a18,#5a3e24)", boxShadow: "0 3px 12px rgba(0,0,0,.3)", border: "1.5px solid rgba(200,168,122,.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <div style={{ width: w - 12, height: h - 12, border: "1px solid rgba(200,168,122,.25)", borderRadius: 5, background: "repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(200,168,122,.04) 4px,rgba(200,168,122,.04) 8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "rgba(200,168,122,.35)", fontSize: 16 }}>✦</span>
      </div>
    </div>
  );
}

// 22 張大秘儀 SVG 線條符號
const TAROT_SYMBOLS = {
  "愚者":     { color: "#c07820", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="20" cy="12" r="5"/><path d="M20 17 L20 30 M14 22 L26 22 M14 30 L26 30"/><path d="M26 14 C30 10 34 12 34 16 C34 20 30 20 28 18"/></svg>` },
  "魔法師":   { color: "#7040b0", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 8 L20 6 M12 16 L28 16 M16 16 C16 22 14 28 12 32 M24 16 C24 22 26 28 28 32"/><circle cx="20" cy="14" r="4"/><path d="M8 22 L14 22 M26 22 L32 22"/></svg>` },
  "女祭司":   { color: "#4050a0", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 8 L14 32 M26 8 L26 32 M14 8 C14 8 17 6 20 6 C23 6 26 8 26 8"/><path d="M14 20 L26 20"/><path d="M16 28 C16 30 18 32 20 32 C22 32 24 30 24 28"/></svg>` },
  "女皇":     { color: "#b03070", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="20" cy="13" r="5"/><path d="M12 34 L12 24 C12 20 16 18 20 18 C24 18 28 20 28 24 L28 34"/><path d="M15 9 L20 5 L25 9"/></svg>` },
  "皇帝":     { color: "#b03020", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="13" y="6" width="14" height="10" rx="2"/><path d="M10 34 L10 26 C10 22 14 20 20 20 C26 20 30 22 30 26 L30 34"/><path d="M17 6 L17 3 L23 3 L23 6"/></svg>` },
  "教皇":     { color: "#705020", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 6 L20 34"/><path d="M14 14 L26 14 M16 20 L24 20"/><path d="M17 6 L23 6 L20 4Z"/></svg>` },
  "戀人":     { color: "#d04060", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 30 C20 30 8 22 8 14 C8 10 11 8 15 8 C17.5 8 19 9.5 20 11 C21 9.5 22.5 8 25 8 C29 8 32 10 32 14 C32 22 20 30 20 30Z"/></svg>` },
  "戰車":     { color: "#204080", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="16" width="24" height="14" rx="2"/><circle cx="14" cy="32" r="3"/><circle cx="26" cy="32" r="3"/><path d="M16 16 L16 10 L24 10 L24 16 M20 10 L20 6"/></svg>` },
  "力量":     { color: "#d08020", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 20 C10 14 14 10 20 10 C26 10 30 14 30 20 C30 26 26 30 20 30 C14 30 10 26 10 20Z"/><path d="M8 16 Q20 8 32 16 M8 24 Q20 32 32 24"/></svg>` },
  "隱者":     { color: "#607080", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 8 L20 6 M18 10 C18 8 22 8 22 10 L22 28 C22 30 20 32 20 32 C20 32 18 30 18 28Z"/><path d="M16 28 L24 28"/><circle cx="20" cy="14" r="3"/></svg>` },
  "命運之輪": { color: "#a07020", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="20" cy="20" r="12"/><circle cx="20" cy="20" r="5"/><path d="M20 8 L20 15 M20 25 L20 32 M8 20 L15 20 M25 20 L32 20 M11.5 11.5 L16 16 M24 24 L28.5 28.5 M28.5 11.5 L24 16 M16 24 L11.5 28.5"/></svg>` },
  "正義":     { color: "#204070", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 6 L20 34 M14 12 L26 12"/><path d="M9 22 L17 18 L17 26Z"/><path d="M23 18 L31 22 L23 26Z"/></svg>` },
  "倒吊人":   { color: "#306050", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="20" cy="27" r="7"/><path d="M20 20 L20 10 M14 10 L26 10 M14 7 L14 13 M26 7 L26 13"/></svg>` },
  "死神":     { color: "#404040", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 8 L24 16 L34 16 L26 22 L29 32 L20 26 L11 32 L14 22 L6 16 L16 16Z"/></svg>` },
  "節制":     { color: "#1870a0", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 10 L14 28 C14 31 17 33 20 33 C23 33 26 31 26 28 L26 10"/><path d="M11 18 L29 18 M16 10 C16 7 24 7 24 10"/></svg>` },
  "惡魔":     { color: "#502060", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 8 L20 4 L26 8"/><circle cx="20" cy="18" r="8"/><path d="M14 28 C14 32 17 34 20 34 C23 34 26 32 26 28"/><path d="M16 24 L16 30 M24 24 L24 30"/></svg>` },
  "塔":       { color: "#c04020", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="13" y="12" width="14" height="20" rx="1"/><path d="M10 32 L30 32 M16 12 L16 8 L24 8 L24 12"/><path d="M29 14 L34 9 M11 14 L6 9"/></svg>` },
  "星星":     { color: "#3060c0", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 6 L22 14 L30 14 L24 19 L26 27 L20 23 L14 27 L16 19 L10 14 L18 14Z"/></svg>` },
  "月亮":     { color: "#4050a0", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M26 8 C18 8 12 14 12 21 C12 28 18 33 26 33 C18 33 8 27 8 20 C8 13 16 7 26 8Z"/></svg>` },
  "太陽":     { color: "#c08010", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="20" cy="20" r="7"/><path d="M20 6 L20 11 M20 29 L20 34 M6 20 L11 20 M29 20 L34 20 M10 10 L13.5 13.5 M26.5 26.5 L30 30 M30 10 L26.5 13.5 M13.5 26.5 L10 30"/></svg>` },
  "審判":     { color: "#705090", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 34 L14 24 C14 20 17 17 20 17 C23 17 26 20 26 24 L26 34"/><path d="M20 17 L20 10 M14 10 C14 7 26 7 26 10 C26 13 22 16 20 16 C18 16 14 13 14 10Z"/></svg>` },
  "世界":     { color: "#1a6040", svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="20" cy="20" rx="6" ry="13"/><ellipse cx="20" cy="20" rx="13" ry="6"/><circle cx="20" cy="20" r="13"/></svg>` },
};

function TarotSymbol({ name, size = 36 }) {
  const sym = TAROT_SYMBOLS[name];
  if (!sym) return <span style={{ fontSize: size * 0.7, color: "#a07030" }}>✦</span>;
  return (
    <span
      style={{ display: "inline-flex", width: size, height: size, color: sym.color, flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: sym.svg }}
    />
  );
}

function DrawCardFront({ name, reversed, w = 76, h = 122 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 9,
      background: "linear-gradient(160deg,#fdf8ee,#f0e4c4)",
      boxShadow: "0 6px 20px rgba(0,0,0,.15)",
      border: "1px solid #dcc898",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      transform: reversed ? "rotate(180deg)" : "none",
      padding: "8px 6px",
      flexShrink: 0, gap: 4,
    }}>
      <div style={{ fontSize: w * 0.12, color: "#a07840", opacity: .7, marginBottom: 2 }}>{name}</div>
      <TarotSymbol name={name} size={w * 0.46} />
      <div style={{ fontSize: w * 0.145, color: "#5a3a18", textAlign: "center", lineHeight: 1.3, fontWeight: 600, marginTop: 2 }}>{name}</div>
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [appPhase, setAppPhase] = useState("landing"); // landing | app
  const [tool, setTool] = useState("tarot");
  // localStorage 每日次數控制
  const DAILY_LIMIT = 3;
  const getStoredCredits = () => {
    try {
      const stored = localStorage.getItem("compass_credits");
      if (!stored) return DAILY_LIMIT;
      const { date, count } = JSON.parse(stored);
      const today = new Date().toDateString();
      if (date !== today) return DAILY_LIMIT; // 新的一天重置
      return Math.max(0, DAILY_LIMIT - count);
    } catch { return DAILY_LIMIT; }
  };
  const useOneCredit = () => {
    try {
      const stored = localStorage.getItem("compass_credits");
      const today = new Date().toDateString();
      let count = 1;
      if (stored) {
        const data = JSON.parse(stored);
        count = data.date === today ? data.count + 1 : 1;
      }
      localStorage.setItem("compass_credits", JSON.stringify({ date: today, count }));
    } catch {}
  };

  const [credits, setCredits] = useState(() => getStoredCredits());
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState("question"); // question | shuffle | result
  const [loading, setLoading] = useState(false);

  // 洗牌抽牌 state（塔羅/佛陀塔羅專用）
  const [drawPhase, setDrawPhase] = useState("stack"); // stack | fan | done
  const [drawCards, setDrawCards] = useState(() => initDrawCards());
  const [drawSelected, setDrawSelected] = useState([]);
  const [deckRotation, setDeckRotation] = useState(0);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const lastAngleRef = useRef(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const deckRef = useRef(null);
  const releaseTimerRef = useRef(null);

  // result state
  const [questionUsed, setQuestionUsed] = useState("");
  const [understanding, setUnderstanding] = useState("");
  const [cards, setCards] = useState(null);
  const [cardAnalyses, setCardAnalyses] = useState(null);
  const [allSummaries, setAllSummaries] = useState(null);
  const [mainText, setMainText] = useState("");
  const [summary, setSummary] = useState("");
  const [actions, setActions] = useState([]);
  const [followupMsgs, setFollowupMsgs] = useState([]);
  const [followupText, setFollowupText] = useState("");
  const [followupCount, setFollowupCount] = useState(0);
  const [followupLoading, setFollowupLoading] = useState(false);
  const [meihuaNumber, setMeihuaNumber] = useState("");
  const [astroInfo, setAstroInfo] = useState({ birthday: "", birthtime: "", birthplace: "" });
  const [baziInfo, setBaziInfo] = useState({ birthday: "", shichen: "", gender: "" });
  const [ziweiInfo, setZiweiInfo] = useState({ birthday: "", shichen: "", gender: "" });
  const [ichingResult, setIchingResult] = useState(null);
  const historyRef = useRef([]);

  const isCardTool = CARD_TOOLS.includes(tool);

  // 洗牌事件處理
  const getClientPos = (e) => e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
  const getAngle = (cx, cy) => { const c = centerRef.current; return Math.atan2(cy - c.y, cx - c.x) * (180 / Math.PI); };
  const updateCenter = () => { if (!deckRef.current) return; const r = deckRef.current.getBoundingClientRect(); centerRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

  const handleDeckPointerDown = useCallback((e) => {
    if (drawPhase !== "stack") return;
    e.preventDefault(); updateCenter();
    const { x, y } = getClientPos(e);
    lastAngleRef.current = getAngle(x, y);
    setIsPointerDown(true); setIsShuffling(true);
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
  }, [drawPhase]);

  const handleDeckPointerMove = useCallback((e) => {
    if (!isPointerDown || drawPhase !== "stack") return;
    e.preventDefault();
    const { x, y } = getClientPos(e);
    const angle = getAngle(x, y);
    const delta = angle - (lastAngleRef.current ?? angle);
    lastAngleRef.current = angle;
    if (Math.abs(delta) < 0.3) return;

    // 整疊一起旋轉，每張只有極小的隨機偏移造成自然感
    setDeckRotation(r => r + delta * 0.6);
    setDrawCards(prev => prev.map(card => ({
      ...card,
      x: Math.max(-50, Math.min(50, card.x + (Math.random() - 0.5) * Math.abs(delta) * 0.8)),
      y: Math.max(-45, Math.min(45, card.y + (Math.random() - 0.5) * Math.abs(delta) * 0.8)),
      rotate: card.rotate + (Math.random() - 0.5) * Math.abs(delta) * 1.5,
    })));
  }, [isPointerDown, drawPhase]);

  const handleDeckPointerUp = useCallback(() => {
    if (!isPointerDown) return;
    setIsPointerDown(false); lastAngleRef.current = null;
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
    if (isShuffling) {
      setDeckRotation(0);
      releaseTimerRef.current = setTimeout(() => setDrawPhase("fan"), 500);
    }
  }, [isPointerDown, isShuffling]);

  useEffect(() => {
    const onMouseMove = (e) => handleDeckPointerMove(e);
    const onMouseUp = (e) => handleDeckPointerUp(e);
    window.addEventListener("mousemove", onMouseMove, { passive: false });
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [handleDeckPointerMove, handleDeckPointerUp]);

  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;
    const onTouchMove = (e) => { e.preventDefault(); handleDeckPointerMove(e); };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", handleDeckPointerUp);
    return () => { el.removeEventListener("touchmove", onTouchMove); el.removeEventListener("touchend", handleDeckPointerUp); };
  }, [handleDeckPointerMove, handleDeckPointerUp]);

  const handleDrawCardHover = (id, hovering) => setDrawCards(prev => prev.map(c => c.id === id ? { ...c, hovering } : c));

  const handleDrawCardSelect = (id) => {
    if (drawPhase !== "fan") return;
    const card = drawCards.find(c => c.id === id);
    if (!card || card.selected || drawSelected.length >= SELECT_COUNT) return;
    const newSelected = [...drawSelected, id];
    setDrawSelected(newSelected);
    setDrawCards(prev => prev.map(c => c.id === id ? { ...c, selected: true, hovering: false, zIndex: 100 + newSelected.length } : c));
    if (newSelected.length === SELECT_COUNT) {
      setTimeout(() => {
        // 把抽到的牌傳給 startReading
        startReadingWithDraw(newSelected);
      }, 400);
    }
  };

  const resetDraw = (toolName) => {
    setDrawPhase("stack"); setDrawCards(initDrawCards(toolName || tool));
    setDrawSelected([]); setDeckRotation(0); setIsShuffling(false); setIsPointerDown(false);
  };

  const switchTool = (newTool) => {
    setTool(newTool);
    setMeihuaNumber("");
    resetDraw(newTool);
    if (phase === "result") {
      setPhase("question");
      setUnderstanding(""); setCards(null); setCardAnalyses(null);
      setAllSummaries(null); setMainText(""); setSummary("");
      setActions([]); setFollowupMsgs([]); setFollowupCount(0);
      historyRef.current = [];
    }
  };

  // 易經：起完卦自動開始解析
  const questionRef = useRef(question);
  useEffect(() => { questionRef.current = question; }, [question]);

  const handleIchingDone = async (result) => {
    const currentQuestion = questionRef.current;
    setIchingResult(result);
    setPhase("result");
    setLoading(true);
    setQuestionUsed(currentQuestion);
    setUnderstanding(""); setCards(null); setCardAnalyses(null);
    setAllSummaries(null); setMainText(""); setSummary("");
    setActions([]); setFollowupMsgs([]); setFollowupCount(0);
    const userMsg = TOOL_PROMPTS.iching(currentQuestion, result) + SUMMARY_INSTRUCTION;
    historyRef.current = [{ role: "user", content: userMsg }];
    try {
      const reply = await callAPI(historyRef.current);
      historyRef.current.push({ role: "assistant", content: reply });
      setUnderstanding(extractBlock(reply, "問題理解"));
      const mainContent = extractMain(reply, "iching");
      setMainText(mainContent || reply); // fallback: 顯示原始回傳
      setSummary(extractSummary(reply));
      setActions(extractActions(reply));
      useOneCredit(); setCredits(c => c - 1);
    } catch (e) {
      setMainText("連線發生問題，請稍後再試。");
    }
    setLoading(false);
  };

  const startReadingWithDraw = async (selectedIds) => {
    if (credits <= 0) return;
    setPhase("result"); setLoading(true);
    setQuestionUsed(question); setUnderstanding(""); setCards(null);
    setCardAnalyses(null); setAllSummaries(null); setMainText("");
    setSummary(""); setActions([]); setFollowupMsgs([]); setFollowupCount(0);

    const pickedCards = selectedIds.map(id => drawCards.find(c => c.id === id)).filter(Boolean);
    const pos = tool === "buddha" ? ["因","緣","果"] : ["過去","現在","未來"];
    const cardInfo = pickedCards.map((c, i) =>
      `第${["一","二","三"][i]}張牌（${pos[i]}）：${c.name} — ${c.reversed ? "逆位" : "正位"}`
    ).join("\n");

    const basePrompt = tool === "buddha" ? TOOL_PROMPTS.buddha("") : TOOL_PROMPTS.tarot("");
    const userMsg = `${question ? `我的問題是：${question}\n\n` : ""}${basePrompt}\n\n實際抽到的牌：\n${cardInfo}` + SUMMARY_INSTRUCTION;
    historyRef.current = [{ role: "user", content: userMsg }];

    try {
      const reply = await callAPI(historyRef.current);
      historyRef.current.push({ role: "assistant", content: reply });
      setUnderstanding(extractBlock(reply, "問題理解"));
      // 用實際抽到的牌覆蓋
      setCards(pickedCards.map((c, i) => ({ pos: pos[i], name: c.name, ori: c.reversed ? "逆位" : "正位" })));
      setCardAnalyses(extractCardAnalyses(reply, pos));
      setMainText(extractMain(reply, tool));
      setSummary(extractSummary(reply));
      setActions(extractActions(reply));
      useOneCredit(); setCredits(c => c - 1);
    } catch { setMainText("連線發生問題，請稍後再試。"); }
    setLoading(false);
  };

  const startReading = async (externalIchingResult) => {
    if (credits <= 0) return;
    if (isCardTool) { setPhase("shuffle"); return; }
    setLoading(true);
    setPhase("result");
    setQuestionUsed(question); setUnderstanding(""); setCards(null);
    setCardAnalyses(null); setAllSummaries(null); setMainText("");
    setSummary(""); setActions([]); setFollowupMsgs([]); setFollowupCount(0);

    const promptFn = TOOL_PROMPTS[tool];
    const resolvedIching = externalIchingResult || ichingResult;
    const userMsg = tool === "meihua"
      ? promptFn(question, meihuaNumber) + SUMMARY_INSTRUCTION
      : tool === "astro"
      ? promptFn(question, astroInfo) + SUMMARY_INSTRUCTION
      : tool === "bazi"
      ? promptFn(question, baziInfo) + SUMMARY_INSTRUCTION
      : tool === "iching"
      ? promptFn(question, resolvedIching) + SUMMARY_INSTRUCTION
      : tool === "ziwei"
      ? promptFn(question, ziweiInfo) + SUMMARY_INSTRUCTION
      : promptFn(question) + SUMMARY_INSTRUCTION;
    historyRef.current = [{ role: "user", content: userMsg }];

    try {
      const reply = await callAPI(historyRef.current);
      historyRef.current.push({ role: "assistant", content: reply });
      setUnderstanding(extractBlock(reply, "問題理解"));
      if (tool === "all") setAllSummaries(extractAllSummaries(reply));
      setMainText(extractMain(reply, tool));
      setSummary(extractSummary(reply));
      setActions(extractActions(reply));
      useOneCredit(); setCredits(c => c - 1);
    } catch { setMainText("連線發生問題，請稍後再試。"); }
    setLoading(false);
  };

  const sendFollowup = async () => {
    if (followupCount >= MAX_FOLLOWUP || !followupText.trim() || followupLoading) return;
    const q = followupText.trim();
    setFollowupText("");
    setFollowupLoading(true);
    setFollowupCount((c) => c + 1);
    setFollowupMsgs((prev) => [...prev, { role: "user", text: q }, { role: "loading" }]);
    // 追問加入指示：不要重新給行動建議
    historyRef.current.push({ role: "user", content: q + "\n\n（注意：請直接回答追問內容，不要重新給行動建議或總結）" });
    try {
      const reply = await callAPI(historyRef.current);
      historyRef.current.push({ role: "assistant", content: reply });
      setFollowupMsgs((prev) => [...prev.slice(0, -1), { role: "master", text: reply }]);
    } catch {
      setFollowupMsgs((prev) => [...prev.slice(0, -1), { role: "master", text: "連線發生問題，請稍後再試。" }]);
    }
    setFollowupLoading(false);
  };

  const reset = () => {
    setPhase("question");
    resetDraw();
    setIchingResult(null);
    setUnderstanding("");
    setCards(null);
    setCardAnalyses(null);
    setAllSummaries(null);
    setMainText("");
    setSummary("");
    setActions([]);
    setFollowupMsgs([]);
    setFollowupCount(0);
    historyRef.current = [];
  };

  const remaining = MAX_FOLLOWUP - followupCount;

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "1.5rem 1rem 3rem", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes bop { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        @keyframes coinFlip{0%{transform:rotateY(0deg) scale(1)}25%{transform:rotateY(90deg) scale(0.8)}50%{transform:rotateY(180deg) scale(1)}75%{transform:rotateY(270deg) scale(0.8)}100%{transform:rotateY(360deg) scale(1)}}
        @keyframes fadeInDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .msg-master h1{font-size:17px;font-weight:500;margin:1em 0 .35em;color:#1a1a1a;}
        .msg-master h2{font-size:15px;font-weight:500;margin:.85em 0 .3em;color:#444;}
        .msg-master h3{font-size:14px;font-weight:500;margin:.7em 0 .2em;color:#666;}
        .msg-master p{margin:0 0 .65em;}
        .msg-master p:last-child{margin:0;}
        .msg-master strong{font-weight:500;color:#8a5c1a;}
      `}</style>

      {/* Landing Page */}
      {appPhase === "landing" && (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", animation: "fadeIn .8s ease" }}>
          {/* 品牌 */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: 11, letterSpacing: ".35em", color: "#b8a88a", marginBottom: 12, textTransform: "uppercase", animation: "fadeIn 1s ease" }}>Wèn</div>
            <div style={{ fontSize: 36, fontWeight: 600, color: "#1a1a1a", marginBottom: 12, letterSpacing: ".06em", animation: "fadeIn 1.2s ease" }}>問一下</div>
            <div style={{ fontSize: 15, color: "#888", letterSpacing: ".02em", lineHeight: 1.8, animation: "fadeIn 1.4s ease" }}>生活裡的小問題，問一下就好</div>
          </div>

          {/* 說明文字 */}
          <div style={{ maxWidth: 340, textAlign: "center", marginBottom: "2.5rem", animation: "fadeIn 1.6s ease" }}>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 2, marginBottom: 20 }}>
              在這裡<br/>
              你可以使用七種占卜工具<br/>
              來做小方向的決定<br/>
              會給你深度解析還有可以執行的行動建議
            </p>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 2, marginBottom: 20 }}>
              感情、工作、生活裡的小決議<br/>
              都隨時歡迎
            </p>
            <div style={{ borderTop: "1px solid #eee", paddingTop: 16 }}>
              <div style={{ fontSize: 11, color: "#b8a88a", letterSpacing: ".08em", marginBottom: 6 }}>小提醒</div>
              <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.8, margin: 0 }}>
              占卜結果僅供參考方向，最後怎麼做，還是你決定。
              </p>
            </div>
          </div>

          {/* 開始按鈕 */}
          <button onClick={() => setAppPhase("app")}
            style={{ padding: "14px 48px", background: "#2a1f14", color: "#f0e8d8", border: "none", borderRadius: 30, fontSize: 15, letterSpacing: ".12em", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 20px rgba(42,31,20,.2)", animation: "fadeIn 1.8s ease", transition: "transform .2s, box-shadow .2s" }}
            onMouseEnter={e => { e.target.style.transform="translateY(-2px)"; e.target.style.boxShadow="0 6px 24px rgba(42,31,20,.25)"; }}
            onMouseLeave={e => { e.target.style.transform="translateY(0)"; e.target.style.boxShadow="0 4px 20px rgba(42,31,20,.2)"; }}>
            開始
          </button>
          <div style={{ marginTop: 16, fontSize: 12, color: "#c8bfb0", animation: "fadeIn 2s ease" }}>
            目前每日 3 次免費使用・未來將推出付費制
          </div>
        </div>
      )}

      {/* Main App */}
      {appPhase === "app" && (<>
      <div style={{ textAlign: "center", marginBottom: "1.75rem", paddingBottom: "1.75rem", borderBottom: "1px solid #eee", animation: "fadeIn .6s ease" }}>
        <div style={{ fontSize: 11, letterSpacing: ".3em", color: "#b8a88a", marginBottom: 8, textTransform: "uppercase" }}>Wèn</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: "#1a1a1a", marginBottom: 6, letterSpacing: ".04em" }}>問一下</div>
        <div style={{ fontSize: 13, color: "#aaa", letterSpacing: ".02em" }}>生活裡的小問題，問一下就好</div>
      </div>

      {/* Credits */}
      {/* Tool tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {TOOLS.map((t) => {
          const active = tool === t.id;
          const enabled = ENABLED_TOOLS.includes(t.id);
          return (
            <button key={t.id}
              onClick={() => switchTool(t.id)}
              style={{
                padding: "6px 12px", borderRadius: 20,
                border: "1px solid #e0e0e0",
                background: active ? (enabled ? "#8a5c1a" : "#f5f0ea") : "white",
                color: active ? (enabled ? "white" : "#b8a88a") : enabled ? "#8a5c1a" : "#ccc",
                fontSize: 12, cursor: "pointer",
                fontWeight: active ? 500 : 400,
                transition: "all .15s",
                display: "flex", alignItems: "center", gap: 5,
              }}>
              <span style={{ width: 14, height: 14, display: "inline-flex", flexShrink: 0 }}
                dangerouslySetInnerHTML={{ __html: TOOL_ICONS[t.id] }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Question phase */}
      {phase === "question" && !ENABLED_TOOLS.includes(tool) && (
        <div style={{ textAlign: "center", padding: "3rem 1rem", animation: "fadeIn .4s ease" }}>
          <div style={{ fontSize: 32, marginBottom: 16, opacity: .3 }}>🔧</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: "#2a1f14", marginBottom: 8 }}>即將上線</div>
          <div style={{ fontSize: 14, color: "#aaa", lineHeight: 1.8 }}>這個占卜工具正在準備中<br/>敬請期待</div>
        </div>
      )}

      {/* Question phase */}
      {phase === "question" && ENABLED_TOOLS.includes(tool) && (
        <div style={{ background: "white", border: "1px solid #eee", borderRadius: 12, padding: "1.25rem" }}>
          <div style={{ fontSize: 13, color: "#999", marginBottom: 8 }}>請輸入你想占卜的問題</div>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
            placeholder="例如：這段感情的走向如何？我的事業方向對嗎？"
            rows={3}
            style={{ width: "100%", border: "1px solid #e8e8e8", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", resize: "vertical", color: "#1a1a1a", background: "#fafafa", outline: "none", lineHeight: 1.7, boxSizing: "border-box" }}
          />

          {/* 梅花易數專屬：數字輸入 */}
          {tool === "meihua" && (
            <div style={{ marginTop: 12, padding: "12px 14px", background: "#fdf6e8", border: "1px solid #d4b483", borderRadius: 8 }}>
              <div style={{ fontSize: 13, color: "#8a5c1a", fontWeight: 500, marginBottom: 10 }}>🌸 請在腦中默想你的問題，讓一個數字自然浮現</div>
              <input type="number" min="1" max="9999" value={meihuaNumber} onChange={(e) => setMeihuaNumber(e.target.value)}
                placeholder="輸入數字（留空則以時間起卦）"
                style={{ width: "100%", border: "1px solid #d4b483", borderRadius: 8, padding: "9px 12px", fontSize: 14, fontFamily: "inherit", color: "#1a1a1a", background: "white", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          )}

          {/* 易經專屬：銅板起卦 */}
          {tool === "iching" && !ichingResult && (
            <div style={{ marginTop: 12 }}>
              <IchingTossUI onDone={handleIchingDone} />
            </div>
          )}
          {tool === "iching" && ichingResult && (
            <div style={{ marginTop: 12, padding: "12px 14px", background: "#fdf6e8", border: "1px solid #d4b483", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, color: "#8a5c1a", fontWeight: 500 }}>
                本卦：{ichingResult.benGua?.name}卦 {ichingResult.hasMoving ? `→ 變卦：${ichingResult.bianGua?.name}卦` : "（無動爻）"}
              </div>
              <button onClick={() => setIchingResult(null)}
                style={{ fontSize: 11, color: "#aaa", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                重新起卦
              </button>
            </div>
          )}

          {/* 八字專屬：生辰輸入 */}
          {tool === "bazi" && (
            <div style={{ marginTop: 12, padding: "12px 14px", background: "#fdf6ee", border: "1px solid #e8c898", borderRadius: 8 }}>
              <div style={{ fontSize: 13, color: "#7a4a10", fontWeight: 500, marginBottom: 10 }}>📜 請輸入出生資料，八字解析更精準</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#a07030", marginBottom: 4 }}>生日（必填）</div>
                  <DateSelect value={baziInfo.birthday} onChange={(v) => setBaziInfo(p => ({ ...p, birthday: v }))} accentColor="#e8c898" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#a07030", marginBottom: 4 }}>出生時辰（選填）</div>
                    <select value={baziInfo.shichen} onChange={(e) => setBaziInfo(p => ({ ...p, shichen: e.target.value }))}
                      style={{ width: "100%", border: "1px solid #e8c898", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", color: baziInfo.shichen ? "#1a1a1a" : "#aaa", background: "white", outline: "none", boxSizing: "border-box" }}>
                      <option value="">不知道</option>
                      {SHICHEN.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#a07030", marginBottom: 4 }}>性別（選填）</div>
                    <select value={baziInfo.gender} onChange={(e) => setBaziInfo(p => ({ ...p, gender: e.target.value }))}
                      style={{ width: "100%", border: "1px solid #e8c898", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", color: baziInfo.gender ? "#1a1a1a" : "#aaa", background: "white", outline: "none", boxSizing: "border-box" }}>
                      <option value="">不填</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 紫微斗數專屬：生辰輸入 */}
          {tool === "ziwei" && (
            <div style={{ marginTop: 12, padding: "12px 14px", background: "#f5f0ff", border: "1px solid #c0a8e8", borderRadius: 8 }}>
              <div style={{ fontSize: 13, color: "#5030a0", fontWeight: 500, marginBottom: 10 }}>⭐ 請輸入出生資料，命盤解析更精準</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#7050b0", marginBottom: 4 }}>生日（必填）</div>
                  <DateSelect value={ziweiInfo.birthday} onChange={(v) => setZiweiInfo(p => ({ ...p, birthday: v }))} accentColor="#c0a8e8" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#7050b0", marginBottom: 4 }}>出生時辰（建議填寫）</div>
                    <select value={ziweiInfo.shichen} onChange={(e) => setZiweiInfo(p => ({ ...p, shichen: e.target.value }))}
                      style={{ width: "100%", border: "1px solid #c0a8e8", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", color: ziweiInfo.shichen ? "#1a1a1a" : "#aaa", background: "white", outline: "none", boxSizing: "border-box" }}>
                      <option value="">不知道</option>
                      {SHICHEN.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#7050b0", marginBottom: 4 }}>性別（必填）</div>
                    <select value={ziweiInfo.gender} onChange={(e) => setZiweiInfo(p => ({ ...p, gender: e.target.value }))}
                      style={{ width: "100%", border: "1px solid #c0a8e8", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", color: ziweiInfo.gender ? "#1a1a1a" : "#aaa", background: "white", outline: "none", boxSizing: "border-box" }}>
                      <option value="">請選擇</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tool === "astro" && (
            <div style={{ marginTop: 12, padding: "12px 14px", background: "#f0f4ff", border: "1px solid #b0c0e8", borderRadius: 8 }}>
              <div style={{ fontSize: 13, color: "#3050a0", fontWeight: 500, marginBottom: 10 }}>🔭 請輸入出生資料，解析會更精準</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#6070a0", marginBottom: 4 }}>生日（必填）</div>
                  <DateSelect value={astroInfo.birthday} onChange={(v) => setAstroInfo(p => ({ ...p, birthday: v }))} accentColor="#b0c0e8" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#6070a0", marginBottom: 4 }}>出生時間（選填）</div>
                    <input type="time" value={astroInfo.birthtime}
                      onChange={(e) => setAstroInfo(prev => ({ ...prev, birthtime: e.target.value }))}
                      style={{ width: "100%", border: "1px solid #b0c0e8", borderRadius: 8, padding: "9px 12px", fontSize: 14, fontFamily: "inherit", color: "#1a1a1a", background: "white", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#6070a0", marginBottom: 4 }}>出生地點（選填）</div>
                    <input type="text" value={astroInfo.birthplace}
                      onChange={(e) => setAstroInfo(prev => ({ ...prev, birthplace: e.target.value }))}
                      placeholder="例：台北市"
                      style={{ width: "100%", border: "1px solid #b0c0e8", borderRadius: 8, padding: "9px 12px", fontSize: 14, fontFamily: "inherit", color: "#1a1a1a", background: "white", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tool !== "iching" && <button onClick={startReading}
            disabled={
              credits <= 0 || !question.trim() ||
              (tool === "astro" && !astroInfo.birthday) ||
              (tool === "bazi" && !baziInfo.birthday) ||
              (tool === "ziwei" && (!ziweiInfo.birthday || !ziweiInfo.gender)) ||
              tool === "iching"
            }
            style={{
              width: "100%", marginTop: 10, padding: "12px",
              background: (credits > 0 && question.trim() &&
                !(tool === "astro" && !astroInfo.birthday) &&
                !(tool === "bazi" && !baziInfo.birthday) &&
                !(tool === "ziwei" && (!ziweiInfo.birthday || !ziweiInfo.gender)) &&
                !(tool === "iching" && !ichingResult)
              ) ? "#8a5c1a" : "#ddd",
              color: (credits > 0 && question.trim() &&
                !(tool === "astro" && !astroInfo.birthday) &&
                !(tool === "bazi" && !baziInfo.birthday) &&
                !(tool === "ziwei" && (!ziweiInfo.birthday || !ziweiInfo.gender)) &&
                !(tool === "iching" && !ichingResult)
              ) ? "white" : "#aaa",
              border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit"
            }}>
            開始占卜
          </button>}
        </div>
      )}

      {/* 今日剩餘次數 — 問題頁框框外 */}
      {phase === "question" && (
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#bbb", display: "flex", justifyContent: "center", gap: 4 }}>
          <span>今日剩餘次數</span>
          <span style={{ fontWeight: 500, color: credits <= 1 ? "#c07820" : "#8a5c1a" }}>{credits} 次</span>
        </div>
      )}

      {/* Shuffle phase — 塔羅/佛陀塔羅 */}
      {phase === "shuffle" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", userSelect: "none", width: "100%", background: "transparent" }}>
          {/* 說明文字 */}
          <div style={{ fontSize: 13, color: "#b8a88a", letterSpacing: ".08em", height: 24, marginBottom: 8, opacity: isShuffling ? 0 : 1, transition: "opacity .3s ease" }}>
            滑動洗牌
          </div>

          {/* 洗牌區 */}
          {drawPhase === "stack" && (
            <div style={{ width: "100%", height: 340, position: "relative" }}>
              <div ref={deckRef} onMouseDown={handleDeckPointerDown} onTouchStart={handleDeckPointerDown}
                style={{ position: "absolute", inset: 0, cursor: isPointerDown ? "grabbing" : "grab", touchAction: "none" }}>
                <div style={{ position: "absolute", inset: 0, transform: `rotate(${deckRotation}deg)`, transition: isPointerDown ? "none" : "transform .5s cubic-bezier(.34,1.2,.64,1)", transformOrigin: "center center" }}>
                  {drawCards.map(card => (
                    <div key={card.id} style={{ position: "absolute", left: "50%", top: "55%",
                      transform: `translate(calc(-50% + ${card.x}px), calc(-50% + ${card.y}px)) rotate(${card.rotate}deg)`,
                      transition: isPointerDown ? "none" : "transform .4s cubic-bezier(.25,1,.5,1)", zIndex: card.zIndex, pointerEvents: "none" }}>
                      <DrawCardBack />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 抽牌區 */}
          {drawPhase === "fan" && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 13, color: "#b8a88a", letterSpacing: ".06em", textAlign: "center" }}>
                點選三張牌（{drawSelected.length}／{SELECT_COUNT}）
              </div>
              {/* 已選牌 */}
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                {Array.from({ length: SELECT_COUNT }).map((_, i) => {
                  const c = drawCards.find(card => card.id === drawSelected[i]);
                  return c ? (
                    <div key={c.id} style={{ textAlign: "center" }}>
                      <DrawCardFront name={c.name} reversed={c.reversed} w={88} h={140} />
                      <div style={{ fontSize: 12, color: "#b8a88a", marginTop: 6 }}>
                        {(tool === "buddha" ? ["因","緣","果"] : ["過去","現在","未來"])[i]}
                      </div>
                      <div style={{ fontSize: 12, color: "#5a3a18", fontWeight: 500, marginTop: 2 }}>
                        {c.name}{c.reversed ? "（逆位）" : ""}
                      </div>
                    </div>
                  ) : (
                    <div key={i} style={{ width: 88, height: 140, borderRadius: 10, border: "1.5px dashed #e0d5c5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#e0d5c5", fontSize: 20 }}>+</span>
                    </div>
                  );
                })}
              </div>
              {/* 橫排牌組 — 上下給 padding 讓 hover 不被裁切 */}
              <div style={{ overflowX: "auto", overflowY: "visible", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", padding: "20px 0 8px" }}>
                <div style={{ display: "flex", paddingLeft: 16, paddingRight: 16, width: "max-content", margin: "0 auto" }}>
                  {drawCards.filter(c => !c.selected).map((card, i) => (
                    <div key={card.id} onClick={() => handleDrawCardSelect(card.id)}
                      onMouseEnter={() => handleDrawCardHover(card.id, true)}
                      onMouseLeave={() => handleDrawCardHover(card.id, false)}
                      style={{ marginLeft: i === 0 ? 0 : -44, transform: card.hovering ? "translateY(-14px) scale(1.08)" : "translateY(0)", transition: "transform .2s cubic-bezier(.34,1.4,.64,1)", zIndex: card.hovering ? 50 : i, cursor: "pointer", flexShrink: 0, position: "relative" }}>
                      <DrawCardBack w={68} h={110} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Result phase */}
      {phase === "result" && (
        <div>
          {/* Loading state */}
          {loading && (
            <div style={{ background: "white", border: "1px solid #eee", borderRadius: 12, padding: "2rem", textAlign: "center" }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#d4b483", display: "inline-block", animation: `bop 1.2s ${i * 0.2}s infinite` }} />
                ))}
              </div>
              <div style={{ fontSize: 13, color: "#aaa" }}>大師正在解讀中...</div>
            </div>
          )}

          {/* Results */}
          {!loading && (
            <>
              {/* 1. 問題卡片 */}
              {(questionUsed || understanding) && (
                <QuestionCard question={questionUsed} understanding={understanding} />
              )}

              {/* 占星：星盤摘要卡片 */}
              {tool === "astro" && mainText && (() => {
                const m = mainText.match(/【星盤摘要】([\s\S]*?)【星盤摘要END】/);
                if (!m) return null;
                const lines = m[1].trim().split("\n").filter(l => l.trim());
                return card(
                  <>
                    <SectionLabel>星盤摘要</SectionLabel>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {lines.map((line, i) => {
                        const parts = line.split("：");
                        if (parts.length < 2) return null;
                        const label = parts[0].trim();
                        const value = parts.slice(1).join("：").trim();
                        return (
                          <div key={i} style={{ border: "1px solid #b0c0e8", borderRadius: 8, padding: "8px 14px", background: "#f0f4ff", display: "flex", gap: 6, alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "#6070a0" }}>{label}</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#3050a0" }}>{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}

              {/* 2. 牌面結果 */}
              {cards && <CardChips cards={cards} />}

              {/* 綜合占卜總覽 */}
              {allSummaries && <AllGrid summaries={allSummaries} />}

              {/* 3. 牌面解析（塔羅類工具） */}
              {cardAnalyses && cardAnalyses.length > 0 && (
                <CardAnalysisCard analyses={cardAnalyses} cards={cards} />
              )}

              {/* 主解讀 */}
              {mainText && tool === "meihua" && <MeihuaReading text={mainText} />}
              {mainText && tool === "bazi" && <BaziReading text={mainText} />}
              {mainText && tool === "ziwei" && <ZiweiReading text={mainText} />}
              {mainText && tool === "iching" && <IchingReading text={mainText} />}
              {mainText && !["meihua","bazi","ziwei","iching"].includes(tool) && tool !== "all" && (
                <MainReading text={mainText} />
              )}
              {mainText && tool === "all" && <MainReading text={mainText} />}

              {/* 總結卡片 */}
              {summary && tool !== "meihua" && (
                <div style={{ background: "white", border: "1px solid #eee", borderRadius: 12, padding: "1.1rem 1.25rem", marginBottom: 12 }}>
                  <SectionLabel>總　結</SectionLabel>
                  <div className="msg-master" style={{ fontSize: 14, lineHeight: 1.85, color: "#1a1a1a" }}
                    dangerouslySetInnerHTML={{ __html: renderMD(summary) }} />
                </div>
              )}

              {/* 行動建議卡片 */}
              {actions.length > 0 && tool !== "meihua" && (
                <div style={{ border: "1px solid #d4b483", borderRadius: 12, padding: "1.1rem 1.25rem", background: "#fdf6e8", marginBottom: 12 }}>
                  <SectionLabel color="#a07030">具體行動建議</SectionLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {actions.map((a, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.7, color: "#5a3a10" }}>
                        <div style={{ width: 20, height: 20, minWidth: 20, background: "#8a5c1a", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, marginTop: 2, flexShrink: 0 }}>{i + 1}</div>
                        <div dangerouslySetInnerHTML={{ __html: renderMD(a).replace(/<\/?p>/g, "") }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 追問區：訊息 + 輸入框合在同一個卡片 */}
              <div style={{ background: "white", border: "1px solid #eee", borderRadius: 12, padding: "1.1rem 1.25rem", marginBottom: 12 }}>
                {followupMsgs.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: followupLoading ? 0 : 16 }}>
                    {followupMsgs.map((m, i) => (
                      <FollowupMessage key={i} role={m.role} text={m.text} />
                    ))}
                  </div>
                )}
                {/* 輸入框：loading 時不顯示 */}
                {!followupLoading && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: "#999" }}>還有想追問的嗎？</span>
                      <span style={{ fontSize: 12, color: remaining <= 1 ? "#c07820" : "#bbb" }}>
                        {remaining <= 0 ? "追問次數已用完" : `剩餘 ${remaining} 次追問`}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                      <textarea value={followupText} onChange={(e) => setFollowupText(e.target.value)}
                        disabled={remaining <= 0}
                        placeholder={remaining <= 0 ? "已達追問上限，請重新占卜" : "繼續提問..."}
                        rows={2}
                        style={{ flex: 1, fontSize: 14, padding: "9px 12px", border: "1px solid #e8e8e8", borderRadius: 8, background: "#fafafa", color: "#1a1a1a", resize: "none", outline: "none", fontFamily: "inherit", opacity: remaining <= 0 ? 0.5 : 1, boxSizing: "border-box" }}
                      />
                      <button onClick={sendFollowup} disabled={remaining <= 0 || !followupText.trim()}
                        style={{ padding: "10px 16px", background: "white", color: "#8a5c1a", border: "1px solid #d4b483", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", opacity: remaining <= 0 || !followupText.trim() ? 0.4 : 1 }}>
                        送出
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div style={{ textAlign: "center", marginTop: 4 }}>
                <button onClick={reset} style={{ padding: "7px 24px", background: "transparent", color: "#aaa", border: "1px solid #eee", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  重新占卜
                </button>
              </div>
            </>
          )}
        </div>
      )}
      </>)}
    </div>
  );
}
