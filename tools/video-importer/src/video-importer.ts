import { createReadStream, promises } from 'fs'
import path from 'path'
import 'dotenv/config'

import axios from 'axios'
import { Command } from 'commander'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { graphql } from 'gql.tada'
import { GraphQLClient } from 'graphql-request'

import { firebaseClient } from './firebaseClient'

/*
TODO:
- [ ] duration
- [ ] dash
- [ ] share
- [ ] lengthInMiliseconds
- [ ] masterHeight
- [ ] masterUrl
- [ ] masterWidth
*/

const program = new Command()

program
  .requiredOption('-f, --folder <path>', 'Folder containing video files')
  .option('--dry-run', 'Print actions without uploading', false)
  .parse(process.argv)

const options = program.opts()

const VIDEO_FILENAME_REGEX =
  /^([a-zA-Z0-9_-]+)---([a-zA-Z0-9_-]+)---([a-zA-Z0-9_-]+)\.mp4$/

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT
if (!GRAPHQL_ENDPOINT) {
  throw new Error(
    '[video-importer] GRAPHQL_ENDPOINT environment variable must be set.'
  )
}

// Caching for JWT token and GraphQL client
let cachedJwtToken: string | undefined
let cachedJwtTokenIssueTime: number | undefined
let cachedGraphQLClient: GraphQLClient | undefined

async function getFirebaseJwtToken(): Promise<string> {
  const now = Date.now()
  // 55 minutes in ms
  const TOKEN_EXPIRY_MS = 55 * 60 * 1000
  if (
    cachedJwtToken &&
    cachedJwtTokenIssueTime &&
    now - cachedJwtTokenIssueTime < TOKEN_EXPIRY_MS
  ) {
    return cachedJwtToken
  }

  const email = process.env.FIREBASE_EMAIL
  const password = process.env.FIREBASE_PASSWORD

  if (!email || !password) {
    throw new Error(
      'FIREBASE_EMAIL and FIREBASE_PASSWORD env variables must be set.'
    )
  }

  const auth = getAuth(firebaseClient)
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  cachedJwtToken = await userCredential.user.getIdToken()
  cachedJwtTokenIssueTime = Date.now()
  return cachedJwtToken
}

async function getGraphQLClient(): Promise<GraphQLClient> {
  if (cachedGraphQLClient) return cachedGraphQLClient

  const jwtToken = process.env.JWT_TOKEN ?? (await getFirebaseJwtToken())
  cachedGraphQLClient = new GraphQLClient(GRAPHQL_ENDPOINT!, {
    headers: {
      Authorization: `JWT ${jwtToken}`,
      'x-graphql-client-name': 'video-importer'
    }
  })
  return cachedGraphQLClient
}

const CREATE_R2_ASSET = graphql(`
  mutation CreateR2Asset($input: CloudflareR2CreateInput!) {
    cloudflareR2Create(input: $input) {
      uploadUrl
      publicUrl
    }
  }
`)

const CREATE_MUX_VIDEO = graphql(`
  mutation CreateMuxVideoUploadByUrl($url: String!, $userGenerated: Boolean) {
    createMuxVideoUploadByUrl(url: $url, userGenerated: $userGenerated) {
      id
      assetId
      playbackId
      readyToStream
    }
  }
`)

const GET_MUX_VIDEO = graphql(`
  query GetMyMuxVideo($id: ID!, $userGenerated: Boolean) {
    getMyMuxVideo(id: $id, userGenerated: $userGenerated) {
      id
      assetId
      playbackId
      readyToStream
    }
  }
`)

const GET_LANGUAGE_SLUG = graphql(`
  query GetLanguageSlug($id: ID!) {
    language(id: $id) {
      id
      slug
    }
  }
`)

const CREATE_VIDEO_VARIANT = graphql(`
  mutation CreateVideoVariant($input: VideoVariantCreateInput!) {
    videoVariantCreate(input: $input) {
      id
      videoId
      slug
      hls
      published
      language {
        id
        name {
          value
          primary
        }
      }
    }
  }
`)

