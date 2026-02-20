import {
  JourneyFields_blocks as Block,
  JourneyFields_blocks_ImageBlock as ImageBlock,
  JourneyFields_logoImageBlock as LogoImageBlock,
  JourneyFields_blocks_VideoBlock as VideoBlock
} from '../JourneyProvider/__generated__/JourneyFields'

import { checkBlocksForCustomizableMedia } from './checkBlocksForCustomizableMedia'

const createImageBlock = (overrides: Partial<ImageBlock> = {}): ImageBlock =>
  ({
    __typename: 'ImageBlock',
    id: 'img-1',
    parentBlockId: null,
    parentOrder: 0,
    src: null,
    alt: '',
    width: 0,
    height: 0,
    blurhash: '',
    scale: null,
    focalTop: null,
    focalLeft: null,
    customizable: null,
    ...overrides
  }) as ImageBlock

const createVideoBlock = (overrides: Partial<VideoBlock> = {}): VideoBlock =>
  ({
    __typename: 'VideoBlock',
    id: 'vid-1',
    parentBlockId: null,
    parentOrder: 0,
    muted: null,
    autoplay: null,
    startAt: null,
    endAt: null,
    posterBlockId: null,
    fullsize: null,
    videoId: null,
    videoVariantLanguageId: null,
    source: 'internal',
    title: null,
    description: null,
    image: null,
    duration: null,
    objectFit: null,
    showGeneratedSubtitles: null,
    subtitleLanguage: null,
    mediaVideo: null,
    action: null,
    eventLabel: null,
    endEventLabel: null,
    customizable: null,
    ...overrides
  }) as VideoBlock

const createLogoImageBlock = (
  overrides: Partial<LogoImageBlock> = {}
): LogoImageBlock =>
  ({
    __typename: 'ImageBlock',
    id: 'logo-1',
    parentBlockId: null,
    parentOrder: null,
    src: null,
    alt: '',
    width: 0,
    height: 0,
    blurhash: '',
    scale: null,
    focalTop: null,
    focalLeft: null,
    customizable: null,
    ...overrides
  }) as LogoImageBlock

describe('checkBlocksForCustomizableMedia', () => {
  it('should return false for empty blocks and no logo', () => {
    expect(checkBlocksForCustomizableMedia([], undefined)).toBe(false)
    expect(checkBlocksForCustomizableMedia([], null)).toBe(false)
  })

  it('should return true when logoImageBlock is customizable', () => {
    const logo = createLogoImageBlock({ customizable: true })
    expect(checkBlocksForCustomizableMedia([], logo)).toBe(true)
  })

  it('should return false when logoImageBlock is not customizable and blocks are empty', () => {
    expect(
      checkBlocksForCustomizableMedia(
        [],
        createLogoImageBlock({ customizable: false })
      )
    ).toBe(false)
    expect(
      checkBlocksForCustomizableMedia(
        [],
        createLogoImageBlock({ customizable: null })
      )
    ).toBe(false)
  })

  it('should return true when blocks contain a customizable ImageBlock or VideoBlock', () => {
    expect(
      checkBlocksForCustomizableMedia([
        createImageBlock({ customizable: true }) as Block
      ])
    ).toBe(true)
    expect(
      checkBlocksForCustomizableMedia([
        createVideoBlock({ customizable: true }) as Block
      ])
    ).toBe(true)
  })

  it('should return false when blocks contain only non-customizable media', () => {
    expect(
      checkBlocksForCustomizableMedia([
        createImageBlock({ customizable: false }) as Block
      ])
    ).toBe(false)
    expect(
      checkBlocksForCustomizableMedia([
        createVideoBlock({ customizable: false }) as Block
      ])
    ).toBe(false)
    expect(
      checkBlocksForCustomizableMedia([
        createImageBlock({ customizable: null }) as Block
      ])
    ).toBe(false)
    expect(
      checkBlocksForCustomizableMedia(
        [createImageBlock({ customizable: false }) as Block],
        createLogoImageBlock({ customizable: false })
      )
    ).toBe(false)
  })

  it('should return false for non-media block types', () => {
    const unsupportedBlock = {
      __typename: 'TypographyBlock',
      id: '1',
      parentBlockId: null,
      parentOrder: 0
    } as unknown as Block
    expect(checkBlocksForCustomizableMedia([unsupportedBlock])).toBe(false)
  })

  it('should return true when blocks contain non-media blocks and a customizable ImageBlock', () => {
    const typographyBlock = {
      __typename: 'TypographyBlock',
      id: '1',
      parentBlockId: null,
      parentOrder: 0
    } as unknown as Block
    const imageBlock = createImageBlock({ customizable: true })
    expect(
      checkBlocksForCustomizableMedia([typographyBlock, imageBlock as Block])
    ).toBe(true)
  })

  it('should return true when logo is customizable and blocks contain non-customizable media', () => {
    const logo = createLogoImageBlock({ customizable: true })
    const imageBlock = createImageBlock({ customizable: false })
    expect(checkBlocksForCustomizableMedia([imageBlock as Block], logo)).toBe(
      true
    )
  })
})
