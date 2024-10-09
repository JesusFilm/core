import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../../../__generated__/JourneyFields'
import { getCustomDomainMock } from '../../../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'

import { PreviewItem } from './PreviewItem'

describe('PreviewItem', () => {
  const mockJourney: JourneyFields = {
    id: 'journeyId',
    title: 'Some Title',
    slug: 'journeySlug',
    team: {
      id: 'teamId'
    }
  } as unknown as JourneyFields

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call onclick', async () => {
    const mockOnClick = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[getCustomDomainMock]}>
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

  it('should not call onclick when no journey id', async () => {
    const mockOnClick = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[getCustomDomainMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: undefined }}>
            <PreviewItem variant="icon-button" onClick={mockOnClick} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(mockOnClick).not.toHaveBeenCalled())
  })

  it('should have correct link', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getCustomDomainMock]}>
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

  it('should provide customDomain hostname to preview button', async () => {
    const result = jest.fn().mockReturnValue(getCustomDomainMock.result)
    const { getByRole } = render(
      <MockedProvider mocks={[{ ...getCustomDomainMock, result }]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: mockJourney }}>
            <PreviewItem variant="icon-button" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/api/preview?slug=journeySlug&hostname=example.com'
    )
  })
})
