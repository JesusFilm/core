#!/bin/sh
# Copies Plausible's event store from the ClickHouse StatefulSet on EKS to the
# environment's ClickHouse Cloud service and verifies it
# (../README.md, "Moving the events to ClickHouse Cloud").
#
# Usage: copy-to-cloud.sh <stage|prod> check|copy
#
#   check  Plausible may be running. Proves the push route (a TLS connection
#          from the pod to Cloud as migrator), that every source table exists
#          on Cloud with the same columns in the same order (the copy inserts
#          by position), and shows what is already on Cloud.
#   copy   Plausible must be stopped on ECS and on EKS; refuses otherwise.
#          Pushes each table, partition by partition, and compares
#          merge-independent numbers on both sides after every slice.
#          Rerunnable: a slice that already matches is skipped. A slice that
#          is on Cloud but does not match stops the run; clear it on Cloud as
#          `default` (the command is printed) and rerun.
#
# Environment:
#   CLICKHOUSE_CLOUD_HOST      the Cloud service hostname (no scheme, no port)
#   CLICKHOUSE_CLOUD_PASSWORD  the migrator user's password (users.sql)
#   kubectl's current context must be jfp-eks-<env>; aws must reach the account.
#
# Statements, and so the password, reach the pod over stdin, never argv.

set -eu

usage() {
  echo "usage: $0 <stage|prod> check|copy" >&2
  exit 2
}

[ $# -eq 2 ] || usage
env_name=$1
mode=$2
case $env_name in stage | prod) ;; *) usage ;; esac
case $mode in check | copy) ;; *) usage ;; esac

: "${CLICKHOUSE_CLOUD_HOST:?set CLICKHOUSE_CLOUD_HOST to the Cloud service hostname}"
: "${CLICKHOUSE_CLOUD_PASSWORD:?set CLICKHOUSE_CLOUD_PASSWORD to the migrator password}"
# Both end up inside single-quoted SQL literals.
case $CLICKHOUSE_CLOUD_HOST in
  *[!A-Za-z0-9.-]*)
    echo "CLICKHOUSE_CLOUD_HOST must be a bare hostname" >&2
    exit 1
    ;;
esac
case $CLICKHOUSE_CLOUD_PASSWORD in
  *[!A-Za-z0-9_-]*)
    echo "CLICKHOUSE_CLOUD_PASSWORD may only hold letters, digits, - and _" >&2
    exit 1
    ;;
esac

db=plausible_events_db
namespace=default
pod=plausible-analytics-clickhouse-0

kube_cluster=$(kubectl config view --minify -o jsonpath='{.clusters[0].name}')
case $kube_cluster in
  */jfp-eks-"$env_name" | jfp-eks-"$env_name") ;;
  *)
    echo "kubectl's current context is on '$kube_cluster', not jfp-eks-$env_name" >&2
    exit 1
    ;;
esac

errors=$(mktemp)
trap 'rm -f "$errors"' EXIT

# sql <statement>: run in the source pod, TSV on stdout. ClickHouse quotes the
# failing query in its error, remoteSecure() password and all, so errors are
# printed with the password masked.
sql() {
  if ! printf '%s\n' "$1" |
    kubectl -n "$namespace" exec -i "$pod" -- clickhouse-client --format TSV 2>"$errors"; then
    sed "s/$CLICKHOUSE_CLOUD_PASSWORD/***/g" "$errors" >&2
    return 1
  fi
}

cloud() {
  printf "remoteSecure('%s:9440', '%s', '%s', 'migrator', '%s')" \
    "$CLICKHOUSE_CLOUD_HOST" "$1" "$2" "$CLICKHOUSE_CLOUD_PASSWORD"
}

# Numbers that do not depend on how far background merges have got on either
# side: raw count() does on the collapsing and summing tables.
metrics() {
  case $1 in
    events_v2) echo "count(), sum(cityHash64(session_id, timestamp, name, pathname))" ;;
    sessions_v2) echo "sum(sign), sum(sign * pageviews), sum(sign * events)" ;;
    ingest_counters) echo "sum(value), uniqExact(domain, metric, toStartOfMinute(event_timebucket))" ;;
    schema_migrations) echo "count(), max(version)" ;;
    *) echo "count()" ;;
  esac
}

# The partition key, so a slice is one source partition. Unpartitioned tables
# are one slice.
partition_key() {
  case $1 in
    events_v2) echo "toYYYYMM(timestamp)" ;;
    sessions_v2) echo "toYYYYMM(start)" ;;
    *) echo "" ;;
  esac
}

