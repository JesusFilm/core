import { Story, Meta } from '@storybook/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { journeysAdminConfig } from '../../libs/storybook'
import { PageWrapper } from '../PageWrapper'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { JourneyView } from './JourneyView'
import { publishedJourney } from './data'
import { Menu } from './Menu'

const JourneyViewStory = {
  ...journeysAdminConfig,
  component: JourneyView,
  title: 'Journeys-Admin/JourneyView',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <ApolloLoadingProvider>
    <FlagsProvider flags={{ reports: args.reports }}>
      <JourneyProvider value={{ journey: args.journey }}>
        <PageWrapper
          title="Journey Details"
          showDrawer
          backHref="/"
          menu={<Menu />}
        >
          <JourneyView />
        </PageWrapper>
      </JourneyProvider>
    </FlagsProvider>
  </ApolloLoadingProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: publishedJourney
}

export const Reports = Template.bind({})
Reports.args = {
  journey: publishedJourney,
  reports: true
}

export const Loading = Template.bind({})
Loading.args = {
  journey: undefined
}

export default JourneyViewStory as Meta
