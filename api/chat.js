export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    if (!body) return res.status(400).json({ error: 'Request body 是空的' });

    const messages = body.messages;
    const system = body.system;
    if (!messages) return res.status(400).json({ error: 'messages 欄位缺失' });

    const key = process.env.VITE_OPENROUTER_API_KEY;
    if (!key) return res.status(500).json({ error: 'API Key 未設定 (VITE_OPENROUTER_API_KEY)' });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'https://wen-divination.vercel.app',
        'X-Title': 'Wen Divination',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        max_tokens: 2500,
        messages: [
          { role: 'system', content: system },
          ...messages
        ],
      }),
    });

    const text_raw = await response.text();
    console.log('OpenRouter raw response:', text_raw);

    let data;
    try {
      data = JSON.parse(text_raw);
    } catch (parseErr) {
      return res.status(500).json({ error: `OpenRouter 回應不是 JSON: ${text_raw.slice(0, 300)}` });
    }

    if (data.error) {
      return res.status(500).json({ error: `OpenRouter 錯誤: ${JSON.stringify(data.error)}` });
    }

    const text = data.choices?.[0]?.message?.content || '解讀失敗，沒有取得內容';
    return res.status(200).json({ text });
  } catch (error) {
    console.log('Caught error:', error.message);
    return res.status(500).json({ error: `函式錯誤: ${error.message}` });
  }
}