source_numbers() { sql "SELECT $(metrics "$1") FROM $db.$1 WHERE $2"; }
cloud_numbers() { sql "SELECT $(metrics "$1") FROM $(cloud "$db" "$1") WHERE $2"; }

# A failed command substitution inside echo or a for list does not trip set -e,
# so every query result is assigned before it is used.
check() {
  failed=0
  all_tables=$(sql "SELECT name FROM system.tables WHERE database = '$db' ORDER BY name")
  for table in $all_tables; do
    columns="SELECT groupArray((name, type)) FROM (SELECT name, type FROM system.columns WHERE database = '$db' AND table = '$table' ORDER BY position)"
    source_columns=$(sql "$columns")
    cloud_columns=$(sql "SELECT groupArray((name, type)) FROM (SELECT name, type FROM $(cloud system columns) WHERE database = '$db' AND table = '$table' ORDER BY position)")
    if [ "$source_columns" != "$cloud_columns" ]; then
      echo "  $table: columns differ on Cloud (missing table, or schema.sql is stale)"
      failed=1
      continue
    fi
    on_cloud=$(cloud_numbers "$table" 1)
    echo "  $table: columns match; on Cloud now: $on_cloud"
  done
  [ $failed -eq 0 ] || exit 1
}

require_stopped() {
  counts=$(aws ecs describe-services --cluster "jfp-ecs-cluster-$env_name" \
    --services "plausible-$env_name-service" \
    --query 'services[0].[desiredCount,runningCount,pendingCount]' --output text)
  set -- $counts
  if [ "$1 $2 $3" != "0 0 0" ]; then
    echo "ECS plausible-$env_name-service has desired/running/pending $1/$2/$3; stop it first" >&2
    exit 1
  fi
  eks_pods=$(kubectl -n "$namespace" get pods -l app.kubernetes.io/name=plausible-analytics -o name)
  if [ -n "$eks_pods" ]; then
    echo "Plausible still has pods on EKS: $eks_pods" >&2
    exit 1
  fi
}

copy_slice() {
  table=$1
  where=$2
  label=$3
  source=$(source_numbers "$table" "$where")
  target=$(cloud_numbers "$table" "$where")
  if [ "$source" = "$target" ]; then
    echo "  $label: on Cloud already ($source)"
    return
  fi
  rows_on_cloud=$(sql "SELECT count() FROM $(cloud "$db" "$table") WHERE $where")
  if [ "$rows_on_cloud" != 0 ]; then
    echo "  $label: partly on Cloud (source $source, Cloud $target). As default on Cloud run" >&2
    echo "    DELETE FROM $db.$table WHERE $where" >&2
    echo "  then rerun." >&2
    exit 1
  fi
  started=$(date +%s)
  sql "INSERT INTO FUNCTION $(cloud "$db" "$table") SELECT * FROM $db.$table WHERE $where"
  target=$(cloud_numbers "$table" "$where")
  if [ "$source" != "$target" ]; then
    echo "  $label: MISMATCH after copy (source $source, Cloud $target)" >&2
    exit 1
  fi
  echo "  $label: copied in $(($(date +%s) - started))s ($source)"
}

copy() {
  require_stopped
  check
  # Tables that hold rows on the source, biggest first. Empty leftovers
  # (events, sessions, imported_* with nothing imported) exist on Cloud from
  # schema.sql and need no copy. TinyLog reports no row count.
  tables=$(sql "SELECT name FROM system.tables WHERE database = '$db' AND (total_rows > 0 OR engine = 'TinyLog') ORDER BY total_bytes DESC")
  copy_started=$(date +%s)
  for table in $tables; do
    key=$(partition_key "$table")
    echo "$table"
    if [ -z "$key" ]; then
      copy_slice "$table" 1 "$table"
      continue
    fi
    partitions=$(sql "SELECT DISTINCT $key AS p FROM $db.$table ORDER BY p")
    for partition in $partitions; do
      copy_slice "$table" "$key = $partition" "$table $partition"
    done
  done

  echo
  echo "Whole tables, source | Cloud:"
  mismatch=0
  for table in $tables; do
    source=$(source_numbers "$table" 1)
    target=$(cloud_numbers "$table" 1)
    [ "$source" = "$target" ] && verdict=ok || {
      verdict=MISMATCH
      mismatch=1
    }
    printf '  %-20s %s | %s  %s\n' "$table" "$source" "$target" "$verdict"
  done
  echo "Copy took $(($(date +%s) - copy_started))s."
  [ $mismatch -eq 0 ] || exit 1
}

case $mode in
  check) check ;;
  copy) copy ;;
esac
