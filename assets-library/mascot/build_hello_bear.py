"""Tách ảnh gấu họa sĩ ở trang chủ (assets-library/mascot/src/hello-full.webp) thành các lớp để chuyển động sạch:
chân trái, chân phải, thân, đầu, tay phải (bảng màu), tay trái (cọ). Mắt dùng lại hello-eyes.webp.

- Mỗi bộ phận được cắt theo chính nét viền của nó (vùng màu bên trong + vòng nét viền bao quanh), nên khi xoay
  không kéo theo phần quần/áo bên cạnh.
- Phần thân bị tay/đầu che được vẽ bù (áo trắng, quần xanh, nét viền liền) để khi tay giơ lên chỉ lộ ra áo quần sạch.
- Vệt xám bẩn trên áo được làm trắng lại.

Chạy:  /usr/bin/python3 assets-library/mascot/build_hello_bear.py
Kết quả: frontend/public/mascots/bear-*.webp (WebP không nén mất dữ liệu để nét không bị nhoè).
"""
import os

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'assets-library/mascot/src/hello-full.webp')
OUT = os.path.join(ROOT, 'frontend/public/mascots')
DEBUG = os.environ.get('BEAR_DEBUG')

img = np.array(Image.open(SRC).convert('RGBA')).astype(np.int32)
H, W = img.shape[:2]
R, G, B, A = img[..., 0], img[..., 1], img[..., 2], img[..., 3]
lum = (R * 299 + G * 587 + B * 114) // 1000
opaque = A > 0
dark = opaque & (lum < 80)             # nét viền (nâu đậm / xanh đậm); bóng đỏ của mũ (sáng hơn) không tính
fill = (A >= 230) & ~dark              # vùng màu bên trong nét (mép mờ khử răng cưa không tính)

lab, n = ndimage.label(fill)
idx = np.arange(1, n + 1)
size = ndimage.sum(np.ones_like(lab), lab, idx)
cy, cx = np.array(ndimage.center_of_mass(np.ones_like(lab), lab, idx)).T
mr = ndimage.mean(R, lab, idx)
mg = ndimage.mean(G, lab, idx)
mb = ndimage.mean(B, lab, idx)


def comp_mask(pred):
    keep = np.zeros(n + 1, bool)
    for i in range(n):
        if pred(i):
            keep[i + 1] = True
    return keep[lab]


is_white = lambda i: mr[i] > 225 and mg[i] > 225 and mb[i] > 225
is_blue = lambda i: mb[i] > 180 and mr[i] < 150
is_brown = lambda i: mr[i] > 140 and 70 < mg[i] < 150 and mb[i] < 100

# ---- Gán từng vùng màu cho bộ phận theo vị trí ----
def part_of(i):
    x, y = cx[i], cy[i]
    if size[i] < 3:
        return None
    # Tay trái + cọ: bên trái thân, không phải áo trắng / quần xanh / vệt sơn xanh lá trên quần
    if x < 168 and 250 < y < 600 and not is_white(i) and not is_blue(i) and not (mg[i] > 180 and mr[i] < 170):
        if x > 150 and y > 500 and not is_brown(i):
            return None
        return 'armL'
    # Tay phải + bảng màu
    if x > 418 and 360 < y < 600 and not is_white(i) and not is_blue(i):
        if x < 450 and y > 540:
            return None
        return 'armR'
    # Chân
    if y > 662 and is_brown(i):
        return 'legL' if x < 300 else 'legR'
    # Đầu (đầu, tai, mũ, mõm, má): phía trên cằm
    if y < 372 and not (mr[i] > 180 and mg[i] < 90 and y > 340):
        return 'head'
    return None


labels = {}
for i in range(n):
    p = part_of(i)
    if p:
        labels.setdefault(p, []).append(i + 1)

