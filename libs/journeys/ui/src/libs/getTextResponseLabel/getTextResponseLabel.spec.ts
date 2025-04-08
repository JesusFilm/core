import { TreeBlock } from '../block'
import { BlockFields_TextResponseBlock as TextResponseBlock } from '../block/__generated__/BlockFields'

import { getTextResponseLabel } from '.'

describe('getTextResponseLabel', () => {
  const textResponseBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponse.id',
    parentBlockId: 'card.id',
    parentOrder: 0,
    label: 'Text Response Label',
    hint: null,
    minRows: null,
    placeholder: null,
    type: null,
    routeId: null,
    integrationId: null,
    children: []
  }

  it('returns label of the text response block', () => {
    expect(getTextResponseLabel(textResponseBlock)).toBe('Text Response Label')
  })

  it('returns null when label is empty or whitespace', () => {
    const blockWithWhitespaceLabel = { ...textResponseBlock, label: '   ' }
    const blockWithEmptyLabel = { ...textResponseBlock, label: '' }

    expect(getTextResponseLabel(blockWithWhitespaceLabel)).toBeNull()
    expect(getTextResponseLabel(blockWithEmptyLabel)).toBeNull()
  })

  it('returns null when block is not a TextResponseBlock - e.g. parameter was improperly type-casted', () => {
    const nonTextResponseBlock: TreeBlock<any> = {
      __typename: 'TypographyBlock',
      id: 'typography.id',
      parentBlockId: 'card.id',
      parentOrder: 0,
      children: []
    }
    expect(getTextResponseLabel(nonTextResponseBlock)).toBeNull()
  })
})
