from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import threading
import time

from services import WeatherService, NewsService, ReminderManager
from command_parser import CommandParser
import config

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize services
weather_service = WeatherService()
news_service = NewsService()
reminder_manager = ReminderManager()
command_parser = CommandParser()

# Global state for reminders checking
reminder_checker_running = False

def start_reminder_checker():
    """Start background reminder checker"""
    global reminder_checker_running
    if not reminder_checker_running:
        reminder_checker_running = True
        threading.Thread(target=reminder_checker_thread, daemon=True).start()

def reminder_checker_thread():
    """Background thread to check reminders"""
    global reminder_checker_running
    while reminder_checker_running:
        try:
            due_reminders = reminder_manager.get_due_reminders()
            # In a real app, you'd send these via WebSocket or similar
            for reminder in due_reminders:
                print(f"Reminder due: {reminder['text']}")
        except Exception as e:
            print(f"Reminder checker error: {e}")
        time.sleep(config.REMINDER_CHECK_INTERVAL)

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get system status"""
    return jsonify({
        'status': 'online',
        'timestamp': datetime.now().isoformat(),
        'location': f"{config.DEFAULT_CITY}, {config.DEFAULT_COUNTRY.upper()}"
    })

@app.route('/api/time', methods=['GET'])
def get_time():
    """Get current time"""
    current_time = datetime.now().strftime("%I:%M %p")
    current_date = datetime.now().strftime("%A, %B %d, %Y")
    
    return jsonify({
        'time': current_time,
        'date': current_date,
        'response': f"The current time is {current_time}"
    })

@app.route('/api/weather', methods=['GET'])
def get_weather():
    """Get weather information"""
    city = request.args.get('city', config.DEFAULT_CITY)
    
    try:
        weather_data = weather_service.get_weather(city)
        
        if "error" in weather_data:
            if "mock_data" in weather_data:
                mock = weather_data["mock_data"]
                return jsonify({
                    'success': True,
                    'data': mock,
                    'response': f"The weather in {mock['city']} is {mock['temperature']} with {mock['description']}. (Sample data - please set up weather API)",
                    'is_mock': True
                })
            else:
                return jsonify({
                    'success': False,
                    'error': weather_data['error'],
                    'response': f"Sorry, I couldn't get weather information: {weather_data['error']}"
                })
        else:
            return jsonify({
                'success': True,
                'data': weather_data,
                'response': f"The weather in {weather_data['city']} is {weather_data['temperature']} with {weather_data['description']}",
                'is_mock': False
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'response': f"Error getting weather: {str(e)}"
        }), 500

@app.route('/api/news', methods=['GET'])
def get_news():
    """Get news headlines"""
    category = request.args.get('category', 'general')
    
    try:
        news_data = news_service.get_news(category=category)
        
        if "error" in news_data:
            if "mock_data" in news_data:
                headlines = news_data["mock_data"]["headlines"]
                return jsonify({
                    'success': True,
                    'data': headlines,
                    'response': f"Here are some sample {category} headlines",
                    'is_mock': True
                })
            else:
                return jsonify({
                    'success': False,
                    'error': news_data['error'],
                    'response': f"Sorry, I couldn't get news: {news_data['error']}"
                })
        else:
            headlines = news_data["headlines"]
            return jsonify({
                'success': True,
                'data': headlines,
                'response': f"Here are the top {category} news headlines",
                'is_mock': False
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'response': f"Error getting news: {str(e)}"
        }), 500

@app.route('/api/reminders', methods=['GET'])
def get_reminders():
    """Get upcoming reminders"""
    try:
        upcoming = reminder_manager.get_upcoming_reminders()
        
        response_data = []
        for reminder in upcoming:
            reminder_time = datetime.fromisoformat(reminder['time'])
            formatted_time = reminder_time.strftime("%I:%M %p on %B %d")
            response_data.append({
                'id': reminder['id'],
                'text': reminder['text'],
                'time': reminder['time'],
                'formatted_time': formatted_time
            })
        
        if response_data:
            response = f"You have {len(response_data)} upcoming reminders"
        else:
            response = "You have no upcoming reminders"
        
        return jsonify({
            'success': True,
            'data': response_data,
            'response': response
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'response': f"Error getting reminders: {str(e)}"
        }), 500

@app.route('/api/reminders', methods=['POST'])
def add_reminder():
    """Add a new reminder"""
    try:
        data = request.get_json()
        command = data.get('command', '')
        
        parsed = command_parser.parse_reminder_command(command)
        
        if parsed:
            text, reminder_time = parsed
            if reminder_manager.add_reminder(text, reminder_time):
                formatted_time = reminder_time.strftime("%I:%M %p on %B %d")
                return jsonify({
                    'success': True,
                    'response': f"Reminder set for {formatted_time}: {text}",
                    'data': {
                        'text': text,
                        'time': reminder_time.isoformat(),
                        'formatted_time': formatted_time
                    }
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Failed to save reminder',
                    'response': "I couldn't set that reminder. Please try again."
                })
        else:
            return jsonify({
                'success': False,
                'error': 'Could not parse reminder',
                'response': "I couldn't understand the reminder format. Try 'remind me to call mom in 10 minutes'"
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'response': f"Error adding reminder: {str(e)}"
        }), 500

@app.route('/api/command', methods=['POST'])
def process_command():
    """Process a general command"""
    try:
        data = request.get_json()
        command = data.get('command', '').lower()
        
        # Remove wake word if present
        if config.WAKE_WORD in command:
            command = command.replace(config.WAKE_WORD, "").strip()
        
        # Route to appropriate handler based on command content
        if any(word in command for word in ['time', 'clock']):
            return get_time()
        
        elif any(word in command for word in ['date', 'day', 'today']):
            return get_time()  # Returns both time and date
        
        elif any(word in command for word in ['weather', 'temperature']):
            city = command_parser.extract_city_from_weather(command)
            return get_weather() if city == config.DEFAULT_CITY else get_weather()
        
        elif any(word in command for word in ['news', 'headlines']):
            category = command_parser.extract_news_category(command)
            # Simulate query parameter
            request.args = {'category': category}
            return get_news()
        
        elif any(word in command for word in ['remind', 'reminder']):
            if 'list' in command or 'show' in command:
                return get_reminders()
            else:
                return add_reminder()
        
        elif any(word in command for word in ['help', 'what can you do']):
            return jsonify({
                'success': True,
                'response': """I can help you with:
