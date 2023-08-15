import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { Role } from '../../../../__generated__/globalTypes'
import { JOURNEY_DUPLICATE } from '../../../libs/useJourneyDuplicateMutation'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../Team/TeamProvider'
import { defaultJourney } from '../data'

import { GET_ROLE } from './Menu'

import { Menu } from '.'

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('JourneyView/Menu', () => {
  const originalEnv = process.env

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

  it('should preview if journey', () => {
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

  it('should handle edit journey title and description if user is publisher', async () => {
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
      fireEvent.click(getByRole('menuitem', { name: 'Description' }))
    })
    expect(getByRole('dialog')).toBeInTheDocument()
    expect(menu).not.toHaveAttribute('aria-expanded')
  })

  it('should handle edit journey title', () => {
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
    fireEvent.click(getByRole('menuitem', { name: 'Title' }))
    expect(getByRole('dialog')).toBeInTheDocument()
    expect(menu).not.toHaveAttribute('aria-expanded')
  })

  it('should handle edit journey description', () => {
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
    fireEvent.click(getByRole('menuitem', { name: 'Description' }))
    expect(getByRole('dialog')).toBeInTheDocument()
    expect(menu).not.toHaveAttribute('aria-expanded')
  })

  it('should handle edit journey language', async () => {
    const { getByRole, getByText } = render(
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
    fireEvent.click(getByRole('menuitem', { name: 'Language' }))
    await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument())
    expect(getByText('Edit Language')).toBeInTheDocument()
    expect(menu).not.toHaveAttribute('aria-expanded')
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

  it('should handle copy url in development', async () => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: 'http://localhost:4100'
    }

    jest.spyOn(navigator.clipboard, 'writeText')

    const { getByRole, getByText } = render(
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
    fireEvent.click(getByRole('menuitem', { name: 'Copy Link' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_JOURNEYS_URL as string}/${defaultJourney.slug}`
    )
    await waitFor(() => {
      expect(getByText('Link Copied')).toBeInTheDocument()
    })
    expect(menu).not.toHaveAttribute('aria-expanded')

    process.env = originalEnv
  })

  it('should handle copy url in production', async () => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: undefined
    }

    jest.spyOn(navigator.clipboard, 'writeText')

    const { getByRole, getByText } = render(
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
    fireEvent.click(getByRole('menuitem', { name: 'Copy Link' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `https://your.nextstep.is/${defaultJourney.slug}`
    )
    await waitFor(() => {
      expect(getByText('Link Copied')).toBeInTheDocument()
    })
    expect(menu).not.toHaveAttribute('aria-expanded')

    process.env = originalEnv
  })

  it('should handle reports', () => {
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
    expect(getByRole('menuitem', { name: 'Report' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/reports'
    )
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
