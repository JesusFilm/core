import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GetUserTeamsAndInvites_userTeamInvites as UserTeamInvite } from '../../../../../../__generated__/GetUserTeamsAndInvites'

import { UserTeamInviteListItem } from './UserTeamInviteListItem'

describe('UserTeamInviteListItem', () => {
  const userTeamInvite: UserTeamInvite = {
    __typename: 'UserTeamInvite',
    id: 'userTeamInviteId',
    email: 'milesmorales@example.com',
    teamId: 'teamId'
  }

  it('should show email of the invitation', () => {
    const { getByText } = render(
      <UserTeamInviteListItem user={userTeamInvite} disabled={false} />
    )

    expect(getByText('milesmorales@example.com')).toBeInTheDocument()
    expect(getByText('Invited')).toBeInTheDocument()
  })

  it('disables button if disabled condition is true', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <UserTeamInviteListItem user={userTeamInvite} disabled />
      </MockedProvider>
    )

    const button = getByRole('button')
    expect(button).toBeDisabled()
  })

  it('opens remove item menu', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <UserTeamInviteListItem user={userTeamInvite} disabled={false} />
      </MockedProvider>
    )

    const button = getByRole('button')
    await waitFor(() => fireEvent.click(button))
    expect(getByText('Remove')).toBeInTheDocument()
  })
})
