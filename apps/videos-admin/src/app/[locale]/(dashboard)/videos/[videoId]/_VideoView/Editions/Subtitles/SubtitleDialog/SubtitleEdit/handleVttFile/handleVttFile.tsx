import { MutationFunction } from '@apollo/client'

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
 * Handles the upload of a VTT file for a subtitle
 * @param params Parameters for handling VTT file upload
 * @returns The public URL of the uploaded VTT file
 */
export async function handleVttFile({
  vttFile,
  video,
  edition,
  languageId,
  createR2Asset,
  uploadAssetFile,
  abortController,
  errorMessage
}: {
  vttFile: File
  video: Video
  edition: Edition
  languageId: string
  createR2Asset: MutationFunction<
    CreateCloudflareR2Asset,
    CreateCloudflareR2AssetVariables
  >
  uploadAssetFile: (file: File, uploadUrl: string) => Promise<void>
  abortController: React.MutableRefObject<AbortController | null>
  errorMessage: string
}): Promise<string | null> {
  const fileName = getSubtitleR2Path(video, edition, languageId, vttFile)

  const result = await createR2Asset({
    variables: {
      input: {
        videoId: video.id,
        fileName: fileName,
        contentType: vttFile.type,
        contentLength: vttFile.size
      }
    },
    context: {
      fetchOptions: {
        signal: abortController.current?.signal
      }
    }
  })

  if (result.data?.cloudflareR2Create?.uploadUrl == null) {
    throw new Error(errorMessage)
  }

  const uploadUrl = result.data.cloudflareR2Create.uploadUrl
  const publicUrl = result.data.cloudflareR2Create.publicUrl

  await uploadAssetFile(vttFile, uploadUrl)
  return publicUrl
}
