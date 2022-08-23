import { Story, Meta } from '@storybook/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import { PageWrapper } from '../PageWrapper'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { Role } from '../../../__generated__/globalTypes'
import { JourneyView, GET_USER_ROLE } from './JourneyView'
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
    <MockedProvider mocks={args.mocks}>
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
    </MockedProvider>
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

export const JourneyTemplate = Template.bind({})
JourneyTemplate.args = {
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

export const Loading = Template.bind({})
Loading.args = {
  journey: undefined
}

export default JourneyViewStory as Meta
