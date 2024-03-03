import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../../../__generated__/JourneyFields'

import { StrategyItem } from './StrategyItem'

describe('StrategyItem', () => {
  const mockJourney: JourneyFields = {
    id: 'journeyId',
    title: 'Some Title',
    slug: 'journeySlug'
  } as unknown as JourneyFields

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call close menu', async () => {
    const mockOnClick = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider>
            <JourneyProvider value={{ journey: mockJourney }}>
              <StrategyItem variant="button" closeMenu={mockOnClick} />
            </JourneyProvider>
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(mockOnClick).toHaveBeenCalled())
  })
})
