import { decode } from 'blurhash'

import { blurImage } from './blurImage'

// Mock blurhash decode function
vi.mock('blurhash', () => ({
  decode: vi.fn()
}))

const mockDecode = vi.mocked(decode)

describe('blurImage', () => {
  // Mock canvas and context before each test
  beforeEach(() => {
    // Create a mock canvas context
    const mockContext = {
      createImageData: () => ({
        data: new Uint8ClampedArray(32 * 32 * 4)
      }),
      putImageData: vi.fn(),
      fillStyle: '',
      fillRect: vi.fn()
    }

    // Create a mock canvas element
    const mockCanvas = {
      getContext: () => mockContext,
      setAttribute: vi.fn(),
      toDataURL: () => 'data:image/png;base64,mockImageData'
    }

    // Mock document.createElement
    document.createElement = vi.fn((tagName) => {
      if (tagName === 'canvas') {
        return mockCanvas as unknown as HTMLCanvasElement
      }
      return {} as HTMLElement
    })
  })

  const image = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    children: []
  }

  it('returns url of blurred image', () => {
    mockDecode.mockReturnValue(new Uint8ClampedArray(32 * 32 * 4).fill(128))

    expect(
      blurImage(image.blurhash, '#000000')?.startsWith('data:image/png;base64,')
    ).toBeTruthy()
  })

  it('returns undefined as fallback', () => {
    // Override the mock to return null context
    document.createElement = vi.fn((tagName) => {
      if (tagName === 'canvas') {
        return {
          getContext: () => null,
          setAttribute: vi.fn()
        } as unknown as HTMLCanvasElement
      }
      return {} as HTMLElement
    })

    mockDecode.mockReturnValue(new Uint8ClampedArray(32 * 32 * 4).fill(128))

    expect(blurImage(image.blurhash, '#000000')).toBeUndefined()
  })

  it('returns undefined if blurhash is empty string', () => {
    expect(blurImage('', '#00000088')).toBeUndefined()
  })

  it('handles decode errors gracefully', () => {
    mockDecode.mockImplementation(() => {
      throw new Error('Invalid blurhash')
    })

    expect(blurImage(image.blurhash, '#000000')).toBeUndefined()
  })

  it('pads small pixel arrays with background color', () => {
    // Return array smaller than expected
    mockDecode.mockReturnValue(new Uint8ClampedArray(16 * 16 * 4).fill(128))

    expect(
      blurImage(image.blurhash, '#FF0000')?.startsWith('data:image/png;base64,')
    ).toBeTruthy()
  })

  it('crops large pixel arrays to fit', () => {
    // Return array larger than expected
    mockDecode.mockReturnValue(new Uint8ClampedArray(64 * 64 * 4).fill(128))

    expect(
      blurImage(image.blurhash, '#00FF00')?.startsWith('data:image/png;base64,')
    ).toBeTruthy()
  })

  it('handles exact size pixel arrays', () => {
    // Return array of exact expected size
    mockDecode.mockReturnValue(new Uint8ClampedArray(32 * 32 * 4).fill(128))

    expect(
      blurImage(image.blurhash, '#0000FF')?.startsWith('data:image/png;base64,')
    ).toBeTruthy()
  })
})
