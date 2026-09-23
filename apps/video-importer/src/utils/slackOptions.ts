// Commander's `--no-slack` negatable boolean option surfaces as `options.slack
// === false` (default true) — NOT `options.noSlack`. Centralized here after a
// packaged-executable smoke test showed `--no-slack` had no effect: the
// original inline checks read `options.noSlack`, which commander never sets.
export function shouldPostSlackSummary(options: {
  dryRun?: boolean
  slack?: boolean
}): boolean {
  return options.dryRun !== true && options.slack !== false
}
