import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { RadioQuestion } from '.'

describe('RadioQuestion', () => {
  it('should render the RadioQuestion button', () => {
    const { getByText } = render(
      <MockedProvider>
        <RadioQuestion />
      </MockedProvider>
    )
    expect(getByText('Poll')).toBeInTheDocument()
  })
})
