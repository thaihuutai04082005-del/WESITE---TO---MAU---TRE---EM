// Trạng thái tranh đang tô + Undo/Redo (Mục 4.3).
import { useCallback, useReducer } from 'react';
import { EMPTY_DATA } from '../lib/picture';

const HISTORY_LIMIT = 200;

function applyAction(data, a) {
  switch (a.type) {
    case 'fill': {
      const fills = { ...data.fills };
      if (a.color) fills[a.regionId] = a.color;
      else delete fills[a.regionId];
      let glitter = data.glitter.filter((g) => g !== a.regionId);
      if (a.glitter && a.color) glitter = [...glitter, a.regionId];
      return { ...data, fills, glitter };
    }
    case 'stroke':
      return { ...data, strokes: [...data.strokes, a.stroke] };
    case 'sticker-add':
      return { ...data, stickers: [...data.stickers, a.sticker] };
    case 'sticker-update':
      return { ...data, stickers: data.stickers.map((s, i) => (i === a.index ? a.sticker : s)) };
    case 'sticker-remove':
      return { ...data, stickers: data.stickers.filter((_, i) => i !== a.index) };
    case 'clear':
      return EMPTY_DATA();
    default:
      return data;
  }
}

/** Tạo action đảo ngược dựa trên trạng thái trước khi áp dụng. */
function inverseOf(data, a) {
  switch (a.type) {
    case 'fill':
      return { type: 'fill', regionId: a.regionId, color: data.fills[a.regionId] || null, glitter: data.glitter.includes(a.regionId) };
    case 'stroke':
      return { type: 'restore', data };
    case 'sticker-add':
      return { type: 'sticker-remove', index: data.stickers.length };
    case 'sticker-update':
      return { type: 'sticker-update', index: a.index, sticker: data.stickers[a.index] };
    case 'sticker-remove':
      return { type: 'restore', data };
    case 'clear':
      return { type: 'restore', data };
    default:
      return { type: 'restore', data };
  }
}

const run = (data, a) => (a.type === 'restore' ? a.data : applyAction(data, a));

function reducer(state, ev) {
  switch (ev.kind) {
    case 'do': {
      const inv = inverseOf(state.data, ev.action);
      return { data: run(state.data, ev.action), undo: [...state.undo.slice(-HISTORY_LIMIT + 1), { action: ev.action, inv }], redo: [] };
    }
    case 'undo': {
      const last = state.undo[state.undo.length - 1];
      if (!last) return state;
      return { data: run(state.data, last.inv), undo: state.undo.slice(0, -1), redo: [...state.redo, last] };
    }
    case 'redo': {
      const last = state.redo[state.redo.length - 1];
      if (!last) return state;
      const inv = inverseOf(state.data, last.action);
      return { data: run(state.data, last.action), undo: [...state.undo, { action: last.action, inv }], redo: state.redo.slice(0, -1) };
    }
    case 'reset':
      return { data: ev.data, undo: [], redo: [] };
    case 'remote':
      // Thao tác từ bạn cùng phòng: áp thẳng, không vào lịch sử Undo của mình.
      return { ...state, data: run(state.data, ev.action) };
    default:
      return state;
  }
}

export function useArtworkEditor(initial) {
  const [state, dispatch] = useReducer(reducer, null, () => ({ data: { ...EMPTY_DATA(), ...(initial || {}) }, undo: [], redo: [] }));
  return {
    data: state.data,
    canUndo: state.undo.length > 0,
    canRedo: state.redo.length > 0,
    act: useCallback((action) => dispatch({ kind: 'do', action }), []),
    undo: useCallback(() => dispatch({ kind: 'undo' }), []),
    redo: useCallback(() => dispatch({ kind: 'redo' }), []),
    reset: useCallback((data) => dispatch({ kind: 'reset', data: { ...EMPTY_DATA(), ...(data || {}) } }), []),
    remote: useCallback((action) => dispatch({ kind: 'remote', action }), []),
  };
}
