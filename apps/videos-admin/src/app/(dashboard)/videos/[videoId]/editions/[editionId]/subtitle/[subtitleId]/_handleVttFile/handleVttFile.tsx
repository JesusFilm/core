import { MutationFunction } from '@apollo/client'

import {
  CreateCloudflareR2Asset,
  CreateCloudflareR2AssetVariables
} from '../../../../../../../../../libs/useCreateR2Asset/useCreateR2Asset'
import { getSubtitleR2Path } from '../../_getSubtitleR2Path/getSubtitleR2Path'

/**
 * Handles the upload of a VTT file for a subtitle
 * @param params Parameters for handling VTT file upload
 * @returns The public URL of the uploaded VTT file
 */
export async function handleVttFile({
  vttFile,
  videoId,
  editionId,
  languageId,
  createR2Asset,
  uploadAssetFile,
  abortController,
  errorMessage
}: {
  vttFile: File
  videoId: string
  editionId: string
  languageId: string
  createR2Asset: MutationFunction<
    CreateCloudflareR2Asset,
    CreateCloudflareR2AssetVariables
  >
  uploadAssetFile: (file: File, uploadUrl: string) => Promise<void>
  abortController: React.MutableRefObject<AbortController | null>
  errorMessage: string
}): Promise<{
  publicUrl: string
  uploadUrl: string
  r2AssetId: string
}> {
  const fileName = getSubtitleR2Path(videoId, editionId, languageId, vttFile)

  const result = await createR2Asset({
    variables: {
      input: {
        videoId: videoId,
        fileName: fileName,
        originalFilename: vttFile.name,
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

  if (result.data?.cloudflareR2Create?.uploadUrl == null)
    throw new Error(errorMessage)

  const uploadUrl = result.data.cloudflareR2Create.uploadUrl

  const publicUrl = result.data.cloudflareR2Create.publicUrl
  if (publicUrl == null) throw new Error(errorMessage)

  await uploadAssetFile(vttFile, uploadUrl)

  return {
    publicUrl,
    uploadUrl,
    r2AssetId: result.data.cloudflareR2Create.id
  }
}
