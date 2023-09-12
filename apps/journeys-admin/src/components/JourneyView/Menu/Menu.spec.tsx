import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { Role } from '../../../../__generated__/globalTypes'
import { JOURNEY_DUPLICATE } from '../../../libs/useJourneyDuplicateMutation'
import { GET_ROLE } from '../../Editor/EditToolbar/Menu/Menu'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../Team/TeamProvider'
import { defaultJourney } from '../data'

import { Menu } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('JourneyView/Menu', () => {
  it('should open menu on click', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <Menu />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    expect(menu).toHaveAttribute('aria-expanded', 'true')
  })

  it('should render menu items', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <Menu />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Edit Cards' })).toBeInTheDocument()
  })

  it('should render menu items for a template', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: {
                  ...defaultJourney,
                  template: true
                },
                variant: 'admin'
              }}
            >
              <Menu />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Use Template' })).toBeInTheDocument()
  })

  it('should render menu items for a Publisher', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_ROLE
              },
              result: {
                data: {
                  getUserRole: {
                    id: 'userRoleId',
                    userId: '1',
                    roles: [Role.publisher]
                  }
                }
              }
            }
          ]}
        >
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: {
                  ...defaultJourney,
                  template: true
                },
                variant: 'admin'
              }}
            >
              <Menu />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Use Template' })).toBeInTheDocument()
    await waitFor(() =>
      expect(getByRole('menuitem', { name: 'Edit Cards' })).toBeInTheDocument()
    )
  })

  it('should preview journey', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <Menu />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'href',
      `/api/preview?slug=${defaultJourney.slug}`
    )
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })

  it('should convert template to journey on Use Template click', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const result = jest.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })

    const result2 = jest.fn(() => ({
      data: {
        teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }))

    const { getByRole, getByTestId, getByText } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            {
              request: {
                query: JOURNEY_DUPLICATE,
                variables: {
                  id: defaultJourney.id,
                  teamId: 'teamId'
                }
              },
              result
            },
            {
              request: {
                query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
              },
              result: result2
            }
          ]}
        >
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: { ...defaultJourney, template: true },
                variant: 'admin'
              }}
            >
              <Menu />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() => expect(result2).toHaveBeenCalled())
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('menuitem', { name: 'Use Template' }))
    const muiSelect = getByTestId('team-duplicate-select')
    const muiSelectDropDownButton = await within(muiSelect).getByRole('button')
    await fireEvent.mouseDown(muiSelectDropDownButton)
    const muiSelectOptions = await getByRole('option', {
      name: 'Team Name'
    })
    fireEvent.click(muiSelectOptions)
    await waitFor(() => fireEvent.click(getByText('Add')))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/journeys/duplicatedJourneyId',
        undefined,
        { shallow: true }
      )
    })
  })

  it('should handle edit cards for journey', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <Menu />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    expect(getByRole('menuitem', { name: 'Edit Cards' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/edit'
    )
  })

  it('should handle edit cards for template', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_ROLE
              },
              result: {
                data: {
                  getUserRole: {
                    id: 'userRoleId',
                    userId: '1',
                    roles: [Role.publisher]
                  }
                }
              }
            }
          ]}
        >
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: { ...defaultJourney, template: true },
                variant: 'admin'
              }}
            >
              <Menu />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    await waitFor(() => {
      expect(getByRole('menuitem', { name: 'Edit Cards' })).toHaveAttribute(
        'href',
        '/publisher/journey-id/edit'
      )
    })
  })

  it('should enable publishers to use template', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const result = jest.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })

    const result2 = jest.fn(() => ({
      data: {
        teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }))

    const { getByRole, getByTestId, getByText } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            {
              request: {
                query: JOURNEY_DUPLICATE,
                variables: {
                  id: defaultJourney.id,
                  teamId: 'teamId'
                }
              },
              result
            },
            {
              request: {
                query: GET_ROLE
              },
              result: {
                data: {
                  getUserRole: {
                    id: 'userRoleId',
                    userId: '1',
                    roles: [Role.publisher]
                  }
                }
              }
            },
            {
              request: {
                query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
              },
              result: result2
            }
          ]}
        >
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: { ...defaultJourney, template: true },
                variant: 'admin'
              }}
            >
              <Menu />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() => expect(result2).toHaveBeenCalled())
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('menuitem', { name: 'Use Template' }))
    const muiSelect = getByTestId('team-duplicate-select')
    const muiSelectDropDownButton = await within(muiSelect).getByRole('button')
    await fireEvent.mouseDown(muiSelectDropDownButton)
    const muiSelectOptions = await getByRole('option', {
      name: 'Team Name'
    })
    fireEvent.click(muiSelectOptions)
    await waitFor(() => fireEvent.click(getByText('Add')))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/journeys/duplicatedJourneyId',
        undefined,
        { shallow: true }
      )
    })
  })
})
