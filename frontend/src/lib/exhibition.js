// Hội trường triển lãm: 4 phòng (bảng xét) + 5 cảm xúc tích cực (mỗi cái 1 điểm).
export const BOARDS = [
  { key: 'S', frame: '#E0A800', frameLight: '#FFF3C4', wall: '#FFF8E1', icon: '👑' },
  { key: 'A', frame: '#9AA7B4', frameLight: '#EEF2F6', wall: '#F4F7FA', icon: '💎' },
  { key: 'B', frame: '#A8672F', frameLight: '#F3E3D3', wall: '#FBF4EC', icon: '🌟' },
  { key: 'free', frame: '#7D5FFF', frameLight: '#EDE7FF', wall: '#F6F2FF', icon: '🎨' },
];
export const boardMeta = (key) => BOARDS.find((b) => b.key === key) || BOARDS[3];

export const REACTIONS = [
  { key: 'heart', emoji: '❤️' },
  { key: 'cheer', emoji: '🎉' },
  { key: 'clap', emoji: '👏' },
  { key: 'love', emoji: '😍' },
  { key: 'star', emoji: '🌟' },
];

/** Tranh được vẽ lại từ dữ liệu tô (không dùng ảnh gửi lên) — gắn svg của tranh vào dữ liệu. */
export const pictureOf = (res, entry) => res.pictures?.[entry.pictureId];
