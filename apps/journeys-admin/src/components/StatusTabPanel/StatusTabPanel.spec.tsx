import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { NextRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '../ThemeProvider'
import { StatusTabPanel } from './StatusTabPanel'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('StatusTabPanel', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))
  it('should render tab panels', async () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <StatusTabPanel
              activeList={<>Active List</>}
              archivedList={<>Archived</>}
              trashedList={<>Trashed</>}
              activeTabLoaded
              setActiveEvent={jest.fn()}
              setSortOrder={jest.fn()}
            />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('Active List')).toBeInTheDocument()
  })

  it('should disable tab when waiting for journeys to load', () => {
    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <StatusTabPanel
              activeList={<>Active List</>}
              archivedList={<>Archived</>}
              trashedList={<>Trashed</>}
              activeTabLoaded={false}
              setActiveEvent={jest.fn()}
              setSortOrder={jest.fn()}
            />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Active' })).toBeDisabled()
  })

  it('should not change tab if clicking a already selected tab', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <StatusTabPanel
              activeList={<>Active List</>}
              archivedList={<>Archived</>}
              trashedList={<>Trashed</>}
              activeTabLoaded
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
    const router = {
      query: {
        tab: undefined
      }
    } as unknown as NextRouter

    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <StatusTabPanel
              router={router}
              activeList={<>Active List</>}
              archivedList={<>Archived</>}
              trashedList={<>Trashed</>}
              activeTabLoaded
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
    const router = {
      query: {
        tab: 'archived'
      }
    } as unknown as NextRouter

    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <StatusTabPanel
              activeList={<>Active List</>}
              archivedList={<>Archived List</>}
              trashedList={<>Trashed List</>}
              activeTabLoaded
              setActiveEvent={jest.fn()}
              setSortOrder={jest.fn()}
              router={router}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('tab', { name: 'Archived' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(getByText('Archived List')).toBeInTheDocument()
  })
})
