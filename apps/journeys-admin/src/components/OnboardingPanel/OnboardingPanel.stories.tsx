import { Meta, StoryObj } from '@storybook/react'
import { ReactElement } from 'react'

import { PageProvider } from '../../libs/PageWrapperProvider'
import { simpleComponentConfig } from '../../libs/storybook'
import { SidePanel } from '../PageWrapper/SidePanel'
import { TeamProvider } from '../Team/TeamProvider'

import { getOnboardingJourneysMock, getTeamsMock } from './data'

import { OnboardingPanel } from '.'

const OnboardingPanelStory: Meta<typeof OnboardingPanel> = {
  ...simpleComponentConfig,
  component: OnboardingPanel,
  title: 'Journeys-Admin/OnboardingPanel'
}

const Template: StoryObj<typeof OnboardingPanel> = {
  render: (): ReactElement => {
    return (
      <TeamProvider>
        <PageProvider initialState={{ mobileDrawerOpen: true }}>
          <SidePanel title="Create A New Journey">
            <OnboardingPanel />
          </SidePanel>
        </PageProvider>
      </TeamProvider>
    )
  }
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getTeamsMock, getOnboardingJourneysMock]
    }
  }
}

export const Loading = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [
        { ...getTeamsMock, delay: 100000000000000 },
        { ...getOnboardingJourneysMock, delay: 100000000000000 }
      ]
    }
  }
}

export default OnboardingPanelStory
