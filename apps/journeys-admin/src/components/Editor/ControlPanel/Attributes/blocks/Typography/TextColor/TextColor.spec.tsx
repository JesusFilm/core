import { render } from '@testing-library/react'
import { TypographyColor } from '../../../../../../../../__generated__/globalTypes'
import { TextColor } from '.'

describe('TextColor drawer', () => {
  it('should show default values', () => {
    const { getByText, getByRole } = render(
      <TextColor id={'text-color-id'} color={TypographyColor.primary} />
    )
    expect(getByText('Error')).toBeInTheDocument()
    expect(getByText('Secondary')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Primary' })).toHaveClass('Mui-selected')
  })
})
