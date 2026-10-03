"""Chuyển tranh nét đen trắng (ảnh) thành tranh tô màu cho web.

  python3 lineart.py <ảnh nguồn> <file màu .json> <file ra .json> [--preview ảnh.png]

- Tách các vùng trắng khép kín (vùng tô), nới mỗi vùng ra tới giữa nét đen để khi tô không hở viền.
- Nét đen giữ nguyên dạng ảnh PNG trong suốt, đặt đè lên trên các vùng.
- File màu (có thể thêm "erase" để xoá bớt nét gốc): {"default": "#FFFFFF", "numbers": {"20": ["#màu", "tên"]}, "seeds": [[x, y, "#màu", "tên"]]}:
  gán theo số vùng (in trên ảnh --preview) hoặc theo điểm (x, y) trong ảnh nguồn. Vùng còn lại dùng màu mặc định.
Kết quả .json: {"size": 600, "regions": [{"id", "d", "color"}...], "lines": "<png base64>"} — build.mjs đọc file này.
"""
import base64, io, json, sys
import cv2
import numpy as np
from scipy import ndimage

SIZE = 600          # khung tranh của web (viewBox 600×600)
MIN_AREA = 80       # vùng nhỏ hơn (px ảnh nguồn) coi như một phần nét, không tô

def main():
    src, colors_file, out = sys.argv[1:4]
    preview = sys.argv[sys.argv.index('--preview') + 1] if '--preview' in sys.argv else None
    gray = cv2.cvtColor(cv2.imread(src), cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    cfg = json.load(open(colors_file)) if colors_file != '-' else {'default': '#FFFFFF', 'seeds': []}
    # "erase": xoá bớt nét của tranh gốc — {"rect": [x0, y0, x1, y1]} hoặc {"line": [[x, y], ...], "w": độ dày}.
    for e in cfg.get('erase', []):
        if 'rect' in e:
            x0, y0, x1, y1 = e['rect']
            gray[y0:y1, x0:x1] = 255
        elif 'poly' in e:
            cv2.fillPoly(gray, [np.array(e['poly'], np.int32)], 255)
        else:
            cv2.polylines(gray, [np.array(e['line'], np.int32)], False, 255, e.get('w', 8))
    # "keep": giữ lại nét gốc dọc các đường này (nối lại chỗ bị "erase" cắt lẹm vào nét cần giữ).
    if cfg.get('keep'):
        orig = cv2.cvtColor(cv2.imread(src), cv2.COLOR_BGR2GRAY)
        km = np.zeros_like(gray)
        for k in cfg['keep']:
            cv2.polylines(km, [np.array(k['line'], np.int32)], False, 255, k.get('w', 10))
        gray[km > 0] = orig[km > 0]
    # "draw": vẽ lại nét đen trơn (nối các nét sau khi xoá) — {"line": [[x, y], ...], "w": độ dày}.
    for d in cfg.get('draw', []):
        cv2.polylines(gray, [np.array(d['line'], np.int32)], False, 0, d.get('w', 8), cv2.LINE_AA)
    line = gray < 140
    # Bịt các khe hở rất nhỏ giữa các nét để vùng không bị "rò" sang nhau.
    sealed = cv2.dilate(line.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    labels, n = ndimage.label(~sealed)
    areas = ndimage.sum(np.ones_like(labels), labels, index=np.arange(n + 1))
    keep = np.zeros(n + 1, bool)
    keep[1:] = areas[1:] >= MIN_AREA
    labels[~keep[labels]] = 0
    # Nới từng vùng ra tới giữa nét đen (mỗi điểm nét nhận vùng gần nhất).
    _, (iy, ix) = ndimage.distance_transform_edt(labels == 0, return_indices=True)
    full = labels[iy, ix]
    ids = [i for i in range(1, n + 1) if keep[i]]

    seed_of = {}
    # "numbers": {"20": ["#màu", "tên"]} — gán theo số vùng (xem ảnh --preview); ưu tiên hơn "seeds".
    for num, (color, name) in cfg.get('numbers', {}).items():
        seed_of[int(num)] = (color, name)
    for x, y, color, name in cfg.get('seeds', []):
        seed_of.setdefault(int(full[int(y), int(x)]), (color, name))

    k = SIZE / w
    regions = []
    for i in ids:
        mask = (full == i).astype(np.uint8)
        cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        c = max(cs, key=cv2.contourArea)
        c = cv2.approxPolyDP(c, 1.0, True).reshape(-1, 2)
        if len(c) < 3:
            continue
        d = 'M ' + ' L '.join(f'{x * k:.1f} {y * k:.1f}' for x, y in c) + ' Z'
        color, name = seed_of.get(i, (cfg.get('default', '#FFFFFF'), None))
        regions.append({'n': i, 'id': name or f'vung-{i}', 'd': d, 'color': color, 'area': int(mask.sum())})
    # Vùng lớn vẽ trước, vùng nhỏ (nằm bên trong) vẽ sau đè lên.
    regions.sort(key=lambda r: -r['area'])
    # Tên trùng → đánh số.
    seen = {}
    for r in regions:
        if r['id'] in seen:
            seen[r['id']] += 1
            r['id'] = f"{r['id']}-{seen[r['id']]}"
        else:
            seen[r['id']] = 1

    # Lớp nét: đen, độ trong theo độ đậm của nét gốc.
    alpha = np.clip((200 - gray.astype(np.int32)) * 255 // 120, 0, 255).astype(np.uint8)
    rgba = np.dstack([np.full_like(gray, 27), np.full_like(gray, 42), np.full_like(gray, 56), alpha])
    ok, png = cv2.imencode('.png', cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA), [cv2.IMWRITE_PNG_COMPRESSION, 9])
    json.dump({'size': SIZE, 'regions': [{'id': r['id'], 'd': r['d'], 'color': r['color']} for r in regions],
               'lines': base64.b64encode(png.tobytes()).decode()}, open(out, 'w'))
    print(f'{len(regions)} vùng tô, lớp nét {len(png) // 1024} KB')

    if preview:
        vis = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
        rng = np.random.default_rng(1)
        for r in regions:
            m = full == r['n']
            if r['color'].upper() != cfg.get('default', '#FFFFFF').upper():
                hexc = r['color'].lstrip('#')
                col = [int(hexc[4:6], 16), int(hexc[2:4], 16), int(hexc[0:2], 16)]
            else:
                col = rng.integers(120, 255, 3).tolist()
            vis[m & ~line] = col
            ys, xs = np.nonzero(m)
            cy, cx = int(ys.mean()), int(xs.mean())
            if r['area'] > 150:
                cv2.putText(vis, str(r['n']), (cx - 10, cy + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4 if r['area'] < 600 else 0.45, (0, 0, 0), 1)
        cv2.imwrite(preview, vis)

if __name__ == '__main__':
    main()
