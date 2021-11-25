import { render } from '@testing-library/react'
import { AccessAvatars, AccessAvatarsProps} from './AccessAvatars'
import { user1, user6 } from './AccessAvatarsData'

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
    const {getByAltText} = render(<AccessAvatars users={props.users} />)
    expect(getByAltText('Amin')).toBeInTheDocument();
  })

  it('should use first name and last as tooltip', () => {
    const props: AccessAvatarsProps = {
      users: [user1]
    }
    const {getByLabelText} = render(<AccessAvatars users={props.users} />)
    expect(getByLabelText('Amin Person')).toBeInTheDocument();
  }) 

  it('should use email as tooltip if user has no firstname', () => {
    const props: AccessAvatarsProps = {
      users: [user6]
    }
    const {getByLabelText} = render(<AccessAvatars users={props.users} />)
    expect(getByLabelText('drake@email.com')).toBeInTheDocument();
  })

  it('should use "No name or email available for this user" as tooltip if user has no firstname and no email', () => {
    const props: AccessAvatarsProps = {
      users: [
        {...user6, firstName: undefined, email: undefined}
      ]
    }
    const {getByLabelText} = render(<AccessAvatars users={props.users} />)
    expect(getByLabelText('No name or email available for this user')).toBeInTheDocument();
  })

  it('should display generic avatar icon if user has no firstname, no email and no image', () => {
    const props: AccessAvatarsProps = {
      users: [
        {...user6, firstName: undefined, email: undefined, image: undefined}
      ]
    }
    const {getByTestId} = render(<AccessAvatars users={props.users} />)
    expect(getByTestId('PersonIcon')).toBeInTheDocument();
  })  
})
