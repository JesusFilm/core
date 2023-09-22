import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'

import { journeys } from './data'
import { TemplateSections } from './TemplateSections'

describe('TemplateSections', () => {
  it('should render TemplateSections', async () => {
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
                  {
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
                    tags: [],
                    primaryImageBlock: null,
                    publishedAt: '2023-08-14T04:24:24.392Z',
                    createdAt: '2023-08-14T04:24:24.392Z',
                    featuredAt: '2023-08-14T04:24:24.392Z'
                  },
                  {
                    id: '2',
                    title: 'Featured Template 2',
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
                    primaryImageBlock: null,
                    publishedAt: '2023-08-14T04:24:24.292Z',
                    createdAt: '2023-08-14T04:24:24.292Z',
                    featuredAt: '2023-08-14T04:24:24.292Z'
                  },
                  {
                    id: '3',
                    title: 'Featured Template 3',
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
                    primaryImageBlock: null,
                    publishedAt: '2023-08-14T04:24:24.192Z',
                    createdAt: '2023-08-14T04:24:24.192Z',
                    featuredAt: '2023-08-14T04:24:24.192Z'
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
                journeys
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
    expect(getByText('I think I just sorted the problem')).toBeInTheDocument()
    expect(getByText('Dev Onboarding Journey')).toBeInTheDocument()
  })
})
