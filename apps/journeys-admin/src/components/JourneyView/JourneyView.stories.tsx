import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { GetUserRole } from '../../../__generated__/GetUserRole'
import { Role } from '../../../__generated__/globalTypes'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_USER_ROLE } from '../../libs/useUserRoleQuery/useUserRoleQuery'
import { PageWrapper } from '../PageWrapper'
import { TeamProvider } from '../Team/TeamProvider'

import { publishedJourney } from './data'
import { JourneyView } from './JourneyView'
import { Menu } from './Menu'

const JourneyViewStory: Meta<typeof JourneyView> = {
  ...journeysAdminConfig,
  component: JourneyView,
  title: 'Journeys-Admin/JourneyView',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const JourneyTemplate: StoryObj<
  ComponentProps<typeof JourneyView> & {
    mocks: [MockedResponse<GetUserRole>]
    journey: Journey
  }
> = {
  render: ({ ...args }) => (
    <ApolloLoadingProvider>
      <FlagsProvider>
        <MockedProvider mocks={args.mocks}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: args.journey,
                variant: 'admin'
              }}
            >
              <PageWrapper
                title="Journey Template"
                showDrawer
                backHref="/"
                menu={<Menu />}
              >
                <JourneyView journeyType="Template" />
              </PageWrapper>
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </FlagsProvider>
    </ApolloLoadingProvider>
  )
}

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

export const DefaultTemplate = {
  ...JourneyTemplate,
  args: {
    journey: template
  }
}

export const PublisherTemplate = {
  ...JourneyTemplate,
  args: {
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
}

export const LoadingTemplate = {
  ...JourneyTemplate,
  args: {
    journey: null
  }
}

export default JourneyViewStory
