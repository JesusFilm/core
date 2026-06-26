import {
  VideoVariantUploadStatus,
  prisma
} from '../../../../libs/prisma/media/src/client'
import {
  createVideoFromUrl,
  getMaxResolutionValue
} from '../schema/mux/video/service'

type TestUploadStatus = Exclude<
  VideoVariantUploadStatus,
  typeof VideoVariantUploadStatus.variantCreated
>

interface ParsedArgs {
  videoId: string
  edition: string
  languageIds: string[]
  statuses: TestUploadStatus[]
  source: string
  runId: string
  write: boolean
  cleanupOnly: boolean
  keepExisting: boolean
  stage: boolean
  confirmStage: boolean
  useRecentRealR2: boolean
  realR2Explicit: boolean
  realR2Limit: number
}

interface RecentRealR2Asset {
  id: string
  fileName: string
  originalFilename: string | null
  publicUrl: string
  contentType: string
  contentLength: bigint
  videoId: string | null
}

interface ReadyMuxVideo {
  id: string
  assetId: string | null
  playbackId: string | null
  uploadUrl: string | null
  uploadId: string | null
  duration: number
  downloadable: boolean
  readyToStream: boolean
}

const DEFAULT_LANGUAGE_IDS = [
  '184631',
  '14278',
  '529',
  '10685',
  '1106',
  '20615'
]
const DEFAULT_STATUSES: TestUploadStatus[] = [
  VideoVariantUploadStatus.created,
  VideoVariantUploadStatus.r2Prepared,
  VideoVariantUploadStatus.r2Uploaded,
  VideoVariantUploadStatus.muxCreated,
  VideoVariantUploadStatus.muxReady,
  VideoVariantUploadStatus.failed
]

