import os
import re

FRONTEND_DIR = r"d:\Demo\People-Tracking\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    # Replace dark:text-white with dark:text-slate-900
    new_content = re.sub(r'\bdark:text-white\b', 'dark:text-slate-900', new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated dark:text-white in {filepath}")

def main():
    for root, _, files in os.walk(FRONTEND_DIR):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
