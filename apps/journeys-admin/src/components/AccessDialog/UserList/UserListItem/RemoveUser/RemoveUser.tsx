import { gql, useLazyQuery, useMutation } from '@apollo/client'
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded'
import { ReactElement } from 'react'

import { GetUserInvites } from '../../../../../../__generated__/GetUserInvites'
import { UserInviteRemove } from '../../../../../../__generated__/UserInviteRemove'
import { UserJourneyRemove } from '../../../../../../__generated__/UserJourneyRemove'
import { MenuItem } from '../../../../MenuItem'
import { GET_USER_INVITES } from '../../../AccessDialog'

interface RemoveUserProps {
  id: string
  email?: string
  onClick?: () => void
  journeyId: string
}

export const USER_JOURNEY_REMOVE = gql`
  mutation UserJourneyRemove($id: ID!) {
    userJourneyRemove(id: $id) {
      id
      journey {
        id
      }
    }
  }
`

export const USER_INVITE_REMOVE = gql`
  mutation UserInviteRemove($id: ID!, $journeyId: ID!) {
    userInviteRemove(id: $id, journeyId: $journeyId) {
      id
      journeyId
      removedAt
    }
  }
`

export function RemoveUser({
  id,
  email,
  onClick,
  journeyId
}: RemoveUserProps): ReactElement {
  const [userJourneyRemove] = useMutation<UserJourneyRemove>(
    USER_JOURNEY_REMOVE,
    {
      variables: { id },
      update(cache, { data }) {
        if (data?.userJourneyRemove.journey != null)
          cache.modify({
            id: cache.identify({ ...data.userJourneyRemove.journey }),
            fields: {
              userJourneys(refs, { readField }) {
                return refs.filter((ref) => id !== readField('id', ref))
              }
            }
          })
      }
    }
  )

  const [userInviteRemove] = useMutation<UserInviteRemove>(USER_INVITE_REMOVE)

  const handleRemoveUserInvite = async (id: string): Promise<void> => {
    await userInviteRemove({
      variables: {
        id,
        journeyId
      },
      update(cache, { data }) {
        if (data?.userInviteRemove != null)
          cache.modify({
            fields: {
              userInvites(refs, { readField }) {
                return refs.filter((ref) => id !== readField('id', ref))
              }
            }
          })
      }
    })
  }

  const [loadUserInvites] = useLazyQuery<GetUserInvites>(GET_USER_INVITES, {
    variables: { journeyId }
  })

  const handleClick = async (): Promise<void> => {
    if (email == null) {
      await handleRemoveUserInvite(id)

      // Remove userJourney and any associated userInvite
    } else {
      const result = await loadUserInvites()
      const userInvite = result.data?.userInvites?.find(
        (invite) => invite.email === email
      )
      if (userInvite != null) {
        void handleRemoveUserInvite(userInvite.id)
      }

      await userJourneyRemove()
    }

    onClick?.()
  }

  return (
    <MenuItem
      label="Remove"
      icon={<RemoveCircleRoundedIcon />}
      onClick={handleClick}
    />
  )
}
