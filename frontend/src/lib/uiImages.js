import { uiImages } from 'virtual:ui-images';
export const uiImage = path => uiImages[path] || path;
export const HOME_IMAGES = Object.entries(uiImages).filter(([path]) => !path.startsWith('/history/')).map(([,url]) => url);
export const HISTORY_IMAGES = ['/history/bg.webp','/history/deco.webp'].map(uiImage);
