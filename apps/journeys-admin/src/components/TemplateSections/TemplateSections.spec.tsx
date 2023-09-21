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
                  template: false
                }
              }
            },
            result: {
              data: {
                journeys: [
                  {
                    id: '1',
                    title: 'Fact or Fiction',
                    description: null,
                    slug: 'default',
                    template: false,
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
                    createdAt: '2023-08-14T04:24:24.392Z',
                    featuredAt: '2023-08-14T04:24:24.392Z'
                  },
                  {
                    id: '2',
                    title: 'Decision',
                    description: null,
                    slug: 'default',
                    template: false,
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
                    createdAt: '2023-08-14T04:24:24.392Z',
                    featuredAt: '2023-08-14T04:24:24.392Z'
                  },
                  {
                    id: '3',
                    title: 'What about the ressurection',
                    description: null,
                    slug: 'default',
                    template: false,
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
                    createdAt: '2023-08-14T04:24:24.392Z',
                    featuredAt: '2023-08-14T04:24:24.392Z'
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
                  template: true
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
      expect(getByText('Fact or Fiction')).toBeInTheDocument()
    )
    expect(getByText('Decision')).toBeInTheDocument()
    // new templates
    expect(getByText('I think I just sorted the problem')).toBeInTheDocument()
    expect(getByText('Dev Onboarding Journey')).toBeInTheDocument()
  })
})
