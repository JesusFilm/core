import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { useState } from 'react'

import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_CURRENT_USER } from '../../libs/useCurrentUser'
import { GET_USER_INVITES } from '../../libs/useUserInvitesLazyQuery/useUserInvitesLazyQuery'

import { GET_JOURNEY_WITH_USER_JOURNEYS } from './AccessDialog'

import { AccessDialog } from '.'

const Demo = {
  ...journeysAdminConfig,
  component: AccessDialog,
  title: 'Journeys-Admin/AccessDialog'
}

export const Default: Story = () => {
  const [open, setOpen] = useState(true)
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_JOURNEY_WITH_USER_JOURNEYS,
            variables: {
              id: 'journeyId'
            }
          },
          result: {
            data: {
              journey: {
                id: 'journeyId',
                userJourneys: [
                  {
                    __typename: 'UserJourney',
                    id: 'userJourneyId1',
                    role: 'owner',
                    user: {
                      id: 'userId1',
                      firstName: 'Amin',
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

export const Loading: Story = () => {
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

export default Demo as Meta
