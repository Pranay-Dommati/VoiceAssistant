# 🤖 AI-Powered Voice Assistant Web App

A modern, full-stack AI voice assistant with a beautiful React frontend and robust Flask backend. Features voice recognition, text-to-speech, intelligent reminders, weather updates, news reading, and advanced AI conversation powered by Google Gemini.

## 🌟 Key Features

### 🎯 Core Capabilities
- **🎤 Voice Recognition**: Advanced speech-to-text with real-time processing
- **🗣️ Text-to-Speech**: High-quality voice responses with stop control
- **🤖 AI Conversations**: Powered by Google Gemini for intelligent responses
- **⏰ Smart Reminders**: Multi-turn reminder creation, editing, and management
- **🌤️ Global Weather**: Real-time weather for any city worldwide
- **📰 News Updates**: Latest headlines from various categories
- **💬 Natural Language Processing**: Understands complex conversational commands

### 🎨 Modern Web Interface
- **ChatGPT-like Interface**: Professional, responsive chat UI
- **Real-time Communication**: Instant voice and text interaction
- **Tools Panel**: Sliding sidebar for reminders and settings
- **Voice Controls**: Start/stop recording, speech synthesis controls
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Modern, easy-on-eyes interface

### 🔧 Technical Features
- **React Frontend**: Built with Vite, Tailwind CSS, and React Icons
- **Flask Backend**: RESTful API with robust error handling
- **Real-time Updates**: WebSocket-like experience for live interaction
- **Secure Configuration**: Environment variables for API keys
- **Cross-platform**: Works on Windows, macOS, and Linux

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **Git**

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd FOURTH-PROJECT

# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Configuration

Create a `.env` file in the project root (copy from `.env.example`):

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your API keys:

```bash
# OpenWeatherMap API Key (free at https://openweathermap.org/api)
OPENWEATHER_API_KEY=your_actual_openweather_key_here

# NewsAPI Key (free at https://newsapi.org/)
NEWS_API_KEY=your_actual_news_key_here

# Google Gemini API Key (free at https://ai.google.dev/)
GEMINI_API_KEY=your_actual_gemini_key_here

# Optional: Customize default settings
DEFAULT_CITY=New York
DEFAULT_COUNTRY=us
SPEECH_RATE=180
SPEECH_VOLUME=0.9
```

### 4. Launch the Application

```bash
# Start the backend server
python backend_api.py

# In a new terminal, start the frontend
cd frontend
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

## 🎯 Usage

### Voice Commands
- **Weather**: "What's the weather in London?"
- **News**: "Give me the latest tech news"
- **Reminders**: "Remind me to call mom at 3 PM tomorrow"
- **General**: "What's the capital of France?"
- **Time**: "What time is it?"

### Text Input
- Type any command in the input field
- Press Enter or click the send button
- Use the microphone button for voice input

### Reminders Management
- **Create**: Use voice or text to create reminders
- **View**: Click the tools panel to see all reminders
- **Edit**: Click edit button on any reminder
- **Delete**: Remove individual reminders or clear all
- **Multi-turn**: AI assists in creating complex reminders

### Speech Controls
- **Start Recording**: Click microphone button
- **Stop Recording**: Click again or press Escape
- **Stop Speech**: Click stop button during speech synthesis

## 📂 Project Structure

```
FOURTH-PROJECT/
├── backend_api.py           # Flask backend with REST API
├── services.py              # Weather, news, and reminder services
├── command_parser.py        # Natural language command parsing
├── gemini_processor.py      # Google Gemini AI integration
├── config.py               # Configuration (loads from .env)
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── reminders.json         # Reminder storage
└── frontend/              # React frontend application
    ├── package.json       # Node.js dependencies
    ├── vite.config.js     # Vite configuration
    ├── index.html         # Main HTML template
    └── src/
        ├── main.jsx       # React entry point
        ├── App.jsx        # Main App component
        └── components/
            └── VoiceAssistant.jsx  # Main voice assistant component
