import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { defaultJourney } from '../../../../JourneyList/journeyListData'

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
    const result = jest.fn(() => ({
      data: {
        journeyTemplate: {
          id: 'templateId',
          template: true
        }
      }
    }))
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
        <SnackbarProvider>
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
        </SnackbarProvider>
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
          teamId: 'jfp-team' // global template team
        },
        update: expect.any(Function)
      })
    )
  })

  it('should create a global template on menu card click with journey from props', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const result = jest.fn(() => ({
      data: {
        journeyTemplate: {
          id: 'templateId',
          template: true
        }
      }
    }))
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
                  id: 'journey-id'
                }
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider>
            <CreateTemplateItem
              variant="menu-item"
              globalPublish={true}
              journey={defaultJourney}
            />
          </JourneyProvider>
        </SnackbarProvider>
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
          id: 'journey-id',
          teamId: 'jfp-team' // global template team
        },
        update: expect.any(Function)
      })
    )
  })

  it('should create a local template on menu card click', async () => {
    const push = jest.fn()
    const handleCloseMenu = jest.fn()
    const query = { existingParam: 'value' }
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/',
      query
    } as unknown as NextRouter)
    const result = jest.fn(() => ({
      data: {
        journeyTemplate: {
          id: 'templateId',
          template: true
        }
      }
    }))
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
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                team: { id: 'local-team-id' }
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <CreateTemplateItem
              variant="menu-item"
              globalPublish={false}
              handleCloseMenu={handleCloseMenu}
            />
          </JourneyProvider>
        </SnackbarProvider>
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
      expect(push).toHaveBeenCalledWith(
        {
          query: {
            ...query,
            type: 'templates',
            refresh: 'true'
          }
        },
        undefined,
        { shallow: true }
      )
    })
    await waitFor(() => {
      expect(handleCloseMenu).toHaveBeenCalled()
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

  it('should create a local template on menu card click with journey from props', async () => {
    const push = jest.fn()
    const handleCloseMenu = jest.fn()
    const query = { existingParam: 'value' }
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/',
      query
    } as unknown as NextRouter)
    const result = jest.fn(() => ({
      data: {
        journeyTemplate: {
          id: 'templateId',
          template: true
        }
      }
    }))
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
                  id: 'journey-id'
                }
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <CreateTemplateItem
            variant="menu-item"
            globalPublish={false}
            handleCloseMenu={handleCloseMenu}
            journey={defaultJourney}
          />
        </SnackbarProvider>
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
      expect(push).toHaveBeenCalledWith(
        {
          query: {
            ...query,
            type: 'templates',
            refresh: 'true'
          }
        },
        undefined,
        { shallow: true }
      )
    })
    await waitFor(() => {
      expect(handleCloseMenu).toHaveBeenCalled()
    })
    expect(journeyDuplicateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          id: 'journey-id',
          teamId: 'team1.id'
        },
        update: expect.any(Function)
      })
    )
  })

  it('should navigate to journeys list template tab when creating local template from Editor context', async () => {
    const push = jest.fn()
    const handleCloseMenu = jest.fn()
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/journeys/[journeyId]'
    } as unknown as NextRouter)
    const result = jest.fn(() => ({
      data: {
        journeyTemplate: {
          id: 'templateId',
          template: true
        }
      }
    }))
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
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                team: { id: 'local-team-id' }
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <CreateTemplateItem
              variant="menu-item"
              globalPublish={false}
              handleCloseMenu={handleCloseMenu}
            />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Make Template' }))
    await waitFor(() => expect(journeyDuplicateMock).toHaveBeenCalled())
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/?type=templates&refresh=true')
    })
  })
})
