import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient as LanguagesPrismaClient } from '../../libs/prisma/languages/src/__generated__/client/client'
import { PrismaClient as MediaPrismaClient } from '../../libs/prisma/media/src/__generated__/client/client'

/*
 * Export prod subtitle/audio-preview links and optionally copy them into stage.
 *
 * Safe export from the currently loaded prod env:
 *   set -a && source apis/api-media/.env && set +a
 *   pnpm exec nx run api-media:sync-prod-subtitle-audio-links -- --export-only
 *
 * Later, after loading stage env, dry-run replacing stage from the artifact:
 *   set -a && source apis/api-media/.env && set +a
 *   pnpm exec nx run api-media:sync-prod-subtitle-audio-links -- \
 *     --artifact .cache/arclight-prod-links/prod-links-2026-...json \
 *     --stage-from-current
 *
 * Apply stage replacement only after reviewing the dry run:
 *   pnpm exec nx run api-media:sync-prod-subtitle-audio-links -- \
 *     --artifact .cache/arclight-prod-links/prod-links-2026-...json \
 *     --stage-from-current \
 *     --apply
 *
 * Prod connections are read-only in this script. Stage writes are limited to
 * existing rows: VideoSubtitle.srtSrc, VideoSubtitle.vttSrc, and
 * AudioPreview.value. The script does not create/delete rows or copy asset IDs
 * between environments.
 */

type MediaClient = InstanceType<typeof MediaPrismaClient>
type LanguagesClient = InstanceType<typeof LanguagesPrismaClient>

interface SubtitleLink {
  videoId: string
  edition: string
  languageId: string
  srtSrc: string | null
  vttSrc: string | null
}

interface AudioPreviewLink {
  languageId: string
  value: string
  duration: number
  size: number
  bitrate: number
  codec: string
  updatedAt: string
}

interface LinkArtifact {
  generatedAt: string
  source: 'prod' | 'current-as-prod'
  counts: {
    subtitles: number
    audioPreviews: number
  }
  subtitles: SubtitleLink[]
  audioPreviews: AudioPreviewLink[]
}

interface Args {
  artifact?: string
  apply: boolean
  exportOnly: boolean
  prodFromCurrent: boolean
  stageFromCurrent: boolean
  outputDir: string
}

interface SyncSummary {
  checked: number
  changed: number
  unchanged: number
  missingInStage: number
}

const DEFAULT_OUTPUT_DIR = path.resolve('.cache/arclight-prod-links')
const BATCH_SIZE = 500
const UPDATE_BATCH_SIZE = 500

function parseArgs(argv: string[]): Args {
  const args: Args = {
    apply: false,
    exportOnly: false,
    prodFromCurrent: false,
    stageFromCurrent: false,
    outputDir: DEFAULT_OUTPUT_DIR
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--apply') {
      args.apply = true
    } else if (arg === '--dry-run') {
      args.apply = false
    } else if (arg === '--export-only') {
      args.exportOnly = true
    } else if (arg === '--prod-from-current') {
      args.prodFromCurrent = true
    } else if (arg === '--stage-from-current') {
      args.stageFromCurrent = true
    } else if (arg === '--artifact') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--artifact requires a path')
      args.artifact = value
      index += 1
    } else if (arg === '--output-dir') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--output-dir requires a path')
      args.outputDir = path.resolve(value)
      index += 1
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return args
}

function createMediaClient(connectionString: string): MediaClient {
  return new MediaPrismaClient({
    adapter: new PrismaPg({
      connectionString,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 10_000
    })
  })
}

function createLanguagesClient(connectionString: string): LanguagesClient {
  return new LanguagesPrismaClient({
    adapter: new PrismaPg({
      connectionString,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 10_000
    })
  })
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (value == null || value === '') throw new Error(`Missing ${name}`)
  return value
}

function subtitleKey({
  videoId,
  edition,
  languageId
}: {
  videoId: string
  edition: string
  languageId: string
}): string {
  return `${videoId}:${edition}:${languageId}`
}

function placeholders(
  rowCount: number,
  columnCount: number,
  casts: string[]
): string {
  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const rowPlaceholders = Array.from(
      { length: columnCount },
      (_, columnIndex) => {
        const placeholderIndex = rowIndex * columnCount + columnIndex + 1
        return `$${placeholderIndex}${casts[columnIndex] ?? ''}`
      }
    )

    return `(${rowPlaceholders.join(', ')})`
  }).join(', ')
}

