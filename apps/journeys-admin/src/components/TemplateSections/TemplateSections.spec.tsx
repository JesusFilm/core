import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
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
    id: '1',
    title: 'Featured Template 1',
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
    status: JourneyStatus.published,
    userJourneys: [],
    seoTitle: null,
    seoDescription: null,
    themeName: ThemeName.base,
    themeMode: ThemeMode.dark,
    tags: [],
    trashedAt: null,
    primaryImageBlock: null,
    publishedAt: '2023-08-14T04:24:24.392Z',
    createdAt: '2023-08-14T04:24:24.392Z',
    featuredAt: '2023-08-14T04:24:24.392Z'
  }

  describe('Featured And New', () => {
    it('should render Featured and new Section', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_JOURNEYS,
                variables: {
                  where: {
                    featured: true,
                    template: true,
                    orderByRecent: true
                  }
                }
              },
              result: {
                data: {
                  journeys: [
                    defaultTemplate,
                    {
                      ...defaultTemplate,
                      title: 'Featured Template 2',
                      id: 2,
                      publishedAt: '2023-08-14T04:24:24.292Z'
                    }
                  ]
                }
              }
            },
            {
              request: {
                query: GET_JOURNEYS,
                variables: {
                  where: {
                    template: true,
                    limit: 10,
                    orderByRecent: true
                  }
                }
              },
              result: {
                data: {
                  journeys: [
                    {
                      ...defaultTemplate,
                      id: 'nw1',
                      title: 'New Template 1',
                      publishedAt: '2023-09-05T23:27:45.596Z'
                    },
                    {
                      ...defaultTemplate,
                      id: 'nw2',
                      title: 'New Template 2',
                      publishedAt: '2023-09-05T23:27:45.596Z'
                    }
                  ]
                }
              }
            }
          ]}
        >
          <TemplateSections />
        </MockedProvider>
      )
      expect(getByText('Featured & New')).toBeInTheDocument()
      // featured templates
      await waitFor(() =>
        expect(getByText('Featured Template 1')).toBeInTheDocument()
      )
      expect(getByText('Featured Template 2')).toBeInTheDocument()
      // new templates
      expect(getByText('New Template 1')).toBeInTheDocument()
      expect(getByText('New Template 2')).toBeInTheDocument()
    })

    it('should not render a journey', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_JOURNEYS,
                variables: {
                  where: {
                    featured: true,
                    template: true,
                    orderByRecent: true
                  }
                }
              },
              result: {
                data: {
                  journeys: [
                    defaultTemplate,
                    {
                      ...defaultTemplate,
                      id: '2',
                      title: 'Journey',
                      template: false,
                      featuredAt: null
                    }
                  ]
                }
              }
            },
            {
              request: {
                query: GET_JOURNEYS,
                variables: {
                  where: {
                    template: true,
                    limit: 10,
                    orderByRecent: true
                  }
                }
              },
              result: {
                data: {
                  journeys: [
                    {
                      ...defaultTemplate,
                      id: 'nw1',
                      title: 'New Template 1',
                      publishedAt: '2023-09-05T23:27:45.596Z'
                    }
                  ]
                }
              }
            }
          ]}
        >
          <TemplateSections />
        </MockedProvider>
      )
      expect(getByText('Featured & New')).toBeInTheDocument()
      // featured templates
      await waitFor(() =>
        expect(getByText('Featured Template 1')).toBeInTheDocument()
      )
      // await waitFor(() => {
      //   expect(getByText('Journey')).not.toBeInTheDocument()
      // })
    })
  })

  // it shouldnt render a featured template within new query
})
