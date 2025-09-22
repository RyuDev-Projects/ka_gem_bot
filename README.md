## 📋 Prerequisites

- Node.js (v18 atau lebih baru)
- npm atau yarn
- Telegram Bot Token dari [@BotFather](https://t.me/botfather)
- Google Gemini API Key dari [Google AI Studio](https://aistudio.google.com/)

## �🛠️ Instalasi

1. **Clone repository ini**
   ```bash
   git clone https://github.com/RyuDev-Projects/ka_gem_bot.git
   cd ka_gem_bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   copy .env.example .env
   ```

   Edit file `.env` dan isi dengan nilai yang sesuai:
   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   BOT_USERNAME=your_bot_username_without_@
   SYSTEM_PROMPT=Custom system prompt (optional)
   ```## 🔧 Cara Mendapatkan Token dan API Key

### Telegram Bot Token

1. Buka [@BotFather](https://t.me/botfather) di Telegram
2. Kirim perintah `/newbot`
3. Ikuti instruksi untuk membuat bot baru
4. Salin token yang diberikan ke file `.env`
5. Salin username bot (tanpa @) ke file `.env`

### Google Gemini API Key

1. Buka [Google AI Studio](https://aistudio.google.com/)
2. Login dengan akun Google
3. Klik "Get API Key"
4. Buat API key baru
5. Salin API key ke file `.env`

## 🚀 Menjalankan Bot

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 📁 Struktur Project

```
src/
├── index.ts      # Entry point aplikasi
├── config.ts     # Konfigurasi environment
├── bot.ts        # Handler untuk Telegram bot
└── gemini.ts     # Service untuk integrasi Gemini AI
```

## 🔧 Penggunaan

### Direct Message
Bot akan merespons semua pesan yang dikirim langsung ke bot.

### Group Message
Bot akan merespons ketika:
- Bot di-mention dengan `@bot_username`
- Pesan adalah reply ke pesan bot

## 🛠️ Development

### Build TypeScript
```bash
npm run build
```

### Clean Build
```bash
npm run clean
```

## 📝 Konfigurasi

Bot menggunakan environment variables untuk konfigurasi:

- `TELEGRAM_BOT_TOKEN`: Token bot Telegram
- `GEMINI_API_KEY`: API key Google Gemini
- `BOT_USERNAME`: Username bot (tanpa @)

## 🚨 Error Handling

Bot memiliki error handling untuk:
- Kesalahan koneksi Telegram
- Kesalahan API Gemini
- Validasi environment variables
- Graceful shutdown

## 📦 Dependencies

### Production
- `node-telegram-bot-api`: Library untuk Telegram Bot API
- `@google/generative-ai`: Library untuk Google Gemini AI
- `dotenv`: Environment variable loader

### Development
- `typescript`: TypeScript compiler
- `@types/node`: Type definitions untuk Node.js
- `@types/node-telegram-bot-api`: Type definitions untuk telegram bot
- `rimraf`: Cross-platform rm -rf

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request
