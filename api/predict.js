// /api/predict.js
export default async function handler(req, res) {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { base64Image } = req.body;

  if (!base64Image) {
    return res.status(400).json({ error: 'No image provided.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `This is a screenshot of a Wingo color trading chart. Based on this chart, what is the most likely next result? Please answer only with: "BIG", "SMALL", or "GREEN".`
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_tokens: 50
      })
    });

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content?.trim();

    res.status(200).json({ prediction: result });
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ error: 'Failed to get prediction from OpenAI.' });
  }
}
