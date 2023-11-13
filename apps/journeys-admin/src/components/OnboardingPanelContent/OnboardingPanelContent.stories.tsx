import { MockedProvider } from '@apollo/client/testing'
import Drawer from '@mui/material/Drawer'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Meta, StoryObj } from '@storybook/react'
import { ReactElement } from 'react'

import { cache } from '../../libs/apolloClient/cache'
import { simpleComponentConfig } from '../../libs/storybook'
import { TeamProvider } from '../Team/TeamProvider'

import { getOnboardingJourneysMock } from './data'
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
      <TeamProvider>
        <Drawer anchor={isMobile ? 'bottom' : 'left'} open>
          <OnboardingPanelContent />
        </Drawer>
      </TeamProvider>
    </MockedProvider>
  )
}

const Template: StoryObj<typeof OnboardingPanelContent> = {
  render: () => <OnboardingPanelContentComponent />
}

export const Default = {
  ...Template,

  parameters: {
    apolloClient: {
      cache: cache(),
      mocks: [getOnboardingJourneysMock]
    }
  }
}

export default OnboardingPanelContentStory
