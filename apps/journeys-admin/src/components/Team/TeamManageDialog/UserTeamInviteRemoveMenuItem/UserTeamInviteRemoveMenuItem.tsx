import { ReactElement } from 'react'
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded'
import { gql, useMutation } from '@apollo/client'
import { MenuItem } from '../../../MenuItem'
import { UserTeamInviteRemove } from '../../../../../__generated__/UserTeamInviteRemove'

export const USER_TEAM_INVITE_REMOVE = gql`
  mutation UserTeamInviteRemove($id: ID!) {
    userTeamInviteRemove(id: $id) {
      id
    }
  }
`

interface UserTeamInviteRemoveMenuItemProps {
  id: string
  onClick?: () => void
}

export function UserTeamInviteRemoveMenuItem({
  id,
  onClick
}: UserTeamInviteRemoveMenuItemProps): ReactElement {
  const [userInviteRemove] = useMutation<UserTeamInviteRemove>(
    USER_TEAM_INVITE_REMOVE,
    {
      variables: { id },
      update(cache, { data }) {
        if (data?.userTeamInviteRemove.id != null)
          cache.evict({
            id: cache.identify({
              __typename: 'UserTeamInvite',
              id: data.userTeamInviteRemove.id
            })
          })
        cache.gc()
      }
    }
  )
  const handleClick = async (): Promise<void> => {
    await userInviteRemove()
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
