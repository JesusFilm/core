#!/bin/sh
# One-off cleanup of the EBS snapshots SnapScheduler left behind for the
# Plausible ClickHouse volumes. The VolumeSnapshotClass uses
# deletionPolicy: Retain, so SnapScheduler's maxCount pruned the Kubernetes
# VolumeSnapshot objects but never the EBS snapshots under them. Retention is
# now enforced by the DLM policy in modules/aws/ebs-snapshot-policy, which only
# ever deletes snapshots it created itself; this script clears the backlog.
#
# The same Retain policy left one orphaned VolumeSnapshotContent per pruned
# snapshot (its VolumeSnapshot is gone). Each deleted EBS snapshot's orphaned
# content object is deleted first, so the cluster stops tracking it.
#
# Usage: cleanup-csi-snapshots.sh <stage|prod> [--execute]
#
# Dry run by default: prints what would be deleted. Pass --execute to delete.
#
# Never deletes:
#   - snapshots DLM created (they carry an aws:dlm:lifecycle-policy-id tag)
#   - snapshots bound to a VolumeSnapshot that still exists
#   - the newest KEEP CSI snapshots of each volume (default 3)
#
# Environment:
#   KEEP        newest CSI snapshots to keep per volume (default 3)
#   LIMIT       delete at most this many snapshots, for a trial run (default: all)
#   KUBECONTEXT kubectl context for the cluster (default: the env name)
#   PVC_NAMES   space-separated PVC names (default: both ClickHouse PVCs)

set -eu

usage() {
  echo "usage: $0 <stage|prod> [--execute]" >&2
  exit 2
}

[ $# -ge 1 ] || usage
env_name=$1
case $env_name in
  stage | prod) ;;
  *) usage ;;
esac

execute=false
if [ $# -ge 2 ]; then
  [ "$2" = "--execute" ] || usage
  execute=true
fi

keep=${KEEP:-3}
limit=${LIMIT:-0}
for number in "$keep" "$limit"; do
  case $number in
    '' | *[!0-9]*)
      echo "KEEP and LIMIT must be non-negative integers" >&2
      exit 2
      ;;
  esac
done

cluster_name="jfp-eks-$env_name"
kube_context=${KUBECONTEXT:-$env_name}
pvc_names=${PVC_NAMES:-"plausible-analytics-clickhouse-data-plausible-analytics-clickhouse-0 plausible-analytics-clickhouse-replica-data-plausible-analytics-clickhouse-replica-0"}

for tool in aws kubectl jq; do
  command -v "$tool" >/dev/null 2>&1 || {
    echo "$tool is required" >&2
    exit 1
  }
done

work_dir=$(mktemp -d)
trap 'rm -rf "$work_dir"' EXIT INT TERM

# Guard against a kubectl context that points at the other cluster: the
# VolumeSnapshotContent exclusion below is only meaningful for the right one.
context_cluster=$(kubectl config view -o json |
  jq -r --arg ctx "$kube_context" '.contexts[] | select(.name == $ctx) | .context.cluster')
case $context_cluster in
  */"$cluster_name") ;;
  *)
    echo "kubectl context '$kube_context' points at '$context_cluster', not $cluster_name" >&2
    exit 1
    ;;
esac

