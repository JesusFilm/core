import { ThemeProvider } from '../../ThemeProvider'
import { render } from '@testing-library/react'
import { Drawer } from '.'
import { EditorProvider } from '../Context'
import useMediaQuery from '@mui/material/useMediaQuery'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Drawer', () => {
  describe('smUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should render the state in drawer', () => {
      const { getByTestId } = render(
        <EditorProvider
          initialState={{
            drawerTitle: 'Title',
            drawerChildren: <div data-testid="test">hello world</div>,
            drawerMobileOpen: true
          }}
        >
          <ThemeProvider>
            <Drawer />
          </ThemeProvider>
        </EditorProvider>
      )
      expect(getByTestId('test')).toHaveTextContent('hello world')
      expect(getByTestId('test')).toBeVisible()
      expect(getByTestId('test').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorRight'
      )
    })
  })

  describe('xsDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should render the state in modal', () => {
      Object.assign(window, { innerWidth: 360 })
      const { getByTestId } = render(
        <EditorProvider
          initialState={{
            drawerTitle: 'Title',
            drawerChildren: <div data-testid="test">hello world</div>,
            drawerMobileOpen: true
          }}
        >
          <ThemeProvider>
            <Drawer />
          </ThemeProvider>
        </EditorProvider>
      )
      expect(getByTestId('test')).toHaveTextContent('hello world')
      expect(getByTestId('test').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorBottom'
      )
    })
  })
})
