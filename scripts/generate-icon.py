"""Generate TermaType app icon — 1024x1024 PNG."""
from PIL import Image, ImageDraw, ImageFont
import os

SIZE = 1024
CORNER_RADIUS = 220
BG_COLOR = (216, 136, 101)  # #D88865 terracotta
TEXT_COLOR = (255, 255, 255, 240)

img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Rounded rectangle background
draw.rounded_rectangle(
    [(0, 0), (SIZE - 1, SIZE - 1)],
    radius=CORNER_RADIUS,
    fill=BG_COLOR,
)

# Subtle inner shadow/highlight at top for depth
overlay = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
odraw = ImageDraw.Draw(overlay)
odraw.rounded_rectangle(
    [(4, 4), (SIZE - 5, SIZE // 2)],
    radius=CORNER_RADIUS,
    fill=(255, 255, 255, 18),
)
img = Image.alpha_composite(img, overlay)
draw = ImageDraw.Draw(img)

# Load Tibetan font
himpath = os.path.join(os.environ.get('WINDIR', r'C:\Windows'), 'Fonts', 'himalaya.ttf')
tibetan_font = ImageFont.truetype(himpath, 480)

# Draw Tibetan letter ཏ (ta from terma) centered
tibetan_char = 'ཏ'
bbox = draw.textbbox((0, 0), tibetan_char, font=tibetan_font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
tx = (SIZE - tw) // 2 - bbox[0]
ty = (SIZE - th) // 2 - bbox[1] - 60

draw.text((tx, ty), tibetan_char, fill=TEXT_COLOR, font=tibetan_font)

out_path = os.path.join(os.path.dirname(__file__), '..', 'src-tauri', 'icons', 'icon.png')
img.save(out_path, 'PNG')
print(f"Saved icon to {os.path.abspath(out_path)}")
print(f"Size: {img.size}")
