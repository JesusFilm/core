#!/usr/bin/env bash
# Enrol the warp-prod container into the Zero Trust org (interactive SSO).
# Run on the host, in a terminal: ./enroll.sh
#
# The login token expires in about a minute, so nothing has to be pasted by
# hand. While this runs, three things can deliver it to the container:
#   1. the success page's redirect / "Open WARP" button, through a temporary
#      handler for the com.cloudflare.warp:// scheme;
#   2. copying the com.cloudflare.warp:// link (wl-paste is polled);
#   3. pasting the link at the hidden prompt, as a last resort.
# The temporary handler is the only thing touched outside this directory: one
# .desktop file in ~/.local/share/applications and one line in
# ~/.config/mimeapps.list. Both are restored on exit.
set -euo pipefail

container="${WARP_CONTAINER:-warp-prod}"
team="${WARP_TEAM:-jfp}"
docker_bin="${DOCKER:-docker}"
timeout_s="${WARP_ENROLL_TIMEOUT:-600}"

scheme="com.cloudflare.warp"
mime="x-scheme-handler/${scheme}"
desktop_id="warp-container-enroll.desktop"
apps_dir="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
mimeapps="${XDG_CONFIG_HOME:-$HOME/.config}/mimeapps.list"

work=""
handler_installed=""

warp() { "$docker_bin" exec "$container" warp-cli --accept-tos "$@"; }

# Value of the explicit [Default Applications] entry for the scheme, if any.
explicit_default() {
  [[ -f "$mimeapps" ]] || return 0
  awk -v key="$mime" '
    /^\[/ { in_defaults = ($0 == "[Default Applications]"); next }
    in_defaults && index($0, key "=") == 1 { print substr($0, length(key) + 2); exit }
  ' "$mimeapps"
}

# Drop the scheme's explicit default, or set it to $1 when non-empty. Writes
# through the existing file so a symlink or hard link survives.
set_explicit_default() {
  local value="${1:-}" tmp
  if [[ -n "$value" ]]; then
    xdg-mime default "$value" "$mime"
    return 0
  fi
  [[ -f "$mimeapps" ]] || return 0
  tmp="$(mktemp)"
  awk -v key="$mime" '
    /^\[/ { in_defaults = ($0 == "[Default Applications]") }
    in_defaults && index($0, key "=") == 1 { next }
    { print }
  ' "$mimeapps" >"$tmp"
  cat "$tmp" >"$mimeapps"
  rm -f "$tmp"
}

restore_handler() {
  local previous=""
  if [[ -f "$apps_dir/$desktop_id" ]]; then
    previous="$(sed -n 's/^X-Previous-Explicit=//p' "$apps_dir/$desktop_id")"
    rm -f "$apps_dir/$desktop_id"
  fi
  if [[ -n "$handler_installed" ]]; then
    set_explicit_default "$previous"
  fi
  handler_installed=""
  [[ -z "$work" ]] || rm -rf "$work"
  work=""
}

# A previous run killed with SIGKILL leaves its handler behind; undo that first.
recover_stale_handler() {
  [[ -f "$apps_dir/$desktop_id" ]] || return 0
  echo "removing a handler left behind by an earlier run"
  handler_installed=stale
  restore_handler
}

# The script the browser (or the clipboard poller) runs with the URL. It logs
# only status, never the URL: the token is a credential.
write_submit_script() {
  cat >"$work/submit-token" <<EOF
#!/usr/bin/env bash
url="\${1:-}"
case "\$url" in
  ${scheme}://${team}.cloudflareaccess.com/*) ;;
  *) echo "ignored a URL that is not for team ${team}" | tee -a "$work/log" >&2; exit 0 ;;
esac
if "$docker_bin" exec "$container" warp-cli --accept-tos registration token "\$url" >>"$work/log" 2>&1; then
  : >"$work/submitted"
else
  : >"$work/failed"
fi
EOF
  chmod 700 "$work/submit-token"
}

install_handler() {
  local previous
  previous="$(explicit_default)"
  mkdir -p "$apps_dir"
  cat >"$apps_dir/$desktop_id" <<EOF
[Desktop Entry]
Type=Application
Name=WARP container enrolment (temporary)
Exec=$work/submit-token %u
NoDisplay=true
StartupNotify=false
MimeType=${mime};
X-Previous-Explicit=${previous}
EOF
  handler_installed=1
  xdg-mime default "$desktop_id" "$mime"
}

clipboard() { wl-paste --no-newline --type text 2>/dev/null || true; }

# Poll until a token has been accepted: handler, clipboard, or typed paste.
wait_for_token() {
  local deadline=$((SECONDS + timeout_s)) seen="" clip="" buf="" chunk="" rc
  local use_clipboard="" use_prompt=""
  [[ -n "${WAYLAND_DISPLAY:-}" ]] && command -v wl-paste >/dev/null && use_clipboard=1
  [[ -t 0 ]] && use_prompt=1
  # Ignore whatever is on the clipboard now; only act on something copied later.
  [[ -z "$use_clipboard" ]] || seen="$(clipboard)"

  echo
  echo "1. Open the login URL printed above and finish the SSO login."
  echo "2. On the success page click \"Open WARP\" (or let the page redirect)."
  [[ -z "$use_clipboard" ]] || echo "   Or copy the com.cloudflare.warp:// link; the clipboard is being watched."
  [[ -z "$use_prompt" ]] || echo "   Last resort: paste the link here and press Enter (input is hidden)."

  while (( SECONDS < deadline )); do
    [[ -e "$work/submitted" ]] && return 0
    if [[ -e "$work/failed" ]]; then
      rm -f "$work/failed"
      echo "the token was rejected (often it has expired; see $work/log): repeat step 2, reloading the success page first" >&2
    fi

    if [[ -n "$use_clipboard" ]]; then
      clip="$(clipboard)"
      if [[ "$clip" != "$seen" && "$clip" == "${scheme}://"* ]]; then
        seen="$clip"
        "$work/submit-token" "$clip"
        continue
      fi
    fi

    if [[ -n "$use_prompt" ]]; then
      rc=0
      IFS= read -rs -t 0.3 chunk || rc=$?
      if (( rc == 0 )); then
        "$work/submit-token" "$buf$chunk"
        buf=""
      elif (( rc > 128 )); then
        buf+="$chunk" # timed out mid-line: keep the partial input
      else
        use_prompt="" # stdin closed
      fi
    else
      sleep 0.3
    fi
  done
  echo "timed out after ${timeout_s}s waiting for the token" >&2
  return 1
}

main() {
  trap restore_handler EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM

  recover_stale_handler
  work="$(mktemp -d "${XDG_RUNTIME_DIR:-/tmp}/warp-enroll.XXXXXX")"
  write_submit_script
  install_handler

  # Drop the consumer registration the upstream entrypoint created on first start.
  warp registration delete || true
  warp registration new "$team"

  wait_for_token
  echo "token accepted; connecting"
  warp connect

  local status
  for _ in $(seq 1 30); do
    # Not `warp status | grep -q`: grep exiting early would SIGPIPE the left side under pipefail.
    status="$(warp status || true)"
    if [[ "$status" == *Connected* ]]; then
      warp registration show | grep -E '^(Account type|Organization)'
      return 0
    fi
    sleep 1
  done
  warp status || true
  echo "not connected after 30s" >&2
  return 1
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main "$@"
fi
