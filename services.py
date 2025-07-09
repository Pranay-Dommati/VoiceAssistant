import requests
import json
from datetime import datetime
from typing import Dict, Any, Optional
import config

class WeatherService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or config.OPENWEATHER_API_KEY
        self.base_url = "http://api.openweathermap.org/data/2.5/weather"
    
    def get_weather(self, city: str) -> Dict[str, Any]:
        """Get weather information for a city"""
        if self.api_key == "your_openweather_api_key":
            return {
                "error": "Please set up an OpenWeatherMap API key",
                "mock_data": {
                    "city": city,
                    "temperature": "72°F",
                    "description": "partly cloudy",
                    "humidity": "65%"
                }
            }
        
        try:
            params = {
                "q": city,
                "appid": self.api_key,
                "units": "imperial"
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return {
                "city": data["name"],
                "temperature": f"{data['main']['temp']:.0f}°F",
                "description": data["weather"][0]["description"],
                "humidity": f"{data['main']['humidity']}%",
                "pressure": f"{data['main']['pressure']} hPa",
                "wind_speed": f"{data['wind']['speed']} mph"
            }
            
        except requests.RequestException as e:
            return {"error": f"Failed to get weather data: {str(e)}"}
        except KeyError as e:
            return {"error": f"Invalid weather data format: {str(e)}"}

class NewsService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or config.NEWS_API_KEY
        self.base_url = "https://newsapi.org/v2/top-headlines"
    
    def get_news(self, country: str = None, category: str = "general") -> Dict[str, Any]:
        """Get top news headlines"""
        if country is None:
            country = config.DEFAULT_COUNTRY
            
        if self.api_key == "your_news_api_key_here":
            return {
                "error": "Please set up a NewsAPI key",
                "mock_data": {
                    "headlines": [
                        "Technology stocks rise amid AI developments",
                        "Weather patterns show seasonal changes",
                        "Local community events scheduled for weekend"
                    ]
                }
            }
        
        try:
            params = {
                "country": country,
                "category": category,
                "apiKey": self.api_key,
                "pageSize": 5
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            articles = data.get("articles", [])
            
            headlines = []
            for article in articles:
                headlines.append({
                    "title": article.get("title", ""),
                    "description": article.get("description", ""),
                    "source": article.get("source", {}).get("name", ""),
                    "url": article.get("url", "")
                })
            
            return {"headlines": headlines}
            
        except requests.RequestException as e:
            return {"error": f"Failed to get news data: {str(e)}"}
        except KeyError as e:
            return {"error": f"Invalid news data format: {str(e)}"}

class ReminderManager:
    def __init__(self, filename: str = "reminders.json"):
        self.filename = filename
        self.reminders = self.load_reminders()
    
    def load_reminders(self) -> list:
        """Load reminders from file"""
        try:
            with open(self.filename, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def save_reminders(self):
        """Save reminders to file"""
        with open(self.filename, 'w') as f:
            json.dump(self.reminders, f, indent=2)
    
    def add_reminder(self, text: str, reminder_time: datetime) -> bool:
        """Add a new reminder"""
        try:
            reminder = {
                "id": len(self.reminders) + 1,
                "text": text,
                "time": reminder_time.isoformat(),
                "completed": False,
                "created": datetime.now().isoformat()
            }
            
            self.reminders.append(reminder)
            self.save_reminders()
            return True
            
        except Exception:
            return False
    
    def get_due_reminders(self) -> list:
        """Get reminders that are due"""
        current_time = datetime.now()
        due_reminders = []
        
        for reminder in self.reminders:
            if not reminder["completed"]:
                reminder_time = datetime.fromisoformat(reminder["time"])
                if current_time >= reminder_time:
                    due_reminders.append(reminder)
                    reminder["completed"] = True
        
        if due_reminders:
            self.save_reminders()
        
        return due_reminders
    
    def get_upcoming_reminders(self) -> list:
        """Get upcoming reminders"""
        current_time = datetime.now()
        upcoming = []
        
        for reminder in self.reminders:
            if not reminder["completed"]:
                reminder_time = datetime.fromisoformat(reminder["time"])
                if current_time < reminder_time:
                    upcoming.append(reminder)
        
        return sorted(upcoming, key=lambda x: x["time"])
    
    def delete_reminder(self, reminder_id: int) -> bool:
        """Delete a reminder by ID"""
        for i, reminder in enumerate(self.reminders):
            if reminder["id"] == reminder_id:
                self.reminders.pop(i)
                self.save_reminders()
                return True
        return False
    
    def update_reminder(self, reminder_id: int, text: str, reminder_time: datetime) -> bool:
        """Update a reminder by ID"""
        for reminder in self.reminders:
            if reminder["id"] == reminder_id:
                reminder["text"] = text
                reminder["time"] = reminder_time.isoformat()
                self.save_reminders()
                return True
        return False

    def clear_all_reminders(self) -> bool:
        """Clear all reminders"""
        try:
            self.reminders = []
            self.save_reminders()
            return True
        except Exception:
            return False
