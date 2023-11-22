import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render } from '@testing-library/react'

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
          <PageWrapper title="Page title" />
        </MockedProvider>
      )
      expect(getByRole('main')).toHaveTextContent('Page title')
    })

    it('should show back button', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <PageWrapper title="Page title" backHref="/" />
        </MockedProvider>
      )
      expect(getByTestId('ChevronLeftIcon').parentElement).toHaveAttribute(
        'href',
        '/'
      )
    })

    it('should not show main panel header', () => {
      const { queryByText } = render(
        <MockedProvider>
          <PageWrapper title="Page Title" showMainHeader={false} />
        </MockedProvider>
      )
      expect(queryByText('Page Title')).not.toBeInTheDocument()
    })

    it('should show main header children', () => {
      const { getByRole } = render(
        <MockedProvider>
          <PageWrapper
            title="Page title"
            mainHeaderChildren={<>Custom Content</>}
          />
        </MockedProvider>
      )
      expect(getByRole('main')).toHaveTextContent('Custom Content')
    })

    it('should show main body children', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <PageWrapper title="Page title">
            <div>Child</div>
          </PageWrapper>
        </MockedProvider>
      )
      expect(getByTestId('main-body')).toHaveTextContent('Child')
    })

    it('should show bottom panel children', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <PageWrapper
            title="Page title"
            bottomPanelChildren={<div>Bottom Panel</div>}
          >
            <div>Child</div>
          </PageWrapper>
        </MockedProvider>
      )
      expect(getByTestId('bottom-panel')).toHaveTextContent('Bottom Panel')
    })
  })

  describe('SidePanel', () => {
    it('should show the side panel', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <PageWrapper
            title="Page title"
            sidePanelTitle="Side Panel"
            sidePanelChildren={<div>Drawer</div>}
          />
        </MockedProvider>
      )
      expect(getByTestId('side-header')).toHaveTextContent('Side Panel')
      expect(getByTestId('side-body')).toHaveTextContent('Drawer')
    })

    it('should show the custom side panel', () => {
      const { getByText } = render(
        <MockedProvider>
          <PageWrapper
            title="Page title"
            customSidePanel={<div>Custom Drawer</div>}
          />
        </MockedProvider>
      )
      expect(getByText('Custom Drawer')).toBeInTheDocument()
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
          <PageWrapper title="Active Journeys" />
        </MockedProvider>
      )
      expect(
        queryByRole('button', { name: 'open-drawer' })
      ).not.toBeInTheDocument()

      const button = getByTestId('toggle-nav-drawer')
      fireEvent.click(button)
      expect(getByText('Discover')).toBeInTheDocument()
    })
  })
})
