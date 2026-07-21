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
# counts only when a non-empty <timestamp>_<name>/migration.sql is added under
# the domain's migrations directory (--diff-filter=A, --no-renames so a
# delete+re-add or moved migration still counts at its new path) — edits to
# already-committed migrations don't count, and neither do other added files
# (e.g. a README). The SQL content itself is not validated against the schema
# diff — that would require `prisma migrate diff` and a shadow database.
#
# Domains are discovered from libs/prisma/*/db/schema.prisma at <head-ref>, so
# a newly added domain is guarded automatically (its initial migration is
# required) and a domain deleted by the PR is not flagged.
#
# Escape hatch: the 'skip-migration-check' PR label, handled entirely by the
# calling workflow — see .github/workflows/main.yml.
#
# The analytics domain is deliberately excluded: its database is managed
# externally and its schema is pulled via `nx prisma-introspect
# prisma-analytics` — it has no prisma-migrate target and no migrations
# directory (see apis/AGENTS.md).
EXCLUDED_DOMAINS=(analytics)

BASE_REF="${1:?usage: check-prisma-migrations.sh <base-ref> [head-ref]}"
HEAD_REF="${2:-HEAD}"

if ! MERGE_BASE=$(git merge-base "$BASE_REF" "$HEAD_REF"); then
  echo "🛑 - could not compute merge-base($BASE_REF, $HEAD_REF)."
  echo "The checkout is likely shallow — this check needs full history (fetch-depth: 0)."
  exit 1
fi

FAILED_DOMAINS=()
for schema in $(git ls-tree -r --name-only "$HEAD_REF" libs/prisma | grep -E '^libs/prisma/[^/]+/db/schema\.prisma$'); do
  domain=$(basename "$(dirname "$(dirname "$schema")")")
  if [[ " ${EXCLUDED_DOMAINS[*]} " == *" $domain "* ]]; then
    continue
  fi
  migrations="libs/prisma/$domain/db/migrations"

  if git diff --quiet "$MERGE_BASE" "$HEAD_REF" -- "$schema"; then
    continue
  fi

  # Only a real, deployable migration counts — a new */migration.sql — not
  # just any file added under the migrations directory (e.g. a README).
  # core.quotePath=false keeps non-ASCII migration names usable as paths.
  added_migrations=$(git -c core.quotePath=false diff --name-only --no-renames --diff-filter=A "$MERGE_BASE" "$HEAD_REF" -- "$migrations/*/migration.sql")
  if [ -z "$added_migrations" ]; then
    echo "🛑 - $schema changed but no migration was added in $migrations"
    FAILED_DOMAINS+=("$domain")
    continue
  fi

  # Read each blob into a variable rather than piping into grep -q: grep
  # exiting early would SIGPIPE git cat-file on large files and, under
  # pipefail, misreport a real migration as empty. A genuine cat-file
  # failure aborts the script loudly here (set -e) instead.
  empty_migrations=""
  while IFS= read -r f; do
    content=$(git cat-file blob "$HEAD_REF:$f")
    if [[ ! "$content" =~ [^[:space:]] ]]; then
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
