import { promises as fs } from 'fs'

import { getGraphQLClient } from '../gql/graphqlClient'
import { CREATE_MUX_VIDEO_AND_QUEUE_UPLOAD } from '../gql/mutations'
import type { ProcessingSummary } from '../types'
import { getVideoMetadata } from '../utils/fileMetadataHelpers'
import { validateVideoAndEdition } from '../utils/videoEditionValidator'

import { VIDEO_FILENAME_REGEX } from './video'

export interface R2AssetInput {
  id?: string
  publicUrl: string
  originalFilename: string
}

function isR2AssetInput(value: unknown): value is R2AssetInput {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.publicUrl === 'string' &&
    v.publicUrl.length > 0 &&
    typeof v.originalFilename === 'string' &&
    v.originalFilename.length > 0 &&
    (v.id == null || typeof v.id === 'string')
  )
}

/**
 * Parse a JSON file describing a list of existing CloudflareR2 assets to be
 * (re-)ingested into Mux. Each entry must include `publicUrl` and
 * `originalFilename`; `id` is optional and used only for logging.
 *
 * The file may be either:
 *   - a JSON array:  `[ { "publicUrl": "...", "originalFilename": "..." }, ... ]`
 *   - a JSON object with an `assets` array:
 *       `{ "assets": [ { ... } ] }`
 *   - NDJSON (one JSON object per line)
 *
 * This matches the shape produced by Postgres, e.g.:
 *
 *   SELECT json_agg(jsonb_build_object(
 *     'id', id,
 *     'publicUrl', "publicUrl",
 *     'originalFilename', "originalFilename"
 *   )) FROM public."CloudflareR2"
 *   WHERE "originalFilename" LIKE '%---185355---%';
 */
export async function readR2AssetsFromFile(
  filePath: string
): Promise<R2AssetInput[]> {
  const raw = (await fs.readFile(filePath, 'utf-8')).trim()
  if (raw.length === 0) return []

  let parsed: unknown
  if (raw.startsWith('[') || raw.startsWith('{')) {
    parsed = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      Array.isArray((parsed as { assets?: unknown }).assets)
    ) {
      parsed = (parsed as { assets: unknown[] }).assets
    }
  } else {
    parsed = raw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line))
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      `Expected a JSON array in ${filePath} (or an object with an "assets" array, or NDJSON).`
    )
  }

  const invalid = parsed.filter((entry) => !isR2AssetInput(entry))
  if (invalid.length > 0) {
    throw new Error(
      `Found ${invalid.length} entries in ${filePath} missing required fields (publicUrl, originalFilename). First invalid: ${JSON.stringify(invalid[0])}`
    )
  }

  return parsed.filter(isR2AssetInput)
}

export async function processExistingR2Asset(
  asset: R2AssetInput,
  summary: ProcessingSummary
): Promise<void> {
  const { id, originalFilename, publicUrl } = asset
  const label = id ? `${originalFilename} (${id})` : originalFilename

  const match = originalFilename.match(VIDEO_FILENAME_REGEX)
  if (!match) {
    console.error(
      `originalFilename "${originalFilename}" does not match the video naming convention. Skipping.`
    )
    summary.failed++
    return
  }

  const [, videoId, editionName, languageId, version] = match
  const edition = editionName.toLowerCase()
  const parsedVersion = Number.parseInt(version, 10)
  if (Number.isNaN(parsedVersion)) {
    console.error(
      `Invalid version "${version}" for ${originalFilename}. Skipping.`
    )
    summary.failed++
    return
  }

  console.log(
    `Processing ${label}: Video=${videoId}, Edition=${edition}, Lang=${languageId}, Version=${parsedVersion}`
  )

  try {
    await validateVideoAndEdition(videoId, edition)
  } catch (error) {
    console.error(`Validation failed:`, error)
    summary.failed++
    return
  }

  let metadata
  try {
    metadata = await getVideoMetadata(publicUrl)
    if (
      metadata.durationMs === undefined ||
      metadata.width === undefined ||
      metadata.height === undefined
    ) {
      throw new Error('Incomplete metadata: missing required properties')
    }
  } catch (error) {
    console.error(
      `Failed to probe metadata from ${publicUrl} for ${originalFilename}:`,
      error
    )
    summary.failed++
    return
  }

  try {
    const client = await getGraphQLClient()
    await client.request(CREATE_MUX_VIDEO_AND_QUEUE_UPLOAD, {
      videoId,
      edition,
      languageId,
      version: parsedVersion,
      r2PublicUrl: publicUrl,
      originalFilename,
      durationMs: metadata.durationMs,
      duration: metadata.duration,
      width: metadata.width,
      height: metadata.height
    })
  } catch (error) {
    console.error(
      `Failed to create Mux video and queue upload for ${originalFilename}:`,
      error
    )
    summary.failed++
    return
  }

  summary.successful++
  console.log(`Successfully processed ${label}`)
}
