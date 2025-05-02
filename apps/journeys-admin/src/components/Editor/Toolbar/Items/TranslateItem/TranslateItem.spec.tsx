import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { getLanguagesMock } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery.mock'

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

  it('should open translate journey dialog', async () => {
    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <TranslateItem variant="menu-item" />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Translate'))
    await waitFor(() =>
      expect(screen.getByTestId('TranslateJourneyDialog')).toBeInTheDocument()
    )
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Cancel'))
    await waitFor(() =>
      expect(
        screen.queryByTestId('TranslateJourneyDialog')
      ).not.toBeInTheDocument()
    )
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
