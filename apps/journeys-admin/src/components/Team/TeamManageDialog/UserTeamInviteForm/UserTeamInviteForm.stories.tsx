import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { AddUserSection } from '../../../AccessDialog/AddUserSection'
import { UserTeamInviteForm } from './UserTeamInviteForm'

const Demo = {
  ...journeysAdminConfig,
  component: UserTeamInviteForm,
  title: 'Journeys-Admin/Team/TeamManageDialog/UserTeamInviteForm'
}

const Template: Story<ComponentProps<typeof UserTeamInviteForm>> = () => (
  <MockedProvider>
    <AddUserSection users={[]} addTeamMembers />
  </MockedProvider>
)
export const Default = Template.bind({})

export default Demo as Meta
