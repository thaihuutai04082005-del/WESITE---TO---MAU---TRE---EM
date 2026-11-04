/** Shared permission expression; callers supply a static SQL expression for the theme ID. */
export const themeAllowedSql = themeIdExpression => `(
  EXISTS (SELECT 1 FROM subscriptions s JOIN users owner ON owner.id=s.user_id
    WHERE s.user_id=? AND s.starts_at<=? AND s.ends_at>?)
  OR EXISTS (SELECT 1 FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY COALESCE(age_group, '6-8') ORDER BY sort,id) AS position
    FROM themes WHERE active=1
  ) allowed WHERE id=${themeIdExpression} AND position<=?)
)`;
