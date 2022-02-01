import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { BlocksTab } from '.'

describe('BlocksTab', () => {
  it('contains all blocks', () => {
    const { getByText } = render(
      <MockedProvider>
        <BlocksTab />
      </MockedProvider>
    )
    expect(getByText('Text')).toBeInTheDocument()
    expect(getByText('Image')).toBeInTheDocument()
    expect(getByText('Video')).toBeInTheDocument()
    expect(getByText('Poll')).toBeInTheDocument()
    expect(getByText('Subscribe')).toBeInTheDocument()
  })
  it('contains correct bottom text', () => {
    const { getByText } = render(
      <MockedProvider>
        <BlocksTab />
      </MockedProvider>
    )
    expect(getByText('Select a Block to Insert')).toBeInTheDocument()
  })
})
