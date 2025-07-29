import { transformer } from '.'

describe('transformer', () => {
  it('should change flat array into tree successfully', () => {
    expect(
      transformer([
        {
          __typename: 'RadioOptionBlock',
          id: 'Option4',
          parentBlockId: 'Question2',
          parentOrder: 1,
          label: 'Option 4',
          action: null,
          pollOptionImageId: null
        },
        {
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          id: 'Root1',
          nextBlockId: null,
          locked: false,
          slug: null
        },
        {
          __typename: 'CardBlock',
          backgroundColor: '#30313D',
          coverBlockId: '404-imageBlock-id',
          fullscreen: false,
          backdropBlur: null,
          id: 'invalidRoot',
          parentBlockId: null,
          parentOrder: 0,
          themeMode: null,
          themeName: null
        },
        {
          __typename: 'RadioQuestionBlock',
          id: 'Question1',
          parentBlockId: 'Root1',
          parentOrder: 0,
          gridView: false
        },
        {
          __typename: 'RadioOptionBlock',
          id: 'Option1',
          parentBlockId: 'Question1',
          parentOrder: 0,
          label: 'Option 1',
          action: null,
          pollOptionImageId: null
        },
        {
          __typename: 'RadioOptionBlock',
          id: 'Option3',
          parentBlockId: 'Question2',
          parentOrder: 0,
          label: 'Option 3',
          action: null,
          pollOptionImageId: null
        },
        {
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 1,
          id: 'Root2',
          nextBlockId: null,
          locked: false,
          slug: null
        },
        {
          __typename: 'RadioOptionBlock',
          id: 'Option2',
          parentBlockId: 'Question1',
          parentOrder: 1,
          label: 'Option 2',
          action: null,
          pollOptionImageId: null
        },
        {
          __typename: 'RadioQuestionBlock',
          id: 'Question2',
          parentBlockId: 'Root2',
          parentOrder: 1,
          gridView: false
        }
      ])
    ).toEqual([
      {
        children: [
          {
            children: [
              {
                children: [],
                __typename: 'RadioOptionBlock',
                id: 'Option1',
                parentBlockId: 'Question1',
                parentOrder: 0,
                label: 'Option 1',
                action: null,
                pollOptionImageId: null
              },
              {
                children: [],
                __typename: 'RadioOptionBlock',
                id: 'Option2',
                parentBlockId: 'Question1',
                parentOrder: 1,
                label: 'Option 2',
                action: null,
                pollOptionImageId: null
              }
            ],
            __typename: 'RadioQuestionBlock',
            id: 'Question1',
            parentBlockId: 'Root1',
            parentOrder: 0,
            gridView: false
          }
        ],
        id: 'Root1',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        nextBlockId: null,
        locked: false,
        slug: null
      },
      {
        children: [
          {
            children: [
              {
                children: [],
                __typename: 'RadioOptionBlock',
                id: 'Option3',
                parentBlockId: 'Question2',
                parentOrder: 0,
                label: 'Option 3',
                action: null,
                pollOptionImageId: null
              },
              {
                children: [],
                __typename: 'RadioOptionBlock',
                id: 'Option4',
                parentBlockId: 'Question2',
                parentOrder: 1,
                label: 'Option 4',
                action: null,
                pollOptionImageId: null
              }
            ],
            __typename: 'RadioQuestionBlock',
            id: 'Question2',
            parentBlockId: 'Root2',
            parentOrder: 1,
            gridView: false
          }
        ],
        id: 'Root2',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 1,
        nextBlockId: null,
        locked: false,
        slug: null
      }
    ])
  })
})
