import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { GET_JOURNEYS } from '../../../libs/useJourneysQuery/useJourneysQuery'

import { GET_TAGS } from './CategoryTemplates'

import { CategoryTemplates } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('CategoryTemplates', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      query: {}
    } as unknown as NextRouter)
  })

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

  it('should render all the categories', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_TAGS
            },
            result: {
              data: {
                tags: [
                  {
                    id: 'cdefc2e8-eb22-46df-bc32-c2a99d8fe663',
                    name: [
                      {
                        value: 'Acceptance',
                        primary: true
                      }
                    ]
                  },
                  {
                    id: '20aab916-de2a-45a8-88b6-2be75fe378bc',
                    name: [
                      {
                        value: 'Addiction',
                        primary: true
                      }
                    ]
                  },
                  {
                    id: 'f80c2a36-9e22-49e2-baf9-628edd8e75ee',
                    name: [
                      {
                        value: 'Anger',
                        primary: true
                      }
                    ]
                  },
                  {
                    id: 'b5a693db-ff4a-46f4-9f23-c88cb0c52ba9',
                    name: [
                      {
                        value: 'Animation',
                        primary: true
                      }
                    ]
                  },
                  {
                    id: 'f11b682d-ab0a-4437-a9db-1f916c0817a3',
                    name: [
                      {
                        value: 'Apologetics',
                        primary: true
                      }
                    ]
                  },
                  {
                    id: '9f1c1946-b717-43be-81e9-5241f1b80505',
                    name: [
                      {
                        value: 'Audience',
                        primary: true
                      }
                    ]
                  },
                  {
                    id: '12dabb49-802a-49e0-817b-f5db0594b5b6',
                    name: [
                      {
                        value: 'Catholic',
                        primary: true
                      }
                    ]
                  },
                  {
                    id: 'fd1a5763-e166-42a7-83a3-e555ec7e985d',
                    name: [
                      {
                        value: 'Children',
                        primary: true
                      }
                    ]
                  },
                  {
                    id: '4e6cf9db-0928-4e34-8e63-8f62bddf87d4',
                    name: [
                      {
                        value: 'Christian',
                        primary: true
                      }
                    ]
                  },
                  {
                    id: '819a5073-0db4-4cd0-914a-95403f18975a',
                    name: [
                      {
                        value: 'Christmas',
                        primary: true
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]}
      >
        <CategoryTemplates />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('heading', { name: 'Acceptance' })).toBeInTheDocument()
    )
    expect(getByRole('heading', { name: 'Acceptance' })).toBeInTheDocument()
    expect(getByRole('heading', { name: 'Addiction' })).toBeInTheDocument()
    expect(getByRole('heading', { name: 'Anger' })).toBeInTheDocument()
    expect(getByRole('heading', { name: 'Apologetics' })).toBeInTheDocument()
    expect(getByRole('heading', { name: 'Catholic' })).toBeInTheDocument()
    expect(getByRole('heading', { name: 'Children' })).toBeInTheDocument()
    expect(getByRole('heading', { name: 'Christian' })).toBeInTheDocument()
    expect(getByRole('heading', { name: 'Christmas' })).toBeInTheDocument()
  })

  it('should render categories related to tagIds in the query param', async () => {
    mockUseRouter.mockReturnValue({
      query: {
        tags: [
          '767561ca-3f63-46f4-b2a0-3a37f891632a',
          '4e6cf9db-0928-4e34-8e63-8f62bddf87d4'
        ]
      }
    } as unknown as NextRouter)

    const { getByRole } = render(
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
        <CategoryTemplates />
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByRole('heading', { name: 'Easter' })).toBeInTheDocument()
    )
    expect(getByRole('heading', { name: 'Christian' })).toBeInTheDocument()
  })
})
