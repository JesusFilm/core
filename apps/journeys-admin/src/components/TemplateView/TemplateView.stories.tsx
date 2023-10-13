import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { User } from 'next-firebase-auth'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey_primaryImageBlock as ImageBlock } from '../../../__generated__/GetJourney'
import { GetJourneys } from '../../../__generated__/GetJourneys'
import { GetUserRole } from '../../../__generated__/GetUserRole'
import { Role } from '../../../__generated__/globalTypes'
import { JourneyFields_tags as Tag } from '../../../__generated__/JourneyFields'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'
import { GET_USER_ROLE } from '../../libs/useUserRoleQuery/useUserRoleQuery'
import { defaultJourney, publishedJourney } from '../JourneyView/data'

import { journeyVideoBlocks } from './TemplatePreviewTabs/data'
import { TemplateView } from './TemplateView'

const TemplateViewStory: Meta<typeof TemplateView> = {
  ...journeysAdminConfig,
  component: TemplateView,
  title: 'Journeys-Admin/TemplateView'
}

const tags: Tag = {
  __typename: 'Tag',
  id: 'tag.id',
  parentId: 'parentTag.id',
  name: [
    {
      __typename: 'Translation',
      primary: true,
      value: 'tag.name',
      language: { __typename: 'Language', id: 'language.id' }
    }
  ]
}

const primaryImageBlock: ImageBlock = {
  parentBlockId: '1',
  id: 'pImage.id',
  __typename: 'ImageBlock' as const,
  src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
  alt: 'onboarding primary',
  width: 1152,
  height: 768,
  blurhash: 'UE9Qmr%MIpWCtmbH%Mxu_4xuWYoL-;oIWYt7',
  parentOrder: 1
}

const getJourneyMock: MockedResponse<GetJourneys> = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds: ['tag.id']
      }
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          id: 'taggedJourney3.id',
          tags: [tags],
          trashedAt: null,
          primaryImageBlock
        },
        {
          ...defaultJourney,
          id: 'taggedJourney3.id',
          tags: [tags],
          trashedAt: null,
          primaryImageBlock
        },
        {
          ...defaultJourney,
          id: 'taggedJourney3.id',
          tags: [tags],
          trashedAt: null,
          primaryImageBlock
        },
        {
          ...defaultJourney,
          id: 'taggedJourney3.id',
          tags: [tags],
          trashedAt: null,
          primaryImageBlock
        }
      ]
    }
  }
}

const journey = {
  ...publishedJourney,
  blocks: journeyVideoBlocks,
  tags: [tags],
  primaryImageBlock
}

const getUserRoleMock: MockedResponse<GetUserRole> = {
  request: {
    query: GET_USER_ROLE
  },
  result: {
    data: {
      getUserRole: {
        __typename: 'UserRole',
        id: 'user.id',
        roles: []
      }
    }
  }
}
const getUserRoleMockPublisher: MockedResponse<GetUserRole> = {
  request: {
    query: GET_USER_ROLE
  },
  result: {
    data: {
      getUserRole: {
        __typename: 'UserRole',
        id: 'user.id',
        roles: [Role.publisher]
      }
    }
  }
}

const Template: StoryObj<
  ComponentProps<typeof TemplateView> & {
    getJourneyMock: MockedResponse<GetJourneys>
    getUserRoleMock: MockedResponse<GetUserRole>
  }
> = {
  render: (args) => {
    return (
      <MockedProvider mocks={[args?.getJourneyMock, args?.getUserRoleMock]}>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <TemplateView authUser={args.authUser as unknown as User} />
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    authUser: 'user.id',
    getJourneyMock,
    getUserRoleMock
  }
}

export const Publisher = {
  ...Template,
  args: {
    ...Default.args,
    getUserRoleMock: getUserRoleMockPublisher
  }
}

export default TemplateViewStory