node_ids=$(aws ec2 describe-instances \
  --filters "Name=tag:eks:cluster-name,Values=$cluster_name" "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].InstanceId' --output text | tr '\t' ',')
[ -n "$node_ids" ] || {
  echo "no running nodes in $cluster_name" >&2
  exit 1
}

pvc_filter=$(echo "$pvc_names" | tr ' ' ',')
volume_ids=$(aws ec2 describe-volumes \
  --filters "Name=tag:kubernetes.io/created-for/pvc/name,Values=$pvc_filter" "Name=attachment.instance-id,Values=$node_ids" \
  --query 'Volumes[].VolumeId' --output text)
[ -n "$volume_ids" ] || {
  echo "no ClickHouse volumes attached to $cluster_name nodes" >&2
  exit 1
}

# snapshot id -> VolumeSnapshotContent name, for every content object.
kubectl --context "$kube_context" get volumesnapshotcontents -o json |
  jq -r '.items[] | select(.status.snapshotHandle != null)
    | [.status.snapshotHandle, .metadata.name] | @tsv' >"$work_dir/contents"

# Snapshot ids a live VolumeSnapshot is bound to (through its content object).
kubectl --context "$kube_context" get volumesnapshots --all-namespaces -o json |
  jq -r '.items[].status.boundVolumeSnapshotContentName // empty' >"$work_dir/bound_contents"
awk -F '\t' 'FILENAME == ARGV[1] { bound[$1] = 1; next } $2 in bound { print $1 }' \
  "$work_dir/bound_contents" "$work_dir/contents" >"$work_dir/in_use"

candidates="$work_dir/candidates"
: >"$candidates"

for volume_id in $volume_ids; do
  # Newest first; CSI-created only; DLM-created excluded.
  aws ec2 describe-snapshots --owner-ids self \
    --filters "Name=volume-id,Values=$volume_id" "Name=status,Values=completed" \
      "Name=description,Values=Created by AWS EBS CSI driver for volume $volume_id" \
    --output json |
    jq -r '.Snapshots
      | map(select(((.Tags // []) | map(.Key) | index("aws:dlm:lifecycle-policy-id")) == null))
      | sort_by(.StartTime) | reverse | .[]
      | [.SnapshotId, .StartTime, .VolumeSize] | @tsv' >"$work_dir/volume"

  total=$(wc -l <"$work_dir/volume" | tr -d ' ')
  # Appends the orphaned content object's name, or "-" when there is none.
  tail -n "+$((keep + 1))" "$work_dir/volume" |
    awk -F '\t' -v OFS='\t' '
      FILENAME == ARGV[1] { in_use[$1] = 1; next }
      FILENAME == ARGV[2] { content[$1] = $2; next }
      !($1 in in_use) { print $0, ($1 in content ? content[$1] : "-") }
    ' "$work_dir/in_use" "$work_dir/contents" - >"$work_dir/volume_candidates"
  count=$(wc -l <"$work_dir/volume_candidates" | tr -d ' ')
  oldest=$(tail -n 1 "$work_dir/volume_candidates" | cut -f 2)
  newest=$(head -n 1 "$work_dir/volume_candidates" | cut -f 2)

  echo "$volume_id: $total CSI snapshots, deleting $count (${oldest:-none} .. ${newest:-none})"
  cat "$work_dir/volume_candidates" >>"$candidates"
done

total_candidates=$(wc -l <"$candidates" | tr -d ' ')
orphaned_contents=$(awk -F '\t' '$4 != "-"' "$candidates" | wc -l | tr -d ' ')
echo "snapshots bound to a live VolumeSnapshot (never deleted): $(wc -l <"$work_dir/in_use" | tr -d ' ')"
echo "total to delete in $env_name: $total_candidates EBS snapshots, $orphaned_contents orphaned VolumeSnapshotContents"

if [ "$execute" != true ]; then
  echo "dry run; re-run with --execute to delete"
  exit 0
fi

if [ "$limit" -gt 0 ]; then
  head -n "$limit" "$candidates" >"$work_dir/limited"
  candidates="$work_dir/limited"
  total_candidates=$(wc -l <"$candidates" | tr -d ' ')
  echo "LIMIT=$limit: deleting $total_candidates"
fi

deleted=0
failed=0
while IFS="$(printf '\t')" read -r snapshot_id _start_time _size content_name; do
  # Content first: if it cannot be removed, keep the snapshot it points to.
  if [ "$content_name" != "-" ] &&
    ! kubectl --context "$kube_context" delete volumesnapshotcontent "$content_name" \
      --timeout=60s >/dev/null 2>"$work_dir/error"; then
    failed=$((failed + 1))
    echo "failed $content_name ($snapshot_id): $(cat "$work_dir/error")" >&2
  elif aws ec2 delete-snapshot --snapshot-id "$snapshot_id" 2>"$work_dir/error"; then
    deleted=$((deleted + 1))
  else
    failed=$((failed + 1))
    echo "failed $snapshot_id: $(cat "$work_dir/error")" >&2
  fi
  if [ $(((deleted + failed) % 100)) -eq 0 ]; then
    echo "progress: $((deleted + failed))/$total_candidates"
  fi
done <"$candidates"

echo "deleted $deleted, failed $failed"
[ "$failed" -eq 0 ]
