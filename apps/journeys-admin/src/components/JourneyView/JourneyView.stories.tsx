import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { journeysAdminConfig } from '../../libs/storybook'
import { PageWrapper } from '../PageWrapper'
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
  <MockedProvider>
    <FlagsProvider flags={{ reports: true }}>
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
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: publishedJourney
}

export const Loading = Template.bind({})
Loading.args = {
  journey: undefined
}

export default JourneyViewStory as Meta
