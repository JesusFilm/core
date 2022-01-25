import { render } from '@testing-library/react'
import { TextColor } from '.'

describe('TextColor drawer', () => {
  it('should show default values', () => {
    const { getByRole } = render(
      <TextColor id={'text-color-id'} color={null} />
    )
    expect(getByRole('button', { name: 'Primary' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Error' })).toBeInTheDocument()
  })
})
