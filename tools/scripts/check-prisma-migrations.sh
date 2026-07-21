#!/bin/bash
set -euo pipefail

# CI guard (ENG-3690): a PR that changes a Prisma schema must add a migration
# in the same domain. `prisma generate` succeeds without one, so a schema
# change with no migration otherwise sails through CI and only explodes at
# deploy time against prod.
#
# Usage: check-prisma-migrations.sh <base-ref> [head-ref]
#   e.g. check-prisma-migrations.sh origin/main
#
# Changes are diffed from merge-base(<base-ref>, <head-ref>) to <head-ref>, so
# commits already on the base branch are never blamed on the PR. A migration
# counts only when a *new* <timestamp>_<name>/migration.sql is added under the
# domain's migrations directory (--diff-filter=A) — edits to already-committed
# migrations don't count, and neither do other added files (e.g. a README).
#
# Escape hatch: schema edits that genuinely need no migration (comments,
# formatting, attributes that don't affect the database) can add the
# 'skip-migration-check' PR label, which skips this job entirely (see
# .github/workflows/main.yml), then re-run the failed job.
#
# The analytics domain is deliberately excluded: its database is managed
# externally and its schema is pulled via `nx prisma-introspect
# prisma-analytics` — it has no prisma-migrate target and no migrations
# directory (see apis/AGENTS.md).
DOMAINS=(journeys languages media users)

BASE_REF="${1:?usage: check-prisma-migrations.sh <base-ref> [head-ref]}"
HEAD_REF="${2:-HEAD}"
MERGE_BASE=$(git merge-base "$BASE_REF" "$HEAD_REF")

FAILED_DOMAINS=()
for domain in "${DOMAINS[@]}"; do
  schema="libs/prisma/$domain/db/schema.prisma"
  migrations="libs/prisma/$domain/db/migrations"

  if git diff --quiet "$MERGE_BASE" "$HEAD_REF" -- "$schema"; then
    continue
  fi

  # Only a real, deployable migration counts — a new */migration.sql — not
  # just any file added under the migrations directory (e.g. a README).
  added_migrations=$(git diff --name-only --diff-filter=A "$MERGE_BASE" "$HEAD_REF" -- "$migrations/*/migration.sql")
  if [ -z "$added_migrations" ]; then
    echo "🛑 - $schema changed but no migration was added in $migrations"
    FAILED_DOMAINS+=("$domain")
  else
    echo "✅ - $schema changed and new migration(s) added:"
    echo "$added_migrations" | sed 's/^/      /'
  fi
done

if [ "${#FAILED_DOMAINS[@]}" -gt 0 ]; then
  echo ""
  echo "A schema.prisma change must ship with a migration in the same domain."
  echo "To fix, run:"
  for domain in "${FAILED_DOMAINS[@]}"; do
    echo "  nx prisma-migrate prisma-$domain"
  done
  echo "and commit the generated migration directory."
  echo ""
  echo "If this change genuinely needs no migration (comments, formatting,"
  echo "attributes that don't affect the database), add the"
  echo "'skip-migration-check' label to the PR and re-run this job."
  exit 1
fi

echo "✅ - all changed prisma schemas have matching migrations"
