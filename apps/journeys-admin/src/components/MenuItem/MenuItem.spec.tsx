import { fireEvent, render } from '@testing-library/react'

import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'

import { MenuItem } from './MenuItem'

describe('MenuItem', () => {
  it('should render menu item', () => {
    const { getByText, getByTestId } = render(
      <MenuItem label="Preview" icon={<EyeOpenIcon />} />
    )

    expect(getByText('Preview')).toBeInTheDocument()
    expect(getByTestId('EyeOpenIcon')).toBeInTheDocument()
  })

  it('should render menu item as disabled', async () => {
    const { getByRole } = render(
      <MenuItem label="Preview" icon={<EyeOpenIcon />} disabled />
    )
    expect(getByRole('menuitem')).toHaveAttribute('aria-disabled', 'true')
  })

  it('should contain redirect props', async () => {
    const { getByRole } = render(
      <MenuItem label="Preview" icon={<EyeOpenIcon />} openInNew />
    )
    expect(getByRole('menuitem')).toHaveAttribute('target', '_blank')
  })

  it('should call onClick on MenuItem click', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <MenuItem label="Preview" icon={<EyeOpenIcon />} onClick={onClick} />
    )
    fireEvent.click(getByRole('menuitem', { name: 'Preview' }))
    expect(onClick).toHaveBeenCalled()
  })
})
