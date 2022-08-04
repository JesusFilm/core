import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { Role } from '../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../libs/storybook'
import { PageWrapper } from '../PageWrapper'
import { GET_USER_ROLE, TemplateView } from './TemplateView'
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
  <MockedProvider mocks={args.mocks}>
    <FlagsProvider>
      <JourneyProvider value={{ journey: args.journey }}>
        <PageWrapper title="Template Details" showDrawer backHref="/">
          <TemplateView />
        </PageWrapper>
      </JourneyProvider>
    </FlagsProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: publishedJourney
}

export const Publisher = Template.bind({})
Publisher.args = {
  journey: publishedJourney,
  mocks: [
    {
      request: {
        query: GET_USER_ROLE
      },
      result: {
        data: {
          getUserRole: {
            id: '1',
            roles: [Role.publisher]
          }
        }
      }
    }
  ]
}

const LoadingTemplate: Story = ({ ...args }) => (
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

export const Loading = LoadingTemplate.bind({})
Loading.args = {
  journey: undefined
}

export default TemplateViewStory as Meta
