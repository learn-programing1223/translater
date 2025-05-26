# Scan & Speak - Multilingual Shopping Assistant

Transform any device into a multilingual shopping assistant. Ask about products in 100+ languages and get instant answers in your language.

## Features

- 🌍 **100+ Languages**: From English to Zulu, speak in your language
- ⚡ **Instant Answers**: No sign-ups required, just start asking
- 🔒 **Privacy First**: All data stays on your device
- 📱 **Works Everywhere**: Use on any device with a modern browser
- 🎤 **Voice Support**: Speak naturally and get spoken responses
- 💬 **Smart Chat**: Type or speak your questions
- 📦 **Offline Catalog**: Works even without internet (partial)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- An OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/scan-speak.git
cd scan-speak
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Database**: Dexie (IndexedDB)
- **AI**: OpenAI GPT-4
- **Speech**: Web Speech API
- **Search**: Fuse.js

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── chat/        # Chat interface components
│   ├── voice/       # Voice interface components
│   ├── layout/      # Layout components
│   └── ui/          # Reusable UI components
├── lib/             # Utility libraries
│   ├── ai/          # AI integration
│   ├── db/          # Database and catalog
│   ├── speech/      # Speech recognition/synthesis
│   └── trpc/        # API routes
├── stores/          # Zustand state stores
└── types/           # TypeScript types
```

## Supported Languages

The app supports over 100 languages including:
- Major languages: English, Spanish, French, German, Chinese, Japanese, Arabic, Hindi
- African languages: Swahili, Yoruba, Zulu, Xhosa, Amharic
- Asian languages: Korean, Thai, Vietnamese, Indonesian, Bengali, Tamil
- And many more!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with ❤️ for the global shopping community
- Inspired by the need for inclusive technology
- Special thanks to all language contributors