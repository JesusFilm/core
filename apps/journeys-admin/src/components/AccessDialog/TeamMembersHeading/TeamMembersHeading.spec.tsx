import { render, screen } from "@testing-library/react"
import { TeamMembersHeading } from "./TeamMembersHeading"

describe('getTeamMembersHeading', () => {
    it('should render all text elements and icons correctly', () => {
        const teamMembersText = 'Team Members'
        const emailNotificationsText = 'Email Notifications'
        const userRoleText = 'User Role'

        render(<TeamMembersHeading 
            teamMembersText={teamMembersText}
            emailNotificationsText={emailNotificationsText}
            userRoleText={userRoleText}/>)

        expect(screen.getByText(teamMembersText)).toBeInTheDocument();
        expect(screen.getByLabelText(emailNotificationsText)).toBeInTheDocument();
        expect(screen.getByLabelText(userRoleText)).toBeInTheDocument();
        
        expect(screen.getByTestId('UsersProfiles2Icon')).toBeInTheDocument();
        expect(screen.getByTestId('EmailIcon')).toBeInTheDocument();
        expect(screen.getByTestId('ShieldCheckIcon')).toBeInTheDocument();
    });
});