import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import {
  GetJourneys,
  GetJourneys_journeys as Journey,
  GetJourneys_journeys_tags as Tag
} from '../../../__generated__/GetJourneys'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'

import { TemplateSections } from './TemplateSections'

describe('TemplateSections', () => {
  const defaultTemplate: Journey = {
    __typename: 'Journey',
    trashedAt: null,
    themeName: ThemeName.base,
    themeMode: ThemeMode.dark,
    id: '1',
    title: 'New Template 1',
    description: null,
    slug: 'default',
    template: true,
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    },
    tags: [],
    primaryImageBlock: {
      id: 'image1.id',
      __typename: 'ImageBlock',
      parentBlockId: null,
      parentOrder: 0,
      src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      alt: 'random image from unsplash',
      width: 1920,
      height: 1080,
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
    },
    publishedAt: '2023-08-14T04:24:24.392Z',
    createdAt: '2023-08-14T04:24:24.392Z',
    featuredAt: '2023-08-14T04:24:24.392Z',
    status: JourneyStatus.published,
    seoTitle: null,
    seoDescription: null,
    userJourneys: []
  }

  const acceptance: Tag = {
    __typename: 'Tag',
    id: 'acceptanceTagId',
    name: [
      {
        value: 'Acceptance',
        primary: true,
        __typename: 'Translation',
        language: {
          __typename: 'Language',
          id: 'en'
        }
      }
    ],
    parentId: 'parentId'
  }

  const addiction: Tag = {
    __typename: 'Tag',
    id: 'addictionTagId',
    name: [
      {
        value: 'Addiction',
        primary: true,
        __typename: 'Translation',
        language: {
          __typename: 'Language',
          id: 'en'
        }
      }
    ],
    parentId: 'parentId'
  }

  const journeys: Journey[] = [
    {
      ...defaultTemplate,
      id: 'featuredId1',
      title: 'Featured Template 1',
      createdAt: '2023-09-05T23:27:45.596Z',
      tags: [acceptance]
    },
    {
      ...defaultTemplate,
      id: 'featuredId2',
      title: 'Featured Template 2',
      createdAt: '2023-08-05T23:27:45.596Z',
      tags: [addiction]
    },
    {
      ...defaultTemplate,
      id: 'featuredId3',
      title: 'Featured Template 3',
      createdAt: '2023-08-05T23:27:45.596Z',
      tags: [acceptance]
    },
    {
      ...defaultTemplate,
      id: 'newId1',
      title: 'New Template 1',
      createdAt: '2023-09-05T23:27:45.596Z',
      tags: [acceptance, addiction],
      featuredAt: null
    },
    {
      ...defaultTemplate,
      id: 'newId2',
      title: 'New Template 2',
      createdAt: '2023-08-05T23:27:45.596Z',
      featuredAt: null
    },
    {
      ...defaultTemplate,
      id: 'newId3',
      title: 'New Template 3',
      createdAt: '2023-08-05T23:27:45.596Z',
      tags: [acceptance, addiction],
      featuredAt: null
    },
    {
      ...defaultTemplate,
      id: 'newId4',
      title: 'New Template 4',
      createdAt: '2023-08-05T23:27:45.596Z',
      tags: [addiction],
      featuredAt: null
    },
    {
      ...defaultTemplate,
      id: 'newId5',
      title: 'New Template 5',
      createdAt: '2023-08-05T23:27:45.596Z',
      tags: [acceptance],
      featuredAt: null
    }
  ]

  const getJourneysMock: MockedResponse<GetJourneys> = {
    request: {
      query: GET_JOURNEYS,
      variables: {
        where: {
          template: true,
          orderByRecent: true,
          languageIds: ['529']
        }
      }
    },
    result: {
      data: {
        journeys
      }
    }
  }

  const getJourneysWithTagIdsMock: MockedResponse<GetJourneys> = {
    ...getJourneysMock,
    request: {
      ...getJourneysMock.request,
      variables: {
        where: {
          template: true,
          orderByRecent: true,
          tagIds: [addiction.id, acceptance.id],
          languageIds: ['529']
        }
      }
    },
    result: {
      data: {
        journeys: journeys.filter(({ tags }) =>
          tags.some(({ id }) => id === addiction.id || id === acceptance.id)
        )
      }
    }
  }

  const getJourneysEmptyMock: MockedResponse<GetJourneys> = {
    ...getJourneysMock,
    result: {
      data: {
        journeys: []
      }
    }
  }

  describe('Featured & New Templates', () => {
    it('should render Featured & New templates if tagIds are not present', async () => {
      const { getByRole, getAllByRole } = render(
        <MockedProvider mocks={[getJourneysMock]}>
          <TemplateSections languageId="529" />
        </MockedProvider>
      )
      await waitFor(() =>
        expect(
          getAllByRole('heading', { name: 'Featured Template 2' })[0]
        ).toBeInTheDocument()
      )
      expect(
        getByRole('heading', { name: 'Featured & New' })
      ).toBeInTheDocument()
      expect(getByRole('heading', { name: 'Acceptance' })).toBeInTheDocument()
    })
  })

  describe('Relevant Templates', () => {
    it('should render relevant templates if tagIds are present', async () => {
      const { getByRole, getAllByRole } = render(
        <MockedProvider mocks={[getJourneysWithTagIdsMock]}>
          <TemplateSections
            tagIds={[addiction.id, acceptance.id]}
            languageId="529"
          />
        </MockedProvider>
      )
      await waitFor(() =>
        expect(
          getAllByRole('heading', { name: 'Featured Template 2' })[0]
        ).toBeInTheDocument()
      )
      expect(
        getByRole('heading', { name: 'Most Relevant' })
      ).toBeInTheDocument()
      expect(getByRole('heading', { name: 'Addiction' })).toBeInTheDocument()
      expect(getByRole('heading', { name: 'Acceptance' })).toBeInTheDocument()
    })
  })

  describe('Tag Templates', () => {
    it('should render tag templates', async () => {
      const { getByRole, queryByRole } = render(
        <MockedProvider mocks={[getJourneysWithTagIdsMock]}>
          <TemplateSections tagIds={[addiction.id]} languageId="529" />
        </MockedProvider>
      )
      await waitFor(async () => {
        expect(getByRole('heading', { name: 'Addiction' })).toBeInTheDocument()
      })
      expect(
        queryByRole('heading', { name: 'Acceptance' })
      ).not.toBeInTheDocument()
    })
  })

  describe('Empty', () => {
    it('should render empty state', async () => {
      const { getByRole, getByText, queryByRole } = render(
        <MockedProvider mocks={[getJourneysEmptyMock]}>
          <TemplateSections languageId="529" />
        </MockedProvider>
      )
      await waitFor(async () => {
        expect(
          getByRole('heading', {
            name: 'No template fully matches your search criteria.'
          })
        ).toBeInTheDocument()
      })
      expect(
        getByText(
          "Try using fewer filters or look below for templates related to the categories you've selected to search"
        )
      ).toBeInTheDocument()
      expect(
        queryByRole('heading', { name: 'Featured & New' })
      ).not.toBeInTheDocument()
    })
  })
})
