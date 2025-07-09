import google.generativeai as genai
import json

# Configure Gemini API
genai.configure(api_key="AIzaSyCeEzuEj-HkFd5UcabGy28bULZjnsYy9Ek")

# List available models
print("Available models:")
for model in genai.list_models():
    print(f"- {model.name}")

# Use the correct model name
model = genai.GenerativeModel('gemini-1.5-flash')

# Test command
command = "Call mom in 10 minutes"

prompt = f"""
You are a voice assistant AI. Analyze the following user command and determine the intent and extract relevant information.

User command: "{command}"

Please respond with a JSON object containing:
1. "intent": One of ["time", "weather", "news", "reminder_set", "reminder_list", "help", "unknown"]
2. "entities": Extracted entities based on intent:
   - For weather: {{"city": "city_name"}}
   - For news: {{"category": "general|technology|sports|business|health|science|entertainment"}}
   - For reminder_set: {{"text": "reminder_text", "time_expression": "time_expression"}}
   - For other intents: {{}}
3. "natural_response": A natural, conversational response to the user
4. "confidence": A number between 0-1 indicating confidence in the classification

Examples:
- "Call mom in 10 minutes" → intent: "reminder_set", entities: {{"text": "call mom", "time_expression": "in 10 minutes"}}
- "What's the weather in Mumbai?" → intent: "weather", entities: {{"city": "Mumbai"}}
- "Tell me about new news" → intent: "news", entities: {{"category": "general"}}
- "What time is it?" → intent: "time", entities: {{}}

Respond only with valid JSON.
"""

try:
    response = model.generate_content(prompt)
    print("Gemini Response:")
    print(response.text)
    
    # Clean the response - remove markdown code blocks if present
    response_text = response.text.strip()
    if response_text.startswith('```json'):
        response_text = response_text[7:]  # Remove ```json
    if response_text.endswith('```'):
        response_text = response_text[:-3]  # Remove ```
    response_text = response_text.strip()
    
    # Try to parse JSON
    try:
        result = json.loads(response_text)
        print("\nParsed JSON:")
        print(json.dumps(result, indent=2))
    except json.JSONDecodeError as e:
        print(f"\nJSON Parse Error: {e}")
        print(f"Cleaned text: '{response_text}'")
        
except Exception as e:
    print(f"Error: {e}")
