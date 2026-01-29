import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'

import {
  DescriptionEdit,
  JOURNEY_SEO_DESCRIPTION_UPDATE
} from './DescriptionEdit'

describe('DescriptionEdit', () => {
  it('should display suggested description length', () => {
    const { getByText } = render(
      <MockedProvider>
        <DescriptionEdit />
      </MockedProvider>
    )
    expect(getByText('Recommended length: up to 18 words')).toBeInTheDocument()
  })

  it('should display seo description', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              description: 'journey description',
              seoDescription: 'social description'
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <DescriptionEdit />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('social description')).toBeInTheDocument()
  })

  it('should display empty form when journey description and seo description not set', () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              description: null,
              seoDescription: null
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <DescriptionEdit />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('textbox')).toBeEmptyDOMElement()
  })

  it('should update seo description', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'journey.id',
          seoDescription: 'new description'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_SEO_DESCRIPTION_UPDATE,
              variables: {
                id: 'journey.id',
                input: {
                  seoDescription: 'new description'
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
              id: 'journey.id',
              slug: 'some-slug'
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <DescriptionEdit />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'new description' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should update seo description with a 180-character long string when user attempts to type beyond the character limit', async () => {
    const longDescription =
      'This is a very long description that exceeds the 180-character limit and should be truncated properly by the component. It contains more text than allowed to test the maxLength behavior in the browser environment and ensure proper truncation happens as expected by users when they type.'
    const expectedTruncatedDescription = longDescription.substring(0, 180)

    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'journey.id',
          seoDescription: expectedTruncatedDescription
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_SEO_DESCRIPTION_UPDATE,
              variables: {
                id: 'journey.id',
                input: {
                  seoDescription: expectedTruncatedDescription
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
              id: 'journey.id',
              slug: 'some-slug'
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <DescriptionEdit />
        </JourneyProvider>
      </MockedProvider>
    )

    const textField = getByRole('textbox') as HTMLInputElement
    await userEvent.clear(textField)
    await userEvent.type(textField, longDescription)
    expect(textField.value).toBe(expectedTruncatedDescription)
    expect(textField.value.length).toBe(180)

    await userEvent.tab()
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should show error text when character limit exeeded', async () => {
    const longDescription =
      'Long description thats over the max character limit for description: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin et tortor in ex eleifend porta. Suspendisse faucibus ligula.'

    const { getByRole, getByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journey.id',
              slug: 'some-slug'
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <DescriptionEdit />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: longDescription }
    })
    await waitFor(() =>
      expect(getByText('Character limit reached')).toBeInTheDocument()
    )
  })
})
