import os
import re

directory = 'src'

replacements = [
    # Backgrounds
    (r'bg-\[\#050505\]', 'bg-white'),
    (r'bg-white/5', 'bg-black/5'),
    (r'bg-white/10', 'bg-black/10'),
    (r'bg-white/(\[.*?\]|\d+)', r'bg-black/\1'),
    (r'bg-\[\#0B0E14\]', 'bg-gray-50'),
    
    # Text
    (r'text-white', 'text-black'),
    (r'text-\[\#8892B0\]', 'text-gray-500'),
    (r'text-\[\#495670\]', 'text-gray-400'),
    
    # Borders
    (r'border-white/5', 'border-black/10'),
    (r'border-white/10', 'border-black/10'),
    (r'border-white/20', 'border-black/20'),
    (r'border-white/(\[.*?\]|\d+)', r'border-black/\1'),
    
    # Neon Colors (Cyan & Mint) -> Black/Grayscale
    (r'text-\[\#00F0FF\]', 'text-black'),
    (r'bg-\[\#00F0FF\]', 'bg-black'),
    (r'border-\[\#00F0FF\]', 'border-black'),
    (r'from-\[\#00F0FF\]', 'from-black'),
    (r'to-\[\#00F0FF\]', 'to-gray-900'),
    (r'via-\[\#00F0FF\]', 'via-gray-800'),
    
    (r'text-\[\#00E676\]', 'text-black'),
    (r'bg-\[\#00E676\]', 'bg-black'),
    (r'border-\[\#00E676\]', 'border-black'),
    (r'from-\[\#00E676\]', 'from-black'),
    
    # Shadows (remove neon glows)
    (r'shadow-\[.*?rgba\(0,240,255.*?\]', 'shadow-[0_4px_20px_rgba(0,0,0,0.1)]'),
    (r'shadow-\[.*?rgba\(0,230,118.*?\]', 'shadow-[0_4px_20px_rgba(0,0,0,0.1)]'),
    (r'shadow-\[0_10px_40px_rgba\(0,0,0,0\.5\)\]', 'shadow-sm'),
    (r'drop-shadow-\[.*?rgba\(0,240,255.*?\]', 'drop-shadow-sm'),
    (r'drop-shadow-\[.*?rgba\(0,230,118.*?\]', 'drop-shadow-sm'),
    (r'drop-shadow-\[0_0_15px_rgba\(239,68,68,0\.5\)\]', 'drop-shadow-sm'),
    (r'drop-shadow-\[.*?rgba\(239,68,68.*?\]', 'drop-shadow-sm'),
    
    # Specific Hexes
    (r'\#00F0FF', '#000000'),
    (r'\#00E676', '#111827'),
    (r'\#050505', '#FFFFFF'),
    
    # Specific components tweaks that might have pure white things
    (r'rgba\(255, 255, 255, 0\.02\)', 'rgba(0, 0, 0, 0.02)')
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
        if file.endswith(('.tsx', '.ts', '.css')):
            filepath = os.path.join(root, file)
            process_file(filepath)

print("Theme migration complete!")
