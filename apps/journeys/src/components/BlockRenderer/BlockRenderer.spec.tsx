import { render } from '@testing-library/react'
import { BlockRenderer } from '.'
import transformer from '../../libs/transformer'
import { BlockType } from '../../types'

const data: BlockType[] = [
  {
    __typename: 'Step',
    id: 'Root Video'
  },
  {
    __typename: 'RadioQuestion',
    id: 'MoreQuestions',
    label: 'How can we help you know more about Jesus?',
    description:
      'What do you think would be the next step to help you grow in your relationship with Christ',
    parent: {
      id: 'Root Video'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'NestedMoreQuestions',
    label: 'Chat Privately',
    parent: {
      id: 'MoreQuestions'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'NestedMoreQuestions2',
    label: 'Get a bible',
    parent: {
      id: 'MoreQuestions'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'NestedMoreQuestions3',
    label: 'Watch more vidoes about Jesus',
    parent: {
      id: 'MoreQuestions'
    }
  },
  {
    __typename: 'RadioOption',
    id: 'NestedMoreQuestions4',
    label: 'Ask a question',
    parent: {
      id: 'MoreQuestions'
    }
  }
]

const transformed = transformer(data)

describe('BlockRenderer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BlockRenderer block={transformed} />)

    expect(baseElement).toBeTruthy()
  })
})
