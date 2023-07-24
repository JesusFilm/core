import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import Typography from '@mui/material/Typography'
import { journeysAdminConfig } from '../../../libs/storybook'
import { UserTeamInviteForm } from './UserTeamInviteForm'

const Demo = {
  ...journeysAdminConfig,
  component: UserTeamInviteForm,
  title: 'Journeys-Admin/Team/TeamManageDialog/UserTeamInviteForm'
}

const Template: Story<ComponentProps<typeof UserTeamInviteForm>> = () => (
  <MockedProvider>
    <Stack flexGrow={1} sx={{ m: 4, mt: 2 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
        <GroupAddIcon />
        <Typography variant="subtitle1" sx={{ ml: 3 }}>
          Add team member by Email
        </Typography>
      </Stack>
      <UserTeamInviteForm emails={[]} />
    </Stack>
  </MockedProvider>
)
export const Default = Template.bind({})

export default Demo as Meta
