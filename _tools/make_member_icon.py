"""회원 PT 노트 홈 화면 앱 아이콘 (2026-11-11 장동욱 "앱아이콘 A로 가자" — 앱 시안 캔버스 아이콘 A '노트 표지')
스프링 노트 표지 + GYMTOS 로고 + 책갈피 + PT NOTE.
  남(M) = 블랙 바탕·짙은 회색 표지·로고·금색 책갈피 → assets/icon-m-180/192/512.png (+ assets/icon.png = 남 180)
  여(F) = 오렌지 바탕·진한 오렌지 표지·로고·흰 책갈피 → assets/icon-f-180/192/512.png
모서리는 둥글리지 않음(아이폰·안드로이드가 알아서 깎음).
실행: python3 _tools/make_member_icon.py   (Playwright 크로미움으로 SVG를 찍음)
"""
import os, shutil, base64
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, "assets")
C = {
    "m": dict(bg="#1C1C1E", cover="#2C2C33", pages="#D9D9DE", ring="#BFBFC6", rib="#C9A227", text="#FFFFFF", logo="logo.png"),
    "f": dict(bg="#D35C14", cover="#A8460C", pages="#F8DFCB", ring="#FFE0C7", rib="#FFFFFF", text="#FFFFFF", logo="logo.png"),
}


def page(c):
    rings = "".join('<rect x="19" y="%d" width="10" height="3.6" rx="1.8" fill="%s"/>' % (y, c["ring"]) for y in range(20, 84, 8))
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
html,body{{margin:0;background:{c['bg']}}} #i{{position:relative;width:500px;height:500px;background:{c['bg']};overflow:hidden}}
#i svg{{position:absolute;inset:0;width:500px;height:500px}} #i img{{position:absolute;left:160px;top:196px;width:200px}}
</style></head><body><div id="i"><svg viewBox="0 0 100 100">
<rect x="28" y="14" width="56" height="74" rx="4" fill="{c['pages']}"/>
<rect x="24" y="12" width="56" height="74" rx="5" fill="{c['cover']}"/>{rings}
<path d="M64 12h8v26l-4-4.5-4 4.5z" fill="{c['rib']}"/>
<rect x="36" y="58" width="34" height="0.9" fill="{c['rib']}" opacity=".7"/>
<text x="53" y="70" text-anchor="middle" font-family="Noto Sans CJK KR, Noto Sans KR, sans-serif" font-size="8" font-weight="900" letter-spacing="1.2" fill="{c['text']}">PT NOTE</text>
</svg><img src="data:image/png;base64,{base64.b64encode(open(os.path.join(A, c['logo']), 'rb').read()).decode()}"></div></body></html>"""


with sync_playwright() as p:
    b = p.chromium.launch()
    for sx, c in C.items():
        for size in (180, 192, 512):
            pg = b.new_page(viewport={"width": 500, "height": 500}, device_scale_factor=size / 500)
            pg.set_content(page(c)); pg.wait_for_timeout(300)
            out = os.path.join(A, "icon-%s-%d.png" % (sx, size))
            pg.locator("#i").screenshot(path=out); pg.close()
            print(out)
    b.close()
shutil.copy(os.path.join(A, "icon-m-180.png"), os.path.join(A, "icon.png"))
