import fetch, { Response } from 'node-fetch'
import mockSharp from 'sharp'
import { type MockedFunction, vi } from 'vitest'

import { generateBlurhashAndMetadataFromUrl } from './generateBlurhashAndMetadataFromUrl'

vi.mock('node-fetch', async () => {
  const originalModule = await vi.importActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: vi.fn()
  }
})

vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    raw: () => ({
      ensureAlpha: () => ({
        toBuffer: () => new Uint8ClampedArray([])
      })
    }),
    metadata: vi.fn(() => ({
      width: 640,
      height: 425
    }))
  }))
}))

vi.mock('blurhash', () => {
  return {
    encode: vi.fn(() => 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ')
  }
})

const mockFetch = fetch as MockedFunction<typeof fetch>

describe('generateBlurhashAndMetadataFromUrl', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      buffer: async () =>
        await Promise.resolve({
          items: []
        })
    } as unknown as Response)

    // Reset sharp mock to default behavior
    ;(mockSharp as any).mockImplementation(() => ({
      raw: () => ({
        ensureAlpha: () => ({
          toBuffer: () => new Uint8ClampedArray([])
        })
      }),
      metadata: vi.fn(() => ({
        width: 640,
        height: 425
      }))
    }))
  })

  it('generates blurhash and metadata from valid image URL', async () => {
    const result = await generateBlurhashAndMetadataFromUrl(
      'https://example.com/image.jpg'
    )
    expect(result).toEqual({
      blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ',
      width: 640,
      height: 425
    })
  })

  it('returns default values when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('fetch error'))
    const result = await generateBlurhashAndMetadataFromUrl(
      'https://example.com/image.jpg'
    )
    expect(result).toEqual({
      blurhash: '',
      width: 0,
      height: 0
    })
  })

  it('returns default values when sharp processing fails', async () => {
    ;(mockSharp as any).mockImplementation(() => {
      throw new Error('sharp error')
    })

    const result = await generateBlurhashAndMetadataFromUrl(
      'https://example.com/image.jpg'
    )
    expect(result).toEqual({
      blurhash: '',
      width: 0,
      height: 0
    })
  })
})
