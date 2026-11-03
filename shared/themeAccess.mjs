export const FREE_THEMES_PER_AGE = 5;

/** Preserve the library's display order, counting the allowance separately for each age. */
export function freeThemeIds(themes, limit = FREE_THEMES_PER_AGE) {
  const count = Number.isInteger(limit) && limit >= 0 ? limit : FREE_THEMES_PER_AGE;
  const groups = new Map();
  const allowed = new Set();
  for (const theme of themes) {
    const age = theme.age ?? theme.age_group ?? '6-8';
    const used = groups.get(age) || 0;
    if (used < count) allowed.add(theme.id ?? theme.slug);
    groups.set(age, used + 1);
  }
  return allowed;
}

export const hasVipThemes = (plan) => plan?.vip === true && ['month', 'year'].includes(plan.plan);

/** Missing lock metadata never means unrestricted access for a Free account. */
export function resolveThemeAccess(themes, plan, limit = FREE_THEMES_PER_AGE) {
  const free = freeThemeIds(themes, limit);
  const vip = hasVipThemes(plan);
  return themes.map((theme) => ({ ...theme,
    locked: theme.locked === true || (!vip && !free.has(theme.id ?? theme.slug)),
  }));
}
