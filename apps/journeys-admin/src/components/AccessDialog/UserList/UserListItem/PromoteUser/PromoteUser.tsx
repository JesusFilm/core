import { gql, useMutation } from '@apollo/client'
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded'
import { ReactElement } from 'react'

import { UserJourneyPromote } from '../../../../../../__generated__/UserJourneyPromote'
import { MenuItem } from '../../../../MenuItem'

interface PromoteUserProps {
  id: string
  onClick?: () => void
}

export const USER_JOURNEY_PROMOTE = gql`
  mutation UserJourneyPromote($id: ID!) {
    userJourneyPromote(id: $id) {
      id
      role
      journey {
        id
        userJourneys {
          id
          role
        }
      }
    }
  }
`

export function PromoteUser({ id, onClick }: PromoteUserProps): ReactElement {
  const [userJourneyPromote] = useMutation<UserJourneyPromote>(
    USER_JOURNEY_PROMOTE,
    { variables: { id } }
  )

  const handleClick = async (): Promise<void> => {
    await userJourneyPromote()
    if (onClick != null) onClick()
  }

  return (
    <MenuItem
      label="Promote"
      icon={<NewReleasesRoundedIcon />}
      onClick={handleClick}
    />
  )
}
