import { MockedProvider } from '@apollo/client/testing'
import Drawer from '@mui/material/Drawer'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Meta, StoryObj } from '@storybook/react'
import { ReactElement } from 'react'

import { simpleComponentConfig } from '../../libs/storybook'

import { onboardingJourneys } from './data'
import {
  GET_ONBOARDING_JOURNEYS,
  OnboardingPanel
} from './OnboardingPanelContent'

const OnboardingPanelContentStory: Meta<typeof OnboardingPanel> = {
  ...simpleComponentConfig,
  component: OnboardingPanel,
  title: 'Journeys-Admin/OnboardingPanelContent'
}

const OnboardingPanelContentComponent = (): ReactElement => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_ONBOARDING_JOURNEYS,
            variables: {
              where: {
                ids: onboardingJourneys.map((journey) => journey.id)
              }
            }
          },
          result: { data: { onboardingJourneys } }
        }
      ]}
    >
      <Drawer anchor={isMobile ? 'bottom' : 'left'} open>
        <OnboardingPanel />
      </Drawer>
    </MockedProvider>
  )
}

const Template: StoryObj<typeof OnboardingPanel> = {
  render: () => <OnboardingPanelContentComponent />
}

export const Default = { ...Template }

export default OnboardingPanelContentStory
