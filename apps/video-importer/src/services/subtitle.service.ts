import type { R2Asset, VideoSubtitleInput } from '../types'

import { getGraphQLClient } from './gql/graphqlClient'
import { CREATE_VIDEO_SUBTITLE, UPDATE_VIDEO_SUBTITLE } from './gql/mutations'
import { GET_VIDEO_SUBTITLES_BY_EDITION } from './gql/queries'

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
