"""회원 카톡 미리보기 그림 og.jpg (1200x630) — 2026-11-12
python3 _tools/make_og.py m/<주소>/og.jpg "<이름>" M|F "<담당 이름> <직함>" [group]
남 = 블랙+골드, 여 = 오렌지+브라운 (style.css 테마와 같은 색)"""
import sys
from PIL import Image, ImageDraw, ImageFont
out, name, sex, trn = sys.argv[1:5]
group = len(sys.argv) > 5
F = "/usr/share/fonts/opentype/noto/NotoSansCJK-%s.ttc"
def font(w, s): return ImageFont.truetype(F % w, s, index=1)  # index 1 = KR
if sex == "F": top, bot, band, sub, bt = (211, 92, 20), (190, 82, 18), (74, 42, 23), (255, 228, 205), (255, 222, 196)
else: top, bot, band, sub, bt = (38, 38, 42), (28, 28, 30), (14, 14, 15), (201, 162, 39), (201, 162, 39)
W, H, BH = 1200, 630, 90
im = Image.new("RGB", (W, H))
d = ImageDraw.Draw(im)
for y in range(H - BH):
    t = y / (H - BH); d.line([(0, y), (W, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
d.rectangle([0, H - BH, W, H], fill=band)
logo = Image.open(__file__.rsplit("/", 2)[0] + "/assets/logo.png").convert("RGBA")
lw = 300; logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
im.paste(logo, (80, 70), logo)
d.text((82, 228), "MY PT NOTE · " + ("함께하는 그룹 PT 노트" if group else "나만의 운동 노트"), font=font("Bold", 34), fill=sub)
nf = 92
while font("Black", nf).getlength(name + " 회원님") > W - 160: nf -= 4
d.text((78, 300), name + " 회원님", font=font("Black", nf), fill=(255, 255, 255))
d.text((82, H - BH + 22), "GYMTOS 도당점 · 담당 " + trn, font=font("Bold", 32), fill=bt)
im.save(out, quality=88)
