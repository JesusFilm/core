import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import BeenhereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import { MenuItem } from '../../../../MenuItem'
import { UserJourneyApprove } from '../../../../../../__generated__/UserJourneyApprove'
import { UserJourneyRole } from '../../../../../../__generated__/globalTypes'

interface ApproveUserProps {
  id: string
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

export function ApproveUser({ id, onClick }: ApproveUserProps): ReactElement {
  const [userJourneyApprove] = useMutation<UserJourneyApprove>(
    USER_JOURNEY_APPROVE,
    { variables: { id } }
  )

  const handleClick = async (): Promise<void> => {
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
