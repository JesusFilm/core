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

  it('returns label of matching text response block', () => {
    const children: TreeBlock[] = [
      {
        __typename: 'CardBlock',
        id: 'card.id',
        parentBlockId: 'step.id',
        parentOrder: null,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          textResponseBlock
        ]
      }
    ]

    expect(getTextResponseLabel(children, 'textResponse.id')).toBe('Text Response Label')
  })

  it('returns null when no matching block is found', () => {
    const children: TreeBlock[] = [
      {
        __typename: 'CardBlock',
        id: 'card.id',
        parentBlockId: 'step.id',
        parentOrder: null,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          textResponseBlock
        ]
      }
    ]

    expect(getTextResponseLabel(children, 'nonexistent.id')).toBeNull()
  })

  it('returns null when matching block is not a TextResponseBlock', () => {
    const children: TreeBlock[] = [
      {
        __typename: 'CardBlock',
        id: 'card.id',
        parentBlockId: 'step.id',
        parentOrder: null,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            __typename: 'TypographyBlock',
            id: 'typography.id',
            parentBlockId: 'card.id',
            parentOrder: 0,
            align: null,
            color: null,
            content: 'Some content',
            variant: null,
            children: []
          }
        ]
      }
    ]

    expect(getTextResponseLabel(children, 'typography.id')).toBeNull()
  })

  it('returns null when text response block has empty label', () => {
    const children: TreeBlock[] = [
      {
        __typename: 'CardBlock',
        id: 'card.id',
        parentBlockId: 'step.id',
        parentOrder: null,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            ...textResponseBlock,
            label: '   ' // empty or whitespace-only label
          }
        ]
      }
    ]

    expect(getTextResponseLabel(children, 'textResponse.id')).toBeNull()
  })

  it('finds text response block in nested children', () => {
    const children: TreeBlock[] = [
      {
        __typename: 'CardBlock',
        id: 'card.id',
        parentBlockId: 'step.id',
        parentOrder: null,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            __typename: 'CardBlock',
            id: 'nestedCard.id',
            parentBlockId: 'card.id',
            parentOrder: null,
            backgroundColor: null,
            coverBlockId: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [
              {
                ...textResponseBlock,
                id: 'nestedTextResponse.id',
                label: 'Nested Text Response Label'
              }
            ]
          }
        ]
      }
    ]

    expect(getTextResponseLabel(children, 'nestedTextResponse.id')).toBe('Nested Text Response Label')
  })
})
