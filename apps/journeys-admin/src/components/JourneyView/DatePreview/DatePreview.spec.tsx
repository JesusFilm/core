import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import TagManager from 'react-gtm-module'
import { publishedJourney } from '../data'
import { TEMPLATE_PREVIEW_EVENT_CREATE } from './DatePreview'
import { DatePreview } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
>

describe('DatePreview', () => {
  it('should have template date and the preview button', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              ...publishedJourney,
              slug: 'template-slug',
              template: true
            }
          }}
        >
          <DatePreview />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('November 19, 2021')).toBeInTheDocument()
    expect(getByRole('link', { name: 'Preview' })).toBeInTheDocument()
  })

  it('should open correct link in a new window', () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              ...publishedJourney,
              slug: 'template-slug',
              template: true
            }
          }}
        >
          <DatePreview />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('link', { name: 'Preview' })).toHaveAttribute(
      'href',
      '/api/preview?slug=template-slug'
    )
    expect(getByRole('link', { name: 'Preview' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })

  it('should create event', async () => {
    const result = jest.fn(() => ({
      data: {
        templatePreviewEventCreate: {
          __typename: 'TemplatePreviewEvent',
          userId: 'user.id',
          journeyId: 'journey-id',
          id: 'event.id'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TEMPLATE_PREVIEW_EVENT_CREATE,
              variables: {
                input: {
                  journeyId: 'journey-id'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              ...publishedJourney,
              slug: 'template-slug',
              template: true
            }
          }}
        >
          <DatePreview />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('link'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(mockedDataLayer).toHaveBeenCalledWith({
      dataLayer: {
        event: 'template_preview',
        eventId: 'event.id',
        journeyId: 'journey-id',
        userId: 'user.id',
        journeyTitle: 'Published Journey Heading'
      }
    })
  })
})
