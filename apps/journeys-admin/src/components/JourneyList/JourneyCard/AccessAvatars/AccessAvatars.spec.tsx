import { render, fireEvent, waitFor } from '@testing-library/react'
import { AccessAvatars, AccessAvatarsProps } from './AccessAvatars'
import { user1, user2, user3, user4, user5, user6 } from './data'

describe('AccessAvatars', () => {
  it('should render avatars', () => {
    const props: AccessAvatarsProps = {
      users: [user1]
    }
    render(<AccessAvatars users={props.users} />)
  })

  it('should use first name as image alt', () => {
    const props: AccessAvatarsProps = {
      users: [user1]
    }
    const { getByAltText } = render(<AccessAvatars users={props.users} />)
    expect(getByAltText('Amin')).toBeInTheDocument()
  })

  it('should use first name and last as tooltip', () => {
    const props: AccessAvatarsProps = {
      users: [user1]
    }
    const { getByLabelText } = render(<AccessAvatars users={props.users} />)
    expect(getByLabelText('Amin Person')).toBeInTheDocument()
  })

  it('should render overflow avatar with correct details', async () => {
    const props: AccessAvatarsProps = {
      users: [user1, user2, user3, user4, user5, user6]
    }

    const { getByRole, getByText } = render(
      <AccessAvatars users={props.users} />
    )
    expect(getByText('+2')).toBeInTheDocument()
    fireEvent.focus(getByText('+2'))
    await waitFor(() => {
      expect(getByRole('tooltip')).toBeInTheDocument()
      expect(getByText('Janelle Clegg')).toBeInTheDocument()
      expect(getByText('Drake Graham')).toBeInTheDocument()
    })
  })
})
