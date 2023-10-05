import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'

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

  it('should render Featured and New templates if tagIds are not present', () => {
    const { getByRole, queryByRole } = render(
      <MockedProvider>
        <TemplateSections />
      </MockedProvider>
    )
    expect(getByRole('heading', { name: 'Featured & New' })).toBeInTheDocument()
    expect(
      queryByRole('heading', { name: 'Most Relevant' })
    ).not.toBeInTheDocument()
  })

  it('should render Most Relevant Templates when tag Ids are provided', async () => {
    mockUseRouter.mockReturnValue({
      query: { tags: ['767561ca-3f63-46f4-b2a0-3a37f891632a'] }
    } as unknown as NextRouter)

    const { getByRole, queryByRole } = render(
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
                journeys: [
                  {
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
                ]
              }
            }
          }
        ]}
      >
        <TemplateSections />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(
        getByRole('heading', { name: 'Most Relevant' })
      ).toBeInTheDocument()
    })
    expect(
      queryByRole('heading', { name: 'Featured & New' })
    ).not.toBeInTheDocument()
  })
})
