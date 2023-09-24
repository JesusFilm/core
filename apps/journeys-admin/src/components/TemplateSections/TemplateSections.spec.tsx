import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'

import { TemplateSections } from './TemplateSections'

describe('TemplateSections', () => {
  describe('Featured And New', () => {
    it('should render Featured & New Section', async () => {
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
                      title: 'Featured Template 1',
                      id: 1,
                      publishedAt: '2023-08-14T04:24:24.392Z',
                      featuredAt: '2023-08-14T04:24:24.392Z',
                      template: true
                    },
                    {
                      title: 'Featured Template 2',
                      id: 2,
                      publishedAt: '2023-08-14T04:24:24.292Z',
                      featuredAt: '2023-08-14T04:24:24.292Z',
                      template: true
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
                    featured: false,
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
                      id: 'nw1',
                      title: 'New Template 1',
                      publishedAt: '2023-09-05T23:27:45.596Z',
                      featuredAt: null,
                      template: true
                    },
                    {
                      id: 'nw2',
                      title: 'New Template 2',
                      publishedAt: '2023-09-05T23:27:45.596Z',
                      featuredAt: null,
                      template: true
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
  })
})
