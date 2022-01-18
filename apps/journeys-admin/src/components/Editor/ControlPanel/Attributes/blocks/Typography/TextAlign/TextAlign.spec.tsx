import { render } from '@testing-library/react'
import { TextAlign } from '.'

describe('TextColor drawer', () => {
  it('should show default values', () => {
    const { getByText, getByRole } = render(
      <TextAlign id={'text-align-id'} align={null} />
    )
    expect(getByText('Center')).toBeInTheDocument()
    expect(getByText('Right')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Left' })).toHaveClass('Mui-selected')
  })
})
