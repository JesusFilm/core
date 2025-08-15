import { getGraphQLClient } from '../gql/graphqlClient'
import { CREATE_VIDEO_SUBTITLE, UPDATE_VIDEO_SUBTITLE } from '../gql/mutations'
import { GET_VIDEO_SUBTITLES_BY_EDITION } from '../gql/queries'
import { createR2Asset, uploadToR2 } from '../services/r2'
import type { ProcessingSummary, R2Asset, VideoSubtitleInput } from '../types'
import { markFileAsCompleted } from '../utils/fileUtils'
import { validateVideoAndEdition } from '../utils/videoEditionValidator'

export const SUBTITLE_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)(?:---([^-]+))*\.(srt|vtt)$/

export async function processSubtitleFile(
  file: string,
  filePath: string,
  contentLength: number,
  summary: ProcessingSummary
): Promise<void> {
  const match = file.match(SUBTITLE_FILENAME_REGEX)
  if (!match) return

  const [, videoId, editionName, languageId, ...extraFields] = match
  const edition = editionName.toLowerCase()

  console.log(
    `   - IDs: Video=${videoId}, Edition=${edition}, Lang=${languageId}`
  )
  if (extraFields.length > 0) {
    console.log(
      `     - Extra fields: ${extraFields.filter(Boolean).join(', ')}`
    )
  }

  console.log('   Validating video and edition...')
  try {
    await validateVideoAndEdition(videoId, edition)
  } catch (error) {
    console.error(`   Validation failed:`, error)
    summary.failed++
    return
  }

  const contentType = file.endsWith('.srt') ? 'text/srt' : 'text/vtt'
  const originalFilename = file

  console.log('   Preparing Cloudflare R2 asset for subtitle...')
  const subtitleVariantId = `${languageId}_${edition}_${videoId}`
  const fileName = `${videoId}/editions/${edition}/subtitles/${subtitleVariantId}.${contentType.split('/')[1]}`

  let r2Asset
  try {
    r2Asset = await createR2Asset({
      fileName,
      contentType,
      originalFilename,
      videoId,
      contentLength
    })
  } catch (error) {
    console.error(`   Failed to create R2 asset for subtitle:`, error)
    summary.failed++
    return
  }

  console.log('   R2 Public URL:', r2Asset.publicUrl)
  console.log('   Uploading subtitle to R2...')
  try {
    await uploadToR2({
      uploadUrl: r2Asset.uploadUrl,
      bucket: process.env.CLOUDFLARE_R2_BUCKET!,
      filePath,
      contentType,
      contentLength
    })
  } catch (error) {
    console.error(`   Failed to upload subtitle to R2:`, error)
    summary.failed++
    return
  }

  console.log('   Importing or updating subtitle...')
  try {
    await importOrUpdateSubtitle({
      videoId,
      editionName,
      languageId,
      fileType: contentType,
      r2Asset
    })
    summary.successful++
    await markFileAsCompleted(filePath)
  } catch (error) {
    console.error(`   Failed to import/update subtitle:`, error)
    summary.failed++
  }
}

export async function importOrUpdateSubtitle({
  videoId,
  editionName,
  languageId,
  fileType,
  r2Asset
}: {
  videoId: string
  editionName: string
  languageId: string
  fileType: 'text/vtt' | 'text/srt'
  r2Asset: R2Asset
}): Promise<void> {
  const client = await getGraphQLClient()
  let existingSubtitle: VideoSubtitleInput | undefined
  try {
    const existingSubtitles: { video: { subtitles: VideoSubtitleInput[] } } =
      await client.request(GET_VIDEO_SUBTITLES_BY_EDITION, {
        videoId,
        edition: editionName
      })

    existingSubtitle = existingSubtitles?.video?.subtitles?.find(
      (subtitle) => subtitle.languageId === languageId
    )
    console.log('      Existing subtitle:', existingSubtitle)
  } catch (error) {
    console.error('Error fetching existing subtitle:', error)
    throw new Error('Failed to fetch existing subtitle')
  }

  if (existingSubtitle) {
    await client.request(UPDATE_VIDEO_SUBTITLE, {
      input: {
        id: existingSubtitle.id,
        edition: existingSubtitle.edition,
        languageId: existingSubtitle.languageId,
        primary: existingSubtitle.primary,
        srtSrc: r2Asset.publicUrl,
        vttSrc: r2Asset.publicUrl,
        srtAssetId: r2Asset.id,
        vttAssetId: r2Asset.id,
        srtVersion: existingSubtitle.srtVersion
          ? existingSubtitle.srtVersion + 1
          : 1,
        vttVersion: existingSubtitle.vttVersion
          ? existingSubtitle.vttVersion + 1
          : 1
      }
    })
    console.log('     Updated existing video subtitle')
  } else {
    const isVtt = fileType === 'text/vtt'
    const isSrt = fileType === 'text/srt'

    const input: VideoSubtitleInput = {
      videoId,
      edition: editionName,
      languageId,
      primary: languageId === '529',
      vttSrc: isVtt ? r2Asset.publicUrl : undefined,
      srtSrc: isSrt ? r2Asset.publicUrl : undefined,
      vttAssetId: isVtt && r2Asset.id ? r2Asset.id : undefined,
      srtAssetId: isSrt && r2Asset.id ? r2Asset.id : undefined,
      vttVersion: 1,
      srtVersion: 1
    }
    await client.request(CREATE_VIDEO_SUBTITLE, { input })
    console.log('     Created new video subtitle')
  }
}
