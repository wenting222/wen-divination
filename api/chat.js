export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
    if (!body) {
      return res.status(400).json({ error: 'Request body 是空的' });
    }

    const messages = body.messages;
    const system = body.system;

    if (!messages) {
      return res.status(400).json({ error: 'messages 欄位缺失', received: JSON.stringify(body).slice(0, 200) });
    }

    const key = process.env.VITE_GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({ error: 'API Key 未設定 (VITE_GEMINI_API_KEY)' });
    }

    const contents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': key,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { maxOutputTokens: 2500 },
        }),
      }
    );

    const text_raw = await response.text();
    console.log('Gemini raw response:', text_raw);

    let data;
    try {
      data = JSON.parse(text_raw);
    } catch (parseErr) {
      return res.status(500).json({ error: `Gemini 回應不是 JSON: ${text_raw.slice(0, 300)}` });
    }

    if (data.error) {
      return res.status(500).json({ error: `Gemini 錯誤: ${JSON.stringify(data.error)}` });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '解讀失敗，沒有取得內容';
    return res.status(200).json({ text });
  } catch (error) {
    console.log('Caught error:', error.message, error.stack);
    return res.status(500).json({ error: `函式錯誤: ${error.message}` });
  }
}
