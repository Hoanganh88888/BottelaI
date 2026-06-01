const axios = require('axios');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const message = req.body.message;

  if (!message || !message.text) {
    return res.status(200).send('OK');
  }

  const chatId = message.chat.id;
  const userText = message.text;

  // Skip /start command
  if (userText === '/start') {
    return res.status(200).send('OK');
  }

  try {
    // Gọi DeepSeek API
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Bạn là một trợ lý AI thân thiện, trả lời ngắn gọn bằng tiếng Việt.'
        },
        { role: 'user', content: userText }
      ],
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const botReply = response.data.choices[0].message.content;

    // Gửi reply về Telegram
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: botReply
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }

  res.status(200).send('OK');
}