SEEDS = {'armL': [(40, 300), (88, 468)], 'armR': [(560, 470)], 'head': [(285, 180)], 'legL': [(190, 715)], 'legR': [(400, 715)]}
parts = {}
for p, ids in labels.items():
    m = np.isin(lab, ids)
    # Chỉ giữ những mảnh dính liền với bộ phận chính (bỏ các mẩu lẻ ở nét áo/đầu bị xếp nhầm)
    grown = ndimage.binary_dilation(m, iterations=4)
    gl, _ = ndimage.label(grown)
    keep_ids = {gl[y, x] for x, y in SEEDS[p] if gl[y, x]}
    m = m & np.isin(gl, list(keep_ids))
    parts[p] = ndimage.binary_fill_holes(m)

body_fill = fill & ~np.any([parts[p] for p in parts], axis=0)

# ---- Gán nét viền (và mép mờ) cho bộ phận gần nhất; tay/đầu được ưu tiên giữ trọn nét viền của mình ----
dist = {p: ndimage.distance_transform_edt(~m) for p, m in parts.items()}
dist['body'] = ndimage.distance_transform_edt(~body_fill)
edge = opaque & ~fill & ~np.any([parts[p] for p in parts], axis=0)
masks = {p: parts[p].copy() for p in parts}
masks['body'] = body_fill.copy()
# Mỗi điểm nét viền thuộc về vùng màu gần nhất; tay/đầu được cộng ưu thế 2.5px để giữ trọn nét viền của mình
order = ['armL', 'armR', 'head', 'body', 'legL', 'legR']
bias = {'armL': 2.5, 'armR': 2.5, 'head': 2.5, 'body': 0, 'legL': -0.5, 'legR': -0.5}
stack = np.stack([dist[p] - bias[p] for p in order])
win = np.argmin(stack, axis=0)
# Nét viền xanh đậm (mép gấu quần) luôn thuộc về quần, không dính sang chân
navy = edge & (B > R + 8)
win[navy & ((win == order.index('legL')) | (win == order.index('legR')))] = order.index('body')
for k, p in enumerate(order):
    masks[p] |= edge & (win == k)
for p in masks:
    masks[p] = ndimage.binary_fill_holes(masks[p])

lightish0 = (lum > 165) & ((np.maximum(np.maximum(R, G), B) - np.minimum(np.minimum(R, G), B)) < 45)
# Khe giữa cẳng tay và cán cọ: ảnh gốc có mẩu nét quần lởm chởm dính vào tay → cắt bỏ khỏi lớp tay trái
cut = np.zeros((H, W), np.uint8)
cv2.fillPoly(cut, [np.array([(146, 507), (169, 492), (174, 562), (152, 552)], np.int32)], 1)
masks['armL'] &= ~cut.astype(bool)
# gọt các gai mảnh còn sót dọc mép phải cán cọ
loc = np.zeros((H, W), bool)
loc[482:565, 128:178] = True
brown_fill = parts['armL'] & (R > 140) & (G > 70) & (G < 150) & (B < 100)
near_brown = ndimage.distance_transform_edt(~brown_fill) <= 6.5
blueish = (B > R + 20)
masks['armL'] = np.where(loc, masks['armL'] & near_brown & ~blueish & ~lightish0, masks['armL'])

rgb = img[..., :3].astype(np.uint8)
alpha = A.astype(np.uint8)


lightish = (lum > 165) & ((np.maximum(np.maximum(R, G), B) - np.minimum(np.minimum(R, G), B)) < 45)


def layer(mask, rgb_=rgb, alpha_=alpha):
    out = np.zeros((H, W, 4), np.uint8)
    out[..., :3] = rgb_
    # mép: bỏ các điểm trắng/xám (vụn áo, nền) dính theo nét viền của bộ phận
    m = mask & ~(lightish & ~ndimage.binary_erosion(mask, iterations=3))
    out[..., 3] = np.where(m, alpha_, 0)
    out[out[..., 3] == 0, :3] = 0
    return out


# ---- Thân: vẽ bù phần bị tay/đầu che ----
body_rgb = rgb.copy()
body_a = np.where(masks['body'], alpha, 0).astype(np.uint8)

