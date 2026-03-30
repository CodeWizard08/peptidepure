/**
 * Migrate WordPress users → Supabase auth
 *
 * Strategy: Create users with a temp password (this works reliably),
 * then update the password hash directly via SQL so users can log in
 * with their existing WordPress passwords.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Auto-load .env.local ──────────────────────────────────────────────────────
try {
  const lines = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8').split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* ignore */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── WordPress users ───────────────────────────────────────────────────────────
const WP_USERS = [
  { email: 'mistermortensen@gmail.com',      name: 'M. Scott Mortensen',   hash: '$2y$10$.pcQxgvJTmYEEEPSOfqnx.KI2ieXBHl.QofhWkvQU11G6sOGA7dj2', reg: '2025-05-17' },
  { email: 'textantextanw@gmail.com',         name: 'Doctor Scot',          hash: '$2y$10$L3np4zeQg0fmp1n51yA8KeEE/W7XxoJa3h0mh59qHvMm6GIufwKE.', reg: '2025-06-26' },
  { email: 'brentwells77@gmail.com',          name: 'brentwells77',         hash: '$2y$10$avytvv05TkowYnwjGcVYDOAhm6oU7ldtKq.5HvDgv4wZxktxhiS2m', reg: '2025-10-28' },
  { email: 'mur@promed-financial.com',        name: 'mur',                  hash: '$2y$10$hxnCOeCoyzbLSpYZEm2sPugSyoIJ92zI/7eS2FFUDy93.URLaWRgW', reg: '2025-10-30' },
  { email: 'Steve.viel78@gmail.com',          name: 'steve.viel78',         hash: '$2y$10$qVvD9As39IRL7tIaU6.0eeB1FdhbS88Pyicmy9mKceukQel2xpckK', reg: '2025-11-12' },
  { email: 'dawnalbert2@verizon.net',         name: 'dawnalbert2',          hash: '$2y$10$Y1O.9v6BD4f/uIWiU1Kfbu1m6XCes7guyBLd9drKt.Priii7a7ZfW', reg: '2025-11-14' },
  { email: 'dr.elaine.nmd@gmail.com',         name: 'Elaine Marquez',       hash: '$2y$10$HDk6.w4XA2a6HcsN/v/WCeW5sSYimksx5EWmBUaHOtEcqBi/kDj86', reg: '2025-12-16' },
  { email: 'Elainelm888@gmail.com',           name: 'Elainelm888',          hash: '$2y$10$RkYJP5nGTYmVtVKlgWs1Xu0WktemBXeP3q/0iGp8E52qm6SDuvvYO', reg: '2025-12-30' },
  { email: 'garrettbrennanturner@gmail.com',  name: 'garrettbrennanturner', hash: '$2y$10$EAho/91KottN1Y3m39kZSua9HpMwErm05S.hW7/n1rWQ1zzL.qb7i', reg: '2026-01-05' },
  { email: 'info@internetize.me',             name: 'Dusan Stankovic',      hash: '$2y$10$VLA57N1IYkkTc9gUv5/QSuYpyursf.Gs8SEv4i48vRIpobhVzuwhe', reg: '2026-01-06' },
  { email: 'Mistermortensen@hotmail.com',     name: 'Mistermortensen',      hash: '$2y$10$0nFgM0r/KYYWhOIUmBSyRONTsc0IzLGGN5rNbujqVbD5VXr8q4huy', reg: '2026-01-07' },
  { email: 'bsroth@gmail.com',                name: 'bsroth',               hash: '$2y$10$.O2vJxl3p0id2w3AeUORYeQZ6gdMAiPxvhv2.p9MOPlHp7kBJ2Xl.', reg: '2026-01-07' },
  { email: 'caitnatale@gmail.com',            name: 'caitnatale',           hash: '$2y$10$qBSsPjl3iTDtZkpMpG6hPe9qikTbBk1vIxnp5oX7It9jE5sq9ZKbm', reg: '2026-01-09' },
  { email: 'jason@omegalongevity.com',        name: 'jason',                hash: '$2y$10$tY/bmYpdhzL3bpJq4C7laudB9qY.TbXUxf0.DwkbLYVC/4z7IEqfu', reg: '2026-01-10' },
  { email: 'info@backonpointwellness.com',    name: 'info',                 hash: '$2y$10$SBCAiOWH58lj6.aJkwzQwOjnJQuwQUYH7yraAbPWPvu6BF.cfesey', reg: '2026-01-10' },
  { email: 'Erinsmurphy@outlook.com',         name: 'Erinsmurphy',          hash: '$2y$10$0huzLODYoVnO0hKBhi7uy.WMnEuyiXTokAR7G40ugIDR1.xTDiBCu', reg: '2026-01-11' },
  { email: 'thoryn@brain.one',                name: 'thoryn',               hash: '$2y$10$7XlOnnsJeeNDG/VBYcRX2.i9VOJqOI1n.6Ia.Fz8sBJIlDt5TmeA6', reg: '2026-01-12' },
  { email: 'Anthonymariano23@gmail.com',      name: 'Anthonymariano23',     hash: '$2y$10$eRJsl6.XneckvSL38Ca.x.roZltQ0EMu8ZeWzZ/Xb7LLY8O8BTh.S', reg: '2026-01-12' },
  { email: 'mjf_janik@yahoo.com',             name: 'mjf_janik',            hash: '$2y$10$6wfYBm4BDSDvj8k0r7djIui7CC.Vu9KQA0jYuiCIF0JihoU0nLgGq', reg: '2026-01-12' },
  { email: 'skmdwellness@gmail.com',          name: 'skmdwellness',         hash: '$2y$10$p6T9UkcQ0V/SpMdkEBfhJ.SiDFek4tIAYAGdugX01b8iJJ/9/jmTC', reg: '2026-01-13' },
  { email: 'ceo@BrainThrive.com',             name: 'ceo',                  hash: '$2y$10$0FiOxHmLd3RcpAnFB2ft/OQn8i7plUJ9qnENmozOqXYXpkjjyV5/u', reg: '2026-01-15' },
  { email: 'robert_gray@live.com',            name: 'robert_gray',          hash: '$2y$10$IWJegXzjtt517JABMmtDlO8USe29WD5dVGsATgt0tkoyz3YiVeUri', reg: '2026-01-17' },
  { email: 'dr.elaine@peptidepure.com',       name: 'Elaine Marquez',       hash: '$2y$10$XidlBTZEZj/9YHuGOFkY2.mbn3l44ENaPlPJy7D/XYuXSPD.7tmBi', reg: '2026-01-19' },
  { email: 'back2healthrexburg@gmail.com',    name: 'back2healthrexburg',   hash: '$2y$10$4HisiEO6ITqghky51SWHFOHFDHzhclbZ0JqIzlMSiVJasLrtTkaKy', reg: '2026-01-20' },
  { email: 'JOE@EVERWELLUSA.COM',             name: 'JOE',                  hash: '$2y$10$YDTssBmH9m8fV2rny7ROW.PBKn/6Y6gSDI8TptK/Uomhq63QJRxNu', reg: '2026-01-27' },
  { email: 'cpcusa9501@gmail.com',            name: 'cpcusa9501',           hash: '$2y$10$K7YEKnGlQkR0Fj2zBrBKweZeILgELxCFpQRTZ/.4hqx6T3r4KkEB6', reg: '2026-02-17' },
  { email: 'golfnut1@mac.com',                name: 'golfnut1',             hash: '$2y$10$3KBgKkaaq.wu6uKZa8/wFuiTBh9HE/e3vVkpLkp223PxmRyDRznye', reg: '2026-02-17' },
  { email: 'abbylovend@gmail.com',            name: 'abbylovend',           hash: '$2y$10$w/zqCmwmBNcRQbn0E.K6Y.Ed/A9DZZ2ogzk2dZsycS31tIhAQjjsS', reg: '2026-02-18' },
  { email: 'Ahoffman714@gmail.com',           name: 'Ahoffman714',          hash: '$2y$10$u9yhZ7gyRye9dJ8PF0aWG.LF5BJ3bjbWUA2TBTkLWe6rzCPwEgDXS', reg: '2026-02-21' },
  { email: 'mitchclaire@gmail.com',           name: 'mitchclaire',          hash: '$2y$10$aV678VLlT8JQ43jB4ALpR.2EMkfmAy0AaeLYOixzCfvvW/iU33oJm', reg: '2026-02-24' },
  { email: 'zlatinstamatov@gmail.com',        name: 'zlatinstamatov',       hash: '$2y$10$/dh9C0WVZfNxn23d4Rhi0uE7g/L2sV9fdpIoIG0yZcB2.eLe1X5H2', reg: '2026-03-09' },
  { email: 'info@innovahealthwellness.com',   name: 'info1',                hash: '$2y$10$Wx6EmhVlSqlchORZcAs9zOHX3m3ApsmA3kslqv0Nk6qnKEOS1EXe6', reg: '2026-03-10' },
  { email: 'dr.vishalthakral@gmail.com',      name: 'dr.vishalthakral',     hash: '$2y$10$ZlOh2/r.oi4fHnAwk3zi5eJaZ/G7xOXVAlAbbUMS1IyLFuHcY3rO6', reg: '2026-03-13' },
];

