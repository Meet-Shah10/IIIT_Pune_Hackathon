import os
import sys
import requests

api_key = os.environ.get("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")

if not api_key:
    print("Error: NVIDIA_API_KEY environment variable is not set.")
    sys.exit(1)

url = "https://integrate.api.nvidia.com/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}
payload = {
    "model": "meta/llama-3.1-8b-instruct",
    "messages": [{"role": "user", "content": "Ping"}],
    "max_tokens": 5
}

try:
    response = requests.post(url, headers=headers, json=payload, timeout=10)
    if response.status_code == 200:
        print("NVIDIA API Status: WORKING")
        print("Model output:", response.json()["choices"][0]["message"]["content"].strip())
    else:
        print(f"NVIDIA API Status: FAILED (HTTP {response.status_code})")
        print("Details:", response.text)
except requests.exceptions.RequestException as e:
        print(f"Connection error: {e}")
        