const UPDATE_VIDEO_VARIANT = graphql(`
  mutation UpdateVideoVariant($input: VideoVariantUpdateInput!) {
    videoVariantUpdate(input: $input) {
      id
      videoId
      slug
      hls
      published
      language {
        id
        name {
          value
          primary
        }
      }
    }
  }
`)

const CREATE_VIDEO_EDITION = graphql(`
  mutation CreateVideoEdition($input: VideoEditionCreateInput!) {
    videoEditionCreate(input: $input) {
      id
      name
    }
  }
`)

interface MuxVideoResponse {
  createMuxVideoUploadByUrl: {
    id: string
    assetId: string
    playbackId: string
    readyToStream: boolean
  }
}

interface MuxVideoStatusResponse {
  getMyMuxVideo: {
    id: string
    assetId: string
    playbackId: string
    readyToStream: boolean
  }
}

interface VideoVariantResponse {
  videoVariantCreate: {
    id: string
    videoId: string
    slug: string
    hls: string
    language: {
      id: string
      name: {
        value: string
        primary: boolean
      }
    }
  }
}

interface VideoVariantUpdateResponse {
  videoVariantUpdate: {
    id: string
    videoId: string
    slug: string
    hls: string
  }
}

interface ProcessingSummary {
  total: number
  successful: number
  failed: number
  errors: Array<{ file: string; error: string }>
}

interface VideoVariantInput {
  id: string
  videoId: string
  edition: string
  languageId: string
  slug: string
  downloadable: boolean
  published: boolean
  muxVideoId: string
  hls: string
  dash?: string
  share?: string
  masterHeight?: number
  masterWidth?: number
  masterUrl?: string
  version?: number
}

interface GetLanguageSlugResponse {
  language: {
    id: string
    slug: string
  }
}

async function getVideoVariantInput({
  videoId,
  languageId,
  edition,
  muxId,
  playbackId
}: {
  videoId: string
  languageId: string
  edition: string
  muxId: string
  playbackId: string
}): Promise<VideoVariantInput> {
  // Parse source from videoId (e.g., "0_JesusVisionLumo" -> source="0")
  let source: string
  let restOfId: string
  if (videoId.includes('_')) {
    ;[source, restOfId = ''] = videoId.split('_', 2)
    if (restOfId === '') {
      console.warn(
        `[video-importer] Expected an '_' in videoId "${videoId}".` +
          ' The variant id/slug will use the plain videoId which may collide.'
      )
      source = '0'
      restOfId = videoId
    }
  } else {
    source = '0'
    restOfId = videoId
    console.warn(
      `[video-importer] No '_' found in videoId "${videoId}". Using source='0' and restOfId=videoId. The variant id/slug will use the plain videoId which may collide.`
    )
  }
  const client = await getGraphQLClient()

  const languageResponse = await client.request<GetLanguageSlugResponse>(
    GET_LANGUAGE_SLUG,
    { id: languageId }
  )

  if (!languageResponse.language?.slug) {
    throw new Error(`No language slug found for language ID: ${languageId}`)
  }

  return {
    id: `${source}_${languageId}_${restOfId}`,
    videoId,
    edition,
    languageId,
    slug: `${videoId}/${languageResponse.language.slug}`,
    downloadable: true,
    published: true,
    muxVideoId: muxId,
    hls: `https://stream.mux.com/${playbackId}.m3u8`,
    version: 1
  }
}

async function createR2Asset({
  fileName,
  contentType,
  originalFilename,
  contentLength,
  videoId
}: {
  fileName: string
  contentType: string
  originalFilename: string
  contentLength: number
  videoId: string
}) {
  const client = await getGraphQLClient()
  const data: { cloudflareR2Create: { uploadUrl: string; publicUrl: string } } =
    await client.request(CREATE_R2_ASSET, {
      input: { fileName, contentType, originalFilename, contentLength, videoId }
    })
  return data.cloudflareR2Create
}

async function uploadToR2(
  uploadUrl: string,
  filePath: string,
  contentType: string
) {
  await axios.put(uploadUrl, createReadStream(filePath), {
    headers: { 'Content-Type': contentType },
    maxBodyLength: Infinity
  })
}

