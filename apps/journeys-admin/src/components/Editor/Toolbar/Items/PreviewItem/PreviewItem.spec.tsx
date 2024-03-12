import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../../../__generated__/JourneyFields'

import { PreviewItem } from './PreviewItem'

import '../../../../../../test/i18n'

describe('PreviewItem', () => {
  const mockJourney: JourneyFields = {
    id: 'journeyId',
    title: 'Some Title',
    slug: 'journeySlug'
  } as unknown as JourneyFields

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call onclick', async () => {
    const mockOnClick = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: mockJourney }}>
            <PreviewItem variant="icon-button" onClick={mockOnClick} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('link'))
    await waitFor(() => expect(mockOnClick).toHaveBeenCalled())
  })

  it('should have correct link', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: mockJourney }}>
            <PreviewItem variant="icon-button" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/api/preview?slug=journeySlug'
    )
  })
})
