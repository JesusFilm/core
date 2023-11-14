import { Meta, StoryObj } from '@storybook/react'
import { ReactElement } from 'react'

import { cache } from '../../libs/apolloClient/cache'
import { PageProvider } from '../../libs/PageWrapperProvider'
import { simpleComponentConfig } from '../../libs/storybook'
import { SidePanel } from '../NewPageWrapper/SidePanel'
import { TeamProvider } from '../Team/TeamProvider'

import { getOnboardingJourneysMock } from './data'
import { OnboardingPanel } from './OnboardingPanelContent'

const OnboardingPanelContentStory: Meta<typeof OnboardingPanel> = {
  ...simpleComponentConfig,
  component: OnboardingPanel,
  title: 'Journeys-Admin/OnboardingPanelContent'
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
      cache: cache(),
      mocks: [getOnboardingJourneysMock]
    }
  }
}

export const Loading = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [{ ...getOnboardingJourneysMock, delay: 100000000000000 }]
    }
  }
}

export default OnboardingPanelContentStory
