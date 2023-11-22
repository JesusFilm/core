import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '../ThemeProvider'

import { JourneyList } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => {
    return {
      query: {
        tab: 'active'
      },
      push: jest.fn()
    }
  })
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('JourneyList', () => {
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
      query: { tab: 'active' }
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
      query: { tab: 'trashed' }
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
      query: { tab: 'archived' }
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
})
