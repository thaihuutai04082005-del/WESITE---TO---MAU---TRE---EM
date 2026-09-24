import { view } from '../services/progression.js';
import { RANK_TIERS } from '../config/constants.js';

export function progression(req, res) {
  res.json({ ...view(req.user.id, req.user.language), tiers: RANK_TIERS });
}
