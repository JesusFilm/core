import { gql, useMutation } from '@apollo/client'
import { ReactElement } from 'react'

import MinusCircleContainedIcon from '@core/shared/ui/icons/MinusCircleContained'

import { UserTeamDelete } from '../../../../../__generated__/UserTeamDelete'
import { MenuItem } from '../../../MenuItem'

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
  const [userTeamDelete, { loading }] = useMutation<UserTeamDelete>(
    USER_TEAM_DELETE,
    {
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
    }
  )

  async function handleClick(): Promise<void> {
    await userTeamDelete()
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
