import urllib.request
import json

try:
    req = urllib.request.Request("http://127.0.0.1:8000/api/employees?page=1&page_size=100")
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print(f"Total employees: {data.get('total')}")
        for emp in data.get('items', []):
            print(f"ID: {emp['id']}, Name: {emp['name']}, Last Detected: {emp['last_detected']}")
except Exception as e:
    print(f"Failed: {e}")
