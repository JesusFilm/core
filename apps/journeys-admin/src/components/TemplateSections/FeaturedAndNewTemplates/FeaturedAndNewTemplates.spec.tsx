import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { GET_JOURNEYS } from '../../../libs/useJourneysQuery/useJourneysQuery'

import { FeaturedAndNewTemplates } from './FeaturedAndNewTemplates'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('FeaturedAndNewTemplates', () => {
  const newTemplate = {
    id: 'nw',
    title: 'New Template',
    publishedAt: '2023-09-05T23:27:45.596Z',
    featuredAt: null,
    template: true
  }

  it('should render Featured & New Section', async () => {
    const { getByRole, getAllByTestId } = render(
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
                    createdAt: '2023-09-05T23:27:45.596Z',
                    template: true
                  },
                  {
                    title: 'Featured Template 2',
                    id: 2,
                    publishedAt: '2023-08-14T04:24:24.292Z',
                    featuredAt: '2023-08-14T04:24:24.292Z',
                    createdAt: '2023-09-05T23:27:45.596Z',
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
                    ...newTemplate,
                    id: 'nw1',
                    title: 'New Template 1',
                    publishedAt: '2023-09-05T23:27:45.796Z'
                  },
                  {
                    ...newTemplate,
                    id: 'nw2',
                    title: 'New Template 2',
                    publishedAt: '2023-09-05T23:27:45.696Z'
                  },
                  newTemplate,
                  newTemplate,
                  newTemplate,
                  newTemplate,
                  newTemplate,
                  newTemplate,
                  newTemplate,
                  newTemplate
                ]
              }
            }
          }
        ]}
      >
        <FeaturedAndNewTemplates />
      </MockedProvider>
    )
    expect(getByRole('heading', { name: 'Featured & New' })).toBeInTheDocument()

    await waitFor(() => {
      const cards = getAllByTestId(/journey-/)
      // featured templates
      expect(cards[0]).toHaveTextContent('Featured Template 1')
      expect(cards[1]).toHaveTextContent('Featured Template 2')
      // new templates
      expect(cards[2]).toHaveTextContent('New Template 1')
      expect(cards[3]).toHaveTextContent('New Template 2')
      expect(cards[11]).toHaveTextContent('New Template')
    })
  })
})
