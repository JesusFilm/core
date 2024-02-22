import { fireEvent, render } from '@testing-library/react'

import { Drawer } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Drawer', () => {
  it('should render drawer title properly', async () => {
    const { getByText } = render(<Drawer title="DrawerTitle" />)

    expect(getByText('DrawerTitle')).toBeInTheDocument()
  })

  it('should close and open properly', async () => {
    const handleClose = jest.fn()
    const { getByTestId } = render(
      <Drawer title="DrawerTitle" onClose={handleClose} />
    )

    fireEvent.click(getByTestId('X2Icon'))
    expect(handleClose).toHaveBeenCalled()
  })
})
