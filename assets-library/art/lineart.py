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

def curve_polygon(pts):
    """Từ đường tâm [[x, y, w], ...] dựng đa giác nét: nội suy mượt rồi lệch hai bên theo độ dày."""
    p = np.array(pts, float)
    n = max(len(p) * 6, 24)
    s = np.r_[0, np.cumsum(np.hypot(*np.diff(p[:, :2], axis=0).T))]
    u = np.linspace(0, s[-1], n)
    x, y, w = (np.interp(u, s, p[:, i]) for i in range(3))
    k = 5  # làm trơn đường tâm và độ dày
    ker = np.ones(k) / k
    x, y, w = (np.convolve(np.pad(v, k, mode='edge'), ker, 'same')[k:-k] for v in (x, y, w))
    dx, dy = np.gradient(x), np.gradient(y)
    ln = np.hypot(dx, dy) + 1e-9
    nx, ny = -dy / ln, dx / ln
    left = np.column_stack([x + nx * w / 2, y + ny * w / 2])
    right = np.column_stack([x - nx * w / 2, y - ny * w / 2])
    return np.vstack([left, right[::-1]])


def draw_curve(gray, d):
    poly = curve_polygon(d['curve'])
    sh = 3  # độ chính xác dưới điểm ảnh (1/8 px)
    cv2.fillPoly(gray, [np.round(poly * (1 << sh)).astype(np.int32)], d.get('v', 0), cv2.LINE_AA, sh)



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
    # "draw": vẽ lại nét đen trơn (nối các nét sau khi xoá) — {"line": [[x, y], ...], "w": độ dày, "v": độ xám 0–255 (mặc định 0 = đen; lớn hơn thì nét nhạt hơn)}.
    for d in cfg.get('draw', []):
        cv2.polylines(gray, [np.array(d['line'], np.int32)], False, d.get('v', 0), d.get('w', 8), cv2.LINE_AA)
    # "curve": nét cong mượt có độ dày thay đổi — {"curve": [[x, y, độ dày], ...], "v": độ xám}. Vẽ thành một mảng liền, toạ độ lẻ (không răng cưa, không bậc).
    for d in cfg.get('curve', []):
        draw_curve(gray, d)
    line = gray < 140
    # Bịt các khe hở rất nhỏ giữa các nét để vùng không bị "rò" sang nhau.
    sealed = cv2.dilate(line.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    # "seal": ngăn vùng ngầm dọc các đường này mà KHÔNG vẽ nét (khép chỗ hở để tách 2 vùng, giống tranh màu gốc).
    for sl in cfg.get('seal', []):
        sm = np.zeros(gray.shape, np.uint8)
        cv2.polylines(sm, [np.array(sl['line'], np.int32)], False, 1, sl.get('w', 3))
        sealed |= sm > 0
    labels, n = ndimage.label(~sealed)
    areas = ndimage.sum(np.ones_like(labels), labels, index=np.arange(n + 1))
    keep = np.zeros(n + 1, bool)
    keep[1:] = areas[1:] >= MIN_AREA
    # "keep_small": [[x, y], ...] — giữ lại vùng nhỏ hơn MIN_AREA chứa các điểm này (chi tiết nhỏ cần tô riêng).
    for x, y in cfg.get('keep_small', []):
        keep[labels[int(y), int(x)]] = labels[int(y), int(x)] > 0
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
    comp_lab, _ = ndimage.label(~line)   # ô trắng thật (không bịt khe) — dùng cho clip_to_ink
    for i in ids:
        mask = (full == i).astype(np.uint8)
        # "grow": N — nở mỗi vùng thêm N px (chồng nhẹ lên vùng kề, nằm dưới nét) để không lộ khe trắng giữa các vùng bên dưới nét mảnh.
        if cfg.get('grow'):
            mask = cv2.dilate(mask, np.ones((2 * int(cfg['grow']) + 1,) * 2, np.uint8))
            # "clip_to_ink": true — vùng nở chỉ được phủ lên nét hoặc ô của chính nó, không đè lên ô khác
            # (nét dày ở chỗ giao nhau làm vùng nở tràn qua dải hẹp bên kia nét → lem màu).
            if cfg.get('clip_to_ink'):
                own = np.unique(comp_lab[labels == i])
                mask = mask & ((line | np.isin(comp_lab, own[own > 0])).astype(np.uint8))
        cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        c = max(cs, key=cv2.contourArea)
        c = cv2.approxPolyDP(c, 0.35 if cfg.get('clip_to_ink') else 1.0, True).reshape(-1, 2)
        if len(c) < 3:
            continue
        d = 'M ' + ' L '.join(f'{x * k:.1f} {y * k:.1f}' for x, y in c) + ' Z'
        color, name = seed_of.get(i, (cfg.get('default', '#FFFFFF'), None))
        regions.append({'n': i, 'id': name or f'vung-{i}', 'd': d, 'color': color, 'area': int(mask.sum()), 'outer': float(cv2.contourArea(c))})
    # Vùng bao ngoài lớn vẽ trước, vùng nằm bên trong vẽ sau đè lên (xét theo diện tích viền ngoài, kể cả vùng có lỗ như góc khung).
    regions.sort(key=lambda r: -r['outer'])
    # "spots": [[x, y, "#màu", "tên"], ...] — ô rất nhỏ (vd. hạt dâu) bị bước bịt khe làm mất:
    # lấy đúng phần trắng chứa điểm đó trên nét gốc, thêm thành vùng tô vẽ đè lên trên.
    if cfg.get('spots'):
        spot_lab, _ = ndimage.label(~line)
        for x, y, color, name in cfg['spots']:
            sid = spot_lab[int(y), int(x)]
            if sid == 0:
                continue
            mask = cv2.dilate((spot_lab == sid).astype(np.uint8), np.ones((3, 3), np.uint8))
            cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
            # ô rất nhỏ/dài chéo: giữ nhiều điểm để đa giác bám đúng ô (epsilon lớn biến ô thành tam giác méo)
            c = cv2.approxPolyDP(max(cs, key=cv2.contourArea), 0.25, True).reshape(-1, 2)
            if len(c) < 3:
                continue
            d = 'M ' + ' L '.join(f'{px * k:.1f} {py * k:.1f}' for px, py in c) + ' Z'
            regions.append({'n': -1, 'id': name, 'd': d, 'color': color, 'area': int(mask.sum())})
    # "patches": [{"mask": "file.png", "color": "#màu", "name": "tên"}] — đốm màu (vd. đốm bò) mà ranh giới của đốm không có nét:
    # mặt nạ (ảnh trắng đen cùng cỡ ảnh nguồn) chỉ cần đúng ở chỗ ranh giới tự do; chỗ sát nét thì đốm được kéo tới tận nét.
    # Trong mỗi vùng bị mặt nạ cắt, điểm nào gần phần "chắc chắn trong đốm" hơn "chắc chắn ngoài đốm" thì thuộc đốm.
    for pi, pt in enumerate(cfg.get('patches', [])):
        pm = (cv2.imread(pt['mask'], 0) > 127).astype(np.uint8)
        for rid in np.unique(full[pm > 0]):
            if rid == 0:
                continue
            reg = full == rid
            if (reg & (pm > 0)).sum() < 300:
                continue
            sure_in = reg & (cv2.erode(pm, np.ones((5, 5), np.uint8)) > 0)
            sure_out = reg & (cv2.dilate(pm, np.ones((19, 19), np.uint8)) == 0)
            if sure_in.sum() < 50:
                continue
            d_in = ndimage.distance_transform_edt(~sure_in)
            d_out = ndimage.distance_transform_edt(~sure_out) if sure_out.any() else np.full(d_in.shape, 1e9)
            piece = (reg & (d_in < d_out)).astype(np.uint8)
            piece = cv2.morphologyEx(piece, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
            lab_p, n_p = ndimage.label(piece)
            for j in range(1, n_p + 1):
                comp = (lab_p == j).astype(np.uint8)
                if comp.sum() < 120:
                    continue
                comp = cv2.dilate(comp, np.ones((3, 3), np.uint8))   # chồng nhẹ xuống dưới nét, không lộ khe trắng
                cs, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
                c = cv2.approxPolyDP(max(cs, key=cv2.contourArea), 0.6, True).reshape(-1, 2)
                if len(c) < 3:
                    continue
                d = 'M ' + ' L '.join(f'{px * k:.1f} {py * k:.1f}' for px, py in c) + ' Z'
                regions.append({'n': -1, 'id': f"{pt.get('name', 'dom')}-{pi}-{rid}-{j}", 'd': d, 'color': pt['color'], 'area': int(comp.sum())})
    # "paint": [{"rect": [x0, y0, x1, y1], "color": "#màu", "name": "tên", "all": true = lấy cả phần trắng rộng}] — tô riêng các khe trắng quá hẹp (chỗ nét chụm lại) trong khung rect:
    # lấy phần trắng "mỏng" (không còn sau khi co 1px) của nét gốc, thêm thành vùng tô vẽ đè lên trên.
    if cfg.get('paint'):
        white = ~line
        core = ndimage.binary_erosion(white, structure=np.ones((3, 3)))
        thin = white & ~ndimage.binary_dilation(core, structure=np.ones((3, 3)))
        for p in cfg['paint']:
            x0, y0, x1, y1 = p['rect']
            win = np.zeros(gray.shape, bool)
            win[y0:y1 + 1, x0:x1 + 1] = True
            mask = cv2.dilate(((white if p.get('all') else thin) & win).astype(np.uint8), np.ones((3, 3), np.uint8))
            if p.get('clip'):  # "clip": [[x, y], ...] — chỉ tô phần nằm trong đa giác này
                cm = np.zeros(gray.shape, np.uint8)
                cv2.fillPoly(cm, [np.array(p['clip'], np.int32)], 1)
                mask &= cm
            cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
            if not cs:
                continue
            c = cv2.approxPolyDP(max(cs, key=cv2.contourArea), 0.6, True).reshape(-1, 2)
            if len(c) < 3:
                continue
            d = 'M ' + ' L '.join(f'{px * k:.1f} {py * k:.1f}' for px, py in c) + ' Z'
            regions.append({'n': -1, 'id': p['name'], 'd': d, 'color': p['color'], 'area': int(mask.sum())})
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
