import { render } from '@testing-library/react'
import { RadioQuestion } from '.'
import transformer from '../../../libs/transformer'
import { radioQuestion } from '../../../data'

const transformed = transformer(radioQuestion)

describe('RadioQuestion', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RadioQuestion {...transformed[0]} />)
    expect(baseElement).toBeTruthy()
  })
  it('should render question with correct text', () => {
    const { getByText } = render(<RadioQuestion {...transformed[0]} />)
    expect(
      getByText('How can we help you know more about Jesus?')
    ).toBeTruthy()
  })
  it('should render description with correct text', () => {
    const { getByText } = render(<RadioQuestion {...transformed[0]} />)
    expect(
      getByText(
        'What do you think would be the next step to help you grow in your relationship with Jesus?'
      )
    ).toBeTruthy()
  })
})
