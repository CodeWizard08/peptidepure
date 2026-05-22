# Inventory ↔ Google Sheets Two-Way Sync

This doc covers the setup for audit #7 phase C — bidirectional sync between
the PeptidePure inventory table and Scott's master inventory Google Sheet.

The bridge is **dormant** until the env vars below are set. Until then, both
endpoints respond `503 Sheet sync not configured` and the Vercel cron job
runs but no-ops harmlessly.

## Architecture

```
┌──────────────────┐         ┌──────────────────┐
│ Google Sheet     │◄────────│  Scheduler       │
│ (master copy)    │         │  hits GET        │
│                  │         │  /api/inventory- │
│                  │         │  sync/to-sheet   │
└────────┬─────────┘         └──────────────────┘
         │                            ▲
         │                            │ Bearer CRON_SECRET
         │                            │
         │ Apps Script onEdit
         │ POST /api/inventory-sync/from-sheet
         ▼
┌──────────────────┐
│  Supabase        │
│  inventory table │
│  + trigger 021   │
│  propagates to   │
│  products        │
└──────────────────┘
```

**Scheduler frequency** — the **DB → Sheet** push is currently scheduled by
Vercel Cron at `0 6 * * *` (once daily at 06:00 UTC). The Vercel Hobby plan
caps cron jobs at daily frequency. To get faster sync (every 5 minutes, or
on-demand) without upgrading to Vercel Pro, point an external scheduler
(GitHub Actions, cron-job.org, EasyCron, etc.) at the same endpoint:

```
GET https://peptidepure.com/api/inventory-sync/to-sheet
  Authorization: Bearer <CRON_SECRET>
```

