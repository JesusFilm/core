import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen } from '@testing-library/react'
import { type Mock } from 'vitest'

import { Drawer } from './Drawer'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: vi.fn()
}))

describe('Drawer', () => {
  it('should not swipe', () => {
    render(<Drawer open />)
    expect(screen.getByTestId('SettingsDrawerContent')).toHaveClass(
      'swiper-no-swiping'
    )
  })

  it('should handle on close', () => {
    const mockHandleClose = vi.fn()
    render(
      <Drawer title="title" open onClose={mockHandleClose}>
        children
      </Drawer>
    )

    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('children')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('close-image-library'))
    expect(mockHandleClose).toHaveBeenCalled()
  })

  describe('smUp', () => {
    beforeEach(() => (useMediaQuery as Mock).mockImplementation(() => true))

    it('should render drawer from the right', () => {
      render(<Drawer open />)
      expect(screen.getByTestId('SettingsDrawer').children[0]).toHaveClass(
        'MuiDrawer-paperAnchorRight'
      )
    })
  })

  describe('smDown', () => {
    beforeEach(() => (useMediaQuery as Mock).mockImplementation(() => false))

    it('should render drawer from the bottom', () => {
      render(<Drawer open />)
      expect(screen.getByTestId('SettingsDrawer').children[0]).toHaveClass(
        'MuiDrawer-paperAnchorBottom'
      )
    })
  })
})
