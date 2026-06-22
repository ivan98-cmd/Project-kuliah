const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const generateOpenAIText = async (prompt) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY belum diset di .env');
  }

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Gagal memanggil OpenAI');
  }

  return data.choices?.[0]?.message?.content || '';
};

module.exports = {
  generateOpenAIText,
};
