import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { Items } from './Items'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Items', () => {
  it('should render items', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <Items />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByTestId('AnalyticsItem')).toBeInTheDocument()
    expect(screen.getByTestId('ResponsesItem')).toBeInTheDocument()
    expect(screen.getByTestId('StrategyItem')).toBeInTheDocument()
    expect(screen.getByTestId('ShareItem')).toBeInTheDocument()
  })

  it('should hide ResponsesItem if template', () => {
    render(
      <JourneyProvider
        value={{ journey: { template: true } as unknown as JourneyFields }}
      >
        <SnackbarProvider>
          <MockedProvider>
            <Items />
          </MockedProvider>
        </SnackbarProvider>
      </JourneyProvider>
    )
    expect(screen.getByTestId('AnalyticsItem')).toBeInTheDocument()
    expect(screen.queryByTestId('ResponsesItem')).not.toBeInTheDocument()
  })
})
