from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import threading
import time

from services import WeatherService, NewsService, ReminderManager
from command_parser import CommandParser
from gemini_processor import GeminiCommandProcessor
import config

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize services
weather_service = WeatherService()
news_service = NewsService()
reminder_manager = ReminderManager()
command_parser = CommandParser()
gemini_processor = GeminiCommandProcessor()

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

def get_weather_for_city(city):
    """Get weather information for a specific city"""
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
                }), 400
        
        return jsonify({
            'success': True,
            'data': weather_data,
            'response': f"The weather in {weather_data['city']} is {weather_data['temperature']} with {weather_data['description']}",
            'weather': weather_data
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'response': f"Error getting weather: {str(e)}"
        }), 500

@app.route('/api/weather', methods=['GET'])
def get_weather():
    """Get weather information"""
    city = request.args.get('city', config.DEFAULT_CITY)
    return get_weather_for_city(city)

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
        
        # Use Gemini processor for better understanding
        result = gemini_processor.process_command(command)
        
        if result["action"] == "reminder_set" and "error" not in result:
            text = result.get("text", "")
            reminder_time = datetime.fromisoformat(result.get("time", ""))
            
            if reminder_manager.add_reminder(text, reminder_time):
                return jsonify({
                    'success': True,
                    'response': result.get("response"),
                    'data': {
                        'text': text,
                        'time': result.get("time"),
                        'formatted_time': result.get("formatted_time")
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
                'error': result.get("error", 'Could not parse reminder'),
                'response': result.get("response", "I couldn't understand the reminder format. Try 'remind me to call mom in 10 minutes'")
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'response': f"Error adding reminder: {str(e)}"
        }), 500

@app.route('/api/command', methods=['POST'])
def process_command():
    """Process a general command using Gemini AI"""
    try:
        data = request.get_json()
        command = data.get('command', '').strip()
        
        # Remove wake word if present
        if config.WAKE_WORD in command.lower():
            command = command.replace(config.WAKE_WORD, "").strip()
        
        # Process command with Gemini
        result = gemini_processor.process_command(command)
        
        # Execute the action based on Gemini's understanding
        if result["action"] == "time":
            return jsonify({
                'success': True,
                'response': result["response"],
                'data': {
                    'time': result.get("time"),
                    'date': result.get("date")
                }
            })
        
        elif result["action"] == "weather":
            city = result.get("city", config.DEFAULT_CITY)
            weather_response = get_weather_for_city(city)
            
            if weather_response.status_code == 200:
                weather_data = weather_response.get_json()
                if weather_data.get("success"):
                    # Generate natural response with Gemini
                    natural_response = gemini_processor.generate_natural_response({
                        "action": "weather",
                        "success": True,
                        "data": weather_data.get("data", {})
                    })
                    weather_data["response"] = natural_response
                return jsonify(weather_data)
            else:
                return weather_response
        
        elif result["action"] == "news":
            category = result.get("category", "general")
            
            try:
                news_data = news_service.get_news(category=category)
                
                if "error" in news_data:
                    if "mock_data" in news_data:
                        headlines = news_data["mock_data"]["headlines"]
                        natural_response = gemini_processor.generate_natural_response({
                            "action": "news",
                            "success": True,
                            "data": headlines,
                            "category": category
                        })
                        return jsonify({
                            'success': True,
                            'data': headlines,
                            'response': natural_response,
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
                    natural_response = gemini_processor.generate_natural_response({
                        "action": "news",
                        "success": True,
                        "data": headlines,
                        "category": category
                    })
                    return jsonify({
                        'success': True,
                        'data': headlines,
                        'response': natural_response,
                        'is_mock': False
                    })
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': str(e),
                    'response': f"Error getting news: {str(e)}"
                }), 500
        
        elif result["action"] == "reminder_set":
            if "error" in result:
                return jsonify({
                    'success': False,
                    'error': result["error"],
                    'response': result["response"]
                })
            
            try:
                text = result.get("text", "")
                reminder_time = datetime.fromisoformat(result.get("time", ""))
                
                if reminder_manager.add_reminder(text, reminder_time):
                    return jsonify({
                        'success': True,
                        'response': result["response"],
                        'data': {
                            'text': text,
                            'time': result.get("time"),
                            'formatted_time': result.get("formatted_time")
                        }
                    })
                else:
                    return jsonify({
                        'success': False,
                        'error': 'Failed to save reminder',
                        'response': "I couldn't set that reminder. Please try again."
                    })
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': str(e),
                    'response': f"Error setting reminder: {str(e)}"
                }), 500
        
        elif result["action"] == "reminder_list":
            return get_reminders()
        
        elif result["action"] == "help":
            return jsonify({
                'success': True,
                'response': result["response"],
                'data': {
                    'help': True,
                    'commands': [
                        'time', 'date', 'weather', 'news', 'reminders', 'help'
                    ]
                }
            })
        
        else:  # unknown action
            return jsonify({
                'success': True,
                'response': result["response"],
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
