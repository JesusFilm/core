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
          action: null
        },
        {
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          id: 'Root1',
          nextBlockId: null,
          locked: false
        },
        {
          __typename: 'RadioQuestionBlock',
          id: 'Question1',
          parentBlockId: 'Root1',
          parentOrder: 0,
          label: 'Question 1',
          description: 'Question 1 description'
        },
        {
          __typename: 'RadioOptionBlock',
          id: 'Option1',
          parentBlockId: 'Question1',
          parentOrder: 0,
          label: 'Option 1',
          action: null
        },
        {
          __typename: 'RadioOptionBlock',
          id: 'Option3',
          parentBlockId: 'Question2',
          parentOrder: 0,
          label: 'Option 3',
          action: null
        },
        {
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 1,
          id: 'Root2',
          nextBlockId: null,
          locked: false
        },
        {
          __typename: 'RadioOptionBlock',
          id: 'Option2',
          parentBlockId: 'Question1',
          parentOrder: 1,
          label: 'Option 2',
          action: null
        },
        {
          __typename: 'RadioQuestionBlock',
          id: 'Question2',
          parentBlockId: 'Root2',
          parentOrder: 1,
          label: 'Question 2',
          description: 'Question 2 description'
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
                action: null
              },
              {
                children: [],
                __typename: 'RadioOptionBlock',
                id: 'Option2',
                parentBlockId: 'Question1',
                parentOrder: 1,
                label: 'Option 2',
                action: null
              }
            ],
            __typename: 'RadioQuestionBlock',
            id: 'Question1',
            parentBlockId: 'Root1',
            parentOrder: 0,
            label: 'Question 1',
            description: 'Question 1 description'
          }
        ],
        id: 'Root1',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        nextBlockId: null,
        locked: false
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
                action: null
              },
              {
                children: [],
                __typename: 'RadioOptionBlock',
                id: 'Option4',
                parentBlockId: 'Question2',
                parentOrder: 1,
                label: 'Option 4',
                action: null
              }
            ],
            __typename: 'RadioQuestionBlock',
            id: 'Question2',
            parentBlockId: 'Root2',
            parentOrder: 1,
            label: 'Question 2',
            description: 'Question 2 description'
          }
        ],
        id: 'Root2',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 1,
        nextBlockId: null,
        locked: false
      }
    ])
  })
})
