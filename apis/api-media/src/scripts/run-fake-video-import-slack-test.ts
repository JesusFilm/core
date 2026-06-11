/**
 * Sends real Slack failure notifications for a fake video import flow.
 *
 * Usage from repo root after loading api-media Slack env:
 *
 *   pnpm exec nx run api-media:fake-video-import-slack-test -- --send
 *
 * Optional:
 *   --scenario=all|r2|mux|queue|variant
 *   --video-id=<id>
 *
 * This script does not create DB, R2, or Mux records. It only exercises the
 * issue-reporting Slack notification helper with realistic fake import payloads.
 */
import { notifyMediaSlackOfOperationFailure } from '../lib/slack'

type Scenario = 'all' | 'r2' | 'mux' | 'queue' | 'variant'

interface ParsedArgs {
  scenario: Scenario
  send: boolean
  videoId: string
}

const defaultVideoId =
  'fake-import-' + new Date().toISOString().replace(/[:.]/g, '-')

function readFlagValue(argv: string[], index: number, flag: string): string {
  const value = argv[index]
  if (value == null || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`)
  }
  return value
}

function parseScenario(value: string): Scenario {
  if (
    value === 'all' ||
    value === 'r2' ||
    value === 'mux' ||
    value === 'queue' ||
    value === 'variant'
  ) {
    return value
  }
  throw new Error('--scenario must be one of all, r2, mux, queue, variant')
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    scenario: 'all',
    send: false,
    videoId: defaultVideoId
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--send') {
      parsed.send = true
      continue
    }
    if (arg === '--scenario') {
      parsed.scenario = parseScenario(readFlagValue(argv, i + 1, '--scenario'))
      i++
      continue
    }
    if (arg.startsWith('--scenario=')) {
      parsed.scenario = parseScenario(arg.slice('--scenario='.length))
      continue
    }
    if (arg === '--video-id') {
      parsed.videoId = readFlagValue(argv, i + 1, '--video-id')
      i++
      continue
    }
    if (arg.startsWith('--video-id=')) {
      parsed.videoId = arg.slice('--video-id='.length)
    }
  }

  return parsed
}

function requireEnv(name: string): void {
  if (process.env[name] == null || process.env[name] === '') {
    throw new Error(`Missing ${name}`)
  }
}

function assertReadyToSend(send: boolean): void {
  if (!send) {
    throw new Error(
      'Pass --send to post real Slack messages. This guard prevents accidental channel noise.'
    )
  }

  requireEnv('SLACK_VIDEO_ADMIN_BOT_TOKEN')
  requireEnv('SLACK_DATA_LANGS_CHANNEL_ID')
}

function sendFailureNotifications(args: ParsedArgs): void {
  const baseContext = {
    videoId: args.videoId,
    languageId: '529',
    edition: 'base',
    version: 1
  }

  if (args.scenario === 'all' || args.scenario === 'r2') {
    notifyMediaSlackOfOperationFailure({
      operation: 'R2 asset create failed',
      error: new Error('Fake import test: R2 presign failed'),
      context: {
        ...baseContext,
        fileName: args.videoId + '.mp4',
        contentType: 'video/mp4',
        userId: 'fake-import-user'
      }
    })
  }

  if (args.scenario === 'all' || args.scenario === 'mux') {
    notifyMediaSlackOfOperationFailure({
      operation: 'Mux video create from R2 failed',
      error: new Error('Fake import test: Mux asset create failed'),
      context: {
        ...baseContext,
        originalFilename: args.videoId + '.mp4',
        userId: 'fake-import-user'
      }
    })
  }

  if (args.scenario === 'all' || args.scenario === 'queue') {
    notifyMediaSlackOfOperationFailure({
      operation: 'Mux video upload queue failed',
      error: new Error('Fake import test: queue add failed'),
      context: {
        ...baseContext,
        muxVideoId: 'fake-mux-video-id',
        originalFilename: args.videoId + '.mp4'
      }
    })
  }

  if (args.scenario === 'all' || args.scenario === 'variant') {
    notifyMediaSlackOfOperationFailure({
      operation: 'Video variant create failed',
      error: new Error('Fake import test: variant create failed'),
      context: {
        ...baseContext,
        muxVideoId: 'fake-mux-video-id'
      }
    })
  }
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2))
  assertReadyToSend(parsed.send)

  console.log(
    `Posting fake video import issue Slack test (${parsed.scenario}) for ${parsed.videoId}`
  )

  sendFailureNotifications(parsed)

  await new Promise((resolve) => setTimeout(resolve, 2500))
  console.log('Fake video import issue Slack test finished')
}

void main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
