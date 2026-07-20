import { ApolloCache, Reference, gql } from '@apollo/client'

const NEW_CLOUDFLARE_IMAGE_FRAGMENT = gql`
  fragment NewCloudflareImage on CloudflareImage {
    id
    url
    blurhash
    userId
  }
`

export function prependCloudflareImage(
  cache: ApolloCache<unknown>,
  image: { id: string; url: string; blurhash: string | null; userId: string },
  isAi: boolean
): void {
  const ref = cache.writeFragment({
    data: { __typename: 'CloudflareImage', ...image },
    fragment: NEW_CLOUDFLARE_IMAGE_FRAGMENT
  })
  if (ref == null) return
  cache.modify({
    fields: {
      getMyCloudflareImages(existing, { storeFieldName, readField }) {
        if (!storeFieldName.includes(`"isAi":${isAi}`)) return existing
        const list = Array.isArray(existing) ? (existing as Reference[]) : []
        const deduped = list.filter(
          (item) => readField<string>('id', item) !== image.id
        )
        return [ref, ...deduped]
      }
    }
  })
}
