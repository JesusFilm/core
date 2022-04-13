import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { JourneyProvider } from '../../../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
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
    expect(getByText('0/ 180 characters')).toBeInTheDocument()
  })
  it('should display seo description', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={
            {
              description: 'journey description',
              seoDescription: 'social description'
            } as unknown as Journey
          }
        >
          <DescriptionEdit />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('social description')).toBeInTheDocument()
  })
  it('should display journey description when seo description not set', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={
            {
              description: 'journey description',
              seoDescription: null
            } as unknown as Journey
          }
        >
          <DescriptionEdit />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('journey description')).toBeInTheDocument()
  })
  it('should display empty form when journey description and seo description not set', () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={
            {
              description: null,
              seoDescription: null
            } as unknown as Journey
          }
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
        <JourneyProvider value={{ id: 'journey.id' } as unknown as Journey}>
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

  it('should show error text when character limit exeeded', async () => {
    const longDescription =
      'Long description thats over the max character limit for description: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin et tortor in ex eleifend porta. Suspendisse faucibus ligula.'

    const { getByRole, getByText } = render(
      <MockedProvider>
        <JourneyProvider value={{ id: 'journey.id' } as unknown as Journey}>
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
