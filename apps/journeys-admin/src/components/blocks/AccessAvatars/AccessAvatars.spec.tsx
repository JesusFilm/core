import { render } from '@testing-library/react'
import { AccessAvatars, AccessAvatarsProps } from './AccessAvatars'

describe('AccessAvatars', () => {
  it('should render avatars', () => {
    const props: AccessAvatarsProps = {
      users: [
        {
          id: '1',
          firstName: 'Amin',
          lastName: 'Person',
          image: 'https://source.unsplash.com/random/300x300',
          email: 'amin@email.com'
        }
      ]
    }
    render(<AccessAvatars users={props.users} />)
  })
})