async function createAndWaitForMuxVideo(publicUrl: string): Promise<{
  id: string
  playbackId: string
}> {
  const client = await getGraphQLClient()

  // Create Mux video
  const muxResponse = await client.request<MuxVideoResponse>(CREATE_MUX_VIDEO, {
    url: publicUrl,
    userGenerated: false
  })

  if (!muxResponse.createMuxVideoUploadByUrl?.id) {
    throw new Error('Failed to create Mux video')
  }

  const muxId = muxResponse.createMuxVideoUploadByUrl.id

  // Exponential backoff intervals in ms: 1min, 2min, 5min, 10min, 15min, 20min
  const BACKOFF_INTERVALS = [
    60_000, 120_000, 300_000, 600_000, 900_000, 1_200_000
  ]
  const MAX_ATTEMPTS = BACKOFF_INTERVALS.length

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const statusResponse = await client.request<MuxVideoStatusResponse>(
      GET_MUX_VIDEO,
      {
        id: muxId,
        userGenerated: false
      }
    )

    if (statusResponse.getMyMuxVideo.readyToStream) {
      return {
        id: statusResponse.getMyMuxVideo.id,
        playbackId: statusResponse.getMyMuxVideo.playbackId
      }
    }

    const waitMs = BACKOFF_INTERVALS[attempt]
    const waitMin = Math.round(waitMs / 60000)
    console.log(
      `Waiting for Mux processing… (attempt ${attempt + 1}/${MAX_ATTEMPTS}, waiting ${waitMin} min)`
    )
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }

  // Continue polling with the last interval if needed
  let attempt = MAX_ATTEMPTS
  while (true) {
    const statusResponse = await client.request<MuxVideoStatusResponse>(
      GET_MUX_VIDEO,
      {
        id: muxId,
        userGenerated: false
      }
    )

    if (statusResponse.getMyMuxVideo.readyToStream) {
      return {
        id: statusResponse.getMyMuxVideo.id,
        playbackId: statusResponse.getMyMuxVideo.playbackId
      }
    }

    const waitMs = BACKOFF_INTERVALS[BACKOFF_INTERVALS.length - 1]
    const waitMin = Math.round(waitMs / 60000)
    console.log(
      `Waiting for Mux processing… (attempt ${attempt + 1}, waiting ${waitMin} min)`
    )
    await new Promise((resolve) => setTimeout(resolve, waitMs))
    attempt++
    if (attempt >= 20) {
      // hard cap at 20 attempts (total ~3.5 hours)
      break
    }
  }
  throw new Error(
    `Mux video ${muxId} not ready after extended polling – aborting.`
  )
}

async function updateVideoVariant({
  videoId,
  languageId,
  edition,
  muxId,
  playbackId
}: {
  videoId: string
  languageId: string
  edition: string
  muxId: string
  playbackId: string
}): Promise<void> {
  const client = await getGraphQLClient()
  const input = await getVideoVariantInput({
    videoId,
    languageId,
    edition,
    muxId,
    playbackId
  })
  await client.request<VideoVariantUpdateResponse>(UPDATE_VIDEO_VARIANT, {
    input: {
      id: input.id,
      videoId: input.videoId,
      edition: input.edition,
      languageId: input.languageId,
      slug: input.slug,
      downloadable: input.downloadable,
      published: input.published,
      muxVideoId: input.muxVideoId,
      hls: input.hls
    }
  })
}

async function createVideoEdition(
  videoId: string,
  edition: string
): Promise<void> {
  const client = await getGraphQLClient()
  try {
    await client.request(CREATE_VIDEO_EDITION, {
      input: {
        name: edition,
        videoId
      }
    })
    console.log(`Created edition "${edition}" for video ${videoId}`)
  } catch (error) {
    // If edition already exists, we can ignore the error
    const errorMessage = error?.toString() ?? ''
    if (!errorMessage.includes('Unique constraint failed')) {
      throw error
    }
  }
}

