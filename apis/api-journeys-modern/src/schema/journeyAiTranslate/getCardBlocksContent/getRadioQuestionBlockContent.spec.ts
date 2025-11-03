import { Block } from '@core/prisma/journeys/client'

import { getRadioQuestionBlockContent } from './getRadioQuestionBlockContent'

describe('getRadioQuestionBlockContent', () => {
  const radio1: Partial<Block> = {
    id: 'r1',
    typename: 'RadioQuestionBlock'
  }
  const radio2: Partial<Block> = {
    id: 'r2',
    typename: 'RadioQuestionBlock'
  }
  const notRadio: Partial<Block> = {
    id: 'n1',
    typename: 'TypographyBlock',
    label: 'NotQ'
  }

  it('includes block id in output', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [radio1 as Block],
      block: radio1 as Block
    })
    expect(result).toContain('Block ID: r1')
  })

  it('includes radio question blocks without labels', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [radio1 as Block, radio2 as Block],
      block: radio1 as Block
    })
    expect(result).toContain('### Questions:')
    // Should not contain any label text since labels are removed
    expect(result).not.toContain('Q1')
    expect(result).not.toContain('Q2')
  })

  it('does not include non-radio-question blocks', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [radio1 as Block, notRadio as Block],
      block: radio1 as Block
    })
    expect(result).toContain('### Questions:')
    expect(result).not.toContain('NotQ')
  })

  it('handles no other radio question blocks', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [radio1 as Block],
      block: radio1 as Block
    })
    expect(result).toContain('Block ID: r1')
    expect(result).toContain('### Questions:')
  })

  it('handles empty blocks array', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [],
      block: radio1 as Block
    })
    expect(result).toContain('Block ID: r1')
    expect(result).toContain('### Questions:')
  })
})
