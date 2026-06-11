import os
import re

def fix_dashboard():
    filepath = r"d:\Demo\People-Tracking\frontend\src\pages\Dashboard.tsx"
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace all text-white with text-slate-900
    new_content = content.replace("text-white", "text-slate-900")
    new_content = new_content.replace("text-slate-100", "text-slate-900")

    # Revert specific instances that must remain white
    revert_patterns = [
        r"(bg-blue-\d00[^>]*?)text-slate-900",
        r"(bg-red-\d00[^>]*?)text-slate-900",
        r"(bg-emerald-\d00[^>]*?)text-slate-900"
    ]
    for _ in range(5):
        for pattern in revert_patterns:
            new_content = re.sub(pattern, r"\1text-white", new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Dashboard text updated")

def fix_navbar():
    filepath = r"d:\Demo\People-Tracking\frontend\src\components\layout\Navbar.tsx"
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content.replace("bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg", "bg-white text-slate-900 border-b border-slate-200 shadow-sm")
    new_content = new_content.replace("hover:text-white", "hover:text-slate-900")
    new_content = new_content.replace("text-white", "text-slate-900")

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Navbar updated")

if __name__ == "__main__":
    fix_dashboard()
    fix_navbar()
