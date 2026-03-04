/**
 * Reset both api-media cache (Yoga) and Watch page cache for a single video.
 *
 * Usage:
 *   npx nx run api-media:reset-video-and-watch-cache -- --url "https://www.jesusfilm.org/watch/jesus.html/english.html"
 *   npx nx run api-media:reset-video-and-watch-cache -- --variant-id 529_1-529-mld-0-0
 *   npx nx run api-media:reset-video-and-watch-cache -- --video-id 1_529-mld-0-0
 *   npx nx run api-media:reset-video-and-watch-cache -- --url "https://www.jesusfilm.org/watch/jesus.html/english.html" --dry-run --verbose
 *
 * Requires:
 *   - PG_DATABASE_URL_MEDIA (or DATABASE_URL) for Prisma
 *   - WATCH_URL and WATCH_REVALIDATE_SECRET for Watch revalidation
 */

import { PrismaClient } from '.prisma/api-media-client'

import { videoCacheReset, videoVariantCacheReset } from '../lib/videoCacheReset'

const prisma = new PrismaClient()

type ScriptArgs = {
  url?: string
  variantId?: string
  videoId?: string
  dryRun: boolean
  verbose: boolean
}

type ResolvedTarget = {
  videoId: string
  variantId?: string
  variantSlug?: string
  source: 'url' | 'variant-id' | 'video-id'
}

function usage(): string {
  return [
    'Usage:',
    '  --url <watch-url>            e.g. https://www.jesusfilm.org/watch/jesus.html/english.html',
    '  --variant-id <id>            e.g. 529_1-529-mld-0-0',
    '  --video-id <id>              e.g. 1_529-mld-0-0',
    '  --dry-run                    print target only, do not reset',
    '  --verbose                    show additional logs',
    '',
    'Exactly one of --url, --variant-id, or --video-id is required.'
  ].join('\n')
}

function parseArgs(argv: string[]): ScriptArgs {
  const args: ScriptArgs = {
    dryRun: false,
    verbose: false
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--dry-run') {
      args.dryRun = true
      continue
    }
    if (arg === '--verbose') {
      args.verbose = true
      continue
    }

    const next = argv[i + 1]
    if (arg === '--url') {
      if (!next) throw new Error('Missing value for --url')
      args.url = next
      i++
      continue
    }
    if (arg === '--variant-id') {
      if (!next) throw new Error('Missing value for --variant-id')
      args.variantId = next
      i++
      continue
    }
    if (arg === '--video-id') {
      if (!next) throw new Error('Missing value for --video-id')
      args.videoId = next
      i++
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  const selectors = [args.url, args.variantId, args.videoId].filter(Boolean)
  if (selectors.length !== 1) {
    throw new Error('Exactly one selector is required: --url, --variant-id, or --video-id')
  }

  return args
}

function parseWatchPathToVariantSlug(rawUrl: string): string {
  let pathname: string
  try {
    pathname = new URL(rawUrl).pathname
  } catch {
    // Support passing only path in case operator copies partial value.
    pathname = rawUrl
  }

  const match = pathname.match(/^\/watch\/([^/]+)\.html\/([^/]+)\.html\/?$/i)
  if (!match) {
    throw new Error(
      `Could not parse Watch path from "${rawUrl}". Expected /watch/<videoSlug>.html/<languageSlug>.html`
    )
  }

  const videoSlug = decodeURIComponent(match[1])
  const languageSlug = decodeURIComponent(match[2])
  return `${videoSlug}/${languageSlug}`
}

function logVerbose(enabled: boolean, message: string): void {
  if (enabled) console.log(`[verbose] ${message}`)
}

async function resolveTarget(args: ScriptArgs): Promise<ResolvedTarget> {
  if (args.url) {
    const variantSlug = parseWatchPathToVariantSlug(args.url)
    const variant = await prisma.videoVariant.findUnique({
      where: { slug: variantSlug },
      select: { id: true, videoId: true, slug: true }
    })
    if (!variant) {
      throw new Error(`No VideoVariant found for slug: ${variantSlug}`)
    }
    return {
      videoId: variant.videoId,
      variantId: variant.id,
      variantSlug: variant.slug,
      source: 'url'
    }
  }

  if (args.variantId) {
    const variant = await prisma.videoVariant.findUnique({
      where: { id: args.variantId },
      select: { id: true, videoId: true, slug: true }
    })
    if (!variant) {
      throw new Error(`No VideoVariant found for id: ${args.variantId}`)
    }
    return {
      videoId: variant.videoId,
      variantId: variant.id,
      variantSlug: variant.slug,
      source: 'variant-id'
    }
  }

  const video = await prisma.video.findUnique({
    where: { id: args.videoId as string },
    select: { id: true }
  })
  if (!video) {
    throw new Error(`No Video found for id: ${args.videoId}`)
  }
  return {
    videoId: video.id,
    source: 'video-id'
  }
}

async function main(): Promise<void> {
  let args: ScriptArgs
  try {
    args = parseArgs(process.argv.slice(2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    console.error('')
    console.error(usage())
    process.exitCode = 1
    return
  }

  const watchUrl = process.env.WATCH_URL
  const hasRevalidateSecret = Boolean(process.env.WATCH_REVALIDATE_SECRET)
  console.log(`WATCH_URL: ${watchUrl ?? '(not set)'}`)
  console.log(
    `WATCH_REVALIDATE_SECRET: ${hasRevalidateSecret ? '***' : '(not set)'}`
  )
  if (!watchUrl || !hasRevalidateSecret) {
    console.warn(
      'Warning: Watch cache revalidation needs WATCH_URL and WATCH_REVALIDATE_SECRET.'
    )
  }

  const target = await resolveTarget(args)

  console.log(`Source: ${target.source}`)
  if (args.url) console.log(`Input URL: ${args.url}`)
  if (target.variantSlug) console.log(`Variant slug: ${target.variantSlug}`)
  if (target.variantId) console.log(`Variant ID: ${target.variantId}`)
  console.log(`Video ID: ${target.videoId}`)

  if (args.dryRun) {
    console.log('')
    console.log('Dry run only, no cache reset executed.')
    return
  }

  console.log('')
  logVerbose(args.verbose, 'Resetting videoVariant cache (Watch + Yoga)')
  if (target.variantId) {
    await videoVariantCacheReset(target.variantId)
    console.log(`OK videoVariantCacheReset(${target.variantId})`)
  } else {
    console.log('SKIP videoVariantCacheReset (no variant target)')
  }

  logVerbose(args.verbose, 'Resetting video cache (Watch + Yoga)')
  await videoCacheReset(target.videoId)
  console.log(`OK videoCacheReset(${target.videoId})`)

  console.log('')
  console.log('Done: dual cache reset completed.')
}

void main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
  .finally(() => {
    void prisma.$disconnect()
  })
