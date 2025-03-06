import { MutationFunction } from '@apollo/client'
import { useTranslations } from 'next-intl'

import {
  GetAdminVideo_AdminVideo_VideoEdition as Edition,
  GetAdminVideo_AdminVideo as Video
} from '../../../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import {
  CreateCloudflareR2Asset,
  CreateCloudflareR2AssetVariables
} from '../../../../../../../../../../../libs/useCreateR2Asset/useCreateR2Asset'
import { getSubtitleR2Path } from '../../getSubtitleR2Path'

/**
 * Handles the upload of an SRT file for a subtitle
 * @param params Parameters for handling SRT file upload
 * @returns The public URL of the uploaded SRT file
 */
export async function handleSrtFile({
  srtFile,
  video,
  edition,
  languageId,
  createR2Asset,
  uploadAssetFile,
  abortController
}: {
  srtFile: File
  video: Video
  edition: Edition
  languageId: string
  createR2Asset: MutationFunction<
    CreateCloudflareR2Asset,
    CreateCloudflareR2AssetVariables
  >
  uploadAssetFile: (file: File, uploadUrl: string) => Promise<void>
  abortController: React.MutableRefObject<AbortController | null>
}): Promise<string | null> {
  const t = useTranslations()
  const fileName = getSubtitleR2Path(video, edition, languageId, srtFile)

  const result = await createR2Asset({
    variables: {
      input: {
        videoId: video.id,
        fileName: fileName,
        contentType: srtFile.type,
        contentLength: srtFile.size
      }
    },
    context: {
      fetchOptions: {
        signal: abortController.current?.signal
      }
    }
  })

  if (result.data?.cloudflareR2Create?.uploadUrl == null) {
    throw new Error(t('Failed to create r2 asset for SRT file.'))
  }

  const uploadUrl = result.data.cloudflareR2Create.uploadUrl
  const publicUrl = result.data.cloudflareR2Create.publicUrl

  await uploadAssetFile(srtFile, uploadUrl)
  return publicUrl
}
