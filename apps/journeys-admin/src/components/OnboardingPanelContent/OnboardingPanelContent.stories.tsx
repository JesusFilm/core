import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Meta, Story } from '@storybook/react'
import Drawer from '@mui/material/Drawer'
import { Theme } from '@mui/material/styles'
import { simpleComponentConfig } from '../../libs/storybook'
import { OnboardingPanelContent } from './OnboardingPanelContent'
import { onboardingJourneys } from './data'

const OnboardingPanelContentStory = {
  ...simpleComponentConfig,
  component: OnboardingPanelContent,
  title: 'Journeys-Admin/OnboardingPanelContent'
}

const Template: Story = () => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  return (
    <MockedProvider>
      <Drawer anchor={isMobile ? 'bottom' : 'left'} open>
        <OnboardingPanelContent onboardingJourneys={onboardingJourneys} />
      </Drawer>
    </MockedProvider>
  )
}

export const Default = Template.bind({})

export default OnboardingPanelContentStory as Meta
