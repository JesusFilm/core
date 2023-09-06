import { MockedProvider } from '@apollo/client/testing'
import Drawer from '@mui/material/Drawer'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Meta, StoryObj } from '@storybook/react'
import { ReactElement } from 'react'

import { simpleComponentConfig } from '../../libs/storybook'

import { onboardingJourneys } from './data'
import { OnboardingPanelContent } from './OnboardingPanelContent'

const OnboardingPanelContentStory: Meta<typeof OnboardingPanelContent> = {
  ...simpleComponentConfig,
  component: OnboardingPanelContent,
  title: 'Journeys-Admin/OnboardingPanelContent'
}

const OnboardingPanelContentComponent = (): ReactElement => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  return (
    <MockedProvider>
      <Drawer anchor={isMobile ? 'bottom' : 'left'} open>
        <OnboardingPanelContent onboardingJourneys={onboardingJourneys} />
      </Drawer>
    </MockedProvider>
  )
}

const Template: StoryObj<typeof OnboardingPanelContent> = {
  render: () => <OnboardingPanelContentComponent />
}

export const Default = { ...Template }

export default OnboardingPanelContentStory
