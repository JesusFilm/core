import { Meta, StoryObj } from '@storybook/react'
import { ReactElement } from 'react'

import { cache } from '../../libs/apolloClient/cache'
import { PageProvider } from '../../libs/PageWrapperProvider'
import { simpleComponentConfig } from '../../libs/storybook'
import { SidePanel } from '../NewPageWrapper/SidePanel'
import { TeamProvider } from '../Team/TeamProvider'

import { getOnboardingJourneysMock } from './data'
import { OnboardingPanelContent } from './OnboardingPanelContent'

const OnboardingPanelContentStory: Meta<typeof OnboardingPanelContent> = {
  ...simpleComponentConfig,
  component: OnboardingPanelContent,
  title: 'Journeys-Admin/OnboardingPanelContent'
}

const Template: StoryObj<typeof OnboardingPanelContent> = {
  render: (): ReactElement => {
    return (
      <TeamProvider>
        <PageProvider initialState={{ mobileDrawerOpen: true }}>
          <SidePanel title="Create A New Journey">
            <OnboardingPanelContent />
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
