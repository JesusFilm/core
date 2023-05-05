import { Story, Meta } from '@storybook/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
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
    <FlagsProvider>
      <JourneyProvider value={{ journey: args.journey }}>
        <PageWrapper
          title="Journey Details"
          showDrawer
          backHref="/"
          menu={<Menu />}
        >
          <JourneyView journeyType="Journey" />
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

const JourneyTemplate: Story = ({ ...args }) => (
  <ApolloLoadingProvider>
    <FlagsProvider>
      <MockedProvider mocks={args.mocks}>
        <JourneyProvider value={{ journey: args.journey }}>
          <PageWrapper
            title="Journey Template"
            showDrawer
            backHref="/"
            menu={<Menu />}
          >
            <JourneyView journeyType="Template" />
          </PageWrapper>
        </JourneyProvider>
      </MockedProvider>
    </FlagsProvider>
  </ApolloLoadingProvider>
)

const template = {
  ...publishedJourney,
  template: true,
  title: 'What does the bible say about Easter?',
  description:
    'The resurrection story is the account of Jesus Christ rising from the dead after being crucified on the cross and buried in the tomb. Jesus remained on earth for 40 days after He was resurrected from the dead on that Sunday morning.',
  primaryImageBlock: {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: null,
    parentOrder: 0,
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'image.jpg',
    width: 1920,
    height: 1080,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
  }
}

export const DefaultTemplate = JourneyTemplate.bind({})
DefaultTemplate.args = {
  journey: template
}

export const PublisherTemplate = JourneyTemplate.bind({})
PublisherTemplate.args = {
  journey: template,
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

export const LoadingTemplate = JourneyTemplate.bind({})
LoadingTemplate.args = {
  journey: null
}

export default JourneyViewStory as Meta