```

## 🔧 API Endpoints

### Backend API (Flask)
- **POST /api/process**: Process voice/text commands
- **GET /api/reminders**: Get all reminders
- **POST /api/reminders**: Create new reminder
- **PUT /api/reminders/<id>**: Update reminder
- **DELETE /api/reminders/<id>**: Delete reminder
- **DELETE /api/reminders**: Clear all reminders

### External APIs Used
- **OpenWeatherMap**: Weather data for any city
- **NewsAPI**: Latest news headlines
- **Google Gemini**: AI conversation and NLP
- **Web Speech API**: Browser-based speech recognition

## 🛠️ Technical Stack

### Frontend
- **React 18**: Modern UI framework
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Beautiful icon library
- **Web Speech API**: Browser speech recognition

### Backend
- **Flask**: Lightweight Python web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Google Generative AI**: Gemini API integration
- **Requests**: HTTP library for API calls
- **Python-dotenv**: Environment variable management

### Development Tools
- **ESLint**: JavaScript linting
- **Git**: Version control
- **Node.js**: JavaScript runtime
- **Python**: Backend programming language

## � Security & Configuration

### Environment Variables
All sensitive information is stored in environment variables:

```bash
# Required API Keys
OPENWEATHER_API_KEY=your_key_here
NEWS_API_KEY=your_key_here  
GEMINI_API_KEY=your_key_here

# Optional Settings
DEFAULT_CITY=New York
DEFAULT_COUNTRY=us
SPEECH_RATE=180
SPEECH_VOLUME=0.9
REMINDER_CHECK_INTERVAL=30
```

### Security Features
- **No hardcoded API keys**: All keys loaded from environment variables
- **CORS protection**: Configured for local development
- **Input validation**: Sanitized user inputs
- **Error handling**: Graceful error responses
- **Git ignore**: Sensitive files excluded from version control

### Getting API Keys

1. **OpenWeatherMap** (Free)
   - Visit: https://openweathermap.org/api
   - Sign up and get your API key
   - 1000 calls/day free tier

2. **NewsAPI** (Free)
   - Visit: https://newsapi.org/
   - Register and get your API key
   - 100 requests/day free tier

3. **Google Gemini** (Free)
   - Visit: https://ai.google.dev/
   - Get your API key
   - Generous free tier available

## 🎯 Features in Detail

### 🎤 Voice Recognition
- **Real-time processing**: Instant speech-to-text conversion
- **Multiple languages**: Supports various languages
- **Noise handling**: Works in various environments
- **Browser-based**: No additional software required

### 🤖 AI Conversations
- **Context awareness**: Remembers conversation history
- **Multi-turn reminders**: Helps create complex reminders
- **Natural responses**: Human-like conversation flow
- **Smart suggestions**: Proactive assistance

### ⏰ Advanced Reminders
- **Flexible time parsing**: "in 10 minutes", "next Tuesday at 3 PM"
- **CRUD operations**: Create, read, update, delete reminders
- **Persistent storage**: Reminders saved to JSON file
- **Visual management**: Easy-to-use reminder interface

### 🌤️ Global Weather
- **Any city support**: Weather for cities worldwide
- **Current conditions**: Temperature, humidity, description
- **Error handling**: Graceful handling of invalid cities
- **Fast responses**: Cached and optimized API calls

### 📰 Comprehensive News
- **Multiple categories**: Tech, sports, business, general
- **Latest headlines**: Real-time news updates
- **Source variety**: News from multiple reliable sources
- **Clean formatting**: Easy-to-read news presentation

## 🔧 Development

### Prerequisites
- **Python 3.8+**: Backend development
- **Node.js 16+**: Frontend development  
- **Git**: Version control

### Setting Up Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd FOURTH-PROJECT

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..

# Copy environment template
cp .env.example .env
# Edit .env with your API keys
```

