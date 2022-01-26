import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import BeenhereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import { UserJourneyApprove } from '../../../../__generated__/UserJourneyApprove'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'

interface ApproveUserProps {
  id: string
}

export const USER_JOURNEY_APPROVE = gql`
  mutation UserJourneyApprove($id: ID!) {
    userJourneyApprove(id: $id) {
      id
      role
    }
  }
`

export function ApproveUser({ id }: ApproveUserProps): ReactElement {
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
  }

  return (
    <MenuItem onClick={handleClick}>
      <ListItemIcon>
        <BeenhereRoundedIcon />
      </ListItemIcon>
      <ListItemText>Approve</ListItemText>
    </MenuItem>
  )
}
