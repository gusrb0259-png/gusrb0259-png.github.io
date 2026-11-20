"""근육 위치 지도 SVG (2026-11-21 팀장 "주동근·보조근 눌러서 어디 근육인지")
인체모형 v3(anatomy_v3.py) 모양 그대로, 근육마다 <path data-k="키">로 → app.js가 누른 근육만 칠함.
python3 _tools/make_muscle_svg.py  →  assets/muscle/map-M.svg, map-F.svg"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
import anatomy_v3 as a

S = 60.0           # 1 단위 = 60px
X0, X1, Y0, Y1 = -4.4, 4.4, -0.75, 7.75
W, H = (X1 - X0) * S, (Y1 - Y0) * S

def pt(p, dx):
    return "%.0f,%.0f" % ((p[0] + dx - X0) * S, (Y1 - p[1]) * S)

def d_of(P, dx, closed=True):
    P = np.asarray(P, float)
    keep, last = [], None
    for i, p in enumerate(P):   # 1.6px 안쪽 점은 건너뜀(파일 크기)
        if last is None or i == len(P) - 1 or np.hypot(*(p - last)) * S >= 1.6:
            keep.append(p); last = p
    return "M" + "L".join(pt(p, dx) for p in keep) + ("Z" if closed else "")

ANG = 15   # 결 방향 무늬 각도 단위

def fiber_angle(Q):
    """근육 결 방향 = 모양의 긴 축(PCA) — 화면 좌표(y 아래로) 기준 각도"""
    P = np.asarray(Q, float); P = P - P.mean(0)
    w, v = np.linalg.eigh(np.cov(P.T))
    ax = v[:, np.argmax(w)]
    ang = np.degrees(np.arctan2(-ax[1], ax[0])) % 180   # y 뒤집힘
    return int(round(ang / ANG) * ANG) % 180

def view(v, sex, dx, cid):
    g = a._geo(v, sex)
    out = ['<g clip-path="url(#%s)" data-v="%s">' % (cid, v)]
    out.append('<path class="skin" d="%s"/>' % d_of(g["body"], dx))
    fib = []
    for name, polys in g["R"].items():
        Qs = [Q for P in polys for Q in a._both(P)]
        ds = " ".join(d_of(Q, dx) for Q in Qs)
        out.append('<path class="m" data-k="%s" data-v="%s" d="%s"/>' % (name, v, ds))
        for Q in Qs:
            fib.append('<path class="fb" data-k="%s" fill="url(#fa%d)" d="%s"/>' % (name, fiber_angle(Q), d_of(Q, dx)))
    out += fib
    for name, polys in g["DEEP"].items():
        ds = " ".join(d_of(Q, dx) for P in polys for Q in a._both(P))
        out.append('<path class="m deep" data-k="%s" data-v="%s" d="%s"/>' % (name, v, ds))
    lines = [Q for P in g["D"] for Q in a._both(P)] + list(g["C"])
    for name, ls in g["L"].items():
        lines += [Q for P in ls for Q in a._both(P)]
    out.append('<path class="ln" d="%s"/>' % " ".join(d_of(Q, dx, False) for Q in lines))
    out.append('</g><path class="ol" d="%s"/>' % d_of(g["body"], dx))
    return out, d_of(g["body"], dx)

def build(sex, path):
    fv, fb = view("F", sex, -2.35, "cF")
    bv, bb = view("B", sex, 2.35, "cB")
    s = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" class="mmap">' % (W, H),
         '<defs><clipPath id="cF"><path d="%s"/></clipPath><clipPath id="cB"><path d="%s"/></clipPath>' % (fb, bb) +
         "".join('<pattern id="fa%d" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(%d)"><path d="M0 2H4" class="fl"/></pattern>' % (g, -g) for g in range(0, 180, ANG)) +
         '</defs>']
    s += fv + bv
    s.append('<text x="%.0f" y="%.0f" class="lb">앞모습</text><text x="%.0f" y="%.0f" class="lb">뒷모습</text>' % ((-2.35 - X0) * S, H - 6, (2.35 - X0) * S, H - 6))
    s.append('</svg>')
    open(path, "w").write("".join(s))
    print(path, os.path.getsize(path))

if __name__ == "__main__":
    root = os.path.join(os.path.dirname(__file__), "..", "assets", "muscle")
    for sx in "MF":
        build(sx, os.path.join(root, "map-%s.svg" % sx))
