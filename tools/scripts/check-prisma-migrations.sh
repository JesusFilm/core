#!/bin/bash
set -euo pipefail

# CI guard (ENG-3690): a PR that changes a Prisma schema must add a migration
# in the same domain. `prisma generate` succeeds without one, so a schema
# change with no migration otherwise sails through CI and only explodes at
# deploy time against prod.
#
# Usage: check-prisma-migrations.sh <base-ref>
#   e.g. check-prisma-migrations.sh origin/main
#
# Assumes a clean checkout of the commit under test (as in CI). Changes are
# diffed from merge-base(<base-ref>, HEAD) to HEAD, so commits already on the
# base branch are never blamed on the PR. A migration counts only when a new
# non-empty */migration.sql is added in the same domain. The SQL content is
# not validated against the schema diff — that would require
# `prisma migrate diff` and a shadow database.
#
# Domains are discovered from libs/prisma/*/db/schema.prisma, so a new domain
# is guarded automatically (its initial migration is required) and a domain
# deleted by the PR is not flagged.
#
# Escape hatch: the 'skip-migration-check' PR label, handled entirely by the
# calling workflow — see .github/workflows/main.yml.

BASE_REF="${1:?usage: check-prisma-migrations.sh <base-ref>}"

if ! MERGE_BASE=$(git merge-base "$BASE_REF" HEAD); then
  echo "🛑 - could not compute merge-base($BASE_REF, HEAD)."
  echo "The checkout is likely shallow — this check needs full history (fetch-depth: 0)."
  exit 1
fi

FAILED_DOMAINS=()
for schema in libs/prisma/*/db/schema.prisma; do
  [ -f "$schema" ] || continue
  domain=$(basename "$(dirname "$(dirname "$schema")")")

  # The analytics database is managed externally and its schema is pulled via
  # `nx prisma-introspect prisma-analytics` — it has no prisma-migrate target
  # and no migrations directory (see apis/AGENTS.md).
  if [ "$domain" = "analytics" ]; then
    continue
  fi
  migrations="libs/prisma/$domain/db/migrations"

  if git diff --quiet "$MERGE_BASE" HEAD -- "$schema"; then
    continue
  fi

  # Only a real, deployable migration counts — a new */migration.sql — not
  # just any file added under the migrations directory (e.g. a README).
  # --no-renames so a moved or replaced migration registers as added at its
  # new path; core.quotePath=false keeps non-ASCII names usable as paths.
  added_migrations=$(git -c core.quotePath=false diff --name-only --no-renames --diff-filter=A "$MERGE_BASE" HEAD -- "$migrations/*/migration.sql")
  if [ -z "$added_migrations" ]; then
    echo "🛑 - $schema changed but no migration was added in $migrations"
    FAILED_DOMAINS+=("$domain")
    continue
  fi

  # Reject empty/whitespace-only files created just to satisfy this check.
  empty_migrations=""
  while IFS= read -r f; do
    if ! grep -q '[^[:space:]]' "$f"; then
      empty_migrations+="$f"$'\n'
    fi
  done <<<"$added_migrations"
  if [ -n "$empty_migrations" ]; then
    echo "🛑 - $schema changed but the added migration(s) are empty:"
    printf '%s' "$empty_migrations" | sed 's/^/      /'
    FAILED_DOMAINS+=("$domain")
    continue
  fi

  echo "✅ - $schema changed and new migration(s) added:"
  echo "$added_migrations" | sed 's/^/      /'
done

if [ "${#FAILED_DOMAINS[@]}" -gt 0 ]; then
  echo ""
  echo "A schema.prisma change must ship with a non-empty migration in the"
  echo "same domain. To fix, run:"
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
