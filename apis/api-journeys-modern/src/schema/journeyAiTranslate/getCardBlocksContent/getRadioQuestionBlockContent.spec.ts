import { Block } from '.prisma/api-journeys-modern-client'

import { getRadioQuestionBlockContent } from './getRadioQuestionBlockContent'

describe('getRadioQuestionBlockContent', () => {
  const radio1: Partial<Block> = {
    id: 'r1',
    typename: 'RadioQuestionBlock',
    label: 'Q1'
  }
  const radio2: Partial<Block> = {
    id: 'r2',
    typename: 'RadioQuestionBlock',
    label: 'Q2'
  }
  const notRadio: Partial<Block> = {
    id: 'n1',
    typename: 'TypographyBlock',
    label: 'NotQ'
  }

  it('includes block id and label in output', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [radio1 as Block],
      block: radio1 as Block
    })
    expect(result).toContain('Block ID: r1')
    expect(result).toContain('Text: Q1')
  })

  it('lists all radio question block labels from blocks', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [radio1 as Block, radio2 as Block],
      block: radio1 as Block
    })
    expect(result).toContain('- Q1')
    expect(result).toContain('- Q2')
  })

  it('does not list non-radio-question blocks', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [radio1 as Block, notRadio as Block],
      block: radio1 as Block
    })
    expect(result).toContain('- Q1')
    expect(result).not.toContain('NotQ')
  })

  it('handles no other radio question blocks', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [radio1 as Block],
      block: radio1 as Block
    })
    expect(result).toContain('- Q1')
  })

  it('handles empty blocks array', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [],
      block: radio1 as Block
    })
    expect(result).toContain('Block ID: r1')
    expect(result).toContain('Text: Q1')
  })
})
