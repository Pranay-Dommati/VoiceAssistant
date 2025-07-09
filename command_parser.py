import re
from datetime import datetime, timedelta
from typing import Optional, Tuple
import config

class CommandParser:
    def __init__(self):
        self.time_patterns = {
            'minutes': r'(\d+)\s*minute[s]?',
            'hours': r'(\d+)\s*hour[s]?',
            'days': r'(\d+)\s*day[s]?',
            'weeks': r'(\d+)\s*week[s]?',
            'specific_time': r'(\d{1,2}):(\d{2})\s*(am|pm)?'
        }
    
    def parse_reminder_command(self, command: str) -> Optional[Tuple[str, datetime]]:
        """Parse reminder command and extract text and time"""
        command = command.lower().strip()
        
        # Remove common trigger words
        trigger_words = ['remind me to', 'remind me', 'set a reminder to', 'set reminder']
        for trigger in trigger_words:
            if command.startswith(trigger):
                command = command[len(trigger):].strip()
                break
        
        # Look for time indicators
        if 'in' in command:
            return self._parse_relative_time(command)
        elif 'at' in command:
            return self._parse_absolute_time(command)
        elif 'tomorrow' in command:
            return self._parse_tomorrow(command)
        else:
            # Default to 5 minutes if no time specified
            text = command
            target_time = datetime.now() + timedelta(minutes=5)
            return text, target_time
    
    def _parse_relative_time(self, command: str) -> Optional[Tuple[str, datetime]]:
        """Parse relative time (e.g., 'in 5 minutes')"""
        parts = command.split('in', 1)
        if len(parts) != 2:
            return None
        
        text = parts[0].strip()
        time_part = parts[1].strip()
        
        # Try to match time patterns
        for unit, pattern in self.time_patterns.items():
            if unit == 'specific_time':
                continue
                
            match = re.search(pattern, time_part)
            if match:
                amount = int(match.group(1))
                
                if unit == 'minutes':
                    target_time = datetime.now() + timedelta(minutes=amount)
                elif unit == 'hours':
                    target_time = datetime.now() + timedelta(hours=amount)
                elif unit == 'days':
                    target_time = datetime.now() + timedelta(days=amount)
                elif unit == 'weeks':
                    target_time = datetime.now() + timedelta(weeks=amount)
                
                return text, target_time
        
        return None
    
    def _parse_absolute_time(self, command: str) -> Optional[Tuple[str, datetime]]:
        """Parse absolute time (e.g., 'at 3:30 PM')"""
        parts = command.split('at', 1)
        if len(parts) != 2:
            return None
        
        text = parts[0].strip()
        time_part = parts[1].strip()
        
        # Try to match specific time pattern
        match = re.search(self.time_patterns['specific_time'], time_part)
        if match:
            hour = int(match.group(1))
            minute = int(match.group(2))
            period = match.group(3)
            
            # Convert to 24-hour format
            if period and period.lower() == 'pm' and hour != 12:
                hour += 12
            elif period and period.lower() == 'am' and hour == 12:
                hour = 0
            
            now = datetime.now()
            target_time = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            # If the time has passed today, schedule for tomorrow
            if target_time <= now:
                target_time += timedelta(days=1)
            
            return text, target_time
        
        return None
    
    def _parse_tomorrow(self, command: str) -> Optional[Tuple[str, datetime]]:
        """Parse tomorrow commands"""
        text = command.replace('tomorrow', '').strip()
        
        # Default to 9 AM tomorrow
        tomorrow = datetime.now() + timedelta(days=1)
        target_time = tomorrow.replace(hour=9, minute=0, second=0, microsecond=0)
        
        return text, target_time
    
    def extract_city_from_weather(self, command: str) -> str:
        """Extract city name from weather command"""
        command = command.lower()
        
        # Common patterns - more comprehensive
        patterns = [
            r'weather in ([a-zA-Z\s]+)',
            r'weather for ([a-zA-Z\s]+)',
            r'weather at ([a-zA-Z\s]+)',
            r'weather of ([a-zA-Z\s]+)',
            r'how is the weather in ([a-zA-Z\s]+)',
            r'what is the weather in ([a-zA-Z\s]+)',
            r'temperature in ([a-zA-Z\s]+)',
            r'temperature at ([a-zA-Z\s]+)',
            r'temperature of ([a-zA-Z\s]+)',
            r'([a-zA-Z\s]+) weather',  # "mumbai weather"
            r'([a-zA-Z\s]+) temperature'  # "mumbai temperature"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, command)
            if match:
                city = match.group(1).strip().title()
                # Filter out common words that might be mistaken for cities
                if city.lower() not in ['the', 'is', 'what', 'how', 'current', 'today', 'now']:
                    return city
        
        return config.DEFAULT_CITY  # Default city from config
    
    def extract_news_category(self, command: str) -> str:
        """Extract news category from command"""
        command = command.lower()
        
        categories = {
            'technology': ['tech', 'technology', 'tech news'],
            'sports': ['sports', 'sport', 'sports news'],
            'business': ['business', 'finance', 'economy'],
            'health': ['health', 'medical', 'healthcare'],
            'science': ['science', 'scientific'],
            'entertainment': ['entertainment', 'celebrity', 'movies']
        }
        
        for category, keywords in categories.items():
            for keyword in keywords:
                if keyword in command:
                    return category
        
        return 'general'  # Default category
