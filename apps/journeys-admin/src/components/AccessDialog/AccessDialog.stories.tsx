import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { useState } from 'react'
import { AuthUser } from 'next-firebase-auth'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { journeysAdminConfig } from '../../libs/storybook'
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
      addTypename={false}
      mocks={[
        {
          request: {
            query: GET_JOURNEY_WITH_USER_JOURNEYS,
            variables: {
              id: 'journeySlug'
            }
          },
          result: {
            data: {
              journey: {
                id: 'journeyId',
                userJourneys: [
                  {
                    id: 'userJourneyId1',
                    role: 'owner',
                    user: {
                      id: 'userId1',
                      firstName: 'Amin',
                      lastName: 'One',
                      imageUrl: 'https://bit.ly/3Gth4Yf',
                      email: 'amin@email.com'
                    }
                  },
                  {
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
        }
      ]}
    >
      <AccessDialog
        AuthUser={
          {
            id: 'userId1',
            displayName: 'Amin One',
            imageUrl: 'https://bit.ly/3Gth4Yf',
            email: 'amin@email.com'
          } as unknown as AuthUser
        }
        journeySlug="journeySlug"
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
        journeySlug="journeySlug"
        open={open}
        onClose={() => setOpen(false)}
      />
    </ApolloLoadingProvider>
  )
}

export default Demo as Meta
