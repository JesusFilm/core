import { MockedProvider } from '@apollo/client/testing'
import { Story, Meta } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { EmailInviteForm } from '.'

const EmailInviteFormStory = {
  ...journeysAdminConfig,
  component: EmailInviteForm,
  title: 'Journeys-Admin/AccessDialog/AddUserSection/EmailInviteForm'
}

const Template: Story = ({ ...args }) => {
  return (
    <MockedProvider>
      <>
        {args.states.map((state) => (
          <Stack key={state} sx={{ mb: 4 }}>
            <Typography variant="body2" gutterBottom>
              {state}
            </Typography>
            <EmailInviteForm users={[]} />
          </Stack>
        ))}
      </>
    </MockedProvider>
  )
}

export const States = Template.bind({})
States.args = {
  states: ['Default', 'Populated', 'Error']
}
States.play = async () => {
  await waitFor(() => {
    const inputs = screen.getAllByRole('textbox')
    const submits = screen.getAllByRole('button')
    userEvent.type(inputs[1], 'test@email.com')
    userEvent.type(inputs[2], 'not-an-email')
    userEvent.click(submits[2])
  })
}

export default EmailInviteFormStory as Meta
