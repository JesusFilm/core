import { ReactElement } from 'react'
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded'
import { gql, useMutation } from '@apollo/client'
import { MenuItem } from '../../../MenuItem'

export const USER_TEAM_REMOVE = gql`
  mutation UserTeamDelete($id: ID!) {
    userTeamDelete(id: $id) {
      id
      user {
        id
      }
    }
  }
`

interface RemoveUserProps {
  id: string
  email?: string
  onClick?: () => void
}

export function RemoveUserTeam({
  id,
  email,
  onClick
}: RemoveUserProps): ReactElement {
  const [userTeamDelete] = useMutation(USER_TEAM_REMOVE, {
    variables: { id },
    update(cache, { data }) {
      if (data?.userTeamDelete.user != null)
        cache.evict({
          id: cache.identify({
            __typename: 'UserTeam',
            id: data.userTeamDelete.id
          })
        })
    }
  })

  const handleClick = async (): Promise<void> => {
    await userTeamDelete()
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
