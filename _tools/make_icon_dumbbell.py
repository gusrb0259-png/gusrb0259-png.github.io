"""덤벨 앱 아이콘 (2026-11-27 팀장 "이다혜님 핸드폰에 뜨는 아이콘 덤벨로") — 분홍 체크 테마(pinkcheck)용
분홍 체크 바탕 + 가운데 큰 덤벨. → assets/icon-p-180/192/512.png
실행: python3 _tools/make_icon_dumbbell.py"""
import os
from playwright.sync_api import sync_playwright
A = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets")
BG, CK, DB, HI = "#FBD3E0", "#F7B9CE", "#E0789C", "#FFFFFF"
SVG = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="500" height="500">
<defs><pattern id="c" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="{BG}"/><rect width="10" height="10" fill="{CK}" opacity=".55"/><rect x="10" y="10" width="10" height="10" fill="{CK}" opacity=".55"/></pattern></defs>
<rect width="100" height="100" fill="url(#c)"/>
<g transform="rotate(-30 50 50)">
<rect x="30" y="46" width="40" height="8" rx="3" fill="{DB}"/>
<rect x="16" y="32" width="10" height="36" rx="4" fill="{DB}"/><rect x="74" y="32" width="10" height="36" rx="4" fill="{DB}"/>
<rect x="24" y="37" width="8" height="26" rx="3.5" fill="{DB}"/><rect x="68" y="37" width="8" height="26" rx="3.5" fill="{DB}"/>
<rect x="9" y="44" width="8" height="12" rx="3" fill="{DB}"/><rect x="83" y="44" width="8" height="12" rx="3" fill="{DB}"/>
<rect x="18" y="35" width="2.6" height="14" rx="1.3" fill="{HI}" opacity=".55"/><rect x="76" y="35" width="2.6" height="14" rx="1.3" fill="{HI}" opacity=".55"/>
<rect x="34" y="47.6" width="14" height="2" rx="1" fill="{HI}" opacity=".5"/>
</g></svg>"""
with sync_playwright() as p:
    b = p.chromium.launch()
    for size in (180, 192, 512):
        pg = b.new_page(viewport={"width": 500, "height": 500}, device_scale_factor=size / 500)
        pg.set_content('<html><body style="margin:0">' + SVG + '</body></html>'); pg.wait_for_timeout(200)
        out = os.path.join(A, "icon-p-%d.png" % size); pg.locator("svg").screenshot(path=out); pg.close(); print(out)
    b.close()
