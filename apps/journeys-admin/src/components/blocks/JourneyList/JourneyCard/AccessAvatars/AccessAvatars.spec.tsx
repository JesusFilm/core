import { render } from '@testing-library/react'
import { AccessAvatars, AccessAvatarsProps } from './AccessAvatars'
import { user1 } from './AccessAvatarsData'

describe('AccessAvatars', () => {
  it('should render avatars', () => {
    const props: AccessAvatarsProps = {
      users: [user1]
    }
    render(<AccessAvatars users={props.users} />)
  })
})
