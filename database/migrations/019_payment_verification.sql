-- Preserve the provider plan selected at checkout for later reconciliation.
ALTER TABLE recurring ADD COLUMN provider_plan_id TEXT;
