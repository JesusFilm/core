import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { render } from '@testing-library/react'
import { BlocksTab } from '.'

describe('BlocksTab', () => {
  it('contains all blocks', () => {
    const { getByText } = render(
      <MockedProvider>
        <FlagsProvider flags={{ feedbackBlock: true }}>
          <BlocksTab />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByText('Text')).toBeInTheDocument()
    expect(getByText('Image')).toBeInTheDocument()
    expect(getByText('Video')).toBeInTheDocument()
    expect(getByText('Poll')).toBeInTheDocument()
    expect(getByText('Subscribe')).toBeInTheDocument()
    expect(getByText('Button')).toBeInTheDocument()
    expect(getByText('Feedback')).toBeInTheDocument()
  })
  it('contains correct bottom text', () => {
    const { getByText } = render(
      <MockedProvider>
        <FlagsProvider flags={{ feedbackBlock: true }}>
          <BlocksTab />
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByText('Select a Block to Insert')).toBeInTheDocument()
  })
})
