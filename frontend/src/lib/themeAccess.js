import { api, ApiError } from '../services/api.js';
import { resolveThemeAccess } from '../../../shared/themeAccess.mjs';

export async function assertThemeAllowed(slug, plan, limit) {
  const response = await api.get('/themes?access=1');
  if (!Array.isArray(response.themes)) throw new ApiError(502, 'backend_unavailable');
  const theme = resolveThemeAccess(response.themes, plan, limit).find((theme) => theme.slug === slug);
  if (!theme) throw new ApiError(404, 'picture_not_found');
  if (theme.locked) throw new ApiError(403, 'theme_vip_required');
}

export async function assertPictureThemeAllowed(picture, plan, limit) {
  if (!picture) throw new ApiError(502, 'backend_unavailable');
  if (picture.isCard) return; // Rare cards follow ownership, not VIP theme access.
  if (!picture.theme?.slug) throw new ApiError(502, 'backend_unavailable');
  await assertThemeAllowed(picture.theme.slug, plan, limit);
}
