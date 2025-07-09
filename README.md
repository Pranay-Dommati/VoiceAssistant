# 🤖 Voice-Activated Personal Assistant

A comprehensive AI-powered personal assistant with both command-line and GUI interfaces. Features speech recognition, text-to-speech, weather updates, news reading, and intelligent reminder management.

## 🌟 Features

### Core Capabilities
- **🎤 Voice Recognition**: Natural speech-to-text processing
- **🗣️ Text-to-Speech**: Clear voice responses
- **⏰ Smart Reminders**: Set, manage, and get notified of reminders
- **🌤️ Weather Updates**: Real-time weather information for any city
- **📰 News Reading**: Latest headlines from various categories
- **💬 Natural Language Processing**: Understands conversational commands

### Interface Options
- **🖥️ GUI Version**: Beautiful graphical interface with buttons and chat display
- **💻 Command Line Version**: Terminal-based voice interaction
- **📱 Text Input**: Type commands in addition to voice input

### Smart Features
- **🧠 Intelligent Parsing**: Understands complex time formats ("in 10 minutes", "at 3 PM", "tomorrow")
- **🔄 Background Processing**: Non-blocking reminder checking
- **⚙️ Configurable**: Easy customization through config file
- **🌍 Location-Aware**: Configured for Hyderabad, India (customizable)

## 🚀 Quick Start

### 1. Installation
```bash
# Clone or download the project
cd FOURTH-PROJECT

# Run the launcher
python launcher.py

# Choose option 3 to install dependencies
```

### 2. Configuration
Edit `config.py` to add your API keys:
```python
# Get free API keys from:
OPENWEATHER_API_KEY = "your_key_here"  # https://openweathermap.org/api
NEWS_API_KEY = "your_key_here"         # https://newsapi.org/
```

### 3. Launch
```bash
python launcher.py
```

Choose your preferred interface:
- **Option 1**: GUI Version (Recommended)
- **Option 2**: Command Line Version

## 📂 Project Structure

```
FOURTH-PROJECT/
├── launcher.py           # Main launcher with interface selection
├── gui_assistant.py      # GUI version with tkinter
├── enhanced_assistant.py # Command-line version (enhanced)
├── main.py              # Basic command-line version
├── services.py          # Weather, news, and reminder services
├── command_parser.py    # Natural language command parsing
├── config.py            # Configuration settings
├── requirements.txt     # Python dependencies
├── setup.py             # Installation and setup script
└── README.md           # This file
```

## 🎤 Voice Commands

### Time & Date
- "What time is it?"
- "What's the date today?"
- "Tell me the current time"

### Weather
- "What's the weather like?"
- "Weather in Mumbai"
- "How's the weather in Delhi?"

### News
- "Latest news"
- "Tech news"
- "Sports headlines"
- "Business news"

### Reminders
- "Remind me to call mom in 10 minutes"
- "Set a reminder to exercise at 6 PM"
- "Remind me to take medicine tomorrow"
- "Show my reminders"

### Help & Control
- "What can you do?"
- "Help"
- "Stop" / "Exit" / "Goodbye"

## 🖥️ GUI Features

### Main Interface
- **Voice Control**: Click "Start Listening" for voice commands
- **Quick Actions**: One-click buttons for common tasks
- **Text Input**: Type commands directly
- **Chat Display**: Visual conversation history
- **Status Indicator**: Real-time status updates

### Visual Elements
- **🎤 Voice Button**: Start/stop voice listening
- **⏰ Time Display**: Current time in header
- **📊 Status Indicator**: Shows current activity
- **💬 Chat History**: Scrollable conversation log
- **🎯 Quick Actions**: Instant access to common features

## ⚙️ Configuration

### Location Settings
```python
# config.py
DEFAULT_CITY = "Hyderabad"    # Your city
DEFAULT_COUNTRY = "in"        # Country code (in = India)
```

### Speech Settings
```python
SPEECH_RATE = 180            # Words per minute
SPEECH_VOLUME = 0.9          # Volume level (0.0-1.0)
WAKE_WORD = "assistant"      # Voice activation word
```

### API Configuration
```python
# Weather API (OpenWeatherMap)
OPENWEATHER_API_KEY = "your_key_here"

# News API (NewsAPI)
NEWS_API_KEY = "your_key_here"
```

## 🔧 Technical Requirements

### Python Version
- Python 3.7 or higher

### Dependencies
```
speechrecognition==3.10.0
pyttsx3==2.90
requests==2.31.0
python-dateutil==2.8.2
pyaudio==0.2.11
newsapi-python==0.2.6
schedule==1.2.0
colorama==0.4.6
```

### System Requirements
- **Microphone**: For voice input
- **Speakers/Headphones**: For voice output
- **Internet Connection**: For weather and news APIs

## 🐛 Troubleshooting

### Common Issues

#### Microphone Not Working
```bash
# Windows: Install PyAudio
pip install pyaudio

# Linux: Install system dependencies
sudo apt-get install python3-dev libasound2-dev portaudio19-dev

# macOS: Install Homebrew dependencies
brew install portaudio
```

#### Speech Recognition Errors
- Check internet connection (Google's API required)
- Ensure microphone permissions are granted
- Reduce background noise
- Speak clearly and at normal pace

#### API Errors
- Verify API keys in `config.py`
- Check API quotas and limits
- Ensure internet connectivity

### Error Messages
- **"Could not understand audio"**: Speak more clearly or reduce noise
- **"Speech recognition error"**: Check internet connection
- **"API key required"**: Add valid API keys to config file
- **"Microphone error"**: Check microphone connection and permissions

## 🔄 Updates & Maintenance

### Adding New Features
1. Create new methods in respective service classes
2. Add command patterns in `command_parser.py`
3. Update GUI buttons and CLI commands
4. Test thoroughly with both interfaces

### Customization
- **Voice**: Modify TTS settings in `setup_tts()`
- **Commands**: Add new patterns in `CommandParser`
- **UI**: Customize colors and layout in `gui_assistant.py`
- **Services**: Extend `WeatherService`, `NewsService`, etc.

## 📊 Performance Tips

### Optimization
- Close unused applications for better microphone performance
- Use good quality microphone for better recognition
- Ensure stable internet connection for APIs
- Run on SSD for faster startup times

### Resource Usage
- **GUI Version**: Higher memory usage, better user experience
- **CLI Version**: Lower resource usage, faster performance
- **Background Process**: Minimal CPU usage for reminder checking

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes with proper error handling
4. Test both GUI and CLI versions
5. Submit pull request

### Code Style
- Follow PEP 8 guidelines
- Add docstrings to all functions
- Handle exceptions gracefully
- Use type hints where appropriate

## 📄 License

This project is created for educational purposes. Feel free to use, modify, and distribute as needed.

## 🙏 Acknowledgments

- **SpeechRecognition**: For voice input processing
- **pyttsx3**: For text-to-speech functionality
- **OpenWeatherMap**: For weather data
- **NewsAPI**: For news headlines
- **tkinter**: For GUI framework

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Run the setup script for dependency issues
3. Verify configuration settings
4. Test with both voice and text input

---

**🎉 Enjoy your new AI Voice Assistant!**

*Configured for Hyderabad, India - Ready to help with your daily tasks!*
