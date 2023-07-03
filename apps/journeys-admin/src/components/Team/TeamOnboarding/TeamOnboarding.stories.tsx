import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { Meta, Story } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { TeamOnboarding } from './TeamOnboarding'

const TeamOnboardingStory = {
  ...journeysAdminConfig,
  component: TeamOnboarding,
  title: 'Journeys-Admin/Team/TeamOnboarding'
}

export const Default: Story = () => {
  return (
    <FlagsProvider>
      <MockedProvider>
        <TeamOnboarding />
      </MockedProvider>
    </FlagsProvider>
  )
}

export default TeamOnboardingStory as Meta