function readFlagValue(argv: string[], index: number, flag: string): string {
  const value = argv[index]
  if (value == null || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`)
  }
  return value
}

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseStatus(value: string): TestUploadStatus {
  if (
    value === VideoVariantUploadStatus.created ||
    value === VideoVariantUploadStatus.r2Prepared ||
    value === VideoVariantUploadStatus.r2Uploaded ||
    value === VideoVariantUploadStatus.muxCreated ||
    value === VideoVariantUploadStatus.muxReady ||
    value === VideoVariantUploadStatus.failed
  ) {
    return value
  }

  throw new Error(
    `Unsupported status "${value}". Use one of: ${DEFAULT_STATUSES.join(', ')}`
  )
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: Partial<ParsedArgs> = {
    edition: 'base',
    languageIds: DEFAULT_LANGUAGE_IDS,
    statuses: DEFAULT_STATUSES,
    source: 'qa-528-test-data',
    runId: new Date().toISOString().replace(/[:.]/g, '-'),
    write: false,
    cleanupOnly: false,
    keepExisting: false,
    stage: false,
    confirmStage: false,
    useRecentRealR2: false,
    realR2Explicit: false,
    realR2Limit: 12
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--video-id') {
      parsed.videoId = readFlagValue(argv, i + 1, '--video-id')
      i++
      continue
    }
    if (arg.startsWith('--video-id=')) {
      parsed.videoId = arg.slice('--video-id='.length)
      continue
    }
    if (arg === '--edition') {
      parsed.edition = readFlagValue(argv, i + 1, '--edition')
      i++
      continue
    }
    if (arg.startsWith('--edition=')) {
      parsed.edition = arg.slice('--edition='.length)
      continue
    }
    if (arg === '--language-ids') {
      parsed.languageIds = parseList(readFlagValue(argv, i + 1, arg))
      i++
      continue
    }
    if (arg.startsWith('--language-ids=')) {
      parsed.languageIds = parseList(arg.slice('--language-ids='.length))
      continue
    }
    if (arg === '--statuses') {
      parsed.statuses = parseList(readFlagValue(argv, i + 1, arg)).map(
        parseStatus
      )
      i++
      continue
    }
    if (arg.startsWith('--statuses=')) {
      parsed.statuses = parseList(arg.slice('--statuses='.length)).map(
        parseStatus
      )
      continue
    }
    if (arg === '--source') {
      parsed.source = readFlagValue(argv, i + 1, '--source')
      i++
      continue
    }
    if (arg.startsWith('--source=')) {
      parsed.source = arg.slice('--source='.length)
      continue
    }
    if (arg === '--run-id') {
      parsed.runId = readFlagValue(argv, i + 1, '--run-id')
      i++
      continue
    }
    if (arg.startsWith('--run-id=')) {
      parsed.runId = arg.slice('--run-id='.length)
      continue
    }
    if (arg === '--write') {
      parsed.write = true
      continue
    }
    if (arg === '--cleanup-only') {
      parsed.cleanupOnly = true
      continue
    }
    if (arg === '--keep-existing') {
      parsed.keepExisting = true
      continue
    }
    if (arg === '--stage') {
      parsed.stage = true
      continue
    }
    if (arg === '--use-recent-real-r2') {
      parsed.useRecentRealR2 = true
      parsed.realR2Explicit = true
      continue
    }
    if (arg === '--no-recent-real-r2') {
      parsed.useRecentRealR2 = false
      parsed.realR2Explicit = true
      continue
    }
    if (arg === '--real-r2-limit') {
      parsed.realR2Limit = Number(readFlagValue(argv, i + 1, '--real-r2-limit'))
      i++
      continue
    }
    if (arg.startsWith('--real-r2-limit=')) {
      parsed.realR2Limit = Number(arg.slice('--real-r2-limit='.length))
      continue
    }
    if (arg === '--confirm-stage') {
      parsed.confirmStage = true
      continue
    }
    if (arg === '--help' || arg === '-h') {
      printUsage()
      process.exit(0)
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  if (parsed.videoId == null || parsed.videoId.trim() === '') {
    throw new Error('--video-id is required')
  }
  if (parsed.languageIds == null || parsed.languageIds.length === 0) {
    throw new Error('--language-ids must include at least one language id')
  }
  if (parsed.statuses == null || parsed.statuses.length === 0) {
    throw new Error('--statuses must include at least one status')
  }
  if (parsed.realR2Explicit !== true && parsed.stage === true) {
    parsed.useRecentRealR2 = true
  }
  if (
    parsed.realR2Limit == null ||
    !Number.isInteger(parsed.realR2Limit) ||
    parsed.realR2Limit < 1
  ) {
    throw new Error('--real-r2-limit must be a positive integer')
  }
  if (parsed.stage === true && parsed.write === true && !parsed.confirmStage) {
    throw new Error('Stage writes require both --stage and --confirm-stage')
  }

  return parsed as ParsedArgs
}

function printUsage(): void {
  console.info(`Create QA-528 video variant upload test rows.

Dry-run local:
  pnpm exec nx run api-media:create-video-variant-upload-test-data -- --video-id=0_JesusVisionJFP

Write local:
  pnpm exec nx run api-media:create-video-variant-upload-test-data -- --video-id=0_JesusVisionJFP --write

Write stage after loading api-media stage env:
  pnpm exec nx run api-media:create-video-variant-upload-test-data -- --video-id=0_JesusVisionJFP --stage --confirm-stage --write

Options:
  --video-id       Required Video.id to attach rows to
  --edition        Video edition label, default: base
  --language-ids   Comma-separated language ids
  --statuses       Comma-separated statuses: ${DEFAULT_STATUSES.join(', ')}
  --write          Mutate the database; omitted means dry-run
  --cleanup-only   Delete prior rows for source/video and exit
  --keep-existing       Do not delete prior script-generated rows before creating
  --use-recent-real-r2  Clone recent real R2 public URLs for processable rows
  --no-recent-real-r2   Use fake example.invalid URLs, even on stage
  --real-r2-limit       Recent real R2 assets to scan, default: 12
  --stage               Declare that this is being run against stage
  --confirm-stage       Required with --stage --write

Stage runs default to --use-recent-real-r2 so Ready to process, Processing,
and Ready to finalize rows can exercise real media paths. The intentionally
failed row stays fake so QA can still verify the failed state.
`)
}

function languageForIndex(args: ParsedArgs, index: number): string {
  return args.languageIds[index % args.languageIds.length]
}

function metadataForIndex(index: number) {
  return {
    originalFilename: `qa-528-upload-${index + 1}.mp4`,
    contentType: 'video/mp4',
    contentLength: BigInt(3_429_652 + index),
    duration: 123 + index,
    durationMs: 123_000 + index * 1000,
    width: 1920,
    height: 1080
  }
}

function r2FileName(args: ParsedArgs, status: TestUploadStatus, index: number) {
  return `${args.source}/${args.videoId}/${args.runId}/${index + 1}-${status}.mp4`
}

function publicUrl(fileName: string) {
  return `https://qa-528-test-data.example.invalid/${fileName}`
}

function shouldCloneRealR2(status: TestUploadStatus): boolean {
  return (
    status === VideoVariantUploadStatus.r2Uploaded ||
    status === VideoVariantUploadStatus.muxCreated ||
    status === VideoVariantUploadStatus.muxReady
  )
}

function nextRecentRealR2Asset(
  assets: RecentRealR2Asset[],
  index: number
): RecentRealR2Asset {
  if (assets.length === 0) {
    throw new Error(
      'No recent real R2 video assets found. Re-run with --no-recent-real-r2 to use fake QA URLs.'
    )
  }

  return assets[index % assets.length]
}

async function findRecentRealR2Assets(
  limit: number,
  excludedUserId: string
): Promise<RecentRealR2Asset[]> {
  return (await prisma.cloudflareR2.findMany({
    where: {
      publicUrl: { not: null },
      userId: { not: excludedUserId },
      contentType: { startsWith: 'video/' },
      NOT: { publicUrl: { contains: 'example.invalid' } }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      fileName: true,
      originalFilename: true,
      publicUrl: true,
      contentType: true,
      contentLength: true,
      videoId: true
    }
  })) as RecentRealR2Asset[]
}

async function findRecentReadyMuxVideos(
  limit: number,
  excludedUserId: string
): Promise<ReadyMuxVideo[]> {
  return await prisma.muxVideo.findMany({
    where: {
      readyToStream: true,
      userId: { not: excludedUserId },
      playbackId: { not: null },
      uploadUrl: { not: null },
      NOT: { uploadUrl: { contains: 'example.invalid' } }
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      assetId: true,
      playbackId: true,
      uploadUrl: true,
      uploadId: true,
      duration: true,
      downloadable: true,
      readyToStream: true
    }
  })
}

async function createRealMuxVideoFromR2Asset({
  r2Asset,
  args,
  status,
  index
}: {
  r2Asset: { id: string; publicUrl: string | null }
  args: ParsedArgs
  status: TestUploadStatus
  index: number
}) {
  if (r2Asset.publicUrl == null) {
    throw new Error(`Cannot create real Mux asset without an R2 public URL`)
  }

  const muxAsset = await createVideoFromUrl(
    r2Asset.publicUrl,
    false,
    getMaxResolutionValue('uhd'),
    true
  )

  return await prisma.muxVideo.create({
    data: {
      assetId: muxAsset.id,
      uploadUrl: r2Asset.publicUrl,
      uploadId: r2Asset.id,
      userId: args.source,
      name: `${args.source}:${args.videoId}:${status}:${index}:real-mux`,
      downloadable: true,
      readyToStream: false
    }
  })
}

async function cleanupExisting(args: ParsedArgs): Promise<void> {
  const [uploads, r2Assets, muxVideos] = await prisma.$transaction([
    prisma.videoVariantUpload.deleteMany({
      where: { source: args.source, videoId: args.videoId }
    }),
    prisma.cloudflareR2.deleteMany({
      where: {
        userId: args.source,
        videoId: args.videoId,
        fileName: { startsWith: `${args.source}/${args.videoId}/` }
      }
    }),
    prisma.muxVideo.deleteMany({
      where: {
        userId: args.source,
        name: { startsWith: `${args.source}:${args.videoId}:` }
      }
    })
  ])

  console.info('Removed existing script-generated rows', {
    uploads: uploads.count,
    r2Assets: r2Assets.count,
    muxVideos: muxVideos.count
  })
}

async function createRows(args: ParsedArgs): Promise<void> {
  const video = await prisma.video.findUnique({
    where: { id: args.videoId },
    select: { id: true, slug: true }
  })

  if (video == null) {
    throw new Error(`Video not found: ${args.videoId}`)
  }

  console.info('Target video found', video)

  if (!args.keepExisting) {
    await cleanupExisting(args)
  }

  if (args.cleanupOnly) return

  const recentRealR2Assets = args.useRecentRealR2
    ? await findRecentRealR2Assets(args.realR2Limit, args.source)
    : []
  const recentReadyMuxVideos = args.useRecentRealR2
    ? await findRecentReadyMuxVideos(args.realR2Limit, args.source)
    : []

  if (args.useRecentRealR2) {
    console.info('Recent real media assets selected for processable rows', {
      r2Assets: recentRealR2Assets.map((asset) => ({
        id: asset.id,
        videoId: asset.videoId,
        originalFilename: asset.originalFilename,
        publicUrl: asset.publicUrl
      })),
      readyMuxVideos: recentReadyMuxVideos.map((muxVideo) => ({
        id: muxVideo.id,
        assetId: muxVideo.assetId,
        playbackId: muxVideo.playbackId
      }))
    })
  }

  let realR2Index = 0
  let readyMuxIndex = 0

  for (const [index, status] of args.statuses.entries()) {
    const languageId = languageForIndex(args, index)
    const fallbackMetadata = metadataForIndex(index)
    const realR2Source =
      args.useRecentRealR2 && shouldCloneRealR2(status)
        ? nextRecentRealR2Asset(recentRealR2Assets, realR2Index++)
        : null
    const metadata = {
      ...fallbackMetadata,
      originalFilename:
        realR2Source?.originalFilename ?? fallbackMetadata.originalFilename,
      contentType: realR2Source?.contentType ?? fallbackMetadata.contentType,
      contentLength:
        realR2Source?.contentLength ?? fallbackMetadata.contentLength
    }
    const fileName = r2FileName(args, status, index)
    const needsR2 = status !== VideoVariantUploadStatus.created
    const hasUploadedR2 =
      status !== VideoVariantUploadStatus.created &&
      status !== VideoVariantUploadStatus.r2Prepared
    const needsMux =
      status === VideoVariantUploadStatus.muxCreated ||
      status === VideoVariantUploadStatus.muxReady ||
      status === VideoVariantUploadStatus.failed

    const r2Asset = needsR2
      ? await prisma.cloudflareR2.create({
          data: {
            fileName,
            originalFilename: metadata.originalFilename,
            userId: args.source,
            publicUrl:
              realR2Source?.publicUrl ??
              (hasUploadedR2 ? publicUrl(fileName) : null),
            videoId: args.videoId,
            contentType: metadata.contentType,
            contentLength: metadata.contentLength
          }
        })
      : null

    const readyMuxVideo =
      args.useRecentRealR2 && status === VideoVariantUploadStatus.muxReady
        ? recentReadyMuxVideos[readyMuxIndex++ % recentReadyMuxVideos.length]
        : null

    const muxVideo =
      status === VideoVariantUploadStatus.muxCreated &&
      args.useRecentRealR2 &&
      r2Asset != null
        ? await createRealMuxVideoFromR2Asset({
            r2Asset,
            args,
            status,
            index
          })
        : readyMuxVideo != null
          ? readyMuxVideo
          : needsMux
            ? await prisma.muxVideo.create({
                data: {
                  assetId: `${args.source}-${args.runId}-${status}-${index}-asset`,
                  playbackId:
                    status === VideoVariantUploadStatus.muxReady
                      ? `${args.source}-${args.runId}-${status}-${index}-playback`
                      : null,
                  uploadUrl: r2Asset?.publicUrl,
                  uploadId: r2Asset?.id,
                  userId: args.source,
                  name: `${args.source}:${args.videoId}:${status}:${index}`,
                  duration: metadata.duration,
                  downloadable: true,
                  readyToStream: status === VideoVariantUploadStatus.muxReady
                }
              })
            : null

    const upload = await prisma.videoVariantUpload.create({
      data: {
        source: args.source,
        sourceKey: `${args.runId}:${status}:${index}`,
        status,
        videoId: args.videoId,
        edition: args.edition,
        languageId,
        version: 1,
        published: false,
        originalFilename: metadata.originalFilename,
        contentType: metadata.contentType,
        contentLength: metadata.contentLength,
        duration: metadata.duration,
        durationMs: metadata.durationMs,
        width: metadata.width,
        height: metadata.height,
        r2AssetId: r2Asset?.id,
        muxVideoId: muxVideo?.id,
        errorMessage:
          status === VideoVariantUploadStatus.failed
            ? 'QA test failure: Mux video processing errored'
            : null
      }
    })

    console.info('Created test upload', {
      id: upload.id,
      status: upload.status,
      languageId: upload.languageId,
      r2AssetId: upload.r2AssetId,
      muxVideoId: upload.muxVideoId,
      realR2SourceId: realR2Source?.id ?? null,
      realMuxAssetId: muxVideo?.assetId ?? null
    })
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))

  console.info('Video variant upload QA test data plan', {
    videoId: args.videoId,
    edition: args.edition,
    languageIds: args.languageIds,
    statuses: args.statuses,
    source: args.source,
    runId: args.runId,
    write: args.write,
    cleanupOnly: args.cleanupOnly,
    keepExisting: args.keepExisting,
    stage: args.stage,
    useRecentRealR2: args.useRecentRealR2,
    realR2Limit: args.realR2Limit
  })

  if (!args.write) {
    console.info('Dry-run only. Re-run with --write to mutate the database.')
    return
  }

  await createRows(args)
}

async function run(): Promise<void> {
  try {
    await main()
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

void run()
