#!/usr/bin/env python3
"""
Test the multi-turn reminder functionality
"""

import requests
import json
import time

API_BASE_URL = 'http://localhost:5000/api'

def test_multi_turn_reminder():
    print("🧪 Testing multi-turn reminder functionality...")
    
    # First command: Set reminder at specific time (incomplete)
    print("\n1. Testing incomplete reminder command: 'Set reminder at 12:43'")
    response = requests.post(f"{API_BASE_URL}/command", 
                           json={"command": "Set reminder at 12:43"})
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Response: {data['response']}")
        print(f"📊 Data: {data.get('data', {})}")
        
        # Check if it's waiting for reminder text
        if data.get('data', {}).get('reminder_incomplete'):
            print("🔄 System is waiting for reminder text...")
            
            # Second command: Complete the reminder
            print("\n2. Testing completion command: 'Call Dad'")
            response2 = requests.post(f"{API_BASE_URL}/command", 
                                    json={"command": "Call Dad"})
            
            if response2.status_code == 200:
                data2 = response2.json()
                print(f"✅ Response: {data2['response']}")
                print(f"📊 Data: {data2.get('data', {})}")
                
                if data2.get('success'):
                    print("🎉 Multi-turn reminder creation successful!")
                else:
                    print("❌ Failed to complete reminder")
            else:
                print(f"❌ Failed to send completion command: {response2.status_code}")
        else:
            print("❌ System did not recognize incomplete reminder")
    else:
        print(f"❌ Failed to send initial command: {response.status_code}")

def test_complete_reminder():
    print("\n🧪 Testing complete reminder in one command...")
    
    # Test complete reminder command
    print("\n3. Testing complete reminder: 'Remind me to drink water in 5 minutes'")
    response = requests.post(f"{API_BASE_URL}/command", 
                           json={"command": "Remind me to drink water in 5 minutes"})
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Response: {data['response']}")
        print(f"📊 Data: {data.get('data', {})}")
        
        if data.get('success'):
            print("🎉 Complete reminder creation successful!")
        else:
            print("❌ Failed to create complete reminder")
    else:
        print(f"❌ Failed to send complete reminder command: {response.status_code}")

def test_weather():
    print("\n🧪 Testing weather functionality...")
    
    # Test weather command
    print("\n4. Testing weather: 'What is the weather in Mumbai?'")
    response = requests.post(f"{API_BASE_URL}/command", 
                           json={"command": "What is the weather in Mumbai?"})
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Response: {data['response']}")
        print(f"📊 Data: {data.get('data', {})}")
        
        if data.get('success'):
            print("🎉 Weather query successful!")
        else:
            print("❌ Failed to get weather")
    else:
        print(f"❌ Failed to send weather command: {response.status_code}")

def test_time():
    print("\n🧪 Testing time functionality...")
    
    # Test time command
    print("\n5. Testing time: 'What time is it?'")
    response = requests.post(f"{API_BASE_URL}/command", 
                           json={"command": "What time is it?"})
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Response: {data['response']}")
        print(f"📊 Data: {data.get('data', {})}")
        
        if data.get('success'):
            print("🎉 Time query successful!")
        else:
            print("❌ Failed to get time")
    else:
        print(f"❌ Failed to send time command: {response.status_code}")

def test_clear_reminders():
    print("\n🧪 Testing clear reminders functionality...")
    
    # Test clear reminders command
    print("\n6. Testing clear reminders: DELETE /api/reminders/clear")
    response = requests.delete(f"{API_BASE_URL}/reminders/clear")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Response: {data['response']}")
        print(f"📊 Data: {data.get('data', {})}")
        
        if data.get('success'):
            print("🎉 Clear reminders successful!")
            
            # Verify reminders are cleared
            print("\n7. Verifying reminders are cleared...")
            verify_response = requests.get(f"{API_BASE_URL}/reminders")
            if verify_response.status_code == 200:
                verify_data = verify_response.json()
                reminder_list = verify_data.get('data', [])
                reminder_count = len(reminder_list)
                print(f"📊 Remaining reminders: {reminder_count}")
                
                if reminder_count == 0:
                    print("✅ All reminders successfully cleared!")
                else:
                    print("❌ Some reminders still remain")
        else:
            print("❌ Failed to clear reminders")
    else:
        print(f"❌ Failed to clear reminders: {response.status_code}")

def main():
    print("🚀 Starting Voice Assistant API Tests...")
    
    # Test if backend is running
    try:
        response = requests.get(f"{API_BASE_URL}/status")
        if response.status_code == 200:
            print("✅ Backend is running!")
            data = response.json()
            print(f"📍 Location: {data.get('location', 'Unknown')}")
        else:
            print("❌ Backend is not responding correctly")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on http://localhost:5000")
        return
    
    # Run tests
    test_multi_turn_reminder()
    test_complete_reminder()
    test_weather()
    test_time()
    test_clear_reminders()
    
    print("\n🏁 Tests completed!")

if __name__ == "__main__":
    main()
