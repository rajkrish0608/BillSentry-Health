import os
import re

directory = 'src'

replacements = [
    # Catch any remaining dark backgrounds with opacity
    (r'bg-\[\#050505\]/(\d+)', r'bg-white/\1'),
    (r'bg-\[\#0B0E14\]/(\d+)', r'bg-gray-50/\1'),
    (r'bg-black/(\d+)', r'bg-white'), # Force black glass to white glass
    (r'bg-brand-navy', 'bg-gray-50'),
    (r'border-black/5', 'border-gray-200'),
    (r'border-black/10', 'border-gray-200'),
    (r'border-black/30', 'border-gray-300'),
    (r'border-white/5', 'border-gray-200'),
    (r'border-white/10', 'border-gray-200'),
    # Text colors
    (r'text-white', 'text-black'),
    (r'text-\[\#8892B0\]', 'text-gray-500'),
    (r'text-brand-gray', 'text-gray-600'),
    (r'text-brand-light', 'text-gray-800'),
    (r'text-brand-blue', 'text-black'),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in replacements:
        new_content = re.sub(pattern, replacement, new_content)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            filepath = os.path.join(root, file)
            process_file(filepath)

print("Secondary Theme sweep complete!")
