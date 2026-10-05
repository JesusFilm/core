import { Block } from '@core/prisma/journeys/client'

import { getRadioQuestionBlockContent } from './getRadioQuestionBlockContent'

describe('getRadioQuestionBlockContent', () => {
  const radio1: Partial<Block> = {
    id: 'r1',
    typename: 'RadioQuestionBlock',
    label: 'Pick one'
  }
  const option1: Partial<Block> = {
    id: 'o1',
    typename: 'RadioOptionBlock',
    parentBlockId: 'r1',
    label: 'Option A'
  }
  const option2: Partial<Block> = {
    id: 'o2',
    typename: 'RadioOptionBlock',
    parentBlockId: 'r1',
    label: 'Option B'
  }
  const otherOption: Partial<Block> = {
    id: 'o3',
    typename: 'RadioOptionBlock',
    parentBlockId: 'r2',
    label: 'Belongs to another question'
  }

  it('includes block id and question label in output', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [radio1 as Block],
      block: radio1 as Block
    })
    expect(result).toContain('Block ID: r1')
    expect(result).toContain('Question: Pick one')
    expect(result).toContain('### Options:')
  })

  it('lists the option labels belonging to this question', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [radio1 as Block, option1 as Block, option2 as Block],
      block: radio1 as Block
    })
    expect(result).toContain('Option A')
    expect(result).toContain('Option B')
  })

  it('does not include options belonging to other questions', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [radio1 as Block, option1 as Block, otherOption as Block],
      block: radio1 as Block
    })
    expect(result).toContain('Option A')
    expect(result).not.toContain('Belongs to another question')
  })

  it('handles a question with no options', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [radio1 as Block],
      block: radio1 as Block
    })
    expect(result).toContain('Block ID: r1')
    expect(result).toContain('### Options:')
  })

  it('handles empty blocks array', () => {
    const result = getRadioQuestionBlockContent({
      blocks: [],
      block: radio1 as Block
    })
    expect(result).toContain('Block ID: r1')
    expect(result).toContain('### Options:')
  })
})
