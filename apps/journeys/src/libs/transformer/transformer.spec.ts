import transformer from '.'

describe('transformer', () => {
  it('should change flat array into tree successfully', () => {
    expect(
      transformer([
        {
          __typename: 'StepBlock',
          parentBlockId: null,
          id: 'Root1'
        },
        {
          __typename: 'StepBlock',
          parentBlockId: null,
          id: 'Root2'
        },
        {
          __typename: 'RadioQuestionBlock',
          id: 'Question1',
          parentBlockId: 'Root1',
          label: 'Question 1',
          description: 'Question 1 description',
          variant: null
        },
        {
          __typename: 'RadioOptionBlock',
          id: 'Option1',
          parentBlockId: 'Question1',
          label: 'Option 1',
          action: null
        },
        {
          __typename: 'RadioOptionBlock',
          id: 'Option2',
          parentBlockId: 'Question1',
          label: 'Option 2',
          action: null
        },
        {
          __typename: 'RadioQuestionBlock',
          id: 'Question2',
          parentBlockId: 'Root2',
          label: 'Question 2',
          description: 'Question 2 description',
          variant: null
        },
        {
          __typename: 'RadioOptionBlock',
          id: 'Option3',
          parentBlockId: 'Question2',
          label: 'Option 3',
          action: null
        },
        {
          __typename: 'RadioOptionBlock',
          id: 'Option4',
          parentBlockId: 'Question2',
          label: 'Option 4',
          action: null
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
                label: 'Option 1',
                action: null
              },
              {
                children: [],
                __typename: 'RadioOptionBlock',
                id: 'Option2',
                parentBlockId: 'Question1',
                label: 'Option 2',
                action: null
              }
            ],
            __typename: 'RadioQuestionBlock',
            id: 'Question1',
            parentBlockId: 'Root1',
            label: 'Question 1',
            description: 'Question 1 description',
            variant: null
          }
        ],
        id: 'Root1',
        __typename: 'StepBlock',
        parentBlockId: null
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
                label: 'Option 3',
                action: null
              },
              {
                children: [],
                __typename: 'RadioOptionBlock',
                id: 'Option4',
                parentBlockId: 'Question2',
                label: 'Option 4',
                action: null
              }
            ],
            __typename: 'RadioQuestionBlock',
            id: 'Question2',
            parentBlockId: 'Root2',
            label: 'Question 2',
            description: 'Question 2 description',
            variant: null
          }
        ],
        id: 'Root2',
        __typename: 'StepBlock',
        parentBlockId: null
      }
    ])
  })
})
