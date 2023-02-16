import { ReactElement } from 'react'
import { useMutation, gql, useLazyQuery } from '@apollo/client'
import BeenhereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { MenuItem } from '../../../../MenuItem'
import { UserJourneyApprove } from '../../../../../../__generated__/UserJourneyApprove'
import { UserInviteRemove } from '../../../../../../__generated__/UserInviteRemove'
import { GetUserInvites } from '../../../../../../__generated__/GetUserInvites'
import { UserJourneyRole } from '../../../../../../__generated__/globalTypes'
import { USER_INVITE_REMOVE } from '../RemoveUser/RemoveUser'
import { GET_USER_INVITES } from '../../../AccessDialog'

interface ApproveUserProps {
  id: string
  email: string
  onClick?: () => void
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
  onClick
}: ApproveUserProps): ReactElement {
  const { journey } = useJourney()
  const [userJourneyApprove] = useMutation<UserJourneyApprove>(
    USER_JOURNEY_APPROVE,
    { variables: { id } }
  )

  const [userInviteRemove] = useMutation<UserInviteRemove>(USER_INVITE_REMOVE)

  const handleRemoveUserInvite = async (id: string): Promise<void> => {
    if (journey != null) {
      await userInviteRemove({
        variables: {
          id,
          journeyId: journey.id
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
  }

  const [loadUserInvites] = useLazyQuery<GetUserInvites>(GET_USER_INVITES, {
    variables: { journeyId: journey?.id ?? '' }
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
