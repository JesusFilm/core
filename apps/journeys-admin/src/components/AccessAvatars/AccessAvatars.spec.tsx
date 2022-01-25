import { render } from '@testing-library/react'
import { AccessAvatars } from './AccessAvatars'
import { user1, user2, user3, user4, user5, user6 } from './data'

describe('AccessAvatars', () => {
  it('should use first name as image alt', () => {
    const { getByAltText } = render(
      <AccessAvatars
        journeySlug="journeySlug"
        users={[user1, user2, user3, user4, user5]}
      />
    )
    expect(getByAltText('Janelle Five')).toBeInTheDocument()
  })

  it('should use first name and last as tooltip', () => {
    const { getByLabelText } = render(
      <AccessAvatars
        journeySlug="journeySlug"
        users={[user1, user2, user3, user4, user5]}
      />
    )
    expect(getByLabelText('Janelle Five')).toBeInTheDocument()
  })

  it('should display 2 mobile and 4 desktop avatars max', () => {
    const { getAllByRole } = render(
      <AccessAvatars
        journeySlug="journeySlug"
        users={[user1, user2, user3, user4, user5, user6]}
      />
    )
    expect(
      getAllByRole('img').map((element) => element.getAttribute('alt'))
    ).toEqual([
      // Mobile
      'Horace Two',
      'Amin One',
      // Desktop
      'Effie Four',
      'Coral Three',
      'Horace Two',
      'Amin One'
    ])
  })
})
