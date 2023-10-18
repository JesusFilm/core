import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render } from '@testing-library/react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { PageWrapper } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('PageWrapper', () => {
  describe('MainPanel', () => {
    it('should show main header title', () => {
      const { getByRole } = render(
        <MockedProvider>
          <FlagsProvider>
            <PageWrapper title="Page title" />
          </FlagsProvider>
        </MockedProvider>
      )
      expect(getByRole('main')).toHaveTextContent('Page title')
    })

    it('should show back button', () => {
      const { getByRole } = render(
        <MockedProvider>
          <FlagsProvider>
            <PageWrapper title="Page title" backHref="/" />
          </FlagsProvider>
        </MockedProvider>
      )
      expect(getByRole('link')).toHaveAttribute('href', '/')
    })

    it('should not show main panel header', () => {
      const { queryByText } = render(
        <MockedProvider>
          <FlagsProvider>
            <PageWrapper title="Page Title" hiddenPanelHeader />
          </FlagsProvider>
        </MockedProvider>
      )
      expect(queryByText('Page Title')).not.toBeInTheDocument()
    })

    it('should show main header children', () => {
      const { getByRole } = render(
        <MockedProvider>
          <FlagsProvider>
            <PageWrapper
              title="Page title"
              mainHeaderChildren={<>Custom Content</>}
            />
          </FlagsProvider>
        </MockedProvider>
      )
      expect(getByRole('main')).toHaveTextContent('Custom Content')
    })

    it('should show main body children', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <FlagsProvider>
            <PageWrapper title="Page title">
              <div>Child</div>
            </PageWrapper>
          </FlagsProvider>
        </MockedProvider>
      )
      expect(getByTestId('main-body')).toHaveTextContent('Child')
    })

    it('should show bottom panel children', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <FlagsProvider>
            <PageWrapper
              title="Page title"
              bottomPanelChildren={<div>Bottom Panel</div>}
            >
              <div>Child</div>
            </PageWrapper>
          </FlagsProvider>
        </MockedProvider>
      )
      expect(getByTestId('bottom-panel')).toHaveTextContent('Bottom Panel')
    })
  })

  describe('SidePanel', () => {
    it('should show the side panel', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <FlagsProvider>
            <PageWrapper
              title="Page title"
              sidePanelTitle="Side Panel"
              sidePanelChildren={<div>Drawer</div>}
            />
          </FlagsProvider>
        </MockedProvider>
      )
      expect(getByTestId('side-header')).toHaveTextContent('Side Panel')
      expect(getByTestId('side-body')).toHaveTextContent('Drawer')
    })
  })

  describe('Navigation', () => {
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should show the side nav bar', () => {
      ;(useMediaQuery as jest.Mock).mockImplementation(() => true)

      const { getByTestId, getByText, queryByRole } = render(
        <MockedProvider>
          <FlagsProvider>
            <PageWrapper title="Active Journeys" />
          </FlagsProvider>
        </MockedProvider>
      )
      expect(
        queryByRole('button', { name: 'open-drawer' })
      ).not.toBeInTheDocument()

      const button = getByTestId('toggle-nav-drawer')
      fireEvent.click(button)
      expect(getByText('Discover')).toBeInTheDocument()
    })

    it('should show the app header', () => {
      ;(useMediaQuery as jest.Mock).mockImplementation(() => false)
      const { getByRole, getByText, queryByTestId } = render(
        <MockedProvider>
          <FlagsProvider>
            <PageWrapper title="Journey Edit" showAppHeader />
          </FlagsProvider>
        </MockedProvider>
      )
      expect(queryByTestId('toggle-nav-drawer')).not.toBeInTheDocument()

      const button = getByRole('button', { name: 'open drawer' })
      fireEvent.click(button)
      expect(getByText('Discover')).toBeInTheDocument()
    })
  })
})
