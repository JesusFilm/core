import { MutationHookOptions, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'

export const VIDEO_VARIANT_DOWNLOAD_CREATE = graphql(`
  mutation VideoVariantDownloadCreate(
    $input: VideoVariantDownloadCreateInput!
  ) {
    videoVariantDownloadCreate(input: $input) {
      id
      quality
      size
      height
      width
      url
      version
    }
  }
`)

export type VideoVariantDownloadCreate = ResultOf<
  typeof VIDEO_VARIANT_DOWNLOAD_CREATE
>
export type VideoVariantDownloadCreateVariables = VariablesOf<
  typeof VIDEO_VARIANT_DOWNLOAD_CREATE
>

export function useVideoVariantDownloadCreateMutation(
  options?: MutationHookOptions<
    VideoVariantDownloadCreate,
    VideoVariantDownloadCreateVariables
  >
): ReturnType<
  typeof useMutation<
    VideoVariantDownloadCreate,
    VideoVariantDownloadCreateVariables
  >
> {
  return useMutation(VIDEO_VARIANT_DOWNLOAD_CREATE, {
    ...options,
    update: (cache, { data }, { variables }) => {
      if (data?.videoVariantDownloadCreate) {
        const { videoVariantDownloadCreate } = data
        const videoVariantId = variables?.input.videoVariantId

        if (videoVariantId) {
          cache.modify({
            id: cache.identify({
              __typename: 'VideoVariant',
              id: videoVariantId
            }),
            fields: {
              downloads: (existingDownloads = []) => {
                const newDownloadRef = cache.writeFragment({
                  data: videoVariantDownloadCreate,
                  fragment: graphql(`
                    fragment NewDownload on VideoVariantDownload {
                      id
                      quality
                      size
                      height
                      width
                      url
                      version
                    }
                  `)
                })
                return [...existingDownloads, newDownloadRef]
              }
            }
          })
        }
      }
    }
  })
}
