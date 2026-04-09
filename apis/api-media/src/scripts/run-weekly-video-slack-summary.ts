/**
 * Manual trigger for the weekly video Slack summary (same logic as the worker).
 *
 * Usage (from repo root — nx runs prisma-generate first):
 *   pnpm exec nx run api-media:run-weekly-video-slack-summary
 *
 * Or with tsx directly (generate client first: nx run prisma-media:prisma-generate):
 *   set -a && source apis/api-media/.env && set +a && pnpm exec tsx --tsconfig apis/api-media/tsconfig.app.json apis/api-media/src/scripts/run-weekly-video-slack-summary.ts
 *
 * Optional: fake "as of" date so an older video counts as created in-window:
 *   ... run-weekly-video-slack-summary.ts 2026-03-20T12:00:00.000Z
 *
 * Window is [asOf - 7d, asOf] for the message; created list is createdAt >= asOf - 7d.
 */
import { sendWeeklyVideoSummary } from '../lib/videoSlack'

const iso = process.argv[2]
const asOf = iso != null ? new Date(iso) : new Date()

if (Number.isNaN(asOf.getTime())) {
  console.error('Invalid date. Pass an ISO-8601 string, e.g. 2026-03-20T12:00:00.000Z')
  process.exit(1)
}

async function main(): Promise<void> {
  await sendWeeklyVideoSummary(asOf)
  console.log('sendWeeklyVideoSummary finished')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
