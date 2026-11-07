# Runbook: move journeys off the `arclight-image-prod` CloudFront distribution

Goal: nothing in Core reads `d1wl257kev7hsz.cloudfront.net` any more, so the
`arclight-image-prod` bucket and distribution can be deleted.

What this changes in production: `Block.src` on the journeys database, for the
few d1wl URLs listed in `mapping.csv`. Nothing else is written. The 1,868 media
`CloudflareImage.uploadUrl` rows are deliberately left alone (not read at
render time).

| File                | What it does                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `mapping.csv`       | You create it: one row per d1wl URL → its Cloudflare Images URL (see step 2)                                              |
| `01-dry-run.sql`    | Read-only. Lists affected blocks/journeys/templates, unmapped variants, residual d1wl                                     |
| `02-migrate.sql`    | The UPDATE in one transaction. **Rolls back unless `-v commit=1`.** Writes before-state.csv and before-state.identity.csv |
| `03-revert.sql`     | Restores `Block.src` from before-state.csv, after checking before-state.identity.csv. Rolls back unless `-v commit=1`     |
| `_load-mapping.sql` | Shared loader/validator, pulled in by 01 and 02. Not run directly                                                         |

Everything below runs from your own machine. No credentials are in this repo or
this document; the database URL is fetched from Doppler into a shell variable
and never printed.

## 0. Prerequisites

- `psql` 13 or newer (`psql --version`). The scripts use `\if` and `:{?var}`.
  Tested with 13.23 and 16 clients.
- Network path to the prod RDS. If `psql` resets mid-handshake, re-auth WARP
  first (`warp-cli`), per the usual RDS access note.
- `doppler` logged in with access to the `api-journeys` project, `prd` config.
- `curl` and `python3` (only for the optional checks in steps 2 and 8).

## 1. Shell setup (bash or zsh)

```bash
# Prisma-only URL parameters (schema, connection_limit, pool_timeout, pgbouncer, ...)
# make psql fail with: invalid URI query parameter. Strip those, keep libpq ones
# such as sslmode.
strip_prisma_params() {
  awk -v u="$1" 'BEGIN {
    n = index(u, "?"); if (n == 0) { print u; exit }
    base = substr(u, 1, n - 1); m = split(substr(u, n + 1), a, "&"); out = ""
    for (i = 1; i <= m; i++) {
      split(a[i], kv, "=")
      if (kv[1] ~ /^(schema|connection_limit|pool_timeout|pgbouncer|statement_cache_size|socket_timeout|sslaccept|sslidentity|sslpassword)$/) continue
      out = out (out == "" ? "" : "&") a[i]
    }
    print (out == "" ? base : base "?" out)
  }'
}

# Fetched and stripped in one go; the URL is never echoed. Do not `echo` or `set -x` it.
PSQL_URL="$(strip_prisma_params "$(doppler secrets get PG_DATABASE_URL_JOURNEYS \
  --project api-journeys --config prd --plain)")"

# From the repo root of your core checkout (this branch):
SCRIPTS="$PWD/apis/api-journeys/src/scripts/d1wl-image-exit"

# A fresh directory per attempt. before-state.csv lands here and is your revert input.
RUN_DIR="$HOME/d1wl-exit-$(date +%Y%m%dT%H%M%S)"
mkdir -p "$RUN_DIR" && cd "$RUN_DIR"

# Every psql call below uses these flags.
psqlp() { psql "$PSQL_URL" -X -v ON_ERROR_STOP=1 "$@"; }
```

Sanity check you are pointed at the right database (prints no credentials):

```bash
psqlp -Atc "select current_database(), current_schema(), current_user"
```

Expect the prod journeys database and schema `public`. If `current_schema` is
not `public`, stop: the stripped `?schema=` mattered and the scripts assume the
default schema.

If you are instead using the repo's `DOPPLER_API_JOURNEYS_TOKEN` flow, replace the
`doppler secrets get ...` line with
`DOPPLER_TOKEN=$DOPPLER_API_JOURNEYS_TOKEN doppler secrets get PG_DATABASE_URL_JOURNEYS --project api-journeys --plain`.

## 2. List what prod actually contains, then write `mapping.csv`

Read-only; lists every distinct d1wl `Block.src` and how many blocks use it:

```bash
psqlp -c "SELECT src, count(*) AS blocks, count(DISTINCT \"journeyId\") AS journeys
          FROM \"Block\" WHERE src ILIKE '%d1wl257kev7hsz.cloudfront.net%'
          GROUP BY src ORDER BY blocks DESC"
```

On the 2026-11-03 prod run this returned 5 URLs and 488 blocks in total; a
re-run against another environment will see different figures. If you see
more URLs than mapping.csv has rows for (for example the same key with
`?version=2`, or `http://`), each one needs its own mapping row; the
migration will not commit while any are unmapped.

