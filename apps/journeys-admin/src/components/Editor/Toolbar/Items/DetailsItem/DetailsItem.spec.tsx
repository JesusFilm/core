import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { type MockedFunction } from 'vitest'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  defaultJourney,
  publishedLocalTemplate
} from '@core/journeys/ui/TemplateView/data'

import { DetailsItem } from './DetailsItem'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: vi.fn()
}))

const mockedUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('DetailsItem', () => {
  const push = vi.fn()
  const on = vi.fn()

  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)
    vi.clearAllMocks()
  })

  it('should open journey details dialog', async () => {
    render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <DetailsItem variant="menu-item" />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Edit Details'))
    await waitFor(() =>
      expect(screen.getByTestId('JourneyDetailsDialog')).toBeInTheDocument()
    )
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Cancel'))
    await waitFor(() =>
      expect(
        screen.queryByTestId('JourneyDetailsDialog')
      ).not.toBeInTheDocument()
    )
  })

  it('should handle helpscout params on click', async () => {
    render(<DetailsItem variant="menu-item" />)

    fireEvent.click(screen.getByText('Edit Details'))
    expect(push).toHaveBeenCalledWith(
      {
        query: { param: 'journeyDetails' }
      },
      undefined,
      { shallow: true }
    )
  })

  it('opens LocalTemplateDetailsDialog and sets templateDetails param for a local template', async () => {
    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: publishedLocalTemplate }}>
            <DetailsItem variant="menu-item" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Edit Details'))
    expect(push).toHaveBeenCalledWith(
      { query: { param: 'templateDetails' } },
      undefined,
      { shallow: true }
    )
    await waitFor(() =>
      expect(
        screen.getByTestId('LocalTemplateDetailsDialog')
      ).toBeInTheDocument()
    )
    expect(screen.queryByTestId('JourneyDetailsDialog')).not.toBeInTheDocument()
  })
})
