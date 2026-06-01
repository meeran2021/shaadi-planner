-- Allow custom categories to have no priority rank (AI categories keep 1–8)
ALTER TABLE recommendations ALTER COLUMN priority_rank DROP NOT NULL;
