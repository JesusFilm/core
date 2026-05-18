import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { useAdminJourneysQuery } from '../../libs/useAdminJourneysQuery'
import { ThemeProvider } from '../ThemeProvider'

import { SortOrder } from './JourneySort'

import { JourneyList } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => {
    return {
      query: {
        status: 'active',
        type: 'journeys'
      },
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn()
      }
    }
  })
}))

jest.mock('../../libs/useAdminJourneysQuery', () => ({
  __esModule: true,
  useAdminJourneysQuery: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockedUseAdminJourneysQuery =
  useAdminJourneysQuery as jest.MockedFunction<typeof useAdminJourneysQuery>

describe('JourneyList', () => {
  let originalSetItem: typeof Storage.prototype.setItem

  beforeAll(() => {
    originalSetItem = Storage.prototype.setItem
  })

  beforeEach(() => {
    mockedUseAdminJourneysQuery.mockReturnValue({
      refetch: jest.fn()
    } as unknown as ReturnType<typeof useAdminJourneysQuery>)
    sessionStorage.clear()
  })

  it('should render tab panel', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('tablist')).toBeInTheDocument()
  })

  it('should show add journey button', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('should show add journey button on active tab', () => {
    mockedUseRouter.mockReturnValue({
      query: { status: 'active', type: 'journeys' },
      events: {
        on: jest.fn(),
        off: jest.fn()
      }
    } as unknown as NextRouter)
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('should hide add journey button on trashed tab', () => {
    mockedUseRouter.mockReturnValue({
      query: { status: 'trashed', type: 'journeys' },
      events: {
        on: jest.fn(),
        off: jest.fn()
      }
    } as unknown as NextRouter)
    const { queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(queryByRole('button', { name: 'Add' })).toBeNull()
  })

  it('should hide add journey button on archived tab', () => {
    mockedUseRouter.mockReturnValue({
      query: { status: 'archived', type: 'journeys' },
      events: {
        on: jest.fn(),
        off: jest.fn()
      }
    } as unknown as NextRouter)
    const { queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(queryByRole('button', { name: 'Add' })).toBeNull()
  })

  it('should hide add journey button when type is templates', () => {
    mockedUseRouter.mockReturnValue({
      query: { status: 'active', type: 'templates' },
      events: {
        on: jest.fn(),
        off: jest.fn()
      }
    } as unknown as NextRouter)
    const { queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(queryByRole('button', { name: 'Add' })).toBeNull()
  })

  it('should call refetch when route changes to /publisher', () => {
    const onMock = jest.fn()
    const offMock = jest.fn()

    mockedUseRouter.mockReturnValue({
      query: { status: 'active', type: 'journeys' },
      events: {
        on: onMock,
        off: offMock
      }
    } as unknown as NextRouter)

    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const handler = onMock.mock.calls[0][1] as (url: string) => void

    handler('/publisher')
    expect(mockedUseAdminJourneysQuery().refetch).toHaveBeenCalledTimes(1)
  })

  it('should call refetch when route changes to /', () => {
    const onMock = jest.fn()
    const offMock = jest.fn()

    mockedUseRouter.mockReturnValue({
      query: { status: 'active', type: 'journeys' },
      events: {
        on: onMock,
        off: offMock
      }
    } as unknown as NextRouter)

    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const handler = onMock.mock.calls[0][1] as (url: string) => void

    handler('/')
    expect(mockedUseAdminJourneysQuery().refetch).toHaveBeenCalledTimes(1)
  })

  it('should not call refetch when router changes to some other route', () => {
    const onMock = jest.fn()
    const offMock = jest.fn()

    mockedUseRouter.mockReturnValue({
      query: { status: 'active', type: 'journeys' },
      events: {
        on: onMock,
        off: offMock
      }
    } as unknown as NextRouter)

    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const handler = onMock.mock.calls[0][1] as (url: string) => void

    handler('/random')
    expect(mockedUseAdminJourneysQuery().refetch).not.toHaveBeenCalled()
  })

  it('should display "title" in session storage when sorting by name is selected', async () => {
    const user = userEvent.setup()
    Storage.prototype.setItem = jest.fn()

    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Sort By' }))
    await user.click(screen.getByText('Name'))

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'journeyListSortBy',
      SortOrder.TITLE
    )
    expect(screen.getByText('Sort By: Name')).toBeInTheDocument()
  })

  it('should display "updated at" in session storage when sorting by last modified is selected', async () => {
    const user = userEvent.setup()
    Storage.prototype.setItem = jest.fn()

    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Sort By' }))
    await user.click(screen.getByText('Name'))

    await user.click(screen.getByRole('button', { name: 'Sort By' }))
    await user.click(screen.getByText('Last Modified'))

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'journeyListSortBy',
      SortOrder.UPDATED_AT
    )
    expect(screen.getByText('Sort By: Last Modified')).toBeInTheDocument()
  })

  it('should display "created at" in session storage when sorting by date created is selected', async () => {
    const user = userEvent.setup()
    Storage.prototype.setItem = jest.fn()

    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Sort By' }))
    await user.click(screen.getByText('Date Created'))

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'journeyListSortBy',
      SortOrder.CREATED_AT
    )
    expect(screen.getByText('Sort By: Date Created')).toBeInTheDocument()
  })

  it('should restore sort order from session storage when returning to the page', async () => {
    // resets setItem mock, so that 'journeysListSortBy' in sessionStorage can be set before render
    Storage.prototype.setItem = originalSetItem
    sessionStorage.setItem('journeyListSortBy', SortOrder.TITLE)
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      const sortButton = screen.getByRole('button', { name: 'Sort By' })
      expect(sortButton).toHaveTextContent('Sort By: Name')
    })
    expect(sessionStorage.getItem('journeyListSortBy')).toBe(SortOrder.TITLE)
  })

  describe('Template Info side panel (NES-1538)', () => {
    function renderWithFlags(flags: { teamTemplateCollection?: boolean }) {
      return render(
        <SnackbarProvider>
          <MockedProvider>
            <ThemeProvider>
              <FlagsProvider flags={flags}>
                <JourneyList />
              </FlagsProvider>
            </ThemeProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
    }

    it('renders the desktop panel and mobile trigger when teamTemplateCollection is on and the templates tab is active', () => {
      mockedUseRouter.mockReturnValue({
        query: { status: 'active', type: 'templates' },
        events: { on: jest.fn(), off: jest.fn() }
      } as unknown as NextRouter)

      renderWithFlags({ teamTemplateCollection: true })

      expect(screen.getByTestId('TemplateInfoPanelDesktop')).toBeInTheDocument()
      expect(
        screen.getByTestId('TemplateInfoPanelMobileTrigger')
      ).toBeInTheDocument()
    })

    it('renders nothing on the journeys tab even with the flag on', () => {
      mockedUseRouter.mockReturnValue({
        query: { status: 'active', type: 'journeys' },
        events: { on: jest.fn(), off: jest.fn() }
      } as unknown as NextRouter)

      renderWithFlags({ teamTemplateCollection: true })

      expect(
        screen.queryByTestId('TemplateInfoPanelDesktop')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('TemplateInfoPanelMobileTrigger')
      ).not.toBeInTheDocument()
    })

    it('renders nothing when teamTemplateCollection is off (local template surface unavailable)', () => {
      mockedUseRouter.mockReturnValue({
        query: { status: 'active', type: 'templates' },
        events: { on: jest.fn(), off: jest.fn() }
      } as unknown as NextRouter)

      renderWithFlags({ teamTemplateCollection: false })

      expect(
        screen.queryByTestId('TemplateInfoPanelDesktop')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('TemplateInfoPanelMobileTrigger')
      ).not.toBeInTheDocument()
    })

    it('opens the mobile drawer (presentation role) when the trigger button is clicked', () => {
      mockedUseRouter.mockReturnValue({
        query: { status: 'active', type: 'templates' },
        events: { on: jest.fn(), off: jest.fn() }
      } as unknown as NextRouter)

      renderWithFlags({ teamTemplateCollection: true })

      // MUI SwipeableDrawer renders its modal `role="presentation"` wrapper
      // only when `open=true`; before clicking the trigger no such role
      // exists for the mobile drawer.
      expect(screen.queryByRole('presentation')).not.toBeInTheDocument()

      fireEvent.click(screen.getByTestId('TemplateInfoPanelMobileTrigger'))

      expect(screen.getByRole('presentation')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Close template info' })
      ).toBeInTheDocument()
    })

    it('closes the mobile drawer when the X button is clicked', () => {
      mockedUseRouter.mockReturnValue({
        query: { status: 'active', type: 'templates' },
        events: { on: jest.fn(), off: jest.fn() }
      } as unknown as NextRouter)

      renderWithFlags({ teamTemplateCollection: true })

      fireEvent.click(screen.getByTestId('TemplateInfoPanelMobileTrigger'))
      expect(screen.getByRole('presentation')).toBeInTheDocument()

      fireEvent.click(
        screen.getByRole('button', { name: 'Close template info' })
      )

      // After closing, the MUI modal wrapper unmounts.
      expect(screen.queryByRole('presentation')).not.toBeInTheDocument()
    })
  })
})
