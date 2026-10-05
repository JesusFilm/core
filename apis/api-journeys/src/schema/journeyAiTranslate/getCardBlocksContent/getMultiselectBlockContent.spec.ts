import { Block } from '@core/prisma/journeys/client'

import { getMultiselectBlockContent } from './getMultiselectBlockContent'

describe('getMultiselectBlockContent', () => {
  const multiselect: Partial<Block> = {
    id: 'm1',
    typename: 'MultiselectBlock',
    label: 'Pick any'
  }
  const option1: Partial<Block> = {
    id: 'o1',
    typename: 'MultiselectOptionBlock',
    parentBlockId: 'm1',
    label: 'Option A'
  }
  const option2: Partial<Block> = {
    id: 'o2',
    typename: 'MultiselectOptionBlock',
    parentBlockId: 'm1',
    label: 'Option B'
  }
  const otherOption: Partial<Block> = {
    id: 'o3',
    typename: 'MultiselectOptionBlock',
    parentBlockId: 'm2',
    label: 'Belongs to another multiselect'
  }

  it('includes block id and question label in output', () => {
    const result = getMultiselectBlockContent({
      blocks: [multiselect as Block],
      block: multiselect as Block
    })
    expect(result).toContain('Block ID: m1')
    expect(result).toContain('Question: Pick any')
    expect(result).toContain('### Options:')
  })

  it('lists the option labels belonging to this multiselect', () => {
    const result = getMultiselectBlockContent({
      blocks: [multiselect as Block, option1 as Block, option2 as Block],
      block: multiselect as Block
    })
    expect(result).toContain('Option A')
    expect(result).toContain('Option B')
  })

  it('does not include options belonging to other multiselects', () => {
    const result = getMultiselectBlockContent({
      blocks: [multiselect as Block, option1 as Block, otherOption as Block],
      block: multiselect as Block
    })
    expect(result).toContain('Option A')
    expect(result).not.toContain('Belongs to another multiselect')
  })

  it('handles a multiselect with no options', () => {
    const result = getMultiselectBlockContent({
      blocks: [multiselect as Block],
      block: multiselect as Block
    })
    expect(result).toContain('Block ID: m1')
    expect(result).toContain('### Options:')
  })
})
