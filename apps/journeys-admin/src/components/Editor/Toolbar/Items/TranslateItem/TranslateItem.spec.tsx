import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { TranslateItem } from './TranslateItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TranslateItem', () => {
  const push = jest.fn()
  const on = jest.fn()

  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)
    jest.clearAllMocks()
  })

  // TODO: Add test for opening translate dialog once implemented
  it('should open translate dialog', async () => {
    // This will be implemented once the TranslateJourneyDialog is added
    // Similar to how DetailsItem opens JourneyDetailsDialog
  })

  it('should handle helpscout params on click', async () => {
    render(<TranslateItem variant="menu-item" />)

    fireEvent.click(screen.getByText('Translate'))
    expect(push).toHaveBeenCalledWith(
      {
        query: { param: 'journeyTranslate' }
      },
      undefined,
      { shallow: true }
    )
  })
})
