import { gql, useMutation } from '@apollo/client'
import { ReactElement } from 'react'

import MinusCircleContainedIcon from '@core/shared/ui/icons/MinusCircleContained'

import { UserTeamInviteRemove } from '../../../../../__generated__/UserTeamInviteRemove'
import { MenuItem } from '../../../MenuItem'

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
  disabled?: boolean
}

export function UserTeamInviteRemoveMenuItem({
  id,
  onClick,
  disabled
}: UserTeamInviteRemoveMenuItemProps): ReactElement {
  const [userInviteRemove, { loading }] = useMutation<UserTeamInviteRemove>(
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
  async function handleClick(): Promise<void> {
    await userInviteRemove()
    onClick?.()
  }

  return (
    <MenuItem
      label="Remove"
      icon={<MinusCircleContainedIcon />}
      onClick={handleClick}
      disabled={disabled === true || loading}
      testId="Remove"
    />
  )
}
