import { fireEvent, render } from '@testing-library/react'

import EyeOpen from '@core/shared/ui/icons/EyeOpen'

import { MenuItem } from './MenuItem'

describe('MenuItem', () => {
  it('should render menu item', () => {
    const { getByText, getByTestId } = render(
      <MenuItem label="Preview" icon={<EyeOpen />} />
    )

    expect(getByText('Preview')).toBeInTheDocument()
    expect(getByTestId('EyeOpenIcon')).toBeInTheDocument()
  })

  it('should render menu item as disabled', async () => {
    const { getByRole } = render(
      <MenuItem label="Preview" icon={<EyeOpen />} disabled />
    )
    expect(getByRole('menuitem')).toHaveAttribute('aria-disabled', 'true')
  })

  it('should contain redirect props', async () => {
    const { getByRole } = render(
      <MenuItem label="Preview" icon={<EyeOpen />} openInNew />
    )
    expect(getByRole('menuitem')).toHaveAttribute('target', '_blank')
  })

  it('should call onClick on MenuItem click', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <MenuItem label="Preview" icon={<EyeOpen />} onClick={onClick} />
    )
    fireEvent.click(getByRole('menuitem', { name: 'Preview' }))
    expect(onClick).toHaveBeenCalled()
  })
})
