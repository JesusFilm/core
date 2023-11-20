import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { User } from 'next-firebase-auth'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetTags } from '../../../__generated__/GetTags'
import {
  JourneyFields as Journey,
  JourneyFields_tags as Tag
} from '../../../__generated__/JourneyFields'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'
import { GET_TAGS } from '../../libs/useTagsQuery/useTagsQuery'
import { defaultJourney } from '../Editor/data'

import { parentTags, tags } from './TemplateTags/data'
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
    parentId: 'tags.topic.id',
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

  it('should show creator details if provided', async () => {
    const journeyWithCreatorDetails: Journey = {
      ...defaultJourney,
      strategySlug: null,
      tags: [tag],
      creatorDescription:
        'Created by a Name of a Mission or Missionaries Organisation label by a Name of a Mission or Missionaries',
      creatorImageBlock: {
        id: 'creatorImageBlock.id',
        parentBlockId: null,
        parentOrder: 3,
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'photo-1552410260-0fd9b577afa6',
        width: 6000,
        height: 4000,
        blurhash: 'LHFr#AxW9a%L0KM{IVRkoMD%D%R*',
        __typename: 'ImageBlock'
      }
    }
    const { getAllByText, getAllByRole } = render(
      <MockedProvider mocks={[getJourneyMock]}>
        <JourneyProvider
          value={{
            journey: journeyWithCreatorDetails,
            variant: 'admin'
          }}
        >
          <TemplateView authUser={{} as unknown as User} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(
      getAllByText(
        'Created by a Name of a Mission or Missionaries Organisation label by a Name of a Mission or Missionaries'
      )
    ).toHaveLength(2)
    const creatorImages = getAllByRole('img')
    expect(creatorImages).toHaveLength(2)
    expect(creatorImages[0]).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'
    )
  })

  it('should not show creator details if description is not provided', async () => {
    const journeyWithoutCreatorDescription: Journey = {
      ...defaultJourney,
      strategySlug: null,
      tags: [tag],
      creatorDescription: null,
      creatorImageBlock: {
        id: 'creatorImageBlock.id',
        parentBlockId: null,
        parentOrder: 3,
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'photo-1552410260-0fd9b577afa6',
        width: 6000,
        height: 4000,
        blurhash: 'LHFr#AxW9a%L0KM{IVRkoMD%D%R*',
        __typename: 'ImageBlock'
      }
    }
    const { queryAllByText, queryAllByRole } = render(
      <MockedProvider mocks={[getJourneyMock]}>
        <JourneyProvider
          value={{
            journey: journeyWithoutCreatorDescription,
            variant: 'admin'
          }}
        >
          <TemplateView authUser={{} as unknown as User} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(
      queryAllByText(
        'Created by a Name of a Mission or Missionaries Organisation label by a Name of a Mission or Missionaries'
      )
    ).toHaveLength(0)
    const creatorImages = queryAllByRole('img')
    expect(creatorImages).toHaveLength(0)
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

  it('should render template tags', async () => {
    const getTagsMock: MockedResponse<GetTags> = {
      request: {
        query: GET_TAGS
      },
      result: {
        data: {
          tags: [
            ...parentTags,
            ...tags.map((tag) => ({ ...tag, service: null }))
          ]
        }
      }
    }

    const journeyWithTags: Journey = {
      ...defaultJourney,
      tags: [tag]
    }
    const { getByTestId } = render(
      <MockedProvider mocks={[getTagsMock, getJourneyMock]}>
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

    await waitFor(() => expect(getByTestId('TemplateTags')).toBeInTheDocument())
  })

  it('should show skeleton if loading', async () => {
    const { getAllByTestId } = render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={{}}>
          <TemplateView authUser={{} as unknown as User} />
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getAllByTestId('TemplateViewDescriptionSkeleton')).toHaveLength(3)
    })
  })
})
