import { render } from '@testing-library/react'

import { GetAdminJourneys_journeys_userJourneys_user as User } from '../../../__generated__/GetAdminJourneys'

import { Avatar } from '.'

describe('Avatar', () => {
  const user: User = {
    __typename: 'User',
    id: '1',
    firstName: 'Person',
    lastName: 'One',
    imageUrl: 'https://bit.ly/3Gth4Yf'
  }

  it('should show avatar', () => {
    const { getByRole } = render(<Avatar user={user} />)
    expect(getByRole('img')).toBeInTheDocument()
  })

  it('should show avatar with notification badge', () => {
    const { getByLabelText } = render(<Avatar user={user} notification />)
    expect(getByLabelText('notification-badge')).toBeInTheDocument()
  })
})
