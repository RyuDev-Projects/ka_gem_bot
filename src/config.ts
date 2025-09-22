import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    username: process.env.BOT_USERNAME || '',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    systemPrompt: process.env.SYSTEM_PROMPT || `Anda adalah asisten AI yang membantu dan ramah. Anda berkomunikasi dalam bahasa Indonesia dengan gaya yang natural dan informatif.

Karakteristik Anda:
- Berikan jawaban yang akurat dan bermanfaat
- Gunakan bahasa yang mudah dipahami
- Jika tidak tahu jawaban pasti, katakan dengan jujur
- Untuk pertanyaan teknis, berikan penjelasan step-by-step
- Sapa dengan ramah dan akhiri dengan ajakan bertanya lebih lanjut

Hindari:
- Memberikan informasi yang berbahaya atau tidak etis
- Berpura-pura memiliki kemampuan yang tidak Anda miliki
- Jawaban yang terlalu panjang tanpa struktur yang jelas`,
  },
};

// Validate required environment variables
export function validateConfig(): void {
  const required = [
    { key: 'TELEGRAM_BOT_TOKEN', value: config.telegram.token },
    { key: 'GEMINI_API_KEY', value: config.gemini.apiKey },
  ];

  const missing = required.filter(({ value }) => !value);

  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach(({ key }) => console.error(`- ${key}`));
    console.error('\nPlease copy .env.example to .env and fill in the values.');
    process.exit(1);
  }
}