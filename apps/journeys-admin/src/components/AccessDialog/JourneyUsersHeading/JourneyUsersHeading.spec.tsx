import { render, screen } from '@testing-library/react'

import { JourneyUsersHeading } from './JourneyUsersHeading'

describe('JourneyUsersHeading', () => {
  it('should render all text elements and icons correctly', () => {
    const usersText = 'Journey Users'
    const emailNotificationsText = 'Email Notifications'
    const userRoleText = 'User Role'

    render(
      <JourneyUsersHeading
        usersText={usersText}
        emailNotificationsText={emailNotificationsText}
        userRoleText={userRoleText}
      />
    )

    expect(screen.getByText(usersText)).toBeInTheDocument()
    expect(screen.getByLabelText(emailNotificationsText)).toBeInTheDocument()
    expect(screen.getByLabelText(userRoleText)).toBeInTheDocument()

    expect(screen.getByTestId('UsersProfiles2Icon')).toBeInTheDocument()
    expect(screen.getByTestId('EmailIcon')).toBeInTheDocument()
    expect(screen.getByTestId('ShieldCheckIcon')).toBeInTheDocument()
  })
})
