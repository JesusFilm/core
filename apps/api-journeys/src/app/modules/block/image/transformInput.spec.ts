import fetch, { Response } from 'node-fetch'

import { ImageBlockCreateInput } from '../../../__generated__/graphql'

import { transformInput } from './transformInput'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

jest.mock('sharp', () => () => ({
  raw: () => ({
    ensureAlpha: () => ({
      resize: () => ({
        toBuffer: () => ({
          data: new Uint8ClampedArray([]),
          info: {
            width: 32,
            height: 32
          }
        })
      })
    })
  }),
  metadata: jest.fn(() => ({
    width: 640,
    height: 425
  }))
}))

jest.mock('blurhash', () => {
  return {
    encode: jest.fn(() => 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ')
  }
})

describe('transformInput', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      buffer: async () =>
        await Promise.resolve({
          items: []
        })
    } as unknown as Response)
  })

  const blockCreateInput: ImageBlockCreateInput = {
    id: 'blockId',
    journeyId: 'journeyId',
    width: null,
    height: null,
    blurhash: null,
    src: 'https://unsplash.it/640/425?image=42',
    alt: 'alt'
  }

  it('skips transform if src is null', async () => {
    const input = {
      ...blockCreateInput,
      src: null
    }
    expect(await transformInput(input)).toEqual({
      ...input,
      width: 0,
      height: 0,
      blurhash: ''
    })
  })

  it('transforms input', async () => {
    expect(await transformInput(blockCreateInput)).toEqual({
      ...blockCreateInput,
      width: 640,
      height: 425,
      blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ'
    })
  })

  it('skips transform if width, height and blurhash defined', async () => {
    const input = {
      ...blockCreateInput,
      width: 640,
      height: 425,
      blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ'
    }
    expect(await transformInput(input)).toEqual(input)
  })

  it('transforms input if width defined', async () => {
    const input = {
      ...blockCreateInput,
      width: 640
    }
    expect(await transformInput(input)).toEqual({
      ...blockCreateInput,
      width: 640,
      height: 425,
      blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ'
    })
  })

  it('transforms input if width, height defined', async () => {
    const input = {
      ...blockCreateInput,
      width: 640,
      height: 425
    }
    expect(await transformInput(input)).toEqual({
      ...blockCreateInput,
      width: 640,
      height: 425,
      blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ'
    })
  })

  it('throws error when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('fetch error'))
    await expect(transformInput(blockCreateInput)).rejects.toThrow(
      'fetch error'
    )
  })
})
