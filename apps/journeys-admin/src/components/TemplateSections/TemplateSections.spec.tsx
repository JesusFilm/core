import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { formatISO, startOfYear } from 'date-fns'
import { NextRouter, useRouter } from 'next/router'

import { GetTags_tags as Tags } from '../../../__generated__/GetTags'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'
import { GET_TAGS } from '../../libs/useTagsQuery/useTagsQuery'

import { TemplateSections } from './TemplateSections'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TemplateSections', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      query: {}
    } as unknown as NextRouter)
  })

  describe('Featured And New Templates', () => {
    it('should render Featured and New templates if tagIds are not present', () => {
      const { getByRole, queryByRole } = render(
        <MockedProvider>
          <TemplateSections />
        </MockedProvider>
      )
      expect(
        getByRole('heading', { name: 'Featured & New' })
      ).toBeInTheDocument()
      expect(
        queryByRole('heading', { name: 'Tag Ids' })
      ).not.toBeInTheDocument()
    })
  })

  describe('Most Relevant Templates', () => {
    it('should render relevant templates if tagIds are present', () => {
      mockUseRouter.mockReturnValue({
        query: {
          tags: [
            '767561ca-3f63-46f4-b2a0-3a37f891632a',
            '4e6cf9db-0928-4e34-8e63-8f62bddf87d4'
          ]
        }
      } as unknown as NextRouter)

      const { getByRole, getByText } = render(
        <MockedProvider>
          <TemplateSections />
        </MockedProvider>
      )
      // replace with checking most relevant templates
      expect(getByRole('heading', { name: 'Tag Ids' })).toBeInTheDocument()
      expect(
        getByText('767561ca-3f63-46f4-b2a0-3a37f891632a')
      ).toBeInTheDocument()
      expect(
        getByText('4e6cf9db-0928-4e34-8e63-8f62bddf87d4')
      ).toBeInTheDocument()
    })
  })

  describe('Category Templates', () => {
    const tags: Tags[] = [
      {
        __typename: 'Tag',
        id: '73cb38e3-06b6-4f34-b1e1-8d2859e510a1',
        name: [
          {
            __typename: 'Translation',
            value: 'Acceptance',
            primary: true
          }
        ]
      },
      {
        __typename: 'Tag',
        id: '29ceed4c-c2e7-4b0e-8643-74181b646784',
        name: [
          {
            __typename: 'Translation',
            value: 'Addiction',
            primary: true
          }
        ]
      },
      {
        __typename: 'Tag',
        id: 'a8b31676-3908-4b87-a172-ae252626a9f0',
        name: [
          {
            __typename: 'Translation',
            value: 'Anger',
            primary: true
          }
        ]
      }
    ]

    const template = {
      __typename: 'Journey',
      id: 'template-id',
      title: 'Default Template Heading',
      description: null,
      themeName: ThemeName.base,
      themeMode: ThemeMode.light,
      slug: 'default',
      publishedAt: formatISO(startOfYear(new Date())),
      status: JourneyStatus.draft,
      seoTitle: null,
      seoDescription: null,
      userJourneys: null,
      template: true,
      primaryImageBlock: null,
      tags
    }

    const journeys = [
      template,
      {
        ...template,
        id: '2'
      },
      {
        ...template,
        id: '3'
      },
      {
        ...template,
        id: '4'
      },
      {
        ...template,
        id: '5'
      }
    ]

    const journeysMock = [
      {
        request: {
          query: GET_JOURNEYS,
          variables: {
            where: {
              template: true,
              orderByRecent: true,
              tagIds: ['73cb38e3-06b6-4f34-b1e1-8d2859e510a1']
            }
          }
        },
        result: {
          data: {
            journeys
          }
        }
      },
      {
        request: {
          query: GET_JOURNEYS,
          variables: {
            where: {
              template: true,
              orderByRecent: true,
              tagIds: ['29ceed4c-c2e7-4b0e-8643-74181b646784']
            }
          }
        },
        result: {
          data: {
            journeys
          }
        }
      },
      {
        request: {
          query: GET_JOURNEYS,
          variables: {
            where: {
              template: true,
              orderByRecent: true,
              tagIds: ['a8b31676-3908-4b87-a172-ae252626a9f0']
            }
          }
        },
        result: {
          data: {
            journeys
          }
        }
      }
    ]

    const tagsMock = {
      request: {
        query: GET_TAGS
      },
      result: {
        data: {
          tags
        }
      }
    }

    it('should render template categories', async () => {
      const { getByRole } = render(
        <MockedProvider mocks={[...journeysMock, tagsMock]}>
          <TemplateSections />
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByRole('heading', { name: 'Acceptance' })).toBeInTheDocument()
      )
      expect(getByRole('heading', { name: 'Addiction' })).toBeInTheDocument()
      expect(getByRole('heading', { name: 'Anger' })).toBeInTheDocument()
    })

    it('should render categories related to tagIds in the query param', async () => {
      mockUseRouter.mockReturnValue({
        query: {
          tags: [
            '73cb38e3-06b6-4f34-b1e1-8d2859e510a1',
            '29ceed4c-c2e7-4b0e-8643-74181b646784'
          ]
        }
      } as unknown as NextRouter)

      const { getByRole, queryByRole } = render(
        <MockedProvider mocks={[...journeysMock, tagsMock]}>
          <TemplateSections />
        </MockedProvider>
      )
      await waitFor(() => {
        expect(getByRole('heading', { name: 'Acceptance' })).toBeInTheDocument()
      })
      expect(getByRole('heading', { name: 'Addiction' })).toBeInTheDocument()
      expect(queryByRole('heading', { name: 'Anger' })).not.toBeInTheDocument()
    })
  })
})
