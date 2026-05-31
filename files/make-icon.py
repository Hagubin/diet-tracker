#!/usr/bin/env python3
"""Generate home screen icons — white bg, bold Diet ~2/3 width."""
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise SystemExit("pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
FILES = Path(__file__).resolve().parent

FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/SFNS.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]

TEXT = "Diet"
TARGET_WIDTH_RATIO = 0.82


def load_bold_font(size: int):
    for path in FONT_CANDIDATES:
        try:
            if path.endswith(".ttc"):
                return ImageFont.truetype(path, size, index=1)
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def render_icon(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size), "#ffffff")
    draw = ImageDraw.Draw(img)

    font_size = int(size * 0.86)
    font = load_bold_font(font_size)
    bbox = draw.textbbox((0, 0), TEXT, font=font)
    tw = bbox[2] - bbox[0]
    while tw > size * TARGET_WIDTH_RATIO and font_size > 8:
        font_size -= 2
        font = load_bold_font(font_size)
        bbox = draw.textbbox((0, 0), TEXT, font=font)
        tw = bbox[2] - bbox[0]

    th = bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1]
    draw.text((x, y), TEXT, fill="#000000", font=font)
    return img


for px in (180, 192, 512):
    im = render_icon(px)
    out_files = FILES / f"apple-touch-icon-{px}.png"
    im.save(out_files)
    if px == 180:
        im.save(FILES / "apple-touch-icon.png")
        im.save(ROOT / "apple-touch-icon.png")
    print(out_files, ROOT / "apple-touch-icon.png")
