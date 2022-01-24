import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { TextAlign } from '.'

describe('TextColor drawer', () => {
  it('should show default values', () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <TextAlign id={'text-align-id'} align={null} />
      </MockedProvider>
    )
    expect(getByText('Center')).toBeInTheDocument()
    expect(getByText('Right')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Left' })).toHaveClass('Mui-selected')
  })
})
