import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
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
})
