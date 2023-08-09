import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '../ThemeProvider'

import { StatusTabPanel } from './StatusTabPanel'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: undefined } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('StatusTabPanel', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('should render tab panels', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <StatusTabPanel
              activeList={<>Active List</>}
              archivedList={<>Archived</>}
              trashedList={<>Trashed</>}
              setActiveEvent={jest.fn()}
              setSortOrder={jest.fn()}
            />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('Active List')).toBeInTheDocument()
  })

  it('should not change tab if clicking a already selected tab', () => {
    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <StatusTabPanel
              activeList={<>Active List</>}
              archivedList={<>Archived</>}
              trashedList={<>Trashed</>}
              setActiveEvent={jest.fn()}
              setSortOrder={jest.fn()}
            />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Active' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    fireEvent.click(getByRole('tab', { name: 'Active' }))
    expect(getByRole('tab', { name: 'Active' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('should show active tab on default', () => {
    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <StatusTabPanel
              activeList={<>Active List</>}
              archivedList={<>Archived</>}
              trashedList={<>Trashed</>}
              setActiveEvent={jest.fn()}
              setSortOrder={jest.fn()}
            />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Active' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('should set active tab based on url query params', () => {
    mockedUseRouter.mockReturnValue({
      query: {
        tab: 'archived'
      }
    } as unknown as NextRouter)

    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <StatusTabPanel
              activeList={<>Active List</>}
              archivedList={<>Archived List</>}
              trashedList={<>Trashed List</>}
              setActiveEvent={jest.fn()}
              setSortOrder={jest.fn()}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('tab', { name: 'Archived' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('should switch tab to active', () => {
    const push = jest.fn()
    const setActiveEvent = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: {
        tab: 'archived'
      },
      push
    } as unknown as NextRouter)

    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <StatusTabPanel
              activeList={<>Active List</>}
              archivedList={<>Archived List</>}
              trashedList={<>Trashed List</>}
              setActiveEvent={setActiveEvent}
              setSortOrder={jest.fn()}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(getByText('Archived List')).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Active' }))
    expect(push).toHaveBeenCalledWith({ query: { tab: 'active' } }, undefined, {
      shallow: true
    })
    expect(setActiveEvent).toHaveBeenCalledWith('refetchActive')
  })

  it('should switch tab to archived', () => {
    const push = jest.fn()
    const setActiveEvent = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: {
        tab: 'active'
      },
      push
    } as unknown as NextRouter)

    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <StatusTabPanel
              activeList={<>Active List</>}
              archivedList={<>Archived List</>}
              trashedList={<>Trashed List</>}
              setActiveEvent={setActiveEvent}
              setSortOrder={jest.fn()}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(getByText('Active List')).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Archived' }))
    expect(push).toHaveBeenCalledWith(
      { query: { tab: 'archived' } },
      undefined,
      { shallow: true }
    )
    expect(setActiveEvent).toHaveBeenCalledWith('refetchArchived')
  })

  it('should switch tab to trash', () => {
    const push = jest.fn()
    const setActiveEvent = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: {
        tab: 'active'
      },
      push
    } as unknown as NextRouter)

    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <StatusTabPanel
              activeList={<>Active List</>}
              archivedList={<>Archived List</>}
              trashedList={<>Trashed List</>}
              setActiveEvent={setActiveEvent}
              setSortOrder={jest.fn()}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(getByText('Active List')).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Trash' }))
    expect(push).toHaveBeenCalledWith(
      { query: { tab: 'trashed' } },
      undefined,
      { shallow: true }
    )
    expect(setActiveEvent).toHaveBeenCalledWith('refetchTrashed')
  })
})
