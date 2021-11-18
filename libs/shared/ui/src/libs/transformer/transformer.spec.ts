import { transformer } from '.'

type Block =
  | {
      __typename: 'StepBlock'
      nextBlockId: string | null
      locked: boolean
    }
  | {
      __typename: 'RadioQuestionBlock'
      label: string
      description: string
    }
  | {
      __typename: 'RadioOptionBlock'
      label: string
      action: null
    }

describe('transformer', () => {
  it('should change flat array into tree successfully', () => {
    expect(
      transformer<Block>([
        {
          __typename: 'StepBlock',
          parentBlockId: null,
          id: 'Root1',
          nextBlockId: null,
          locked: false
        },
        {
          __typename: 'StepBlock',
          parentBlockId: null,
          id: 'Root2',
          nextBlockId: null,
          locked: false
        },
        {
          __typename: 'RadioQuestionBlock',
          id: 'Question1',
          parentBlockId: 'Root1',
          label: 'Question 1',
          description: 'Question 1 description'
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
          description: 'Question 2 description'
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
            description: 'Question 1 description'
          }
        ],
        id: 'Root1',
        __typename: 'StepBlock',
        parentBlockId: null,
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
            description: 'Question 2 description'
          }
        ],
        id: 'Root2',
        __typename: 'StepBlock',
        parentBlockId: null,
        nextBlockId: null,
        locked: false
      }
    ])
  })
})
