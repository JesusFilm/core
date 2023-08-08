import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { SocialProvider } from '../../../SocialProvider'

import { JOURNEY_SEO_TITLE_UPDATE, TitleEdit } from './TitleEdit'

describe('TitleEdit', () => {
  it('should display suggested title length', () => {
    const { getByText } = render(
      <MockedProvider>
        <SocialProvider>
          <TitleEdit />
        </SocialProvider>
      </MockedProvider>
    )
    expect(getByText('Recommended length: 5 words')).toBeInTheDocument()
  })

  it('should display seo title', () => {
    const { getByText } = render(
      <MockedProvider>
        <SocialProvider>
          <JourneyProvider
            value={{
              journey: {
                title: 'journey title',
                seoTitle: 'Social share title'
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TitleEdit />
          </JourneyProvider>
        </SocialProvider>
      </MockedProvider>
    )
    expect(getByText('Social share title')).toBeInTheDocument()
  })

  it('should display journey title when seo title not set', () => {
    const { getByText } = render(
      <MockedProvider>
        <SocialProvider>
          <JourneyProvider
            value={{
              journey: {
                title: 'journey title',
                seoTitle: null
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TitleEdit />
          </JourneyProvider>
        </SocialProvider>
      </MockedProvider>
    )
    expect(getByText('journey title')).toBeInTheDocument()
  })

  it('should update seo title', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'journey.id',
          seoTitle: 'new title'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_SEO_TITLE_UPDATE,
              variables: {
                id: 'journey.id',
                input: {
                  seoTitle: 'new title'
                }
              }
            },
            result
          }
        ]}
      >
        <SocialProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TitleEdit />
          </JourneyProvider>
        </SocialProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), { target: { value: 'new title' } })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should show error text when character limit exeeded', async () => {
    const longTitle =
      'This is a long title that needs to be over the character count of 65 to test validationThis is a long title that needs to be over the character count of 65 to test validation'

    const { getByRole, getByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { id: 'journey.id' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <TitleEdit />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), { target: { value: longTitle } })
    await waitFor(() =>
      expect(getByText('Character limit reached')).toBeInTheDocument()
    )
  })
})
