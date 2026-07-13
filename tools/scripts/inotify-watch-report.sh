#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  tools/scripts/inotify-watch-report.sh
  tools/scripts/inotify-watch-report.sh --watch [interval_seconds]

Reports Linux inotify usage by process. --watch keeps sampling so transient
watch spikes are visible while reproducing Cursor/Next watcher failures.
USAGE
}

mode="once"
interval="2"
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
elif [[ "${1:-}" == "--watch" ]]; then
  mode="watch"
  interval="${2:-2}"
fi

collect_report() {
  local limit_file=/proc/sys/fs/inotify/max_user_watches
  local instance_limit_file=/proc/sys/fs/inotify/max_user_instances
  local watch_limit="unknown"
  local instance_limit="unknown"
  [[ -r "$limit_file" ]] && watch_limit=$(<"$limit_file")
  [[ -r "$instance_limit_file" ]] && instance_limit=$(<"$instance_limit_file")

  local tmp_file
  tmp_file=$(mktemp)
  local permission_denied=0
  local fdinfo_seen=0

  for fdinfo in /proc/[0-9]*/fdinfo/*; do
    [[ -e "$fdinfo" ]] || continue

    if [[ ! -r "$fdinfo" ]]; then
      permission_denied=$((permission_denied + 1))
      continue
    fi

    if ! grep -q '^inotify' "$fdinfo" 2>/dev/null; then
      continue
    fi

    fdinfo_seen=$((fdinfo_seen + 1))
    local pid=${fdinfo#/proc/}
    pid=${pid%%/*}
    local count
    count=$(grep -c '^inotify' "$fdinfo" 2>/dev/null || true)
    local cmd
    cmd=$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null || true)
    if [[ -z "$cmd" ]]; then
      cmd=$(cat "/proc/$pid/comm" 2>/dev/null || echo unknown)
    fi

    printf '%s\t%s\t%s\n' "$count" "$pid" "$cmd" >> "$tmp_file"
  done

  local total instances percent instance_percent
  total=$(awk -F '\t' '{sum += $1} END {print sum + 0}' "$tmp_file")
  instances=$(wc -l < "$tmp_file" | tr -d ' ')
  percent="unknown"
  instance_percent="unknown"
  if [[ "$watch_limit" =~ ^[0-9]+$ ]] && [[ "$watch_limit" -gt 0 ]]; then
    percent=$(awk -v used="$total" -v limit="$watch_limit" 'BEGIN { printf "%.1f%%", used * 100 / limit }')
  fi
  if [[ "$instance_limit" =~ ^[0-9]+$ ]] && [[ "$instance_limit" -gt 0 ]]; then
    instance_percent=$(awk -v used="$instances" -v limit="$instance_limit" 'BEGIN { printf "%.1f%%", used * 100 / limit }')
  fi

  cat <<REPORT
inotify watch report
====================
timestamp: $(date -Is)
watch descriptors used: $total / $watch_limit ($percent)
inotify instances used: $instances / $instance_limit ($instance_percent)
inotify fdinfo entries seen: $fdinfo_seen
unreadable fdinfo entries: $permission_denied

Top processes by watch descriptor count:
REPORT

  if [[ ! -s "$tmp_file" ]]; then
    echo 'No readable inotify watchers found.'
    rm -f "$tmp_file"
    return 0
  fi

  sort -t $'\t' -k1,1nr "$tmp_file" |
    awk -F '\t' 'NR <= 40 {
      cmd=$3
      if (length(cmd) > 180) cmd=substr(cmd, 1, 177) "..."
      printf "%8d  pid=%-8s  %s\n", $1, $2, cmd
    }'

  rm -f "$tmp_file"
}

if [[ "$mode" == "watch" ]]; then
  while true; do
    collect_report
    printf '\n%s\n\n' '---'
    sleep "$interval"
  done
else
  collect_report
  cat <<'REPORT'

Interpretation:
- The count is watched paths, not file descriptors. One process can hold one inotify FD and thousands of watches.
- If unreadable fdinfo entries is high, rerun with sudo or from the same user/session as Cursor/dev servers.
- If the total is far below max_user_watches but failures still say watch limit reached, suspect max_user_instances, per-process limits, remote/container boundaries, or a short-lived process that crashed and released its watches before this report ran.
REPORT
fi
