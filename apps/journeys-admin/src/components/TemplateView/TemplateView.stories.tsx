import { Story, Meta } from '@storybook/react'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { journeysAdminConfig } from '../../libs/storybook'
import { PageWrapper } from '../PageWrapper'
import { TemplateView } from './TemplateView'
import { publishedJourney } from './data'

const TemplateViewStory = {
  ...journeysAdminConfig,
  component: TemplateView,
  title: 'Journeys-Admin/TemplateView',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <ApolloLoadingProvider>
    <FlagsProvider>
      <JourneyProvider value={{ journey: args.journey }}>
        <PageWrapper title="Template Details" showDrawer backHref="/">
          <TemplateView />
        </PageWrapper>
      </JourneyProvider>
    </FlagsProvider>
  </ApolloLoadingProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: publishedJourney
}

export const Loading = Template.bind({})
Loading.args = {
  journey: undefined
}

export default TemplateViewStory as Meta