async function bulkUpdateSubtitles(
  media: MediaClient,
  updates: SubtitleLink[]
): Promise<void> {
  for (let offset = 0; offset < updates.length; offset += UPDATE_BATCH_SIZE) {
    const batch = updates.slice(offset, offset + UPDATE_BATCH_SIZE)
    const values = batch.flatMap(
      ({ videoId, edition, languageId, srtSrc, vttSrc }) => [
        videoId,
        edition,
        languageId,
        srtSrc,
        vttSrc
      ]
    )

    await media.$executeRawUnsafe(
      `
        update public."VideoSubtitle" as subtitle
        set
          "srtSrc" = payload."srtSrc",
          "vttSrc" = payload."vttSrc"
        from (values ${placeholders(batch.length, 5, [
          '::text',
          '::text',
          '::text',
          '::text',
          '::text'
        ])}) as payload("videoId", "edition", "languageId", "srtSrc", "vttSrc")
        where subtitle."videoId" = payload."videoId"
          and subtitle."edition" = payload."edition"
          and subtitle."languageId" = payload."languageId"
          and (
            subtitle."srtSrc" is distinct from payload."srtSrc"
            or subtitle."vttSrc" is distinct from payload."vttSrc"
          )
      `,
      ...values
    )
  }
}

async function bulkUpdateAudioPreviews(
  languages: LanguagesClient,
  updates: AudioPreviewLink[]
): Promise<void> {
  for (let offset = 0; offset < updates.length; offset += UPDATE_BATCH_SIZE) {
    const batch = updates.slice(offset, offset + UPDATE_BATCH_SIZE)
    const values = batch.flatMap(({ languageId, value }) => [languageId, value])

    await languages.$executeRawUnsafe(
      `
        update public."AudioPreview" as audio_preview
        set "value" = payload."value"
        from (values ${placeholders(batch.length, 2, ['::text', '::text'])}) as payload("languageId", "value")
        where audio_preview."languageId" = payload."languageId"
          and audio_preview."value" is distinct from payload."value"
      `,
      ...values
    )
  }
}

function getProdUrls(args: Args): {
  media: string
  languages: string
  source: LinkArtifact['source']
} {
  const mediaProd = process.env.PG_DATABASE_URL_MEDIA_PROD
  const languagesProd = process.env.PG_DATABASE_URL_LANGUAGES_PROD

  if (
    mediaProd != null &&
    mediaProd !== '' &&
    languagesProd != null &&
    languagesProd !== ''
  ) {
    return { media: mediaProd, languages: languagesProd, source: 'prod' }
  }

  const mediaCurrent = process.env.PG_DATABASE_URL_MEDIA
  const languagesCurrent = process.env.PG_DATABASE_URL_LANGUAGES
  const canUseCurrent =
    mediaCurrent != null &&
    mediaCurrent !== '' &&
    languagesCurrent != null &&
    languagesCurrent !== ''

  if (args.prodFromCurrent || canUseCurrent) {
    if (!canUseCurrent) {
      throw new Error(
        'Missing PG_DATABASE_URL_MEDIA or PG_DATABASE_URL_LANGUAGES for current-as-prod export.'
      )
    }

    if (!args.prodFromCurrent) {
      console.warn(
        'Using PG_DATABASE_URL_MEDIA and PG_DATABASE_URL_LANGUAGES as prod because *_PROD variables were not set.'
      )
    }

    return {
      media: mediaCurrent,
      languages: languagesCurrent,
      source: 'current-as-prod'
    }
  }

  throw new Error(
    'Missing prod URLs. Set PG_DATABASE_URL_MEDIA_PROD and PG_DATABASE_URL_LANGUAGES_PROD, or load prod into PG_DATABASE_URL_MEDIA/PG_DATABASE_URL_LANGUAGES.'
  )
}

function getStageUrls(args: Args): { media: string; languages: string } | null {
  const mediaStage = process.env.PG_DATABASE_URL_MEDIA_STAGE
  const languagesStage = process.env.PG_DATABASE_URL_LANGUAGES_STAGE

  if (
    mediaStage != null &&
    mediaStage !== '' &&
    languagesStage != null &&
    languagesStage !== ''
  ) {
    return { media: mediaStage, languages: languagesStage }
  }

  if (args.stageFromCurrent) {
    return {
      media: requireEnv('PG_DATABASE_URL_MEDIA'),
      languages: requireEnv('PG_DATABASE_URL_LANGUAGES')
    }
  }

  return null
}

