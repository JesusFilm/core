import { InMemoryCache, gql } from '@apollo/client'
import { offsetLimitPagination } from '@apollo/client/utilities'

import { prependCloudflareImageToCache } from './prependCloudflareImageToCache'

const GET_MY_CLOUDFLARE_IMAGES = gql`
  query GetMyCloudflareImages($offset: Int, $limit: Int, $isAi: Boolean) {
    getMyCloudflareImages(offset: $offset, limit: $limit, isAi: $isAi) {
      id
      url
      blurhash
    }
  }
`

function makeCache(): InMemoryCache {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getMyCloudflareImages: offsetLimitPagination(['isAi'])
        }
      }
    }
  })
}

function seed(
  cache: InMemoryCache,
  isAi: boolean,
  items: Array<{ id: string; url: string; blurhash: string | null }>
): void {
  cache.writeQuery({
    query: GET_MY_CLOUDFLARE_IMAGES,
    variables: { offset: 0, limit: items.length, isAi },
    data: {
      getMyCloudflareImages: items.map((item) => ({
        __typename: 'CloudflareImage',
        ...item
      }))
    }
  })
}

function readSlot(
  cache: InMemoryCache,
  isAi: boolean
): Array<{ id: string; url: string; blurhash: string | null }> {
  const result = cache.readQuery<{
    getMyCloudflareImages: Array<{
      id: string
      url: string
      blurhash: string | null
    }>
  }>({
    query: GET_MY_CLOUDFLARE_IMAGES,
    variables: { offset: 0, limit: 100, isAi }
  })
  return result?.getMyCloudflareImages ?? []
}

describe('prependCloudflareImageToCache', () => {
  it('should prepend a new image to the matching isAi slot', () => {
    const cache = makeCache()
    seed(cache, false, [
      { id: 'existing-1', url: 'https://cdn/existing-1', blurhash: 'h1' }
    ])

    prependCloudflareImageToCache(cache, {
      cloudflareId: 'new-1',
      url: 'https://cdn/new-1',
      isAi: false
    })

    const slot = readSlot(cache, false)
    expect(slot).toHaveLength(2)
    expect(slot[0]).toEqual(
      expect.objectContaining({
        id: 'new-1',
        url: 'https://cdn/new-1',
        blurhash: null
      })
    )
    expect(slot[1]).toEqual(
      expect.objectContaining({ id: 'existing-1' })
    )
  })

  it('should leave the non-matching isAi slot untouched when writing to the AI slot', () => {
    const cache = makeCache()
    seed(cache, false, [
      { id: 'uploaded-1', url: 'https://cdn/uploaded-1', blurhash: null }
    ])
    seed(cache, true, [
      { id: 'ai-1', url: 'https://cdn/ai-1', blurhash: null }
    ])

    prependCloudflareImageToCache(cache, {
      cloudflareId: 'ai-new',
      url: 'https://cdn/ai-new',
      isAi: true
    })

    expect(readSlot(cache, false).map((i) => i.id)).toEqual(['uploaded-1'])
    expect(readSlot(cache, true).map((i) => i.id)).toEqual(['ai-new', 'ai-1'])
  })

  it('should leave the AI slot untouched when writing to the non-AI slot', () => {
    const cache = makeCache()
    seed(cache, false, [
      { id: 'uploaded-1', url: 'https://cdn/uploaded-1', blurhash: null }
    ])
    seed(cache, true, [
      { id: 'ai-1', url: 'https://cdn/ai-1', blurhash: null }
    ])

    prependCloudflareImageToCache(cache, {
      cloudflareId: 'uploaded-new',
      url: 'https://cdn/uploaded-new',
      isAi: false
    })

    expect(readSlot(cache, true).map((i) => i.id)).toEqual(['ai-1'])
    expect(readSlot(cache, false).map((i) => i.id)).toEqual([
      'uploaded-new',
      'uploaded-1'
    ])
  })

  it('should be a no-op when an image with the same id already exists in the slot', () => {
    const cache = makeCache()
    seed(cache, false, [
      { id: 'dup', url: 'https://cdn/dup', blurhash: 'h' },
      { id: 'other', url: 'https://cdn/other', blurhash: null }
    ])

    prependCloudflareImageToCache(cache, {
      cloudflareId: 'dup',
      url: 'https://cdn/dup-different',
      isAi: false
    })

    const slot = readSlot(cache, false)
    expect(slot.map((i) => i.id)).toEqual(['dup', 'other'])
    // url should not have been overwritten by the duplicate write
    expect(slot[0].url).toBe('https://cdn/dup')
  })

  it('should insert the new image when the slot exists but is empty', () => {
    const cache = makeCache()
    seed(cache, false, [])

    prependCloudflareImageToCache(cache, {
      cloudflareId: 'first',
      url: 'https://cdn/first',
      isAi: false
    })

    const slot = readSlot(cache, false)
    expect(slot).toHaveLength(1)
    expect(slot[0]).toEqual(
      expect.objectContaining({
        id: 'first',
        url: 'https://cdn/first',
        blurhash: null
      })
    )
  })

  it('should preserve existing order with the new ref at the head', () => {
    const cache = makeCache()
    seed(cache, true, [
      { id: 'a', url: 'https://cdn/a', blurhash: null },
      { id: 'b', url: 'https://cdn/b', blurhash: null },
      { id: 'c', url: 'https://cdn/c', blurhash: null }
    ])

    prependCloudflareImageToCache(cache, {
      cloudflareId: 'z',
      url: 'https://cdn/z',
      isAi: true
    })

    expect(readSlot(cache, true).map((i) => i.id)).toEqual([
      'z',
      'a',
      'b',
      'c'
    ])
  })
})