# Làm trắng vệt xám trên áo (vùng áo quanh vai)
shirt = np.zeros((H, W), bool)
shirt[360:520, 120:480] = True
grey = (R > 165) & (G > 165) & (B > 165) & ((np.maximum(np.maximum(R, G), B) - np.minimum(np.minimum(R, G), B)) < 30)
fix = shirt & grey & masks['body']
body_rgb[fix] = 255

# Hình bóng thân hoàn chỉnh. Hai bên sườn (chỗ tay che) vẽ lại theo đường cong trơn: vai áo trắng → sườn quần xanh.
sil = masks['body'] & (alpha > 128)
covered = masks['armL'] | masks['armR'] | masks['head']
SS = 4  # vẽ ở độ phân giải gấp 4 rồi thu nhỏ để mép và nét mịn


def spline(pts, step=0.5):
    """Đường cong Catmull-Rom đi qua các điểm."""
    p = np.array(pts, float)
    p = np.vstack([p[0], p, p[-1]])
    out = []
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        n_ = max(2, int(np.linalg.norm(p2 - p1) / step))
        for t in np.linspace(0, 1, n_, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(p[-2])
    return np.array(out)


def raster(poly_pts=None, line_pts=None, width=6.5):
    """Trả về độ phủ 0..1 (khử răng cưa) của một đa giác kín hoặc một nét vẽ."""
    big = np.zeros((H * SS, W * SS), np.uint8)
    if poly_pts is not None:
        cv2.fillPoly(big, [np.round(poly_pts * SS).astype(np.int32)], 255, lineType=cv2.LINE_AA)
    if line_pts is not None:
        cv2.polylines(big, [np.round(line_pts * SS).astype(np.int32)], False, 255, thickness=int(width * SS), lineType=cv2.LINE_AA)
    return cv2.resize(big, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255


LEFT = [(196, 367), (152, 382), (128, 397), (115, 418), (118, 440), (130, 456), (150, 467), (163, 478),
        (158, 520), (151, 558), (146, 590), (140, 614)]
RIGHT = [(398, 376), (422, 384), (444, 395), (462, 410), (472, 428), (472, 448), (460, 462), (440, 471), (420, 478),
         (426, 500), (432, 525), (440, 552), (448, 582), (456, 614)]
sides = []
for pts, inner_x in ((LEFT, 300), (RIGHT, 300)):
    c = spline(pts)
    poly = np.vstack([c, [[inner_x, c[-1][1]], [inner_x, c[0][1]]]])
    sides.append((c, raster(poly_pts=poly)))
inside = np.maximum(sides[0][1], sides[1][1])
y_rng = np.zeros((H, W), bool)
y_rng[368:607, :] = True
side_zone = y_rng & ((np.arange(W)[None, :] < 200) | (np.arange(W)[None, :] > 400))

# Dưới cằm: kéo dài lên 22px (sau đầu) màu của điểm trên cùng của thân ở cột đó (khăn đỏ / áo trắng),
# để đầu nhún, nghiêng không lộ khe. Cột nào mép trên là nét vai thì bỏ qua (tránh làm vai dày ra).
top_band = np.zeros((H, W), bool)
band_rgb = np.zeros((H, W, 3), np.uint8)
cols = np.where(sil.any(0))[0]
for x in range(cols.min(), cols.max() + 1):
    ys = np.where(sil[:, x])[0]
    if not len(ys) or ys[0] >= 420:
        continue
    y0 = ys[0]
    if not masks['head'][max(0, y0 - 3), x]:
        continue
    # bỏ qua nét viền (mép trên của khăn) — lấy màu vải ngay dưới nét
    y1 = y0
    while y1 < y0 + 14 and (dark[y1, x] or alpha[y1, x] < 230):
        y1 += 1
    if dark[y1, x] or alpha[y1, x] < 230 or not (194 <= x <= 408):
        continue
    top_band[max(0, y0 - 22):y1, x] = True
    band_rgb[max(0, y0 - 22):y1, x] = rgb[y1, x]
# cột bị bỏ qua (nút khăn có nét viền ở mép trên): mượn cột bên cạnh gần nhất
filled = top_band.any(0)
for x in range(194, 409):
    if filled[x] or not sil[:, x].any():
        continue
    for d in range(1, 30):
        for xx in (x - d, x + d):
            if 0 <= xx < W and filled[xx]:
                top_band[:, x] = top_band[:, xx]
                band_rgb[:, x] = band_rgb[:, xx]
                break
        else:
            continue
        break
top_band &= ndimage.binary_dilation(masks['head'], iterations=1)
# làm mịn theo chiều ngang để không thành sọc
band_rgb = cv2.GaussianBlur(band_rgb, (0, 0), sigmaX=5, sigmaY=0.1)

# Vùng phải tô lại: dải sát mép sườn (bỏ nét cũ lởm chởm) + chỗ tay che + dải dưới cằm
inner = inside > 0.5
rim = side_zone & inner & ~ndimage.binary_erosion(inner, iterations=9)
need = (side_zone & inner & (covered | ~sil)) | rim | (top_band & ~sil)
# Tay áo (phần áo trắng hai bên vai, trên mép quần): xoá mọi nét/vệt cũ còn sót bên trong, tô lại trắng
xs_ = np.arange(W)[None, :]
ys_ = np.arange(H)[:, None]
# Ranh giới tay áo / quần: đoạn thẳng từ mép sườn lên tới cúc quần
def left_of(p, q):
    (x1, y1), (x2, y2) = p, q
    return ((x2 - x1) * (ys_ - y1) - (y2 - y1) * (xs_ - x1)) > 0


HEM_L = ((163, 478), (190, 452))
HEM_R = ((420, 478), (410, 452))
sleeve = side_zone & inner & (ys_ < 488) & (((xs_ < 184) & ~left_of(*HEM_L)) | ((xs_ > 414) & left_of(*HEM_R)))
# chỉ tô trắng chỗ vốn không phải quần xanh / nét viền xanh của yếm (giữ nguyên mép yếm cạnh cúc áo)
orig_blue = (B > 170) & (R < 160) & (A > 200)
navy_line = dark & (B > R + 2)
sleeve &= ~ndimage.binary_dilation(orig_blue | navy_line, iterations=1)
need |= sleeve

# Tô bù chỉ bằng màu của chính thân (áo/quần/khăn) — vùng ngoài thân, nét viền và dải cần tô coi như chưa biết
known = masks['body'] & (alpha > 230) & ~dark & ~need
inp = cv2.inpaint(cv2.cvtColor(body_rgb, cv2.COLOR_RGB2BGR), (~known).astype(np.uint8) * 255, 5, cv2.INPAINT_TELEA)
inp = cv2.cvtColor(inp, cv2.COLOR_BGR2RGB)
body_rgb[need] = inp[need]
body_rgb[top_band] = band_rgb[top_band]
body_a[top_band] = 255
# Chỗ giao khăn – vai phải trong ảnh gốc bị lem hồng xám: tô trắng lại (giữ nét viền)
box = np.zeros((H, W), bool)
box[366:388, 396:420] = True
mud = box & (lum > 110) & masks['body']
body_rgb[mud] = 255
body_rgb[sleeve] = 255
body_a[need] = 255
# Ngoài đường sườn mới: trong suốt (mép mịn theo độ phủ)
cov = (inside * 255).astype(np.uint8)
body_a = np.where(side_zone, np.minimum(body_a, cov), body_a).astype(np.uint8)
body_a = np.where(side_zone & (inside > 0) & need, cov, body_a).astype(np.uint8)

# Nét viền mới dọc hai sườn
OUTLINE = np.array([69, 23, 10], np.float32)
for c in [c for c, _ in sides]:
    k = raster(line_pts=c, width=6.5)[..., None]
    body_rgb = (body_rgb * (1 - k) + OUTLINE * k).astype(np.uint8)
    body_a = np.maximum(body_a, (k[..., 0] * 255).astype(np.uint8))

# Mẩu áo/khăn cũ còn nằm dưới đầu (ngoài dải vừa tô) → bỏ, để đầu nghiêng không lộ mảnh vụn
under_head = ndimage.binary_erosion(masks['head'], iterations=2) & ~top_band
body_a[under_head] = 0
# Mép dưới gấu quần: bỏ viền trắng mờ (khi chân đung đưa sẽ lộ thành vệt trắng)
low = np.zeros((H, W), bool)
low[628:, :] = True
body_a[low & lightish0] = 0
# Mẩu xám vụn của ảnh gốc ở mép yếm trái (cạnh cẳng tay): bên trong thân → trắng, bên ngoài → trong suốt
spur = np.zeros((H, W), bool)
spur[452:486, 158:182] = True
spur &= lightish0 & ~((B > 170) & (R < 160))
body_rgb[spur & (inside > 0.5)] = 255
body_a[spur & (inside <= 0.5)] = 0
# Chỗ mép yếm trái chạm sườn: ảnh gốc lem xám → tô lại (trên: áo trắng, dưới: quần xanh) và nối nét yếm liền tới sườn
zone = np.zeros((H, W), bool)
zone[456:492, 158:184] = True
brown_line = (R > G + 25) & (lum < 110)
navy_px = (B > R + 25) & (lum < 110)
blue_px = (B > 170) & (R < 160) & (lum > 110)
P0, P1 = (182.0, 457.0), (165.0, 477.0)
above = ((P1[0] - P0[0]) * (ys_ - P0[1]) - (P1[1] - P0[1]) * (xs_ - P0[0])) > 0
fixz = zone & (inside > 0.5) & ~brown_line & ~((navy_px | blue_px) & ~above)
body_rgb[fixz & above] = 255
below = zone & (inside > 0.5) & ~above
body_rgb[below] = [53, 160, 231]
body_a[fixz | below] = 255
k = raster(line_pts=sides[0][0], width=6.5)[..., None] * zone[..., None]
body_rgb = (body_rgb * (1 - k) + OUTLINE * k).astype(np.uint8)
k = raster(line_pts=np.array([P0, P1]), width=5.0)[..., None] * zone[..., None]
body_rgb = (body_rgb * (1 - k) + np.array([22, 58, 96], np.float32) * k).astype(np.uint8)
# Tay áo hai bên vẽ lại hẳn bằng hình học: vùng giữa mép yếm và đường sườn tô trắng phẳng, rồi kẻ lại
# nét mép yếm (xanh đậm) và nét sườn (nâu) cho sắc gọn — hết răng cưa, hết vệt lem quanh nách.
NAVY = np.array([22, 58, 96], np.float32)
BIB_R = [(391, 384), (395, 400), (398, 416), (401, 432), (404, 448), (408, 462), (414, 472), (420, 478)]
BIB_L = [(198, 386), (194, 400), (190, 416), (187, 432), (185, 448), (182, 457), (165, 477)]
for bib, (c, _), end_y in ((BIB_R, sides[1], 478), (BIB_L, sides[0], 477)):
    upper = c[c[:, 1] <= end_y + 0.5]
    poly = np.vstack([np.array(bib, float), upper[::-1]])
    cov = raster(poly_pts=poly)
    m = cov > 0
    body_rgb[m] = (body_rgb[m] * (1 - cov[m][:, None]) + 255 * cov[m][:, None]).astype(np.uint8)
    body_a[m] = np.maximum(body_a[m], (cov[m] * 255).astype(np.uint8))
for c, _ in sides:
    k = raster(line_pts=c, width=6.5)[..., None]
    body_rgb = (body_rgb * (1 - k) + OUTLINE * k).astype(np.uint8)
for bib in (BIB_R, BIB_L):
    k = raster(line_pts=spline(bib), width=5.0)[..., None]
    body_rgb = (body_rgb * (1 - k) + NAVY * k).astype(np.uint8)
# Bỏ các mẩu vụn rời (nét đầu/vai lẻ loi) khỏi lớp thân
bl, bn = ndimage.label(body_a > 0)
if bn > 1:
    sizes = ndimage.sum(np.ones_like(bl), bl, np.arange(1, bn + 1))
    small = np.isin(bl, np.where(sizes < 400)[0] + 1)
    body_a[small] = 0

body = np.zeros((H, W, 4), np.uint8)
body[..., :3] = body_rgb
body[..., 3] = body_a

# ---- Chân: kéo dài lên dưới gấu quần để chân đung đưa không hở ----
legs = {}
for p in ('legL', 'legR'):
    m = masks[p]
    lr = rgb.copy()
    la = np.where(m, alpha, 0).astype(np.uint8)
    ys, xs = np.where(m & (alpha > 200) & ~dark)
    top = ys.min()
    x0, x1 = xs[ys < top + 6].min(), xs[ys < top + 6].max()
    for y in range(top - 26, top + 2):
        for x in range(x0 + 2, x1 - 1):
            if la[y, x] < 255:
                lr[y, x] = rgb[top + 4, x] if fill[top + 4, x] else [188, 109, 47]
                la[y, x] = 255
    # mép trên của chân (giáp gấu quần): lấp kín mọi chỗ hở / viền trắng / nét xanh của quần bằng màu chân,
    # hai cột ngoài cùng giữ màu nét viền để mép chân vẫn liền nét khi đung đưa
    band = np.zeros((H, W), bool)
    band[top - 26:top + 14, x0:x1 + 1] = True
    bad = band & ((la < 255) | lightish0 | ((B > R + 2) & (lum < 140)))
    side = np.abs(np.arange(W)[None, :] - (x0 + x1) / 2) >= (x1 - x0) / 2 - 3
    lr[bad & ~side] = [188, 109, 47]
    lr[bad & side] = [69, 23, 10]
    la[bad] = 255
    leg = np.zeros((H, W, 4), np.uint8)
    leg[..., :3] = lr
    leg[..., 3] = la
    legs[p] = leg


SCALE = 2  # xuất gấp đôi để nét viền mịn, sắc trên màn hình độ phân giải cao


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def crisp(arr):
    """Làm nét lớp ảnh: phóng 2 lần, làm phẳng mảng màu (hết lấm tấm do nén), nét viền và mép ảnh sắc gọn."""
    a = arr[..., 3].astype(np.float32) / 255
    rgb_ = arr[..., :3].astype(np.float32)
    h, w = a.shape
    size = (w * SCALE, h * SCALE)
    # phóng to dạng nhân trước alpha để mép không bị viền tối
    pa = cv2.resize(a, size, interpolation=cv2.INTER_CUBIC)
    prgb = cv2.resize(rgb_ * a[..., None], size, interpolation=cv2.INTER_CUBIC)
    pa = np.clip(pa, 0, 1)
    up = np.clip(prgb / np.maximum(pa, 1e-3)[..., None], 0, 255)
    # mảng màu: lọc giữ cạnh để phẳng màu, hết vệt nhoè
    flat = cv2.bilateralFilter(up.astype(np.uint8), 9, 28, 6).astype(np.float32)
    flat = cv2.bilateralFilter(flat.astype(np.uint8), 7, 22, 4).astype(np.float32)
    # nét viền: độ đậm mực theo độ sáng, làm sắc lại bằng smoothstep hẹp
    lum_ = (up[..., 0] * 0.299 + up[..., 1] * 0.587 + up[..., 2] * 0.114)
    ink_raw = 1 - smoothstep(50, 92, lum_)  # nét viền ~35–45; bóng nâu của lông ≥ 92 không bị tính là nét
    ink_raw = cv2.GaussianBlur(ink_raw, (0, 0), 0.9)
    ink = smoothstep(0.38, 0.62, ink_raw)
    # màu mực: trung bình màu các điểm rất đậm ở gần (giữ nâu đậm / xanh đậm của từng nét)
    core = (lum_ < 60).astype(np.float32) * pa
    num = cv2.GaussianBlur(up * core[..., None], (0, 0), 3)
    den = cv2.GaussianBlur(core, (0, 0), 3)[..., None]
    ink_col = np.where(den > 1e-3, num / np.maximum(den, 1e-3), np.array([69, 23, 10], np.float32))
    out_rgb = flat * (1 - ink[..., None]) + ink_col * ink[..., None]
    # mép ảnh: sắc lại, giữ khử răng cưa 1 điểm ảnh
    sharp_a = smoothstep(0.3, 0.7, cv2.GaussianBlur(pa, (0, 0), 0.6))
    out_a = np.where(pa > 0.98, 1.0, sharp_a)
    out = np.zeros((h * SCALE, w * SCALE, 4), np.uint8)
    out[..., :3] = np.clip(out_rgb, 0, 255).astype(np.uint8)
    out[..., 3] = np.clip(out_a * 255, 0, 255).astype(np.uint8)
    return out


def reoutline(arr, width=3.6):
    """Làm lại mép ngoài của bộ phận: hình bóng được làm trơn (hết răng cưa ở chỗ cắt), viền ngoài kẻ lại bằng nét nâu đậm
    đều nét — chỗ cắt sát yếm/áo không còn vụn xanh, vụn trắng."""
    a = arr[..., 3] > 127
    big = cv2.resize(a.astype(np.uint8) * 255, (W * SS, H * SS), interpolation=cv2.INTER_LINEAR).astype(np.float32) / 255
    big = cv2.GaussianBlur(big, (0, 0), 1.6 * SS) > 0.5
    dist = ndimage.distance_transform_edt(big)
    ring = big & (dist <= width * SS)
    cov = cv2.resize(big.astype(np.float32), (W, H), interpolation=cv2.INTER_AREA)
    ring_c = cv2.resize(ring.astype(np.float32), (W, H), interpolation=cv2.INTER_AREA)
    out = arr.copy()
    k = np.clip(ring_c / np.maximum(cov, 1e-3), 0, 1)[..., None]
    out[..., :3] = (arr[..., :3] * (1 - k) + np.array([69, 23, 10], np.float32) * k).astype(np.uint8)
    out[..., 3] = (cov * 255).astype(np.uint8)
    return out


def save(arr, name):
    a = crisp(arr)
    a[a[..., 3] == 0, :3] = 0
    Image.fromarray(a, 'RGBA').save(os.path.join(OUT, name), 'WEBP', lossless=True, quality=100, method=6)


save(legs['legL'], 'bear-leg-l.webp')
save(legs['legR'], 'bear-leg-r.webp')
save(body, 'bear-body.webp')
head_layer = layer(masks['head'])
head_mud = box & (lum > 110) & ~((R > 140) & (G > 70) & (G < 150) & (B < 100))
head_layer[head_mud, 3] = 0
save(head_layer, 'bear-head.webp')
arm_r = layer(masks['armR'])
navy_bits = (B > R + 15) & (lum < 150) & (xs_ < 445)
arm_r[navy_bits, 3] = 0
save(reoutline(arm_r), 'bear-arm-r.webp')
save(reoutline(layer(masks['armL'])), 'bear-arm-l.webp')
save(np.array(Image.open(os.path.join(ROOT, 'assets-library/mascot/src/hello-eyes.webp')).convert('RGBA')), 'bear-eyes.webp')

if DEBUG:
    dbg = np.zeros((H, W, 3), np.uint8) + 230
    colors = {'body': (90, 160, 230), 'head': (230, 150, 60), 'armL': (60, 200, 90), 'armR': (200, 60, 200), 'legL': (230, 60, 60), 'legR': (60, 60, 230)}
    for p, c in colors.items():
        dbg[masks[p]] = c
    Image.fromarray(dbg).save(os.path.join(DEBUG, 'parts.png'))
    Image.fromarray(np.where(need[..., None], 255, 0).astype(np.uint8).repeat(3, -1)).save(os.path.join(DEBUG, 'need.png'))
print('ok', {p: int(m.sum()) for p, m in masks.items()})
