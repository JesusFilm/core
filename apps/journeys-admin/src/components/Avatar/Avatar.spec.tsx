import { render } from '@testing-library/react'

import { GetJourneysAdmin_journeys_userJourneys_user as ApiUser } from '../../../__generated__/GetJourneysAdmin'

import { Avatar } from '.'

describe('Avatar', () => {
  const apiUser: ApiUser = {
    __typename: 'User',
    id: '1',
    firstName: 'Person',
    lastName: 'One',
    imageUrl: 'https://bit.ly/3Gth4Yf'
  }

  it('should show avatar', () => {
    const { getByRole } = render(<Avatar apiUser={apiUser} />)
    expect(getByRole('img')).toBeInTheDocument()
  })

  it('should show avatar with notification badge', () => {
    const { getByLabelText } = render(<Avatar apiUser={apiUser} notification />)
    expect(getByLabelText('notification-badge')).toBeInTheDocument()
  })
})
