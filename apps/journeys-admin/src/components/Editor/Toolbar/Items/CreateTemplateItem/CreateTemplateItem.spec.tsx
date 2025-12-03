import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'

import {
  CREATE_TEMPLATE,
  CreateTemplateItem,
  REMOVE_USER_JOURNEY
} from './CreateTemplateItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('@core/journeys/ui/useJourneyDuplicateMutation', () => ({
  ...jest.requireActual('@core/journeys/ui/useJourneyDuplicateMutation'),
  useJourneyDuplicateMutation: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseJourneyDuplicateMutation =
  useJourneyDuplicateMutation as jest.MockedFunction<
    typeof useJourneyDuplicateMutation
  >

describe('CreateTemplateItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a global template on menu card click', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const result = jest.fn(() => {
      return {
        data: {
          journeyTemplate: {
            id: 'templateId',
            template: true
          }
        }
      }
    })
    const journeyDuplicateMock = jest.fn().mockResolvedValue({
      data: {
        journeyDuplicate: {
          id: 'duplicatedJourneyId'
        }
      }
    })
    mockUseJourneyDuplicateMutation.mockReturnValue([
      journeyDuplicateMock,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        reset: jest.fn(),
        client: {} as any
      }
    ])
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_TEMPLATE,
              variables: {
                id: 'duplicatedJourneyId',
                input: {
                  template: true
                }
              }
            },
            result
          },
          {
            request: {
              query: REMOVE_USER_JOURNEY,
              variables: {
                id: 'templateId'
              }
            },
            result: {
              data: {
                userJourneyRemoveAll: {
                  id: 'journeyId'
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              team: { id: 'local-team-id' }
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <CreateTemplateItem variant="menu-item" globalPublish={true} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Make Global Template' }))
    await waitFor(() => expect(journeyDuplicateMock).toHaveBeenCalled())
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/publisher/templateId', undefined, {
        shallow: true
      })
    })
    expect(journeyDuplicateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          id: 'journeyId',
          teamId: 'jfp-team'
        },
        update: expect.any(Function)
      })
    )
  })

  it('should create a local template on menu card click', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const result = jest.fn(() => {
      return {
        data: {
          journeyTemplate: {
            id: 'templateId',
            template: true
          }
        }
      }
    })
    const journeyDuplicateMock = jest.fn().mockResolvedValue({
      data: {
        journeyDuplicate: {
          id: 'duplicatedJourneyId'
        }
      }
    })
    mockUseJourneyDuplicateMutation.mockReturnValue([
      journeyDuplicateMock,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        reset: jest.fn(),
        client: {} as any
      }
    ])
    const { getByRole, queryByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_TEMPLATE,
              variables: {
                id: 'duplicatedJourneyId',
                input: {
                  template: true
                }
              }
            },
            result
          },
          {
            request: {
              query: REMOVE_USER_JOURNEY,
              variables: {
                id: 'templateId'
              }
            },
            result: {
              data: {
                userJourneyRemoveAll: {
                  id: 'journeyId'
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              team: { id: 'local-team-id' }
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <CreateTemplateItem variant="menu-item" globalPublish={false} />
        </JourneyProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        getByRole('menuitem', { name: 'Make Template' })
      ).toBeInTheDocument()
    )
    await waitFor(() =>
      expect(
        queryByRole('menuitem', { name: 'Make Global Template' })
      ).not.toBeInTheDocument()
    )

    fireEvent.click(getByRole('menuitem', { name: 'Make Template' }))
    await waitFor(() => expect(journeyDuplicateMock).toHaveBeenCalled())
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/publisher/templateId', undefined, {
        shallow: true
      })
    })
    expect(journeyDuplicateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          id: 'journeyId',
          teamId: 'local-team-id'
        },
        update: expect.any(Function)
      })
    )
  })
})
