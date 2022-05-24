import { TreeBlock } from '..'
import { getStepHeading } from '.'

describe('getStepHeading', () => {
  it('returns text of first typography block', () => {
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
            id: 'typography1.id',
            parentBlockId: 'card.id',
            parentOrder: 0,
            align: null,
            color: null,
            variant: null,
            content: 'Heading',
            children: []
          },
          {
            __typename: 'TypographyBlock',
            id: 'typograph2.id',
            parentBlockId: 'card.id',
            parentOrder: 1,
            align: null,
            color: null,
            variant: null,
            content: 'Description',
            children: []
          }
        ]
      }
    ]

    expect(getStepHeading(children)).toEqual('Heading')
  })

  it('returns undefined if there are no typography blocks', () => {
    const children: TreeBlock[] = []
    expect(getStepHeading(children)).toBeUndefined()
  })
})
