import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { GET_JOURNEYS } from '../../../libs/useJourneysQuery/useJourneysQuery'

import { CategoryTemplates } from '.'

describe('CategoryTemplates', () => {
  const template = {
    id: 1,
    title: 'Template 1',
    publishedAt: '2023-08-14T04:24:24.392Z',
    template: true,
    tags: [
      {
        id: '767561ca-3f63-46f4-b2a0-3a37f891632a',
        parentId: '32d5ca43-2e26-4bea-9d80-b28bae58900e',
        name: [
          {
            value: 'Easter',
            primary: true,
            language: {
              iso3: 'eng',
              id: '529',
              bcp47: 'en',
              name: [
                {
                  value: 'English'
                }
              ]
            }
          }
        ]
      }
    ]
  }

  it('should render Category Templates', async () => {
    const result = jest.fn(() => ({
      data: {
        journeys: [
          template,
          {
            ...template,
            id: 2,
            title: 'Template 2'
          },
          {
            ...template,
            id: 3,
            title: 'Template 3'
          },
          {
            ...template,
            id: 4,
            title: 'Template 4'
          },
          {
            ...template,
            id: 5,
            title: 'Template 5'
          }
        ]
      }
    }))

    const { getByRole, getAllByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEYS,
              variables: {
                where: {
                  template: true,
                  orderByRecent: true,
                  tagIds: ['767561ca-3f63-46f4-b2a0-3a37f891632a']
                }
              }
            },
            result
          }
        ]}
      >
        <CategoryTemplates
          id="767561ca-3f63-46f4-b2a0-3a37f891632a"
          name="Easter"
        />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByRole('heading', { name: 'Easter' })).toBeInTheDocument()
    const cards = getAllByTestId(/journey-/)
    expect(cards[0]).toHaveTextContent('Template 1')
    expect(cards[1]).toHaveTextContent('Template 2')
    expect(cards[2]).toHaveTextContent('Template 3')
    expect(cards[3]).toHaveTextContent('Template 4')
    expect(cards[4]).toHaveTextContent('Template 5')
  })

  it('should not render templates if there is less than 5 in the category', async () => {
    const { queryByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEYS,
              variables: {
                where: {
                  template: true,
                  orderByRecent: true,
                  tagIds: ['767561ca-3f63-46f4-b2a0-3a37f891632a']
                }
              }
            },
            result: {
              data: {
                journeys: [template]
              }
            }
          }
        ]}
      >
        <CategoryTemplates
          id="767561ca-3f63-46f4-b2a0-3a37f891632a"
          name="Easter"
        />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(queryByRole('heading', { name: 'Easter' })).not.toBeInTheDocument()
    )
  })
})
