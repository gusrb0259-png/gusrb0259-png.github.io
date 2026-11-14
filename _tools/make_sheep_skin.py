import sys
SC="#B8325A"
def wool(circles, sc=SC, fill="#FFFDF8"):
    a="".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{sc}" stroke-width="3"/>' for x,y,r in circles)
    b="".join(f'<circle cx="{x}" cy="{y}" r="{r-1.6}" fill="{fill}"/>' for x,y,r in circles)
    return a+b
BODY=[(42,98,12),(54,104,12),(66,104,12),(78,98,12),(60,92,14)]
HEAD_WOOL=[(36,52,11),(44,40,12),(58,34,13),(72,40,12),(84,52,11),(60,46,14)]
RING=[(38,58,10),(41,45,11),(52,37,12),(68,37,12),(79,45,11),(82,58,10),(40,72,8),(80,72,8)]
def face(sc=SC, eyes="open", mouth="smile"):
    s=wool(RING,sc)+(f'<ellipse cx="32" cy="64" rx="11" ry="5.5" transform="rotate(-25 32 64)" fill="#F3CDBD" stroke="{sc}" stroke-width="3"/>'
       f'<ellipse cx="88" cy="64" rx="11" ry="5.5" transform="rotate(25 88 64)" fill="#F3CDBD" stroke="{sc}" stroke-width="3"/>'
       f'<ellipse cx="60" cy="68" rx="24" ry="21" fill="#F7DDD0" stroke="{sc}" stroke-width="3"/>')
    s+=wool([(46,50,8),(56,46,9),(66,46,9),(75,50,8)],sc)
    s+=f'<path d="M37 51 Q60 38 83 51 L82 58 Q60 46 38 58 Z" fill="#D6204F" stroke="{sc}" stroke-width="2" stroke-linejoin="round"/>'
    if eyes=="open":
        s+='<ellipse cx="51" cy="68" rx="3.8" ry="5" fill="#4A2030"/><circle cx="52.3" cy="66" r="1.4" fill="#fff"/><ellipse cx="69" cy="68" rx="3.8" ry="5" fill="#4A2030"/><circle cx="70.3" cy="66" r="1.4" fill="#fff"/>'
    elif eyes=="wink":
        s+='<ellipse cx="51" cy="68" rx="3.8" ry="5" fill="#4A2030"/><circle cx="52.3" cy="66" r="1.4" fill="#fff"/><path d="M65 68 L73 68" stroke="#4A2030" stroke-width="3" stroke-linecap="round"/>'
    elif eyes=="happy":
        s+='<path d="M47 69 Q51 64 55 69" fill="none" stroke="#4A2030" stroke-width="3" stroke-linecap="round"/><path d="M65 69 Q69 64 73 69" fill="none" stroke="#4A2030" stroke-width="3" stroke-linecap="round"/>'
    elif eyes=="joy":
        s+='<path d="M47 65 L55 68 L47 71" fill="none" stroke="#4A2030" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M73 65 L65 68 L73 71" fill="none" stroke="#4A2030" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
    s+='<ellipse cx="44" cy="77" rx="5" ry="3" fill="#FF8FA8" opacity=".75"/><ellipse cx="76" cy="77" rx="5" ry="3" fill="#FF8FA8" opacity=".75"/>'
    s+='<path d="M57 75 L63 75 L60 78 Z" fill="#B8325A"/>'
    if mouth=="smile": s+='<path d="M56 80 Q60 84 64 80" fill="none" stroke="#B8325A" stroke-width="2.2" stroke-linecap="round"/>'
    else: s+='<path d="M55 80 Q60 88 65 80 Z" fill="#B8325A"/>'
    return s
H='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -8 120 128">'
def base(): return H+wool(BODY)+face()+'</svg>'
def stamp(): return H+wool(BODY)+face(eyes="wink")+'<rect x="82" y="86" width="22" height="14" rx="3" fill="#D6204F" stroke="#B8325A" stroke-width="2.5"/><rect x="89" y="74" width="8" height="13" rx="3" fill="#FFD3DE" stroke="#B8325A" stroke-width="2.5"/><circle cx="82" cy="95" r="6.5" fill="#FFFDF8" stroke="#B8325A" stroke-width="2.5"/></svg>'
def lift(): 
    sc="#fff"
    return H+wool(BODY,sc)+face(sc,eyes="happy",mouth="open")+'<rect x="22" y="16" width="76" height="6" rx="3" fill="#E7E2E4"/><rect x="12" y="7" width="12" height="24" rx="4" fill="#fff"/><rect x="96" y="7" width="12" height="24" rx="4" fill="#fff"/><circle cx="34" cy="24" r="7" fill="#FFFDF8" stroke="#fff" stroke-width="2.5"/><circle cx="86" cy="24" r="7" fill="#FFFDF8" stroke="#fff" stroke-width="2.5"/></svg>'
def cheer(): return H+wool(BODY)+face(eyes="joy",mouth="open")+'<circle cx="24" cy="26" r="7" fill="#FFFDF8" stroke="#B8325A" stroke-width="2.5"/><circle cx="96" cy="26" r="7" fill="#FFFDF8" stroke="#B8325A" stroke-width="2.5"/><path d="M14 10 L16 16 M8 18 L14 20 M106 10 L104 16 M112 18 L106 20" stroke="#E8B23A" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="8" r="5" fill="#FFE7A3" stroke="#E8B23A" stroke-width="2"/></svg>'
def peek(): return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 16 120 80">'+face()+'</svg>'
out=sys.argv[1]
for n,f in [("base",base),("stamp",stamp),("lift",lift),("cheer",cheer),("peek",peek)]:
    open(f"{out}/{n}.svg","w").write(f())
