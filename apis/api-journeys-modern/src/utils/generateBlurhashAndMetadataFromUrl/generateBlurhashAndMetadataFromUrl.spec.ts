import fetch, { Response } from 'node-fetch'

import { generateBlurhashAndMetadataFromUrl } from './generateBlurhashAndMetadataFromUrl'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})

jest.mock('sharp', () =>
  jest.fn(() => ({
    raw: () => ({
      ensureAlpha: () => ({
        toBuffer: () => new Uint8ClampedArray([])
      })
    }),
    metadata: jest.fn(() => ({
      width: 640,
      height: 425
    }))
  }))
)

jest.mock('blurhash', () => {
  return {
    encode: jest.fn(() => 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ')
  }
})

const mockFetch = fetch as jest.MockedFunction<typeof fetch>
const mockSharp = require('sharp')

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
    mockSharp.mockImplementation(() => ({
      raw: () => ({
        ensureAlpha: () => ({
          toBuffer: () => new Uint8ClampedArray([])
        })
      }),
      metadata: jest.fn(() => ({
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
    mockSharp.mockImplementation(() => {
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