async function createVideoVariant({
  videoId,
  languageId,
  edition,
  muxId,
  playbackId
}: {
  videoId: string
  languageId: string
  edition: string
  muxId: string
  playbackId: string
}): Promise<'created' | 'updated'> {
  const client = await getGraphQLClient()
  const input = await getVideoVariantInput({
    videoId,
    languageId,
    edition,
    muxId,
    playbackId
  })

  // First try to update
  try {
    console.log('Attempting to update existing variant...')
    await updateVideoVariant({
      videoId,
      languageId,
      edition,
      muxId,
      playbackId
    })
    return 'updated'
  } catch (error) {
    // If update fails because record doesn't exist, create it
    const errorMessage = error?.toString() ?? ''
    if (errorMessage.includes('Record to update not found')) {
      console.log('No existing variant found, creating new one...')

      // Create the edition first if it doesn't exist
      await createVideoEdition(videoId, edition)

      const response = await client.request<VideoVariantResponse>(
        CREATE_VIDEO_VARIANT,
        {
          input: {
            id: input.id,
            videoId: input.videoId,
            edition: input.edition,
            languageId: input.languageId,
            slug: input.slug,
            downloadable: input.downloadable,
            published: input.published,
            muxVideoId: input.muxVideoId,
            hls: input.hls
          }
        }
      )

      if (!response.videoVariantCreate) {
        throw new Error('Failed to create video variant')
      }

      return 'created'
    }
    throw error
  }
}

async function main() {
  const folderPath = path.resolve(options.folder)
  let files: string[]
  try {
    files = await promises.readdir(folderPath)
  } catch (err) {
    console.error(`Failed to read folder: ${folderPath}`)
    process.exit(1)
  }

  const videoFiles = files.filter((file) => VIDEO_FILENAME_REGEX.test(file))

  if (videoFiles.length === 0) {
    console.log('No valid video files found in the folder.')
    return
  }

  const summary: ProcessingSummary = {
    total: videoFiles.length,
    successful: 0,
    failed: 0,
    errors: []
  }

  for (const file of videoFiles) {
    const match = file.match(VIDEO_FILENAME_REGEX)
    if (!match) continue
    const [, languageId, edition, videoId] = match

    console.log(`\nProcessing ${file}...`)
    console.log(
      `Language ID: ${languageId}, Edition: ${edition}, Video ID: ${videoId}`
    )

    if (options.dryRun) {
      console.log(`[DRY RUN] Would process file: ${file}`)
      continue
    }

    try {
      // --- R2 Asset Creation ---
      const filePath = path.join(folderPath, file)
      const contentType = 'video/mp4'
      const originalFilename = file
      const contentLength = (await promises.stat(filePath)).size

      console.log('Creating R2 asset...')
      const r2Asset = await createR2Asset({
        fileName: `${videoId}/variants/${languageId}/videos/${videoId}_${languageId}.mp4`,
        contentType,
        originalFilename,
        contentLength,
        videoId
      })

      console.log('Uploading to R2...')
      await uploadToR2(r2Asset.uploadUrl, filePath, contentType)

      console.log('Creating Mux video...')
      const muxVideo = await createAndWaitForMuxVideo(r2Asset.publicUrl)

      console.log('Creating video variant...')
      console.log('Mux ID:', muxVideo.id)
      console.log('Playback ID:', muxVideo.playbackId)
      console.log('Video ID:', videoId)
      console.log('Language ID:', languageId)
      console.log('Edition:', edition)
      const result = await createVideoVariant({
        videoId,
        languageId,
        edition,
        muxId: muxVideo.id,
        playbackId: muxVideo.playbackId
      })
      console.log(
        result === 'created'
          ? '✅ Successfully created video variant'
          : '♻️  Updated existing video variant'
      )
      summary.successful++
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err)
      summary.failed++
      summary.errors.push({
        file,
        error: err instanceof Error ? err.message : String(err)
      })
    }
  }

  // Print summary
  console.log('\n=== Processing Summary ===')
  console.log(`Total files: ${summary.total}`)
  console.log(`Successfully processed: ${summary.successful}`)
  console.log(`Failed: ${summary.failed}`)

  if (summary.errors.length > 0) {
    console.log('\nErrors:')
    summary.errors.forEach(({ file, error }) => {
      console.log(`\n${file}:`)
      console.log(`  ${error}`)
    })
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
