#!/usr/bin/env python3
"""
Add test reminders to verify the clear functionality
"""

import requests
import json
from datetime import datetime, timedelta

API_BASE_URL = 'http://localhost:5000/api'

def add_test_reminders():
    print("📝 Adding test reminders...")
    
    # Test reminders
    test_reminders = [
        "Call mom in 30 minutes",
        "Take medication at 2 PM",
        "Buy groceries tomorrow",
        "Meeting reminder at 3:30 PM",
        "Remind me to exercise in 1 hour"
    ]
    
    for reminder_text in test_reminders:
        try:
            print(f"Adding: {reminder_text}")
            response = requests.post(f"{API_BASE_URL}/command", 
                                   json={"command": f"Remind me to {reminder_text}"})
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print(f"✅ Added: {reminder_text}")
                else:
                    print(f"❌ Failed: {reminder_text} - {data.get('response', 'Unknown error')}")
            else:
                print(f"❌ HTTP Error {response.status_code}: {reminder_text}")
        except Exception as e:
            print(f"❌ Exception: {reminder_text} - {str(e)}")

def check_reminders():
    print("\n📋 Checking current reminders...")
    try:
        response = requests.get(f"{API_BASE_URL}/reminders")
        if response.status_code == 200:
            data = response.json()
            reminder_list = data.get('data', [])
            print(f"📊 Current reminders: {len(reminder_list)}")
            for reminder in reminder_list:
                print(f"  • {reminder.get('text', 'Unknown')} - {reminder.get('formatted_time', 'Unknown time')}")
        else:
            print(f"❌ Failed to get reminders: {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking reminders: {str(e)}")

def main():
    print("🚀 Setting up test reminders...")
    
    # Check if backend is running
    try:
        response = requests.get(f"{API_BASE_URL}/status")
        if response.status_code == 200:
            print("✅ Backend is running!")
        else:
            print("❌ Backend is not responding correctly")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on http://localhost:5000")
        return
    
    # Add test reminders
    add_test_reminders()
    
    # Check current reminders
    check_reminders()
    
    print("\n🎉 Test setup complete!")
    print("💡 Now you can test the 'Clear All' functionality in the web interface!")

if __name__ == "__main__":
    main()
