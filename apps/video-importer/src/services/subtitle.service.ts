import type { R2Asset, VideoSubtitleInput } from '../types'

import { CREATE_VIDEO_SUBTITLE, UPDATE_VIDEO_SUBTITLE } from './gql/mutations'
import { GET_VIDEO_SUBTITLES_BY_EDITION } from './gql/queries'
import { getGraphQLClient } from './graphqlClient'

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
  fileType: 'vtt' | 'srt'
  r2Asset: R2Asset
}): Promise<'created' | 'updated' | 'failed'> {
  const client = await getGraphQLClient()
  let existingSubtitle: VideoSubtitleInput | undefined
  try {
    const existingSubtitles: { video: { subtitles: VideoSubtitleInput[] } } =
      await client.request(GET_VIDEO_SUBTITLES_BY_EDITION, {
        videoId,
        edition: editionName
      })

    console.log('      Existing subtitles:', existingSubtitles)
    existingSubtitle = existingSubtitles?.video?.subtitles?.find(
      (subtitle) => subtitle.languageId === languageId
    )
    console.log('      Existing subtitle:', existingSubtitle)
  } catch (error) {
    console.error('Error fetching existing subtitle:', error)
    return 'failed'
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
    return 'updated'
  } else {
    const isVtt = fileType === 'vtt'
    const isSrt = fileType === 'srt'

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
    return 'created'
  }
}
