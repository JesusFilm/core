/**
 * Next.js 15 / Node 24 dev-server stability workaround — not real
 * instrumentation.
 *
 * Without this file, `nx serve journeys` exits cleanly (code 0) shortly after
 * serving the initial page + `/api/flags` request — Nx reports
 * "Successfully ran target serve" and the dev server dies. Reproduced 3/3
 * on Next 15.5.7 + Node v24.14.0 in this repo.
 *
 * Creating `instrumentation.ts` and exporting an (even empty) `register()`
 * function triggers Next's instrumentation hook and prevents the shutdown.
 * Confirmed empirically: with this file the server stays up across many
 * runs; deleting it brings the exit back.
 *
 * Root cause inside Next/Node has not been isolated — listeners that log AND
 * re-exit still stabilise the process, so it's not a catchable signal or
 * unhandled-rejection being suppressed by handlers. Likely a behaviour
 * branch in Next's dev server that only runs when no instrumentation hook
 * is registered.
 *
 * Safe to delete once upgrading Node / Next resolves the underlying
 * behaviour. Revisit when bumping either.
 */
export async function register(): Promise<void> {
  // intentionally empty — presence of the register export is the workaround
}
