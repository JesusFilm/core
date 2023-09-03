import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ReactNode, useState } from 'react'

import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_CURRENT_USER } from '../../libs/useCurrentUser'
import { GET_USER_INVITES } from '../../libs/useUserInvitesLazyQuery/useUserInvitesLazyQuery'

import { GET_JOURNEY_WITH_PERMISSIONS } from './AccessDialog'

import { AccessDialog } from '.'

const Demo: Meta<typeof AccessDialog> = {
  ...journeysAdminConfig,
  component: AccessDialog,
  title: 'Journeys-Admin/AccessDialog'
}

const DefaultAccessDialog = (): ReactNode => {
  const [open, setOpen] = useState(true)
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_JOURNEY_WITH_PERMISSIONS,
            variables: {
              id: 'journeyId'
            }
          },
          result: {
            data: {
              journey: {
                id: 'journeyId',
                team: {
                  __typename: 'Team',
                  id: 'teamId',
                  userTeams: [
                    {
                      __typename: 'UserTeam',
                      id: 'userTeamId',
                      role: 'manager',
                      user: {
                        __typename: 'User',
                        email: 'kujojotaro@example.com',
                        firstName: 'Jotaro',
                        id: 'userId',
                        imageUrl:
                          'https://lh3.googleusercontent.com/a/AGNmyxbPtShdH3_xxjpnfHLlo0w-KxDBa9Ah1Qn_ZwpUrA=s96-c',
                        lastName: 'Kujo'
                      }
                    },
                    {
                      __typename: 'UserTeam',
                      id: 'userTeamId1',
                      role: 'member',
                      user: {
                        __typename: 'User',
                        email: 'josukehigashikata@example.com',
                        firstName: 'Josuke',
                        id: 'userId1',
                        imageUrl: null,
                        lastName: 'Higashikata'
                      }
                    },
                    {
                      __typename: 'UserTeam',
                      id: 'userTeamId2',
                      role: 'member',
                      user: {
                        __typename: 'User',
                        email: 'KoichiHirose@example.com',
                        firstName: 'Koichi',
                        id: 'userId2',
                        imageUrl: null,
                        lastName: 'Hirose'
                      }
                    }
                  ]
                },
                userJourneys: [
                  {
                    __typename: 'UserJourney',
                    id: 'userJourneyId1',
                    role: 'owner',
                    user: {
                      id: 'userId1',
                      firstName: 'Admin',
                      lastName: 'One',
                      imageUrl: 'https://bit.ly/3Gth4Yf',
                      email: 'admin@email.com'
                    }
                  },
                  {
                    __typename: 'UserJourney',
                    id: 'userJourneyId2',
                    role: 'editor',
                    user: {
                      id: 'userId2',
                      firstName: 'Horace',
                      lastName: 'Two',
                      imageUrl: 'https://bit.ly/3rgHd6a',
                      email: 'horace@email.com'
                    }
                  },
                  {
                    __typename: 'UserJourney',
                    id: 'userJourneyId3',
                    role: 'inviteRequested',
                    user: {
                      id: 'userId3',
                      firstName: 'Coral',
                      lastName: 'Three',
                      imageUrl: 'https://bit.ly/3nlwUwJ',
                      email: 'coral@email.com'
                    }
                  }
                ]
              }
            }
          }
        },
        {
          request: {
            query: GET_USER_INVITES,
            variables: {
              journeyId: 'journeyId'
            }
          },
          result: {
            data: {
              userInvites: [
                {
                  __typename: 'UserInvite',
                  id: 'invite.id',
                  journeyId: 'journey.id',
                  email: 'invite@email.com',
                  acceptedAt: null,
                  removedAt: null
                }
              ]
            }
          }
        },
        {
          request: {
            query: GET_CURRENT_USER
          },
          result: {
            data: {
              me: {
                id: 'userId1',
                email: 'admin@email.com'
              }
            }
          }
        }
      ]}
    >
      <AccessDialog
        journeyId="journeyId"
        open={open}
        onClose={() => setOpen(false)}
      />
    </MockedProvider>
  )
}

export const Default: StoryObj<typeof AccessDialog> = {
  render: () => <DefaultAccessDialog />
}

const LoadingAccessDialog = (): ReactNode => {
  const [open, setOpen] = useState(true)
  return (
    <ApolloLoadingProvider>
      <AccessDialog
        journeyId="journeyId"
        open={open}
        onClose={() => setOpen(false)}
      />
    </ApolloLoadingProvider>
  )
}

export const Loading: StoryObj<typeof AccessDialog> = {
  render: () => <LoadingAccessDialog />
}

export default Demo