async function exportProdLinks(
  args: Args
): Promise<{ artifact: LinkArtifact; outputPath: string }> {
  const prodUrls = getProdUrls(args)
  const media = createMediaClient(prodUrls.media)
  const languages = createLanguagesClient(prodUrls.languages)

  try {
    const [subtitles, audioPreviews] = await Promise.all([
      media.videoSubtitle.findMany({
        where: {
          OR: [{ srtSrc: { not: null } }, { vttSrc: { not: null } }]
        },
        orderBy: [
          { videoId: 'asc' },
          { edition: 'asc' },
          { languageId: 'asc' }
        ],
        select: {
          videoId: true,
          edition: true,
          languageId: true,
          srtSrc: true,
          vttSrc: true
        }
      }),
      languages.audioPreview.findMany({
        orderBy: { languageId: 'asc' },
        select: {
          languageId: true,
          value: true,
          duration: true,
          size: true,
          bitrate: true,
          codec: true,
          updatedAt: true
        }
      })
    ])

    const generatedAt = new Date().toISOString()
    const artifact: LinkArtifact = {
      generatedAt,
      source: prodUrls.source,
      counts: {
        subtitles: subtitles.length,
        audioPreviews: audioPreviews.length
      },
      subtitles,
      audioPreviews: audioPreviews.map((audioPreview) => ({
        ...audioPreview,
        updatedAt: audioPreview.updatedAt.toISOString()
      }))
    }

    await mkdir(args.outputDir, { recursive: true })
    const outputPath = path.join(
      args.outputDir,
      `prod-links-${generatedAt.replace(/[:.]/g, '-')}.json`
    )
    await writeFile(outputPath, JSON.stringify(artifact, null, 2), 'utf-8')

    return { artifact, outputPath }
  } finally {
    await Promise.all([media.$disconnect(), languages.$disconnect()])
  }
}

async function loadArtifact(artifactPath: string): Promise<LinkArtifact> {
  const raw = await readFile(artifactPath, 'utf-8')
  return JSON.parse(raw) as LinkArtifact
}

async function syncSubtitles(
  media: MediaClient,
  artifact: LinkArtifact,
  apply: boolean
): Promise<SyncSummary> {
  const summary: SyncSummary = {
    checked: 0,
    changed: 0,
    unchanged: 0,
    missingInStage: 0
  }

  for (
    let offset = 0;
    offset < artifact.subtitles.length;
    offset += BATCH_SIZE
  ) {
    const prodBatch = artifact.subtitles.slice(offset, offset + BATCH_SIZE)
    const stageBatch = await media.videoSubtitle.findMany({
      where: {
        OR: prodBatch.map(({ videoId, edition, languageId }) => ({
          videoId,
          edition,
          languageId
        }))
      },
      select: {
        id: true,
        videoId: true,
        edition: true,
        languageId: true,
        srtSrc: true,
        vttSrc: true
      }
    })
    const stageByKey = new Map(
      stageBatch.map((stageSubtitle) => [
        subtitleKey(stageSubtitle),
        stageSubtitle
      ])
    )
    const updates: SubtitleLink[] = []

    for (const prodSubtitle of prodBatch) {
      summary.checked += 1
      const stageSubtitle = stageByKey.get(subtitleKey(prodSubtitle))

      if (stageSubtitle == null) {
        summary.missingInStage += 1
        continue
      }

      const changed =
        stageSubtitle.srtSrc !== prodSubtitle.srtSrc ||
        stageSubtitle.vttSrc !== prodSubtitle.vttSrc

      if (!changed) {
        summary.unchanged += 1
        continue
      }

      summary.changed += 1

      if (apply) {
        updates.push(prodSubtitle)
      }
    }

    if (updates.length > 0) {
      await bulkUpdateSubtitles(media, updates)
    }
  }

  return summary
}

