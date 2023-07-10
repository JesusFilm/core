import { ReactElement } from 'react'
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded'
import { gql, useMutation } from '@apollo/client'
import { MenuItem } from '../../../MenuItem'
import { UserTeamDelete } from '../../../../../__generated__/UserTeamDelete'

export const USER_TEAM_DELETE = gql`
  mutation UserTeamDelete($id: ID!) {
    userTeamDelete(id: $id) {
      id
    }
  }
`

interface UserTeamDeleteMenuItemProps {
  id: string
  onClick?: () => void
  disabled?: boolean
}

export function UserTeamDeleteMenuItem({
  id,
  onClick,
  disabled
}: UserTeamDeleteMenuItemProps): ReactElement {
  const [userTeamDelete] = useMutation<UserTeamDelete>(USER_TEAM_DELETE, {
    variables: { id },
    update(cache, { data }) {
      if (data?.userTeamDelete.id != null)
        cache.evict({
          id: cache.identify({
            __typename: 'UserTeam',
            id: data.userTeamDelete.id
          })
        })
      cache.gc()
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
      disabled={disabled}
    />
  )
}
