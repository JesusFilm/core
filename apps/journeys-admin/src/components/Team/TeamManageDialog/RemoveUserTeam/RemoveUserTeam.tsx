import { ReactElement } from 'react'
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded'
import { gql, useMutation } from '@apollo/client'
import { MenuItem } from '../../../MenuItem'
import { UserTeamDelete } from '../../../../../__generated__/UserTeamDelete'
import { UserTeamInviteRemove } from '../../../../../__generated__/UserTeamInviteRemove'

export const USER_TEAM_DELETE = gql`
  mutation UserTeamDelete($id: ID!) {
    userTeamDelete(id: $id) {
      id
    }
  }
`

export const USER_TEAM_INVITE_REMOVE = gql`
  mutation UserTeamInviteRemove($id: ID!) {
    userTeamInviteRemove(id: $id) {
      id
    }
  }
`

interface RemoveUserProps {
  id: string
  isInvite: boolean
  onClick?: () => void
}

export function RemoveUserTeam({
  id,
  isInvite,
  onClick
}: RemoveUserProps): ReactElement {
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
    !isInvite ? await userTeamDelete() : await userInviteRemove()
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
