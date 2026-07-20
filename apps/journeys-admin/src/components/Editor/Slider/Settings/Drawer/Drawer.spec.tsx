import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen } from '@testing-library/react'
import { type Mock } from 'vitest'

import { EditorLayoutProvider } from '../../../EditorLayoutContext'

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

  describe('layered layout', () => {
    beforeEach(() => (useMediaQuery as Mock).mockImplementation(() => true))

    it('should render permanent panels in-flow as a paper panel', () => {
      const { container } = render(
        <EditorLayoutProvider value="layered">
          <Drawer title="title">children</Drawer>
        </EditorLayoutProvider>
      )
      const drawer = screen.getByTestId('SettingsDrawer')
      expect(container).toContainElement(drawer)
      expect(drawer).toHaveClass('MuiPaper-root')
      expect(drawer).not.toHaveClass('MuiDrawer-root')
    })

    it('should portal media library drawers outside the editor drawer', () => {
      const { container } = render(
        <EditorLayoutProvider value="layered">
          <Drawer title="title" open>
            children
          </Drawer>
        </EditorLayoutProvider>
      )
      const drawer = screen.getByTestId('SettingsDrawer')
      // portaled to the body so fixed positioning escapes the layered
      // drawer's transformed paper
      expect(container).not.toContainElement(drawer)
      expect(drawer).toHaveClass('MuiDrawer-root')
    })
  })
})