• Time and date information
• Weather updates for any city (default: Hyderabad)
• Latest news headlines from India
• Setting and managing reminders

Commands you can try:
• "What time is it?"
• "Weather in Mumbai"
• "Latest news"
• "Remind me to call mom in 10 minutes"
• "Show my reminders" """,
                'data': {
                    'help': True,
                    'commands': [
                        'time', 'date', 'weather', 'news', 'reminders', 'help'
                    ]
                }
            })
        
        else:
            return jsonify({
                'success': True,
                'response': "I'm not sure how to help with that. Try asking about time, weather, news, or reminders.",
                'data': {
                    'suggestion': 'Try commands like "what time is it", "weather", "news", or "remind me to..."'
                }
            })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'response': f"Error processing command: {str(e)}"
        }), 500

@app.route('/api/config', methods=['GET'])
def get_config():
    """Get configuration information"""
    return jsonify({
        'wake_word': config.WAKE_WORD,
        'default_city': config.DEFAULT_CITY,
        'default_country': config.DEFAULT_COUNTRY,
        'speech_rate': config.SPEECH_RATE,
        'speech_volume': config.SPEECH_VOLUME
    })

if __name__ == '__main__':
    # Start reminder checker
    start_reminder_checker()
    
    print("🚀 Starting Voice Assistant Backend API...")
    print(f"📍 Configured for {config.DEFAULT_CITY}, {config.DEFAULT_COUNTRY.upper()}")
    print("🌐 API will be available at http://localhost:5000")
    print("🔗 Frontend should connect to this URL")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
