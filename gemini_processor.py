import google.generativeai as genai
import json
import re
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple
import config
from command_parser import CommandParser

class GeminiCommandProcessor:
    def __init__(self):
        # Configure Gemini API
        genai.configure(api_key=config.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.command_parser = CommandParser()
        self.conversation_context = None  # Store conversation context
        
    def process_command(self, command: str) -> Dict[str, Any]:
        """Process command using Gemini AI for better understanding"""
        try:
            # Check if we have a pending reminder that needs completion
            if self.conversation_context and self.conversation_context.get("waiting_for_reminder_text"):
                return self._handle_reminder_completion(command)
                
            # Create a prompt for Gemini to understand the command intent
            prompt = f"""
You are a voice assistant AI. Analyze the following user command and determine the intent and extract relevant information.

User command: "{command}"

Please respond with a JSON object containing:
1. "intent": One of ["time", "weather", "news", "reminder_set", "reminder_incomplete", "reminder_list", "help", "unknown"]
2. "entities": Extracted entities based on intent:
   - For weather: {{"city": "city_name"}}
   - For news: {{"category": "general|technology|sports|business|health|science|entertainment"}}
   - For reminder_set: {{"text": "reminder_text", "time_expression": "time_expression"}}
   - For reminder_incomplete: {{"time_expression": "time_expression"}} (when only time is given without task)
   - For other intents: {{}}
3. "natural_response": A natural, conversational response to the user
4. "confidence": A number between 0-1 indicating confidence in the classification

Examples:
- "Call mom in 10 minutes" → intent: "reminder_set", entities: {{"text": "call mom", "time_expression": "in 10 minutes"}}
- "Set reminder at 12:43" → intent: "reminder_incomplete", entities: {{"time_expression": "at 12:43"}}
- "What's the weather in Mumbai?" → intent: "weather", entities: {{"city": "Mumbai"}}
- "Tell me about new news" → intent: "news", entities: {{"category": "general"}}
- "What time is it?" → intent: "time", entities: {{}}

For incomplete reminders (only time given), respond with a question asking what to remind about.

Respond only with valid JSON, no markdown formatting.
"""
            
            response = self.model.generate_content(prompt)
            
            # Clean the response - remove markdown code blocks if present
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]  # Remove ```json
            if response_text.endswith('```'):
                response_text = response_text[:-3]  # Remove ```
            response_text = response_text.strip()
            
            # Parse the JSON response
            try:
                result = json.loads(response_text)
                
                # Process based on intent
                if result["intent"] == "weather":
                    return self._handle_weather(result, command)
                elif result["intent"] == "news":
                    return self._handle_news(result, command)
                elif result["intent"] == "reminder_set":
                    return self._handle_reminder_set(result, command)
                elif result["intent"] == "reminder_incomplete":
                    return self._handle_reminder_incomplete(result, command)
                elif result["intent"] == "reminder_list":
                    return self._handle_reminder_list(result)
                elif result["intent"] == "time":
                    return self._handle_time(result)
                elif result["intent"] == "help":
                    return self._handle_help(result)
                else:
                    return self._handle_unknown(result)
                    
            except json.JSONDecodeError:
                # Fallback to original processing if JSON parsing fails
                return self._fallback_processing(command)
                
        except Exception as e:
            print(f"Gemini API error: {e}")
            # Fallback to original processing
            return self._fallback_processing(command)
    
    def _handle_weather(self, result: Dict, command: str) -> Dict[str, Any]:
        """Handle weather commands"""
        city = result.get("entities", {}).get("city")
        if not city:
            city = self.command_parser.extract_city_from_weather(command)
        
        return {
            "action": "weather",
            "city": city,
            "response": result.get("natural_response", f"Getting weather for {city}..."),
            "confidence": result.get("confidence", 0.8)
        }
    
    def _handle_news(self, result: Dict, command: str) -> Dict[str, Any]:
        """Handle news commands"""
        category = result.get("entities", {}).get("category", "general")
        
        return {
            "action": "news",
            "category": category,
            "response": result.get("natural_response", f"Getting {category} news..."),
            "confidence": result.get("confidence", 0.8)
        }
    
    def _handle_reminder_set(self, result: Dict, command: str) -> Dict[str, Any]:
        """Handle reminder setting commands"""
        entities = result.get("entities", {})
        reminder_text = entities.get("text", "")
        time_expression = entities.get("time_expression", "")
        
        # Use the original parser to extract time information
        parsed_reminder = self.command_parser.parse_reminder_command(command)
        
        if parsed_reminder:
            text, reminder_time = parsed_reminder
            return {
                "action": "reminder_set",
                "text": text,
                "time": reminder_time.isoformat(),
                "formatted_time": reminder_time.strftime("%I:%M %p on %B %d"),
                "response": result.get("natural_response", f"Setting reminder: {text}"),
                "confidence": result.get("confidence", 0.8)
            }
        else:
            return {
                "action": "reminder_set",
                "error": "Could not parse time",
                "response": "I couldn't understand when you want to be reminded. Try something like 'remind me to call mom in 10 minutes'",
                "confidence": result.get("confidence", 0.5)
            }
    
    def _handle_reminder_incomplete(self, result: Dict, command: str) -> Dict[str, Any]:
        """Handle incomplete reminder commands (only time given, no text)"""
        entities = result.get("entities", {})
        time_expression = entities.get("time_expression", "")
        
        # Try to parse the time from the command
        try:
            # Extract time using the command parser
            parsed_time = self.command_parser.parse_time_expression(time_expression or command)
            
            if parsed_time:
                # Store the context for the next message
                self.conversation_context = {
                    "waiting_for_reminder_text": True,
                    "stored_time": parsed_time.isoformat(),
                    "time_expression": time_expression
                }
                
                return {
                    "action": "reminder_incomplete",
                    "time": parsed_time.isoformat(),
                    "formatted_time": parsed_time.strftime("%I:%M %p on %B %d"),
                    "response": result.get("natural_response", "Okay, I've set a reminder for {}. What should I remind you about?".format(parsed_time.strftime("%I:%M %p"))),
                    "confidence": result.get("confidence", 0.8)
                }
            else:
                return {
                    "action": "reminder_incomplete",
                    "error": "Could not parse time",
                    "response": "I couldn't understand the time. Please try again with a specific time like '12:43 PM' or 'in 10 minutes'.",
                    "confidence": result.get("confidence", 0.3)
                }
                
        except Exception as e:
            return {
                "action": "reminder_incomplete",
                "error": f"Time parsing error: {str(e)}",
                "response": "I couldn't understand the time. Please try again with a specific time.",
                "confidence": result.get("confidence", 0.3)
            }

    def _handle_reminder_list(self, result: Dict) -> Dict[str, Any]:
        """Handle reminder listing commands"""
        return {
            "action": "reminder_list",
            "response": result.get("natural_response", "Here are your reminders..."),
            "confidence": result.get("confidence", 0.9)
        }
    
    def _handle_time(self, result: Dict) -> Dict[str, Any]:
        """Handle time commands"""
        current_time = datetime.now().strftime("%I:%M %p")
        current_date = datetime.now().strftime("%A, %B %d, %Y")
        
        return {
            "action": "time",
            "time": current_time,
            "date": current_date,
            "response": result.get("natural_response", f"The current time is {current_time}"),
            "confidence": result.get("confidence", 0.9)
        }
    
    def _handle_help(self, result: Dict) -> Dict[str, Any]:
        """Handle help commands"""
        return {
            "action": "help",
            "response": result.get("natural_response", """I can help you with:
• Time and date information
• Weather updates for any city worldwide
• Latest news headlines from various categories
• Setting and managing reminders

Commands you can try:
• "What time is it?"
• "Weather in Mumbai" / "London weather" / "Temperature in Dubai"
• "Latest news" / "Technology news"
• "Remind me to call mom in 10 minutes"
• "Show my reminders" """),
            "confidence": result.get("confidence", 0.9)
        }
    
    def _handle_unknown(self, result: Dict) -> Dict[str, Any]:
        """Handle unknown commands"""
        return {
            "action": "unknown",
            "response": result.get("natural_response", "I'm not sure how to help with that. Try asking about time, weather, news, or reminders."),
            "confidence": result.get("confidence", 0.3)
        }
    
    def _fallback_processing(self, command: str) -> Dict[str, Any]:
        """Fallback to original processing if Gemini fails"""
        command = command.lower()
        
        if any(word in command for word in ['time', 'clock']):
            return self._handle_time({"natural_response": None})
        elif any(word in command for word in ['weather', 'temperature']):
            city = self.command_parser.extract_city_from_weather(command)
            return {"action": "weather", "city": city, "response": f"Getting weather for {city}...", "confidence": 0.6}
        elif any(word in command for word in ['news', 'headlines']):
            category = self.command_parser.extract_news_category(command)
            return {"action": "news", "category": category, "response": f"Getting {category} news...", "confidence": 0.6}
        elif any(word in command for word in ['remind', 'reminder']):
            if 'list' in command or 'show' in command:
                return {"action": "reminder_list", "response": "Here are your reminders...", "confidence": 0.7}
            else:
                parsed = self.command_parser.parse_reminder_command(command)
                if parsed:
                    text, reminder_time = parsed
                    return {
                        "action": "reminder_set",
                        "text": text,
                        "time": reminder_time.isoformat(),
                        "formatted_time": reminder_time.strftime("%I:%M %p on %B %d"),
                        "response": f"Setting reminder: {text}",
                        "confidence": 0.6
                    }
                else:
                    return {"action": "reminder_set", "error": "Could not parse time", "response": "I couldn't understand when you want to be reminded.", "confidence": 0.3}
        else:
            return {"action": "unknown", "response": "I'm not sure how to help with that. Try asking about time, weather, news, or reminders.", "confidence": 0.2}

    def _handle_reminder_completion(self, command: str) -> Dict[str, Any]:
        """Handle completion of a reminder that was waiting for text"""
        try:
            # Get the stored time from context
            stored_time = self.conversation_context.get("stored_time")
            
            # Use the command as the reminder text
            reminder_text = command.strip()
            
            # Clear the context
            self.conversation_context = None
            
            # Return the completed reminder
            return {
                "action": "reminder_set",
                "text": reminder_text,
                "time": stored_time,
                "formatted_time": datetime.fromisoformat(stored_time).strftime("%I:%M %p on %B %d"),
                "response": f"Setting reminder: {reminder_text}",
                "confidence": 0.9
            }
            
        except Exception as e:
            # Clear context on error
            self.conversation_context = None
            return {
                "action": "reminder_set",
                "error": "Could not complete reminder",
                "response": "Sorry, I couldn't complete your reminder. Please try again.",
                "confidence": 0.3
            }
    
    def generate_natural_response(self, action_result: Dict[str, Any]) -> str:
        """Generate a natural response using Gemini based on action result"""
        try:
            if action_result.get("action") == "weather" and action_result.get("success"):
                weather_data = action_result.get("data", {})
                prompt = f"""
Generate a natural, conversational response for weather information:
City: {weather_data.get('city', 'Unknown')}
Temperature: {weather_data.get('temperature', 'Unknown')}
Description: {weather_data.get('description', 'Unknown')}
Humidity: {weather_data.get('humidity', 'Unknown')}%
Wind Speed: {weather_data.get('wind_speed', 'Unknown')} km/h

Make it sound natural and conversational, like a friendly assistant.
"""
                response = self.model.generate_content(prompt)
                return response.text
            
            elif action_result.get("action") == "news" and action_result.get("success"):
                headlines = action_result.get("data", [])
                prompt = f"""
Generate a natural, conversational response for news headlines:
Category: {action_result.get('category', 'general')}
Number of headlines: {len(headlines)}

Create a brief, friendly introduction to the news, mentioning the category and that you're providing the latest headlines.
"""
                response = self.model.generate_content(prompt)
                return response.text
            
            else:
                return action_result.get("response", "I'm here to help!")
                
        except Exception as e:
            print(f"Error generating natural response: {e}")
            return action_result.get("response", "I'm here to help!")
