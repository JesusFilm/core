import { MutationHookOptions, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'

export type VideoVariantDownloadDelete = ResultOf<
  typeof VIDEO_VARIANT_DOWNLOAD_DELETE
>
export type VideoVariantDownloadDeleteVariables = VariablesOf<
  typeof VIDEO_VARIANT_DOWNLOAD_DELETE
>

export function useVideoVariantDownloadDeleteMutation(
  options?: MutationHookOptions<
    VideoVariantDownloadDelete,
    VideoVariantDownloadDeleteVariables
  >
): ReturnType<
  typeof useMutation<
    VideoVariantDownloadDelete,
    VideoVariantDownloadDeleteVariables
  >
> {
  return useMutation(VIDEO_VARIANT_DOWNLOAD_DELETE, {
    ...options,
    update: (cache, { data }) => {
      if (data?.videoVariantDownloadDelete) {
        cache.evict({
          id: cache.identify({
            __typename: 'VideoVariantDownload',
            id: data.videoVariantDownloadDelete.id
          })
        })
      }
    }
  })
}
