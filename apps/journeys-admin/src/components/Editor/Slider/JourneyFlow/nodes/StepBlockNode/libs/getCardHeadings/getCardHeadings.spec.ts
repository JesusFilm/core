import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'

import { BlockFields_CardBlock } from '../../../../../../../../../__generated__/BlockFields'
import { getCardMetadata } from '../getCardMetadata'

import { getCardHeadings } from '.'

describe('getCardHeading', () => {
  const card: TreeBlock<BlockFields_CardBlock> = {
    __typename: 'CardBlock',
    id: '13',
    parentBlockId: '123',
    parentOrder: 1,
    backgroundColor: 'white',
    coverBlockId: 'a',
    themeMode: null,
    themeName: null,
    fullscreen: false,
    children: [
      {
        __typename: 'TypographyBlock',
        id: 'cardId',
        parentBlockId: 'stepId',
        parentOrder: 0,
        align: null,
        color: null,
        content: 'title here',
        variant: null,
        children: []
      }
    ]
  }

  it('should be called when there is a typography block present', () => {
    getCardMetadata(card)

    expect(getCardHeadings).toHaveBeenCalled()
  })

  it('should return a card title and subtitle when called', () => {
    getCardHeadings(card.children)

    expect('title here').toBe('a')
    expect('b').toBeInTheDocument()
  })

  it('should not be called where there are no typography blocks', async () => {
    getCardMetadata(card)

    expect(getCardHeadings).not.toHaveBeenCalled()
  })
})
