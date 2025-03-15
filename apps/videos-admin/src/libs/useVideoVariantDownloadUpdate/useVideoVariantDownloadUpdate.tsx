import { MutationHookOptions, gql, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'

export const VIDEO_VARIANT_DOWNLOAD_UPDATE = graphql(`
  mutation VideoVariantDownloadUpdate(
    $input: VideoVariantDownloadUpdateInput!
  ) {
    videoVariantDownloadUpdate(input: $input) {
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

export type VideoVariantDownloadUpdate = ResultOf<
  typeof VIDEO_VARIANT_DOWNLOAD_UPDATE
>
export type VideoVariantDownloadUpdateVariables = VariablesOf<
  typeof VIDEO_VARIANT_DOWNLOAD_UPDATE
>

export function useVideoVariantDownloadUpdate(
  options?: MutationHookOptions<
    VideoVariantDownloadUpdate,
    VideoVariantDownloadUpdateVariables
  >
): ReturnType<
  typeof useMutation<
    VideoVariantDownloadUpdate,
    VideoVariantDownloadUpdateVariables
  >
> {
  return useMutation(VIDEO_VARIANT_DOWNLOAD_UPDATE, {
    ...options,
    update: (cache, { data }, { variables }) => {
      if (data?.videoVariantDownloadUpdate) {
        const { videoVariantDownloadUpdate } = data
        cache.modify({
          id: cache.identify({
            __typename: 'VideoVariant',
            id: variables?.input.videoVariantId
          }),
          fields: {
            downloads(existingDownloadRefs = []) {
              const newDownloadRef = cache.writeFragment({
                data: videoVariantDownloadUpdate,
                fragment: gql`
                  fragment NewDownload on VideoVariantDownload {
                    id
                    quality
                    size
                    height
                    width
                    url
                    version
                  }
                `
              })
              return [...existingDownloadRefs, newDownloadRef]
            }
          }
        })
      }
    }
  })
}
