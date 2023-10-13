import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { User } from 'next-firebase-auth'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  JourneyFields as Journey,
  JourneyFields_tags as Tag
} from '../../../__generated__/JourneyFields'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'
import { defaultJourney } from '../JourneyView/data'

import { TemplateView } from './TemplateView'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TemplateView', () => {
  const tag: Tag = {
    __typename: 'Tag',
    id: 'tag.id',
    parentId: 'parentTag.id',
    name: [
      {
        __typename: 'Translation',
        primary: true,
        value: 'tag.name',
        language: { __typename: 'Language', id: 'language.id' }
      }
    ]
  }

  const getJourneyMock = {
    request: {
      query: GET_JOURNEYS,
      variables: {
        where: {
          template: true,
          orderByRecent: true,
          tagIds: ['tag.id']
        }
      }
    },
    result: {
      data: {
        journeys: [
          {
            ...defaultJourney,
            id: 'taggedJourney.id',
            tags: [tag]
          }
        ]
      }
    }
  }

  it('should render Strategy section if journey strategy slug is available', () => {
    const journeyWithStrategySlug: Journey = {
      ...defaultJourney,
      strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view',
      tags: [tag]
    }
    const { getByText } = render(
      <MockedProvider mocks={[getJourneyMock]}>
        <JourneyProvider
          value={{
            journey: journeyWithStrategySlug,
            variant: 'admin'
          }}
        >
          <TemplateView authUser={{} as unknown as User} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByText('Strategy')).toBeInTheDocument()
  })

  it('should not render Strategy section if journey strategy slug is null', () => {
    const journeyWithoutStrategySlug: Journey = {
      ...defaultJourney,
      strategySlug: null,
      tags: [tag]
    }
    const { queryByText } = render(
      <MockedProvider mocks={[getJourneyMock]}>
        <JourneyProvider
          value={{
            journey: journeyWithoutStrategySlug,
            variant: 'admin'
          }}
        >
          <TemplateView authUser={{} as unknown as User} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(queryByText('Strategy')).not.toBeInTheDocument()
  })

  it('should get related templates', async () => {
    const journeyWithTags: Journey = {
      ...defaultJourney,
      strategySlug: null,
      tags: [tag]
    }

    const result = jest.fn(() => ({
      data: {
        journeys: [
          defaultJourney,
          {
            ...defaultJourney,
            id: 'taggedJourney.id',
            tags: [tag]
          }
        ]
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEYS,
              variables: {
                where: {
                  template: true,
                  orderByRecent: true,
                  tagIds: ['tag.id']
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: journeyWithTags,
            variant: 'admin'
          }}
        >
          <TemplateView authUser={{} as unknown as User} />
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })

  it('should render template tags', () => {
    const journeyWithTags: Journey = {
      ...defaultJourney,
      tags: [tag]
    }
    const { getByTestId } = render(
      <MockedProvider mocks={[getJourneyMock]}>
        <JourneyProvider
          value={{
            journey: journeyWithTags,
            variant: 'admin'
          }}
        >
          <TemplateView authUser={{} as unknown as User} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByTestId('TemplateTags')).toBeInTheDocument()
  })
})
