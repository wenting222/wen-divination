export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, system } = req.body;
    const key = process.env.VITE_OPENROUTER_API_KEY;

    if (!key) return res.status(500).json({ error: 'API Key 未設定' });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'https://wen-divination.vercel.app',
        'X-Title': '問一下 Wèn',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        max_tokens: 2500,
        messages: [
          { role: 'system', content: system },
          ...messages
        ],
      }),
    });

    const text_raw = await response.text();
    console.log('OpenRouter raw response:', text_raw);
    
    const data = JSON.parse(text_raw);
    if (data.error) return res.status(500).json({ error: `OpenRouter: ${JSON.stringify(data.error)}` });

    const text = data.choices?.[0]?.message?.content || '解讀失敗';
    return res.status(200).json({ text });
  } catch (error) {
    console.log('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
