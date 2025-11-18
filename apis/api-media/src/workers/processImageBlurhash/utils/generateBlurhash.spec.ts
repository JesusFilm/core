import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'

import { generateBlurhash } from './generateBlurhash'

const mockSharp = require('sharp')

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

const server = setupServer()

describe('generateBlurhash', () => {
  beforeAll(() => {
    server.listen()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    server.resetHandlers()

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

  afterAll(() => {
    server.close()
  })

  it('generates blurhash from valid image ID', async () => {
    server.use(
      http.get('https://imagedelivery.net/testAccount/test-image-id', () => {
        return HttpResponse.arrayBuffer(new ArrayBuffer(0))
      })
    )

    const result = await generateBlurhash('test-image-id')
    expect(result).toBe('UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ')
  })

  it('returns null when fetch fails', async () => {
    server.use(
      http.get('https://imagedelivery.net/testAccount/test-image-id', () => {
        return HttpResponse.error()
      })
    )

    const result = await generateBlurhash('test-image-id')
    expect(result).toBeNull()
  })

  it('returns null when image has zero width', async () => {
    server.use(
      http.get('https://imagedelivery.net/testAccount/test-image-id', () => {
        return HttpResponse.arrayBuffer(new ArrayBuffer(0))
      })
    )

    mockSharp.mockImplementation(() => ({
      raw: () => ({
        ensureAlpha: () => ({
          toBuffer: () => new Uint8ClampedArray([])
        })
      }),
      metadata: jest.fn(() => ({
        width: 0,
        height: 425
      }))
    }))
    const result = await generateBlurhash('test-image-id')
    expect(result).toBeNull()
  })

  it('returns null when image has zero height', async () => {
    server.use(
      http.get('https://imagedelivery.net/testAccount/test-image-id', () => {
        return HttpResponse.arrayBuffer(new ArrayBuffer(0))
      })
    )

    mockSharp.mockImplementation(() => ({
      raw: () => ({
        ensureAlpha: () => ({
          toBuffer: () => new Uint8ClampedArray([])
        })
      }),
      metadata: jest.fn(() => ({
        width: 640,
        height: 0
      }))
    }))
    const result = await generateBlurhash('test-image-id')
    expect(result).toBeNull()
  })

  it('returns null when sharp processing fails', async () => {
    server.use(
      http.get('https://imagedelivery.net/testAccount/test-image-id', () => {
        return HttpResponse.arrayBuffer(new ArrayBuffer(0))
      })
    )

    mockSharp.mockImplementation(() => {
      throw new Error('sharp error')
    })
    const result = await generateBlurhash('test-image-id')
    expect(result).toBeNull()
  })

  it('returns null when buffer processing fails', async () => {
    server.use(
      http.get('https://imagedelivery.net/testAccount/test-image-id', () => {
        return HttpResponse.arrayBuffer(new ArrayBuffer(0))
      })
    )

    mockSharp.mockImplementation(() => ({
      raw: () => ({
        ensureAlpha: () => {
          throw new Error('buffer error')
        }
      }),
      metadata: jest.fn(() => ({
        width: 640,
        height: 425
      }))
    }))
    const result = await generateBlurhash('test-image-id')
    expect(result).toBeNull()
  })
})
