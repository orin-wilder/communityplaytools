from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "images" / "ryan-stock-social.png"
HEADSHOT = ROOT / "assets" / "images" / "ryan-stock-headshot.jpg"

W, H = 1200, 630
PAPER = "#F5F1ED"
PINE = "#103F38"
CORAL = "#B63F28"
INK = "#1A1714"
MUTED = "#4A443D"

canvas = Image.new("RGB", (W, H), PAPER)
draw = ImageDraw.Draw(canvas)

headshot = Image.open(HEADSHOT).convert("RGB")
crop = headshot.crop((150, 0, 1050, 1200)).resize((470, 630), Image.Resampling.LANCZOS)
canvas.paste(crop, (730, 0))
draw.rectangle((712, 0, 744, H), fill=PINE)
draw.ellipse((82, 76, 142, 136), fill=PINE)
draw.ellipse((102, 96, 122, 116), fill="#FF6A49")

font_paths = [
    Path("C:/Windows/Fonts/georgia.ttf"),
    Path("C:/Windows/Fonts/arial.ttf"),
]
display = str(font_paths[0] if font_paths[0].exists() else font_paths[1])
sans = str(font_paths[1])

name_font = ImageFont.truetype(display, 72)
role_font = ImageFont.truetype(display, 38)
body_font = ImageFont.truetype(sans, 25)
label_font = ImageFont.truetype(sans, 19)

draw.text((82, 170), "RYAN STOCK", font=label_font, fill=CORAL)
draw.text((82, 212), "Ryan Stock", font=name_font, fill=INK)
draw.text((82, 318), "Senior Program &", font=role_font, fill=PINE)
draw.text((82, 366), "Innovation Leader", font=role_font, fill=PINE)
draw.text((82, 463), "Enterprise delivery · civic leadership", font=body_font, fill=MUTED)
draw.text((82, 500), "products worth shipping", font=body_font, fill=MUTED)
draw.text((82, 563), "communityplaytools.com", font=label_font, fill=INK)

OUT.parent.mkdir(parents=True, exist_ok=True)
canvas.save(OUT, "PNG", optimize=True)
