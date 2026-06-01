-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── intake_forms ──────────────────────────────────────────────────────────────
CREATE TABLE intake_forms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_date    DATE NOT NULL,
    guest_count     TEXT NOT NULL CHECK (guest_count IN ('<100', '100-300', '300-500', '500+')),
    city            TEXT NOT NULL,
    venue_type      TEXT NOT NULL CHECK (venue_type IN (
                        'banquet_hall', 'farmhouse', 'heritage_property', 'destination', 'home'
                    )),
    budget_bracket  TEXT NOT NULL CHECK (budget_bracket IN (
                        '10-25L', '25-50L', '50L-1Cr', '1-2Cr', '2Cr+'
                    )),
    priorities      TEXT[] NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── recommendations ───────────────────────────────────────────────────────────
CREATE TABLE recommendations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id             UUID NOT NULL REFERENCES intake_forms(id) ON DELETE CASCADE,
    category            TEXT NOT NULL,
    priority_rank       INTEGER NOT NULL,
    suggested_min       INTEGER NOT NULL,
    suggested_max       INTEGER NOT NULL,
    allocation_percent  NUMERIC(5,2) NOT NULL,
    rationale           TEXT NOT NULL,
    tips                TEXT[] NOT NULL DEFAULT '{}',
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recommendations_plan_id ON recommendations(plan_id);

-- ── payments ─────────────────────────────────────────────────────────────────
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id             UUID NOT NULL REFERENCES intake_forms(id) ON DELETE CASCADE,
    recommendation_id   UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
    vendor_name         TEXT NOT NULL,
    amount              INTEGER NOT NULL CHECK (amount > 0),
    payment_date        DATE NOT NULL,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_plan_id ON payments(plan_id);
CREATE INDEX idx_payments_recommendation_id ON payments(recommendation_id);
