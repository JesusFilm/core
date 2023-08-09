import { gql, useLazyQuery, useMutation } from '@apollo/client'
import BeenhereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import { ReactElement } from 'react'

import { GetUserInvites } from '../../../../../../__generated__/GetUserInvites'
import { UserJourneyRole } from '../../../../../../__generated__/globalTypes'
import { UserInviteRemove } from '../../../../../../__generated__/UserInviteRemove'
import { UserJourneyApprove } from '../../../../../../__generated__/UserJourneyApprove'
import { MenuItem } from '../../../../MenuItem'
import { GET_USER_INVITES } from '../../../AccessDialog'
import { USER_INVITE_REMOVE } from '../RemoveUser/RemoveUser'

interface ApproveUserProps {
  id: string
  email: string
  onClick?: () => void
  journeyId: string
}

export const USER_JOURNEY_APPROVE = gql`
  mutation UserJourneyApprove($id: ID!) {
    userJourneyApprove(id: $id) {
      id
      role
    }
  }
`

export function ApproveUser({
  id,
  email,
  onClick,
  journeyId
}: ApproveUserProps): ReactElement {
  const [userJourneyApprove] = useMutation<UserJourneyApprove>(
    USER_JOURNEY_APPROVE,
    { variables: { id } }
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
    const result = await loadUserInvites()
    const userInvite = result.data?.userInvites?.find(
      (invite) => invite.email === email
    )

    if (userInvite != null) {
      void handleRemoveUserInvite(userInvite.id)
    }

    await userJourneyApprove({
      optimisticResponse: {
        userJourneyApprove: {
          id,
          role: UserJourneyRole.editor,
          __typename: 'UserJourney'
        }
      }
    })
    onClick?.()
  }

  return (
    <MenuItem
      label="Approve"
      icon={<BeenhereRoundedIcon />}
      onClick={handleClick}
    />
  )
}