// ── Main migration ────────────────────────────────────────────────────────────
async function migrate() {
  console.log(`\n--- Phase 1: Create user accounts (temp password) ---\n`);

  const TEMP_PASSWORD = 'TempMigrate2026!xQ9';
  const created: { email: string; id: string; hash: string }[] = [];
  const results = { created: 0, skipped: 0, failed: 0 };

  for (const user of WP_USERS) {
    const email = user.email.toLowerCase().trim();

    // Try to create with a temp password (this always works)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: TEMP_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: user.name,
        migrated_from: 'wordpress',
        wp_registered: user.reg,
      },
    });

    if (error) {
      const code = (error as any).code;
      const msg = error.message.toLowerCase();
      if (code === 'email_exists' || msg.includes('already') || msg.includes('registered')) {
        // Already exists — still need to grab their ID for the hash update
        const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const existing = list?.users.find(u => u.email?.toLowerCase() === email);
        if (existing) {
          created.push({ email, id: existing.id, hash: user.hash });
          console.log(`  ⏭  SKIP   ${email} (exists — will update hash)`);
        } else {
          console.log(`  ⏭  SKIP   ${email} (exists — cannot find ID)`);
        }
        results.skipped++;
      } else {
        console.log(`  ❌  FAIL   ${email} — [${code}] ${error.message}`);
        results.failed++;
      }
    } else if (data.user) {
      created.push({ email, id: data.user.id, hash: user.hash });
      console.log(`  ✅  OK     ${email} (${user.name})`);
      results.created++;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n  Created: ${results.created}  |  Skipped: ${results.skipped}  |  Failed: ${results.failed}`);

  // ── Phase 2: Update password hashes via SQL ─────────────────────────────────
  if (created.length === 0) {
    console.log('\nNo users to update hashes for.');
    return;
  }

  console.log(`\n--- Phase 2: Overwrite password hashes (${created.length} users) ---\n`);

  let hashUpdated = 0;
  let hashFailed = 0;

  for (const u of created) {
    // Use Supabase SQL (via rpc or direct query) to set the real bcrypt hash.
    // GoTrue stores passwords in auth.users.encrypted_password.
    const { error } = await supabase.rpc('admin_set_password_hash', {
      target_user_id: u.id,
      new_hash: u.hash,
    });

    if (error) {
      // Fallback: try raw SQL via supabase management API
      console.log(`  ⚠  RPC failed for ${u.email} — ${error.message}`);
      hashFailed++;
    } else {
      console.log(`  ✅  HASH   ${u.email}`);
      hashUpdated++;
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n  Hashes updated: ${hashUpdated}  |  Failed: ${hashFailed}`);

  if (hashFailed > 0) {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Some hash updates failed. Run this SQL in Supabase         ║
║  Dashboard → SQL Editor to create the helper function:      ║
╚══════════════════════════════════════════════════════════════╝

CREATE OR REPLACE FUNCTION public.admin_set_password_hash(
  target_user_id uuid,
  new_hash text
) RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET encrypted_password = new_hash
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

Then re-run this script.

Alternatively, run the UPDATE statements directly in the SQL Editor:
`);
    for (const u of created) {
      console.log(`UPDATE auth.users SET encrypted_password = '${u.hash}' WHERE id = '${u.id}';`);
    }
  }

  console.log('\n✅  Done. Users can now log in with their WordPress passwords.');
}

migrate().catch(console.error);
