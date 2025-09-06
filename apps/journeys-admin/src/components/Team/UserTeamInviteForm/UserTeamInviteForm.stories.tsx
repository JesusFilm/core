import { MockedProvider } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'

import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { UserTeamRole } from '../../../../__generated__/globalTypes'

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
          <UsersProfiles2Icon />
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
