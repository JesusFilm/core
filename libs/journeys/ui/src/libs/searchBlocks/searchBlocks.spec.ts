import type { TreeBlock } from '../block'

import { searchBlocks } from '.'

describe('searchBlocks', () => {
  it('should find block in a given tree', () => {
    const tree: TreeBlock[] = [
      {
        id: 'card0.id',
        __typename: 'CardBlock',
        parentBlockId: null,
        backgroundColor: null,
        coverBlockId: null,
        parentOrder: 0,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        backdropBlur: null,
        children: [
          {
            __typename: 'TypographyBlock',
            id: 'heading3',
            parentBlockId: 'question',
            parentOrder: 0,
            content: 'Hello World!',
            variant: null,
            color: null,
            align: null,
            children: []
          ,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
},
          {
            __typename: 'RadioQuestionBlock',
            id: 'RadioQuestion1',
            parentBlockId: 'RadioQuestion1',
            parentOrder: 1,
            children: [
              {
                __typename: 'RadioOptionBlock',
                id: 'RadioOption1',
                label: 'Option 1',
                parentBlockId: 'RadioQuestion1',
                parentOrder: 0,
                action: null,
                children: []
              },
              {
                __typename: 'RadioOptionBlock',
                id: 'RadioOption2',
                label: 'Option 2',
                parentBlockId: 'RadioQuestion1',
                parentOrder: 1,
                action: null,
                children: []
              }
            ]
          }
        ]
      }
    ]

    const block = searchBlocks(tree, 'RadioOption1')
    expect(block).toEqual({
      __typename: 'RadioOptionBlock',
      id: 'RadioOption1',
      label: 'Option 1',
      parentBlockId: 'RadioQuestion1',
      parentOrder: 0,
      action: null,
      children: []
    })
  })

  it('should only search the step blocks', () => {
    const tree: TreeBlock[] = [
      {
        id: 'card0.id',
        __typename: 'CardBlock',
        parentBlockId: null,
        backgroundColor: null,
        coverBlockId: null,
        parentOrder: 0,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        backdropBlur: null,
        children: [
          {
            __typename: 'TypographyBlock',
            id: 'heading3',
            parentBlockId: 'question',
            parentOrder: 0,
            content: 'Hello World!',
            variant: null,
            color: null,
            align: null,
            children: []
          ,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
},
          {
            __typename: 'RadioQuestionBlock',
            id: 'RadioQuestion1',
            parentBlockId: 'RadioQuestion1',
            parentOrder: 1,
            children: [
              {
                __typename: 'RadioOptionBlock',
                id: 'RadioOption1',
                label: 'Option 1',
                parentBlockId: 'RadioQuestion1',
                parentOrder: 0,
                action: null,
                children: []
              },
              {
                __typename: 'RadioOptionBlock',
                id: 'RadioOption2',
                label: 'Option 2',
                parentBlockId: 'RadioQuestion1',
                parentOrder: 1,
                action: null,
                children: []
              }
            ]
          }
        ]
      }
    ]

    const block = searchBlocks(tree, 'RadioOption1', {
      filter: 'searchStepsOnly'
    })
    expect(block).toBeUndefined()
  })
})
