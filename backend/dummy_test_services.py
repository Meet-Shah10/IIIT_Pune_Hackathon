# dummy_test_services.py
"""Simple script to test the backend services.
Sends a chat request to the Node server and prints the response.
"""
import json
import sys

try:
    import requests
except ImportError:
    print("The 'requests' library is required. Install it with 'pip install requests'.")
    sys.exit(1)

# Configuration
SERVER_URL = "http://localhost:3000/api/chat"

# Prompt user for input
print("Enter user ID (default: test_user): ", end="")
user_id = input().strip() or "test_user"
print("Enter session ID (default: test_session): ", end="")
session_id = input().strip() or "test_session"

print("Enter your message: ", end="")
import re
from indic_transliteration import sanscript

def transliterate_for_riva(text: str) -> str:
    if re.search(r'[\u0900-\u097F]', text):
        return sanscript.transliterate(text, sanscript.DEVANAGARI, sanscript.ITRANS)
    return text

message = transliterate_for_riva(message)

payload = {
    "userId": user_id,
    "sessionId": session_id,
    "message": message,
    "memoryEnabled": True,
}

try:
    response = requests.post(SERVER_URL, json=payload, timeout=10)
    response.raise_for_status()
    data = response.json()
    print("Response from server:")
    print(json.dumps(data, indent=2))
except requests.exceptions.RequestException as e:
    print(f"Request failed: {e}")
    sys.exit(1)
except json.JSONDecodeError:
    print("Failed to decode JSON response")
    sys.exit(1)
