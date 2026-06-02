import axios from 'axios';

export default async function handler(req, res) {
  console.log('Received request:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const message = req.body.message;

  if (!message || !message.text) {
    console.log('No message text');
    return res.status(200).send('OK');
  }

  const chatId = message.chat.id;
  const userText = message.text;

  console.log('Chat ID:', chatId, 'Text:', userText);

  if (userText === '/start') {
    return res.status(200).send('OK');
  }

  try {
    console.log('Calling DeepSeek API...');
    
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Bạn là trợ lý AI thân thiện.' },
        { role: 'user', content: userText }
      ],
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const botReply = response.data.choices[0].message.content;
    console.log('Bot reply:', botReply);

    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: botReply
    });

    console.log('Message sent!');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }

  res.status(200).send('OK');
}
