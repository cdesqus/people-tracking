import os
import re

FRONTEND_DIR = r"d:\Demo\People-Tracking\frontend\src"

MAPPINGS = {
    # Backgrounds
    r'\bbg-slate-950\b': 'bg-slate-50',
    r'\bbg-slate-900\b': 'bg-white',
    r'\bbg-slate-850\b': 'bg-slate-100',
    r'\bbg-slate-800\b': 'bg-slate-100',
    r'\bbg-slate-700\b': 'bg-slate-200',
    
    # Backgrounds with opacity (handling /xx)
    r'\bbg-slate-950/(\d+)\b': r'bg-white/\1',
    r'\bbg-slate-900/(\d+)\b': r'bg-white/\1',
    r'\bbg-slate-800/(\d+)\b': r'bg-slate-100/\1',

    # Hover Backgrounds
    r'\bhover:bg-slate-800\b': 'hover:bg-slate-200',
    r'\bhover:bg-slate-700\b': 'hover:bg-slate-200',
    r'\bhover:bg-slate-900\b': 'hover:bg-slate-100',

    # Borders
    r'\bborder-slate-850\b': 'border-slate-200',
    r'\bborder-slate-800\b': 'border-slate-200',
    r'\bborder-slate-700\b': 'border-slate-300',
    r'\bborder-slate-600\b': 'border-slate-300',

    # Hover Borders
    r'\bhover:border-slate-700\b': 'hover:border-slate-300',

    # Text Colors
    r'\btext-gray-100\b': 'text-slate-800',
    r'\btext-gray-200\b': 'text-slate-700',
    r'\btext-gray-300\b': 'text-slate-600',
    r'\btext-gray-400\b': 'text-slate-500',
    r'\btext-slate-400\b': 'text-slate-500',
    r'\btext-slate-300\b': 'text-slate-600',
    r'\btext-slate-200\b': 'text-slate-700',
    r'\btext-slate-100\b': 'text-slate-800',
    r'\btext-emerald-400\b': 'text-emerald-600', # make emerald darker for contrast
    r'\btext-blue-400\b': 'text-blue-600', # make blue darker for contrast
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for pattern, replacement in MAPPINGS.items():
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

def main():
    for root, _, files in os.walk(FRONTEND_DIR):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