### Running in Development Mode

```bash
# Terminal 1: Start backend
python backend_api.py

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# The built files will be in frontend/dist/
```

### Project Scripts

```bash
# Backend
python backend_api.py          # Start Flask server

# Frontend
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview                # Preview production build
npm run lint                   # Run ESLint
```

## 🐛 Troubleshooting

### Common Issues

#### 🎤 Microphone Not Working
- **Check browser permissions**: Allow microphone access
- **HTTPS requirement**: Voice recognition requires HTTPS or localhost
- **Browser compatibility**: Use Chrome/Firefox for best results

#### 🔑 API Key Issues
- **Check .env file**: Ensure API keys are properly set
- **Verify keys**: Test keys directly with API providers
- **Restart server**: Restart backend after changing .env

#### 🌐 Network Issues
- **CORS errors**: Ensure backend is running on port 5000
- **Firewall**: Check if ports 5000 and 5173 are not blocked
- **Internet connection**: APIs require internet access

#### 📱 Frontend Issues
- **Clear cache**: Hard refresh browser (Ctrl+Shift+R)
- **Check console**: Look for JavaScript errors in browser console
- **Dependencies**: Run `npm install` if components are missing

### Error Messages
- **"Microphone permission denied"**: Allow microphone access in browser
- **"API key not found"**: Check .env file configuration
- **"Connection failed"**: Ensure backend server is running
- **"Speech recognition failed"**: Check internet connection

## � Performance Optimization

### Backend Performance
- **Caching**: Weather and news data cached for faster responses
- **Async processing**: Non-blocking reminder operations
- **Error handling**: Graceful degradation on API failures
- **Memory management**: Efficient JSON file handling

### Frontend Performance
- **Virtual DOM**: React's efficient rendering
- **Component optimization**: Minimized re-renders
- **Code splitting**: Lazy loading for better performance
- **Asset optimization**: Compressed images and fonts

## 🤝 Contributing

### Development Workflow
1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow coding standards
4. **Test thoroughly**: Test both frontend and backend
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Create Pull Request**: Describe your changes

### Code Style
- **Python**: Follow PEP 8 guidelines
- **JavaScript**: Use ESLint configuration
- **Comments**: Document complex logic
- **Error handling**: Always handle potential errors

### Testing
- **Manual testing**: Test all voice and text commands
- **Cross-browser**: Test on Chrome, Firefox, Safari
- **Mobile testing**: Ensure mobile responsiveness
- **API testing**: Verify all endpoints work correctly

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **React Team**: For the amazing React framework
- **Google**: For Gemini AI and speech recognition APIs
- **OpenWeatherMap**: For comprehensive weather data
- **NewsAPI**: For real-time news headlines
- **Tailwind CSS**: For the utility-first CSS framework
- **Vite**: For the fast build tool
- **Flask**: For the lightweight Python web framework

## 📞 Support & Contact

### Getting Help
1. **Check the troubleshooting section** above
2. **Read the API documentation** for external services
3. **Test with different browsers** if having issues
4. **Check browser console** for JavaScript errors
5. **Verify environment variables** are properly set

### Reporting Issues
When reporting issues, please include:
- Operating system and version
- Browser version
- Python version
- Error messages (if any)
- Steps to reproduce the issue

### Feature Requests
We welcome feature requests! Please describe:
- The feature you'd like to see
- Why it would be useful
- Any implementation ideas you have

---

## 🎉 Ready to Get Started?

1. **Clone the repository**
2. **Set up your environment** (Python + Node.js)
3. **Install dependencies** (pip + npm)
4. **Configure API keys** (copy .env.example to .env)
5. **Launch the application** (backend + frontend)
6. **Start chatting** with your AI assistant!

**🚀 Experience the future of voice-powered AI assistance!**

*Built with ❤️ using React, Flask, and cutting-edge AI technology*
