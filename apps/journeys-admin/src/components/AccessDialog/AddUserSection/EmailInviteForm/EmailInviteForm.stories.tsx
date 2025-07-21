import { MockedProvider } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { EmailInviteForm } from '.'

const EmailInviteFormStory: Meta<typeof EmailInviteForm> = {
  ...journeysAdminConfig,
  component: EmailInviteForm,
  title: 'Journeys-Admin/AccessDialog/AddUserSection/EmailInviteForm'
}

const Template: StoryObj<
  ComponentProps<typeof EmailInviteForm> & { states: [string] }
> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider>
        <>
          {args.states.map((state) => (
            <Stack key={state} sx={{ mb: 4 }}>
              <Typography variant="body2" gutterBottom>
                {state}
              </Typography>
              <EmailInviteForm users={[]} journeyId="journeyId" />
            </Stack>
          ))}
        </>
      </MockedProvider>
    )
  }
}

export const States = {
  ...Template,
  args: {
    states: ['Default', 'Populated', 'Error']
  },
  play: async () => {
    const inputs = screen.getAllByRole('textbox')
    const submits = screen.getAllByRole('button')
    await userEvent.type(inputs[1], 'test@email.com')
    await userEvent.type(inputs[2], 'not-an-email')
    await userEvent.click(submits[2])
  }
}

export default EmailInviteFormStory
