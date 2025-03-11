import { MutationHookOptions, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'

export const VIDEO_VARIANT_DOWNLOAD_DELETE = graphql(`
  mutation VideoVariantDownloadDelete($id: ID!) {
    videoVariantDownloadDelete(id: $id) {
      id
    }
  }
`)

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
  const { enqueueSnackbar } = useSnackbar()
  const t = useTranslations()

  return useMutation(VIDEO_VARIANT_DOWNLOAD_DELETE, {
    ...options,
    onError: (error, ...rest) => {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: false
      })
      options?.onError?.(error, ...rest)
    },
    update: (cache, { data }) => {
      if (data?.videoVariantDownloadDelete) {
        const { id } = data.videoVariantDownloadDelete

        // Find all VideoVariant objects in the cache
        const videoVariants = cache.extract()

        // Loop through all cache objects
        Object.keys(videoVariants).forEach((cacheKey) => {
          // Check if this is a VideoVariant type
          if (cacheKey.includes('VideoVariant:')) {
            // Modify the downloads field to filter out the deleted download
            cache.modify({
              id: cacheKey,
              fields: {
                downloads: (existingDownloads = [], { readField }) => {
                  return existingDownloads.filter(
                    (downloadRef) => readField('id', downloadRef) !== id
                  )
                }
              }
            })
          }
        })
      }
    }
  })
}
