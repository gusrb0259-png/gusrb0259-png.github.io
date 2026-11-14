"""회원 노트·선생님 페이지가 늘 최신 app.js·style.css를 받게 주소 끝 ?v=날짜시각 을 바꿈 (2026-11-12)
아이폰 홈 화면 앱은 예전 파일을 오래 붙잡고 있어서, 사이트 코드를 고친 뒤 커밋 전에 한 번 돌리기: python3 _tools/bump_ver.py"""
import glob, re, time, os
os.chdir(os.path.dirname(os.path.abspath(__file__)) + "/..")
stamp = time.strftime("%y%m%d%H%M")
pat = re.compile(r'(assets/(?:style\.css|app\.js|exicons\.js|site\.js|memo\.js))(\?v=\w+)?')
n = 0
for f in glob.glob("m/*/index.html") + ["404.html", "index.html"] + glob.glob("coach-co8rde/*.html"):
    s = open(f, encoding="utf-8").read()
    t = pat.sub(lambda m: m.group(1) + "?v=" + stamp, s)
    if t != s:
        open(f, "w", encoding="utf-8").write(t); n += 1
print("v=" + stamp, n, "files")
