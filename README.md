# What If? - Interactive Story Creator

An immersive React-based application that uses Google's Gemini AI to create branching, interactive stories based on "What If" scenarios.

## ✨ Features

- **AI-Powered Storytelling**: Uses Google Gemini API to generate rich, contextual narratives
- **Branching Narratives**: Create multiple story paths and explore different outcomes
- **Immersive UI**: Dark theme with neon accents for an engaging experience
- **Smart Context Management**: Optimizes token usage while maintaining story continuity
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ifs
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

5. Enter your Google Gemini API key when prompted

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI

## 📖 How It Works

1. **Create Your Story**: Enter a "What If" scenario and set a timeline
2. **AI Generation**: Gemini AI creates a detailed story continuation
3. **Make Choices**: Select from AI-generated options or create your own
4. **Explore Branches**: Each choice creates a new branch in your story tree
5. **Infinite Possibilities**: Continue exploring different paths and outcomes

## 🔧 Technical Features

- **Token Optimization**: Smart summarization of older story branches
- **Context Preservation**: Maintains narrative consistency across long stories
- **Error Handling**: Graceful fallbacks for API failures
- **Responsive Design**: Mobile-first approach with CSS modules

## 🎨 UI/UX Design

- **Dark Theme**: Pure black background with neon accents (#00FF7F)
- **Card-Based Layout**: Each story element is a beautifully styled card
- **Smooth Animations**: Hover effects and transitions enhance user experience
- **Accessibility**: Clean typography and proper contrast ratios

## 🔒 Security

- API keys are stored locally in your browser
- No third-party servers handle your data
- Direct communication with Google's Gemini API only

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── StoryCard.jsx   # Main story display component
│   ├── OptionsGrid.jsx # Story choice options
│   ├── ApiKeySetup.jsx # API key configuration
│   └── ...
├── services/           # API and business logic
│   └── geminiService.js # Gemini API integration
├── App.jsx            # Main application component
└── main.jsx           # Application entry point
```

## 🐛 Troubleshooting

- **API Key Issues**: Make sure your Gemini API key is valid and has proper permissions
- **Story Generation Fails**: Check your internet connection and API key validity
- **Performance Issues**: The app optimizes token usage automatically for long stories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.
