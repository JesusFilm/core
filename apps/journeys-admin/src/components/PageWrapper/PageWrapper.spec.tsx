import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { PageWrapper } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('PageWrapper', () => {
  describe('smUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )
    it('should show title', () => {
      const { getByText } = render(
        <MockedProvider>
          <PageWrapper title="Journeys" />
        </MockedProvider>
      )
      expect(getByText('Journeys')).toBeInTheDocument()
    })

    it('should show back button', () => {
      const { getByRole } = render(
        <MockedProvider>
          <PageWrapper title="Journeys" backHref="/" />
        </MockedProvider>
      )
      expect(getByRole('link')).toHaveAttribute('href', '/')
    })

    it('should show custom menu', () => {
      const { getByText } = render(
        <MockedProvider>
          <PageWrapper title="Journeys" Menu={<>Custom Content</>} />
        </MockedProvider>
      )
      expect(getByText('Custom Content')).toBeInTheDocument()
    })

    it('should show children', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <PageWrapper title="Journeys">
            <div data-testid="test">Hello</div>
          </PageWrapper>
        </MockedProvider>
      )
      expect(getByTestId('test')).toHaveTextContent('Hello')
    })

    it('should show the drawer on the left', () => {
      const { getAllByRole, getByTestId, getByText } = render(
        <MockedProvider>
          <PageWrapper title="Journeys" />
        </MockedProvider>
      )
      expect(getAllByRole('button')[0]).toContainElement(
        getByTestId('ChevronRightRoundedIcon')
      )
      fireEvent.click(getAllByRole('button')[0])
      expect(getByText('Discover')).toBeInTheDocument()
    })
  })

  describe('xsDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should show the drawer on mobile view', () => {
      const { getAllByRole, getByTestId, getByText } = render(
        <MockedProvider>
          <PageWrapper title="Journeys" />
        </MockedProvider>
      )
      expect(getByText('Journeys')).toBeInTheDocument()
      const button = getAllByRole('button')[0]
      expect(button).toContainElement(getByTestId('MenuIcon'))
      fireEvent.click(button)
      expect(getByText('Discover')).toBeInTheDocument()
    })
  })
})
