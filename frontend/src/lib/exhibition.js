// Hội trường triển lãm: một hội trường chung + 5 cảm xúc tích cực (mỗi cái 1 điểm).
export const BOARDS = [{ key: 'free', frame: '#7D5FFF', frameLight: '#EDE7FF', wall: '#F6F2FF', icon: '🎨' }];
export const boardMeta = (key) => BOARDS.find((b) => b.key === key) || BOARDS[0];

export const REACTIONS = [
  { key: 'heart', emoji: '❤️' },
  { key: 'cheer', emoji: '🎉' },
  { key: 'clap', emoji: '👏' },
  { key: 'love', emoji: '😍' },
  { key: 'star', emoji: '🌟' },
];

/** Tranh được vẽ lại từ dữ liệu tô (không dùng ảnh gửi lên) — gắn svg của tranh vào dữ liệu. */
export const pictureOf = (res, entry) => res.pictures?.[entry.pictureId];
