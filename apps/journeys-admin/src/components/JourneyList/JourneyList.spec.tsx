import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

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
  beforeEach(() => {
    mockedUseAdminJourneysQuery.mockReturnValue({
      refetch: jest.fn()
    } as unknown as ReturnType<typeof useAdminJourneysQuery>)
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

    handler('/')
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

    handler('/publisher')
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

  it('should display journeys sorting list when the "sort by" button is clicked', () => {
    render(
      <MockedProvider>
        <JourneyList />
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sort By' }))

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Last Modified')).toBeInTheDocument()
    expect(screen.getByText('Date Created')).toBeInTheDocument()
  })

  it('should display "title" in session storage when sorting by name is selected', async () => {
    const user = userEvent.setup()
    Storage.prototype.setItem = jest.fn()

    sessionStorage.clear()

    render(
      <MockedProvider>
        <JourneyList />
      </MockedProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Sort By' }))
    await user.click(screen.getByText('Name'))

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'journeyListSortBy',
      SortOrder.TITLE
    )
  })

  it('should display "updated at" in session storage when sorting by name is selected', async () => {
    const user = userEvent.setup()
    Storage.prototype.setItem = jest.fn()

    sessionStorage.clear()

    render(
      <MockedProvider>
        <JourneyList />
      </MockedProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Sort By' }))
    await user.click(screen.getByText('Name'))

    await user.click(screen.getByRole('button', { name: 'Sort By' }))
    await user.click(screen.getByText('Last Modified'))

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'journeyListSortBy',
      SortOrder.UPDATED_AT
    )
  })

  it('should display "created at" in session storage when sorting by name is selected', async () => {
    const user = userEvent.setup()
    Storage.prototype.setItem = jest.fn()

    sessionStorage.clear()

    render(
      <MockedProvider>
        <JourneyList />
      </MockedProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Sort By' }))
    await user.click(screen.getByText('Name'))

    await user.click(screen.getByRole('button', { name: 'Sort By' }))
    await user.click(screen.getByText('Date Created'))

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'journeyListSortBy',
      SortOrder.CREATED_AT
    )
  })
})
