import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyFeature } from '../../../../__generated__/JourneyFeature'

import { FeaturedCheckbox, JOURNEY_FEATURE_UPDATE } from './FeaturedCheckbox'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('FeaturedCheckbox', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const journeyFeatureNullMock: MockedResponse<JourneyFeature> = {
    request: {
      query: JOURNEY_FEATURE_UPDATE,
      variables: { id: 'journeyId', feature: false }
    },
    result: jest.fn(() => ({
      data: {
        journeyFeature: {
          __typename: 'Journey',
          featuredAt: null
        }
      }
    }))
  }

  const journeyFeatureMock: MockedResponse<JourneyFeature> = {
    request: {
      query: JOURNEY_FEATURE_UPDATE,
      variables: { id: 'journeyId', feature: true }
    },
    result: jest.fn(() => ({
      data: {
        journeyFeature: {
          __typename: 'Journey',
          featuredAt: new Date()
        }
      }
    }))
  }

  it('should set journey to not be featured', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[journeyFeatureNullMock]}>
        <FeaturedCheckbox
          journeyId="journeyId"
          featuredAt="2021-11-19T12:34:56.647Z"
        />
      </MockedProvider>
    )
    expect(getByRole('checkbox')).toBeChecked()
    await waitFor(() => fireEvent.click(getByRole('checkbox')))
    expect(getByRole('checkbox')).not.toBeChecked()
    await expect(getByRole('checkbox')).toBeDisabled()
    await waitFor(() =>
      expect(journeyFeatureNullMock.result).toHaveBeenCalled()
    )
    await expect(getByRole('checkbox')).not.toBeDisabled()
  })

  it('should set journey to be featured', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[journeyFeatureMock]}>
        <FeaturedCheckbox journeyId="journeyId" featuredAt={null} />
      </MockedProvider>
    )
    expect(getByRole('checkbox')).not.toBeChecked()
    await waitFor(() => fireEvent.click(getByRole('checkbox')))
    expect(getByRole('checkbox')).toBeChecked()
    await expect(getByRole('checkbox')).toBeDisabled()
    await waitFor(() => expect(journeyFeatureMock.result).toHaveBeenCalled())
    await expect(getByRole('checkbox')).not.toBeDisabled()
  })
})
