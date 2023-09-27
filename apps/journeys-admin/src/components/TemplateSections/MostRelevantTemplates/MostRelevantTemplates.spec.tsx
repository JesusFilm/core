import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { GET_JOURNEYS } from '../../../libs/useJourneysQuery/useJourneysQuery'

import { MostRelevantTemplates } from './MostRelevantTemplates'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('MostRelevantTemplates', () => {
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
      },
      {
        id: '4e6cf9db-0928-4e34-8e63-8f62bddf87d4',
        parentId: '9f1c1946-b717-43be-81e9-5241f1b80505',
        name: [
          {
            value: 'Christian',
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

  it('should render templates from tag id', async () => {
    mockUseRouter.mockReturnValue({
      query: {
        tags: [
          '767561ca-3f63-46f4-b2a0-3a37f891632a',
          '4e6cf9db-0928-4e34-8e63-8f62bddf87d4'
        ]
      }
    } as unknown as NextRouter)

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
                  tagIds: [
                    '767561ca-3f63-46f4-b2a0-3a37f891632a',
                    '4e6cf9db-0928-4e34-8e63-8f62bddf87d4'
                  ]
                }
              }
            },
            result: {
              data: {
                journeys: [
                  template,
                  {
                    ...template,
                    id: 2,
                    title: 'Template 2'
                  }
                ]
              }
            }
          }
        ]}
      >
        <MostRelevantTemplates />
      </MockedProvider>
    )
    expect(getByRole('heading', { name: 'Most Relevant' })).toBeInTheDocument()
    await waitFor(() => {
      const cards = getAllByTestId(/journey-/)
      expect(cards[0]).toHaveTextContent('Template 1')
      expect(cards[1]).toHaveTextContent('Template 2')
    })
  })

  it('should not render templates when no tagIds', async () => {
    mockUseRouter.mockReturnValue({
      query: {}
    } as unknown as NextRouter)

    const { getByRole, queryAllByTestId } = render(
      <MockedProvider>
        <MostRelevantTemplates />
      </MockedProvider>
    )

    expect(getByRole('heading', { name: 'Most Relevant' })).toBeInTheDocument()
    await waitFor(() => {
      const journeys = queryAllByTestId(/journey-/)
      expect(journeys).toHaveLength(0)
    })
  })
})