async function syncAudioPreviews(
  languages: LanguagesClient,
  artifact: LinkArtifact,
  apply: boolean
): Promise<SyncSummary> {
  const summary: SyncSummary = {
    checked: 0,
    changed: 0,
    unchanged: 0,
    missingInStage: 0
  }

  for (
    let offset = 0;
    offset < artifact.audioPreviews.length;
    offset += BATCH_SIZE
  ) {
    const prodBatch = artifact.audioPreviews.slice(offset, offset + BATCH_SIZE)
    const stageBatch = await languages.audioPreview.findMany({
      where: {
        languageId: { in: prodBatch.map(({ languageId }) => languageId) }
      },
      select: { languageId: true, value: true }
    })
    const stageByLanguageId = new Map(
      stageBatch.map((stageAudioPreview) => [
        stageAudioPreview.languageId,
        stageAudioPreview
      ])
    )
    const updates: AudioPreviewLink[] = []

    for (const prodAudioPreview of prodBatch) {
      summary.checked += 1
      const stageAudioPreview = stageByLanguageId.get(
        prodAudioPreview.languageId
      )

      if (stageAudioPreview == null) {
        summary.missingInStage += 1
        continue
      }

      if (stageAudioPreview.value === prodAudioPreview.value) {
        summary.unchanged += 1
        continue
      }

      summary.changed += 1

      if (apply) {
        updates.push(prodAudioPreview)
      }
    }

    if (updates.length > 0) {
      await bulkUpdateAudioPreviews(languages, updates)
    }
  }

  return summary
}

async function syncStage(
  args: Args,
  artifact: LinkArtifact
): Promise<{ subtitles: SyncSummary; audioPreviews: SyncSummary }> {
  const stageUrls = getStageUrls(args)
  if (stageUrls == null) {
    throw new Error(
      'Missing stage URLs. Set PG_DATABASE_URL_MEDIA_STAGE and PG_DATABASE_URL_LANGUAGES_STAGE, or pass --stage-from-current after loading the stage env.'
    )
  }

  const media = createMediaClient(stageUrls.media)
  const languages = createLanguagesClient(stageUrls.languages)

  try {
    const subtitles = await syncSubtitles(media, artifact, args.apply)
    const audioPreviews = await syncAudioPreviews(
      languages,
      artifact,
      args.apply
    )
    return { subtitles, audioPreviews }
  } finally {
    await Promise.all([media.$disconnect(), languages.$disconnect()])
  }
}

function printSummary(
  artifact: LinkArtifact,
  outputPath: string | undefined,
  syncSummary?: { subtitles: SyncSummary; audioPreviews: SyncSummary },
  apply = false
): void {
  console.info('')
  console.info('=== PROD LINK EXPORT ===')
  console.info(`source: ${artifact.source}`)
  console.info(`subtitles: ${artifact.counts.subtitles}`)
  console.info(`audio previews: ${artifact.counts.audioPreviews}`)
  if (outputPath != null) console.info(`artifact: ${outputPath}`)

  if (syncSummary == null) return

  console.info('')
  console.info(`=== STAGE ${apply ? 'APPLY' : 'DRY RUN'} ===`)
  console.info(
    `subtitles: checked=${syncSummary.subtitles.checked}, changed=${syncSummary.subtitles.changed}, unchanged=${syncSummary.subtitles.unchanged}, missingInStage=${syncSummary.subtitles.missingInStage}`
  )
  console.info(
    `audio previews: checked=${syncSummary.audioPreviews.checked}, changed=${syncSummary.audioPreviews.changed}, unchanged=${syncSummary.audioPreviews.unchanged}, missingInStage=${syncSummary.audioPreviews.missingInStage}`
  )
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const loaded =
    args.artifact != null ? await loadArtifact(args.artifact) : undefined
  const exported = loaded == null ? await exportProdLinks(args) : undefined
  const artifact = loaded ?? exported?.artifact

  if (artifact == null) throw new Error('No artifact loaded or exported')

  const outputPath = exported?.outputPath ?? args.artifact

  if (args.exportOnly) {
    printSummary(artifact, outputPath)
    return
  }

  const stageUrls = getStageUrls(args)
  if (stageUrls == null) {
    printSummary(artifact, outputPath)
    console.info('')
    console.info(
      'Stage not configured, so no replacement dry run was performed. Load stage env and pass --stage-from-current, or set *_STAGE database URLs.'
    )
    return
  }

  const syncSummary = await syncStage(args, artifact)
  printSummary(artifact, outputPath, syncSummary, args.apply)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
