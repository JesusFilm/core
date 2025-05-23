import { Block } from '.prisma/api-journeys-modern-client'

import { getBlockContent } from './getBlockContent'
import { getButtonBlockContent } from './getButtonBlockContent'
import { getImageBlockContent } from './getImageBlockContent'
import { getRadioQuestionBlockContent } from './getRadioQuestionBlockContent'
import { getVideoBlockContent } from './getVideoBlockContent'

// Mock all helper imports
jest.mock('./getButtonBlockContent', () => ({
  getButtonBlockContent: jest.fn(() => 'button-content')
}))
jest.mock('./getImageBlockContent', () => ({
  getImageBlockContent: jest.fn(() => Promise.resolve('image-content'))
}))
jest.mock('./getRadioQuestionBlockContent', () => ({
  getRadioQuestionBlockContent: jest.fn(() => 'radio-question-content')
}))
jest.mock('./getVideoBlockContent', () => ({
  getVideoBlockContent: jest.fn(() => Promise.resolve('video-content'))
}))

describe('getBlockContent', () => {
  const blocks: Block[] = []

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns image content for ImageBlock', async () => {
    const block = { typename: 'ImageBlock' } as any
    const result = await getBlockContent({ blocks, block })
    expect(getImageBlockContent).toHaveBeenCalledWith({ block })
    expect(result).toBe('image-content')
  })

  it('returns video content for VideoBlock', async () => {
    const block = { typename: 'VideoBlock' } as any
    const result = await getBlockContent({ blocks, block })
    expect(getVideoBlockContent).toHaveBeenCalledWith({ blocks, block })
    expect(result).toBe('video-content')
  })

  it('returns formatted string for TypographyBlock', async () => {
    const block = { typename: 'TypographyBlock', content: 'Hello' } as any
    const result = await getBlockContent({ blocks, block })
    expect(result).toBe('## Text: \n Hello\n')
  })

  it('returns button content for ButtonBlock', async () => {
    const block = { typename: 'ButtonBlock' } as any
    const result = await getBlockContent({ blocks, block })
    expect(getButtonBlockContent).toHaveBeenCalledWith({ block })
    expect(result).toBe('button-content')
  })

  it('returns radio question content for RadioQuestionBlock', async () => {
    const block = { typename: 'RadioQuestionBlock' } as any
    const result = await getBlockContent({ blocks, block })
    expect(getRadioQuestionBlockContent).toHaveBeenCalledWith({ blocks, block })
    expect(result).toBe('radio-question-content')
  })

  it('returns blank space for SpacerBlock', async () => {
    const block = { typename: 'SpacerBlock' } as any
    const result = await getBlockContent({ blocks, block })
    expect(result).toBe('### Blank Space\n')
  })

  it('returns empty string for unknown block type', async () => {
    const block = { typename: 'UnknownBlock' } as any
    const result = await getBlockContent({ blocks, block })
    expect(result).toBe('')
  })
})