See [§External scheduler setup](#external-scheduler-setup) below.

The **Sheet → DB** direction is event-driven via Apps Script `onEdit` and
is unaffected by the cron schedule — Scott's edits propagate to Supabase
within a second regardless of cron frequency.

## Setup steps

### 1. Create a Google Cloud service account

1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts
2. Pick or create a project (e.g. `peptidepure-prod`)
3. Click **Create Service Account** → name `peptidepure-sheet-sync`
4. Skip the role grants (we don't need them)
5. After creation, click the new account → **Keys** tab → **Add Key → Create new key → JSON**
6. A JSON file downloads. Save it — this is the secret used in step 4.

### 2. Enable the Sheets API

1. Go to https://console.cloud.google.com/apis/library/sheets.googleapis.com
2. Pick the same project, click **Enable**

### 3. Share the sheet with the service account

1. Open the master inventory Google Sheet
2. Click **Share**
3. Add the service account's email (looks like `peptidepure-sheet-sync@<project>.iam.gserviceaccount.com`) with **Editor** permission
4. Uncheck "Notify people" and send

### 4. Set Vercel env vars

Add these to Vercel → peptidepure project → Settings → Environment Variables
(apply to Production, Preview, Development):

| Variable | Value |
|---|---|
| `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON` | Paste the **entire JSON file** contents from step 1 (one line is fine) |
| `GOOGLE_SHEETS_ID` | The spreadsheet ID — the long alphanumeric string in the sheet URL between `/d/` and `/edit` |
| `GOOGLE_SHEETS_TAB` | (Optional) The tab name. Defaults to `Inventory`. |
| `SHEET_SYNC_SECRET` | A random string ≥ 32 chars. Generate with `openssl rand -hex 32` |
| `CRON_SECRET` | Vercel auto-sets this for cron-triggered routes; nothing to do |

### 5. Prepare the Sheet's column layout

Row 1 is the header. Rows 2+ are data. The cron always writes starting at A2.

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| SKU | Product | Dose | Stock | Status | Notes | Last Synced |

When the cron writes, it stamps column G with the ISO timestamp. The Apps
Script reads the SKU from column A — that's the lookup key.

**Important** — the cron clears rows beyond the data range on every push
and rewrites columns A–G with `USER_ENTERED` semantics. Do **not** add
formulas, conditional formatting per-cell, or notes in columns A–G or
in rows past the data — they will be wiped. Put any auxiliary formulas
in column H+ or on a separate tab.

### 6. Paste the Apps Script

1. In the Sheet, click **Extensions → Apps Script**
2. Replace any existing code with the contents of `inventory-sync.gs` below
3. Set the script properties:
   - **Project Settings → Script Properties**:
     - `WEBHOOK_URL` = `https://peptidepure.com/api/inventory-sync/from-sheet`
     - `SHEET_SYNC_SECRET` = (same value as Vercel `SHEET_SYNC_SECRET`)
4. Set the trigger:
   - **Triggers → Add Trigger**
   - Function: `onInventoryEdit` · Event source: `From spreadsheet` · Event type: `On edit`
   - Save (Google will ask for permission scope — accept)

```javascript
// inventory-sync.gs — paste into Apps Script

const STOCK_COL = 4;   // column D = Stock
const STATUS_COL = 5;  // column E = Status
const NOTES_COL = 6;   // column F = Notes
const SKU_COL = 1;     // column A = SKU
const HEADER_ROWS = 1; // header in row 1, data starts row 2

function onInventoryEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== 'Inventory') return; // only the Inventory tab

  const row = e.range.getRow();
  if (row <= HEADER_ROWS) return; // header edit — ignore

  const col = e.range.getColumn();
  // Only react when stock / status / notes change. Editing SKU directly
  // would require a row-rename flow that's not in scope.
  if (col !== STOCK_COL && col !== STATUS_COL && col !== NOTES_COL) return;

  const sku = String(sheet.getRange(row, SKU_COL).getValue() || '').trim();
  if (!sku) return;

  const stock = Number(sheet.getRange(row, STOCK_COL).getValue());
  const status = String(sheet.getRange(row, STATUS_COL).getValue() || '');
  const notes = String(sheet.getRange(row, NOTES_COL).getValue() || '');

  const props = PropertiesService.getScriptProperties();
  const url = props.getProperty('WEBHOOK_URL');
  const secret = props.getProperty('SHEET_SYNC_SECRET');
  if (!url || !secret) {
    console.error('WEBHOOK_URL or SHEET_SYNC_SECRET not set in Script Properties');
    return;
  }

  const payload = {
    sku: String(sku),
    sheet_secret: secret,
  };
  if (Number.isFinite(stock) && stock >= 0) payload.stock = stock;
  if (status) payload.status = status;
  if (notes) payload.notes = notes;

  try {
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });
  } catch (err) {
    console.error('Webhook failed for SKU ' + sku + ': ' + err);
  }
}
```

### 7. Verify

1. Apply migrations 020, 021, 022, 023 in Supabase SQL Editor if not already done.
2. Deploy with the new env vars.
3. Trigger the cron manually once:
   ```
   curl -X GET https://peptidepure.com/api/inventory-sync/to-sheet \
     -H "Authorization: Bearer $CRON_SECRET"
   ```
   Expect `{ ok: true, rows: N, synced_at: "..." }`.
4. Confirm the Sheet now has data rows. Check column G has the ISO timestamp.
5. Edit a Stock value in the Sheet. The Apps Script onEdit fires; within
   ~1 second the inventory row in Supabase should reflect the new value, and
   trigger 021 propagates to `products.stock_quantity`.
6. To verify the loop break: immediately after a cron sync, edit the Sheet.
   The webhook should return `{ ok: true, applied: false, reason: "echo" }`
   if it landed inside the 60-second window. Wait 60+ seconds, edit again,
   and you should see `applied: true`.

## Conflict / source-of-truth

- **DB is the source of truth for purchase decrements** — customer orders
  decrement `products.stock_quantity` via the existing RPC, then trigger 020
  cascades to `inventory.stock`. The next cron picks the change up.
- **Sheet wins for manual edits** — when Scott edits a cell, that's the
  intentional override. The 60-second echo skip prevents the cron's own
  write from being misinterpreted as Scott's edit.
- If two parties write within the same 5-minute window (rare): last-write-
  wins between Scott's sheet edit and the next cron push. To eliminate
  this entirely, use Realtime instead of cron — out of scope for phase C.

## Operating costs

- Vercel cron: included in Hobby/Pro tier
- Google Sheets API: free tier is 500 req/100sec/user — we use ~12 req/hour
- Network: ~10KB per cron run

## External scheduler setup

Vercel Hobby caps `crons` at daily frequency. For sub-daily DB → Sheet
sync (e.g. every 5 minutes), point any external scheduler at the same
endpoint. The endpoint already authenticates via `Authorization: Bearer
<CRON_SECRET>`, so external callers just need that header.

### Option A: GitHub Actions (free, runs every 5 min)

Create `.github/workflows/inventory-sync.yml`:

```yaml
name: Inventory sync (DB → Sheet)
on:
  schedule:
    - cron: '*/5 * * * *'   # every 5 min
  workflow_dispatch:          # also manual-trigger from the Actions UI
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Hit to-sheet endpoint
        run: |
          curl -fsS -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://peptidepure.com/api/inventory-sync/to-sheet
```

Then in GitHub → Repo Settings → Secrets and variables → Actions, add
`CRON_SECRET` matching the value in Vercel. (Note: GitHub's scheduled
runs can be delayed 10–20 min under load — fine for inventory sync.)

### Option B: cron-job.org (free, generally on-time)

1. Sign in at https://cron-job.org
2. Create job → URL = `https://peptidepure.com/api/inventory-sync/to-sheet`
3. Headers → `Authorization: Bearer <CRON_SECRET>`
4. Schedule = every 5 minutes

### Option C: Upgrade Vercel to Pro

Edit `vercel.json` schedule back to `*/5 * * * *` and redeploy. Pro
removes the daily-only cap.

## Disabling

Unset any of `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON`, `GOOGLE_SHEETS_ID`, or
`SHEET_SYNC_SECRET` and redeploy. Both endpoints return 503 and the bridge
goes dormant without code changes.