Create `mapping.csv` in `$RUN_DIR` (`$SCRIPTS/mapping.example.csv` shows the
shape), one row per d1wl URL from the query above, each mapped to its
already-uploaded Cloudflare Images delivery URL. Rules:

- Header line exactly `d1wl_url,cloudflare_url`.
- `d1wl_url` must equal the `Block.src` string character for character (the
  query above prints it).
- `cloudflare_url` is `https://imagedelivery.net/<account hash>/<image id>/<variant>`.
  It is written into `Block.src` verbatim. The image id may contain dots
  (for example `1_jf6126-0-0.mobileCinematicHigh.jpg`).
- Any value containing a comma (a variant such as `f=jpg,w=640,h=300,q=95`)
  must be wrapped in double quotes.
- Placeholders like `<KEY_1>` are rejected by the loader.

Optional but recommended, while the old distribution still exists: confirm each
new URL serves a 640x300 image.

```bash
python3 -c 'import csv; [print(r[0], r[1]) for r in list(csv.reader(open("mapping.csv")))[1:]]' |
while read -r old new; do
  printf '%s\n  old: ' "$old"; curl -s -o /dev/null -w '%{http_code} %{content_type} %{size_download}B\n' "$old"
  printf '  new: '; curl -s -o /dev/null -w '%{http_code} %{content_type} %{size_download}B\n' "$new"
  curl -s "$new" | file - | sed 's/^/  new: /'    # should mention 640 x 300
done
```

## 3. Dry run (read-only)

```bash
psqlp -f "$SCRIPTS/01-dry-run.sql" | tee dry-run.txt
```

It never writes to the database (temp tables only, then the session is set
read-only). Read it before going on:

- On the 2026-11-03 prod run: `blocks_to_rewrite` ≈ 488, `journeys` ≈ 270,
  `journeys_live` ≈ 156, `teams` ≈ 150 ("live" here means published and not
  deleted/trashed/archived). A re-run against another environment will see
  different figures; sanity-check against the live counts the query above
  reports, not these numbers.
- Every mapping row has `blocks` > 0.
- **UNMAPPED section is empty.** If not, add rows to `mapping.csv`.
- TEMPLATE section lists the template journeys that keep copying these images.
  They are rewritten like any other journey, which is what stops new journeys
  inheriting d1wl.
- **Residual scan.** Anything listed other than `Block.src` is a d1wl reference
  this migration does not touch (most likely `Block.image` on video blocks). See
  step 9 before deploying the `next.config` commit.

Files written to `$RUN_DIR`: `dry-run-blocks.csv`, `dry-run-journeys.csv`,
`dry-run-revalidate.csv`.

## 4. Rehearsal (UPDATE, checks, ROLLBACK)

```bash
psqlp -f "$SCRIPTS/02-migrate.sql" | tee rehearsal.txt
```

Default behaviour is `ROLLBACK`. It runs the real UPDATE inside a transaction,
prints BEFORE and AFTER counts, runs the checks, and rolls back. Look for:

- `CHECKS PASSED.` then `ROLLED BACK (rehearsal ...)`.
- `rows_updated` equals `blocks_to_rewrite`; `d1wl_mapped_left` and
  `unmapped_d1wl_blocks` are 0; `blocks_total` is the same before and after.
- STATE NOW still shows the original numbers (nothing was kept).

It writes `before-state.rehearsal.csv`, not `before-state.csv`.

## 5. The flip: commit

```bash
psqlp -v commit=1 -f "$SCRIPTS/02-migrate.sql" | tee migrate.txt
```

The only difference from the rehearsal is `-v commit=1`. It commits only if
every check passed; otherwise it rolls back whatever you passed. Expect
`CHECKS PASSED.`, `COMMITTED.`, and STATE NOW `0 | 0`.

It also writes `before-state.csv` (every row it changed: block id, journey id,
old src, new src) and `before-state.identity.csv` (the target database,
schema, address and port, so `03-revert.sql` can refuse to run these against a
different database later). **Keep both.** The script refuses a second
`commit=1` run in a directory that already has one, so you cannot overwrite
them by accident.

The UPDATE touches ~488 rows and takes well under a second. It sets
`lock_timeout` 5s and `statement_timeout` 120s inside the transaction.
`Block.updatedAt` is intentionally not bumped.

## 6. Verify

```bash
psqlp -f "$SCRIPTS/01-dry-run.sql" | sed -n '/== Summary/,/== Journeys by status/p'
```

(`mapping.csv` must still be in the directory.) `blocks_to_rewrite` and
`unmapped_blocks` must both be 0, and the residual scan shows only what you
already knew about.

Spot check one live journey in a browser: its images render from
`imagedelivery.net`.

