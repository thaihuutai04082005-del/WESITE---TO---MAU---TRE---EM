// Khuôn mặt dễ thương gắn lên chủ thể — thay đổi theo biểu cảm của biến thể.
import { E, D, dot, whiteDot, line } from './shapes.mjs';

const f = (n) => Math.round(n * 10) / 10;

export function face(x, y, s, expr) {
  const items = [];
  const ex = 26 * s; // khoảng cách mắt tới giữa
  const cheeks = () => [
    E('ma-trai', x - 46 * s, y + 20 * s, 11 * s, 7 * s, '#FFB3C1'),
    E('ma-phai', x + 46 * s, y + 20 * s, 11 * s, 7 * s, '#FFB3C1'),
  ];
  const eyes = (r = 8) => [
    dot(x - ex, y, r * s),
    dot(x + ex, y, r * s),
    whiteDot(x - ex + 2.5 * s, y - 3 * s, 2.6 * s),
    whiteDot(x + ex + 2.5 * s, y - 3 * s, 2.6 * s),
  ];
  const smile = () => line(`M ${f(x - 15 * s)} ${f(y + 30 * s)} Q ${f(x)} ${f(y + 46 * s)} ${f(x + 15 * s)} ${f(y + 30 * s)}`, 4 * s + 1);
  const closedEye = (cx) => line(`M ${f(cx - 10 * s)} ${f(y - 2 * s)} Q ${f(cx)} ${f(y + 8 * s)} ${f(cx + 10 * s)} ${f(y - 2 * s)}`, 3.5 * s + 1);
  const happyArc = (cx) => line(`M ${f(cx - 10 * s)} ${f(y + 4 * s)} Q ${f(cx)} ${f(y - 8 * s)} ${f(cx + 10 * s)} ${f(y + 4 * s)}`, 3.5 * s + 1);

  switch (expr) {
    case 'angry':
      items.push(...eyes(7));
      items.push(line(`M ${f(x - ex - 12 * s)} ${f(y - 22 * s)} L ${f(x - ex + 10 * s)} ${f(y - 12 * s)}`, 4 * s + 1));
      items.push(line(`M ${f(x + ex + 12 * s)} ${f(y - 22 * s)} L ${f(x + ex - 10 * s)} ${f(y - 12 * s)}`, 4 * s + 1));
      items.push(line(`M ${f(x - 14 * s)} ${f(y + 40 * s)} Q ${f(x)} ${f(y + 28 * s)} ${f(x + 14 * s)} ${f(y + 40 * s)}`, 4 * s + 1));
      items.push(E('ma-trai', x - 46 * s, y + 20 * s, 11 * s, 7 * s, '#FF8A80'), E('ma-phai', x + 46 * s, y + 20 * s, 11 * s, 7 * s, '#FF8A80'));
      break;
    case 'sleep':
      items.push(closedEye(x - ex), closedEye(x + ex));
      items.push(...cheeks());
      items.push(E('mieng', x, y + 34 * s, 5 * s, 6 * s, '#E57373'));
      break;
    case 'surprised':
      items.push(...eyes(10));
      items.push(line(`M ${f(x - ex - 8 * s)} ${f(y - 20 * s)} Q ${f(x - ex)} ${f(y - 26 * s)} ${f(x - ex + 8 * s)} ${f(y - 20 * s)}`, 3 * s + 1));
      items.push(line(`M ${f(x + ex - 8 * s)} ${f(y - 20 * s)} Q ${f(x + ex)} ${f(y - 26 * s)} ${f(x + ex + 8 * s)} ${f(y - 20 * s)}`, 3 * s + 1));
      items.push(E('mieng', x, y + 36 * s, 9 * s, 11 * s, '#C0392B'));
      items.push(...cheeks());
      break;
    case 'tongue':
      items.push(happyArc(x - ex));
      items.push(dot(x + ex, y, 8 * s), whiteDot(x + ex + 2.5 * s, y - 3 * s, 2.6 * s));
      items.push(...cheeks());
      items.push(
        D(
          'luoi',
          `M ${f(x - 9 * s)} ${f(y + 34 * s)} L ${f(x + 9 * s)} ${f(y + 34 * s)} Q ${f(x + 11 * s)} ${f(y + 54 * s)} ${f(x)} ${f(
            y + 54 * s,
          )} Q ${f(x - 11 * s)} ${f(y + 54 * s)} ${f(x - 9 * s)} ${f(y + 34 * s)} Z`,
          '#FF7A9C',
        ),
      );
      items.push(line(`M ${f(x - 15 * s)} ${f(y + 30 * s)} Q ${f(x)} ${f(y + 42 * s)} ${f(x + 15 * s)} ${f(y + 30 * s)}`, 4 * s + 1));
      break;
    case 'happy':
    default:
      items.push(...eyes(8));
      items.push(...cheeks());
      items.push(smile());
      break;
  }
  return items;
}
