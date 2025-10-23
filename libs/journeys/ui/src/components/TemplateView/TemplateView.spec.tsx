import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { render, waitFor } from '@testing-library/react'
import { User } from 'next-firebase-auth'

import { JourneyProvider } from '../../libs/JourneyProvider'
import {
  JourneyFields as Journey,
  JourneyFields_tags as Tag
} from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery'
import {
  GetJourneys,
  GetJourneysVariables
} from '../../libs/useJourneysQuery/__generated__/GetJourneys'
import { GET_TAGS } from '../../libs/useTagsQuery'
import { GetTags } from '../../libs/useTagsQuery/__generated__/GetTags'

import { defaultJourney } from './data'
import { parentTags, tags } from './TemplateTags/data'
import { TemplateView } from './TemplateView'

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
        __typename: 'TagName',
        primary: true,
        value: 'tag.name',
        language: { __typename: 'Language', id: 'language.id' }
      }
    ]
  }

  const getJourneysMock: MockLink.MockedResponse<
    GetJourneys,
    GetJourneysVariables
  > = {
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
            trashedAt: null,
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
      <MockedProvider mocks={[getJourneysMock]}>
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
      <MockedProvider mocks={[getJourneysMock]}>
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

  it('should not render Strategy section if journey strategy slug is empty string', () => {
    const journeyWithoutStrategySlug: Journey = {
      ...defaultJourney,
      strategySlug: '',
      tags: [tag]
    }
    const { queryByText } = render(
      <MockedProvider mocks={[getJourneysMock]}>
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
        __typename: 'ImageBlock',
        scale: null,
        focalLeft: 50,
        focalTop: 50
      }
    }
    const { getAllByText, getAllByRole } = render(
      <MockedProvider mocks={[getJourneysMock]}>
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
        __typename: 'ImageBlock',
        scale: null,
        focalLeft: 50,
        focalTop: 50
      }
    }
    const { queryAllByText, queryAllByRole } = render(
      <MockedProvider mocks={[getJourneysMock]}>
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
                  tagIds: ['tag.id'],
                  limit: 10
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
    const getTagsMock: MockLink.MockedResponse<GetTags> = {
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
      <MockedProvider mocks={[getTagsMock, getJourneysMock]}>
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