## 7. Revert (only if needed)

If the step 9 item 3 `next.config` change (removing the d1wl host from
`remotePatterns`) is already deployed, redeploy the previous config first.
Otherwise the images this restores to d1wl URLs return 400 from the `next/image`
optimizer, which no longer allows that host.

```bash
psqlp -f "$SCRIPTS/03-revert.sql"                 # rehearsal
psqlp -v commit=1 -f "$SCRIPTS/03-revert.sql"     # restore
```

Run from the directory containing `before-state.csv` and
`before-state.identity.csv`. It restores a block only
if its `src` is still the Cloudflare URL the migration wrote; a block someone
changed since is skipped and counted (`skipped_changed_since`). After a revert,
redo step 8.

## 8. Caches and snapshots to refresh

What was checked in the code:

- **Journeys have no stored/published snapshot of their blocks.** Published
  journeys render from the `Block` rows. The only snapshot-like data is
  `CampaignBlock` title/description text, which holds no image URLs.
  There is nothing to re-publish.
- **Journeys app (`apps/journeys`) is statically regenerated.** Journey pages
  (`/home/<slug>`, step pages, `/embed/<slug>`, and the custom-domain
  equivalents) use ISR with `revalidate: 60`, so a stale page refreshes itself
  on the first request after 60 seconds. Doing nothing is acceptable.
- **To refresh immediately** (optional), call the app's own endpoint for every
  live journey. `dry-run-revalidate.csv` has `slug,hostname` rows (empty
  hostname = `/home/<slug>`, otherwise that team custom domain; custom-domain
  rows for a journey the domain does not route simply return an error you can
  ignore):

  ```bash
  JOURNEYS_URL="$(doppler secrets get JOURNEYS_URL --project api-journeys --config prd --plain)"
  TOKEN="$(doppler secrets get JOURNEYS_REVALIDATE_ACCESS_TOKEN --project api-journeys --config prd --plain)"
  tail -n +2 dry-run-revalidate.csv | while IFS=, read -r slug hostname; do
    args=(--data-urlencode "accessToken=$TOKEN" --data-urlencode "slug=$slug")
    [ -n "$hostname" ] && args+=(--data-urlencode "hostname=$hostname")
    code=$(curl -s -o /dev/null -w '%{http_code}' -G "$JOURNEYS_URL/api/revalidate" "${args[@]}")
    echo "$code $slug ${hostname:-home}"
  done | tee revalidate.txt | awk '{print $1}' | sort | uniq -c
  ```

  Do not paste `$TOKEN` anywhere. If the app sits behind an edge cache with its
  own TTL, the api's revalidate worker waits 300ms after this call for the edge
  to pick it up; nothing in this repo sets a longer `s-maxage`.

- **`next/image` optimizer cache** is keyed by source URL. The new
  `imagedelivery.net` URLs are new keys and the old entries just age out.
  Nothing to purge.
- **Facebook / social link previews.** For journeys whose primary image was
  rewritten (`is_primary_image` in `dry-run-journeys.csv`) the `og:image` URL
  changed. Platforms that already scraped the page keep the old d1wl URL until
  they re-scrape, so some existing shared-link previews will break once the
  bucket is deleted. The API only re-scrapes Facebook on a journey edit
  (`fbReScrape`); there is no bulk path. Low impact, but know it.
- **journeys-admin** (Apollo cache in each browser) refetches on next load.
  Nothing to do.
- **Algolia:** no journey data is indexed by `api-journeys`. This repo cannot
  tell whether Algolia **video** records still carry d1wl image URLs (see
  step 9).

## 9. Deploy order for the code changes, and when to delete the bucket

The branch carries the code changes as separate commits so they can ship
independently:

1. **Allowlist (`api-journeys`)**: `updateSimpleJourney` no longer accepts
   d1wl image URLs from the AI journey path; such a URL is re-uploaded to
   Cloudflare instead. Safe to ship at any time.
2. **Fixtures/stories/specs**: no runtime effect. Safe at any time.
3. **`next.config` `remotePatterns`** (journeys, journeys-admin, player,
   resources, videos-admin): **ship only after** the migration is committed
   (step 5) **and** nothing else still renders a d1wl URL through `next/image`.
   Once the host is not in `remotePatterns`, any remaining d1wl image fails to
   render. Before shipping, confirm:
   - the step 3/6 residual scan has no d1wl in anything that renders (notably
     `Block.image` on video blocks; migrate those too if present: they are not
     covered by this script and need their own mapping), and
   - the Algolia video index and any other external data source no longer return
     d1wl image URLs (not verifiable from this repo).
4. **Delete the bucket/distribution** (core-ops plan): after the above, wait
   past the 60s ISR window plus your usual CDN TTL, and check the distribution's
   request metrics/access logs show no remaining traffic.
