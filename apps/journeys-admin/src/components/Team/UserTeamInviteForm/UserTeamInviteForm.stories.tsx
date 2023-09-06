import { MockedProvider } from '@apollo/client/testing'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'

import { UserTeamRole } from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'

import { UserTeamInviteForm } from './UserTeamInviteForm'

const Demo: Meta<typeof UserTeamInviteForm> = {
  ...journeysAdminConfig,
  component: UserTeamInviteForm,
  title: 'Journeys-Admin/Team/TeamManageDialog/UserTeamInviteForm'
}

const Template: StoryObj<typeof UserTeamInviteForm> = {
  render: () => (
    <MockedProvider>
      <Stack flexGrow={1} sx={{ m: 4, mt: 2 }}>
        <Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
          <GroupAddIcon />
          <Typography variant="subtitle1" sx={{ ml: 3 }}>
            Add team member by Email
          </Typography>
        </Stack>
        <UserTeamInviteForm emails={[]} role={UserTeamRole.manager} />
      </Stack>
    </MockedProvider>
  )
}
export const Default = { ...Template }

export default Demo
