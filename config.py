# Configuration file for Voice Assistant
# Uses environment variables for API keys

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Keys (loaded from environment variables)
# OpenWeatherMap API Key
# Get yours at: https://openweathermap.org/api
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', 'your_openweather_api_key_here')

# NewsAPI Key
# Get yours at: https://newsapi.org/
NEWS_API_KEY = os.getenv('NEWS_API_KEY', 'your_news_api_key_here')

# Gemini API Key
# Get yours at: https://ai.google.dev/
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'your_gemini_api_key_here')

# Default settings
DEFAULT_CITY = os.getenv('DEFAULT_CITY', 'New York')
DEFAULT_COUNTRY = os.getenv('DEFAULT_COUNTRY', 'us')
REMINDER_CHECK_INTERVAL = int(os.getenv('REMINDER_CHECK_INTERVAL', '30'))  # seconds
WAKE_WORD = os.getenv('WAKE_WORD', 'assistant')

# Speech settings
SPEECH_RATE = int(os.getenv('SPEECH_RATE', '180'))
SPEECH_VOLUME = float(os.getenv('SPEECH_VOLUME', '0.9'))
MICROPHONE_TIMEOUT = int(os.getenv('MICROPHONE_TIMEOUT', '5'))
PHRASE_TIME_LIMIT = int(os.getenv('PHRASE_TIME_LIMIT', '10'))