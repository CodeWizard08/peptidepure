-- Seed metadata.volume_pricing on 21-day lead-time products (MOQ 10 vials).
-- Tiers come from the "FOR AI APP: Peptide Pure & Peptide Buzz Pricing & SKUs"
-- spreadsheet — 10-19 vials (list), 20-49 (5% off), 50+ (10% off).
-- Values are stored as cents. The UI in ProductHero renders these tiers
-- automatically when metadata.volume_pricing is populated.
--
-- Safe to re-run: uses jsonb_set (merges into existing metadata, overwrites key).

DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN (
    VALUES
      -- sku,                                  10-19, 20-49, 50+
      ('5-amino-1mq-5mg',                      5000,  4800,  4500),
      ('5-amino-1mq-50mg',                     7700,  7300,  6900),
      ('aod-9604-2mg',                         4400,  4200,  4000),
      ('aod-9604-5mg',                         5500,  5200,  5000),
      ('bpc-157-5mg',                          2800,  2700,  2500),
      ('cagrilintide-5mg',                    10500, 10000,  9500),
      ('cagrilintide-10mg',                   14900, 14200, 13400),
      ('cjc-1295-ipamorelin-20mg',            11000, 10500,  9900),
      ('cjc-1295-dac-10mg',                    6600,  6300,  5900),
      ('cjc-1295-10mg',                        6100,  5800,  5500),
      ('dsip-10mg',                            5200,  4900,  4700),
      ('epithalon-20mg',                       4600,  4400,  4100),
      ('epithalon-40mg',                       5500,  5200,  5000),
      ('follistatin-1mg',                     19300, 18300, 17400),
      ('follistatin-315-1mg',                 16000, 15200, 14400),
      ('follistatin-344-1mg',                 13300, 12600, 12000),
      ('fox04-dri-5mg',                       12100, 11500, 10900),
      ('fox04-dri-10mg',                      19800, 18800, 17800),
      ('ghrp-2-5mg',                           3500,  3300,  3200),
      ('ghrp-2-10mg',                          5500,  5200,  5000),
      ('hexarelin-5mg',                        4200,  4000,  3800),
      ('igf-1-lr3-1mg',                        7000,  6700,  6300),
      ('ipamorelin-5mg',                       4400,  4200,  4000),
      ('ipamorelin-10mg',                      6100,  5800,  5500),
      ('klow-80mg',                           15400, 14600, 13900),
      ('kpv-10mg',                             6800,  6500,  6100),
      ('lipo-c-10ml',                          5300,  5000,  4800),
      ('LL-37-5mg',                            6600,  6300,  5900),
      ('mazdutide-5mg',                        7200,  6800,  6500),
      ('mazdutide-10mg',                      11000, 10500,  9900),
      ('mots-c-40mg',                         16500, 15700, 14900),
      ('nad-500mg',                            5000,  4800,  4500),
      ('oxytocin-5mg',                         3900,  3700,  3500),
      ('peg-mgf-2mg',                          6100,  5800,  5500),
      ('pinealon-20mg',                        8300,  7900,  7500),
      ('SM-15mg',                             17600, 16700, 15800),
      ('SM-30mg',                             19300, 18300, 17400),
      ('sermorelin-10mg',                      7000,  6700,  6300),
      ('ss-31-50mg',                          17600, 16700, 15800),
      ('tesamorelin-5mg',                      5500,  5200,  5000),
      ('tesamorelin-10mg-ipamorelin-10mg',     7700,  7300,  6900),
      ('TA1-10mg',                             8300,  7900,  7500),
      ('TZ-15mg',                             13200, 12500, 11900)
    ) AS t(sku, tier1, tier2, tier3)
  ) LOOP
    UPDATE products
    SET metadata = jsonb_set(
      jsonb_set(
        jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{volume_pricing}',
          jsonb_build_object(
            '10-19', rec.tier1,
            '20-49', rec.tier2,
            '50+',   rec.tier3
          )
        ),
        '{inventory}',
        '"lead_time"'::jsonb,
        true  -- create if missing
      ),
      '{lead_time_days}',
      '21'::jsonb,
      true
    )
    WHERE lower(sku) = lower(rec.sku);
  END LOOP;
END $$;

-- Mark the oral capsule/tablet SKUs with metadata.form = 'Oral tablets' so the
-- /peptides?shop=oral quick-nav filter matches them.
UPDATE products
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{form}',
  '"Oral tablets"'::jsonb,
  true
)
WHERE lower(sku) IN (
  'oral-5-amino-1mq-50mg',
  'oral-bpc-500mcg',
  'oral-kpv-500mcg',
  'oral-slu-pp-332-250mcg',
  'oral-tirz-500mcg'
);

-- Mark the Peptide Buzz SKUs with metadata.brand = 'peptidebuzz' so the
-- /peptides?shop=buzz quick-nav filter matches them. No-op if rows don't exist yet.
UPDATE products
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{brand}',
  '"peptidebuzz"'::jsonb,
  true
)
WHERE sku IN (
  'PB-NS-WG-CAF-20T-V1',
  'PB-NS-CT-NC-20T-V1',
  'PB-RR-GHKCU-WHIP-60ML',
  'PB-RR-GHKCU-S8-SERUM-30ML',
  'PB-RR-DUO'
);
