import { ApolloCache, Reference, gql } from '@apollo/client'

interface PrependCloudflareImageOptions {
  cloudflareId: string
  url: string
  isAi: boolean
}

const NEW_CLOUDFLARE_IMAGE_FRAGMENT = gql`
  fragment NewCloudflareImage on CloudflareImage {
    id
    url
    blurhash
  }
`

export function prependCloudflareImageToCache(
  cache: ApolloCache<unknown>,
  { cloudflareId, url, isAi }: PrependCloudflareImageOptions
): void {
  cache.modify<{ getMyCloudflareImages: readonly Reference[] }>({
    fields: {
      getMyCloudflareImages(existing = [], { storeFieldName, readField }) {
        const slotIsAi = storeFieldName.includes('"isAi":true')
        if (slotIsAi !== isAi) return existing
        const existingRefs = Array.isArray(existing) ? existing : [existing]
        const alreadyPresent = existingRefs.some(
          (ref) => readField('id', ref) === cloudflareId
        )
        if (alreadyPresent) return existing
        const newRef = cache.writeFragment({
          data: {
            __typename: 'CloudflareImage',
            id: cloudflareId,
            url,
            blurhash: null
          },
          fragment: NEW_CLOUDFLARE_IMAGE_FRAGMENT
        })
        return newRef != null ? [newRef, ...existingRefs] : existing
      }
    }
  })
}
