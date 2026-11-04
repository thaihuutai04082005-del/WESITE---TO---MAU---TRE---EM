// Carry one freshly created editor response into its immediate navigation.
// Reload/back navigation, expiry, or a different account always reads the API again.
let pending = null;
const MAX_AGE_MS = 15000;

export function rememberCreatedEditor(response, token) {
  pending = null;
  if (!token || response?.accessError !== null || !Number.isSafeInteger(response.artwork?.id)
      || response.artwork.pictureId !== response.picture?.id || !response.picture?.svg
      || !Array.isArray(response.picture.regions)) return;
  pending = { response, token, expires: Date.now() + MAX_AGE_MS };
}

export function takeCreatedEditor(id, token) {
  const entry = pending;
  pending = null;
  if (!entry || token !== entry.token || String(id) !== String(entry.response.artwork.id)
      || Date.now() >= entry.expires) return null;
  const plan = entry.response.plan;
  if (plan?.vip && plan.endsAt && Date.parse(plan.endsAt) <= Date.now()) return null;
  return entry.response;
}

export function clearCreatedEditor() {
  pending = null;
}
