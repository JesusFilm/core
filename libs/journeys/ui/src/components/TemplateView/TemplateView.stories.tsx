import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { User } from 'next-firebase-auth'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { Role } from '../../../__generated__/globalTypes'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFieldsFragment as Journey } from '../../libs/JourneyProvider/__generated__/journeyFields'
import { GetJourneyQuery } from '../../libs/useJourneyQuery/__generated__/useJourneyQuery'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery'
import { GetJourneysQuery } from '../../libs/useJourneysQuery/__generated__/useJourneysQuery'
import { GET_TAGS } from '../../libs/useTagsQuery'
import { GetTagsQuery } from '../../libs/useTagsQuery/__generated__/useTagsQuery'
import { GET_USER_ROLE } from '../../libs/useUserRoleQuery'
import { GetUserRoleQuery } from '../../libs/useUserRoleQuery/__generated__/useUserRoleQuery'

import { defaultJourney, publishedJourney } from './data'
import { journeyVideoBlocks } from './TemplatePreviewTabs/data'
import { parentTags, tags } from './TemplateTags/data'
import { TemplateView } from './TemplateView'

type Tag = Journey['tags'][number]
type PrimaryImageBlock = GetJourneyQuery['journey']['primaryImageBlock']

const TemplateViewStory: Meta<typeof TemplateView> = {
  ...journeysAdminConfig,
  component: TemplateView,
  title: 'Journeys-Admin/TemplateView',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const tag: Tag = {
  __typename: 'Tag',
  id: 'tag1.id',
  parentId: 'parentTag.id',
  name: [
    {
      __typename: 'TagName',
      primary: true,
      value: 'tag.name',
      language: { __typename: 'Language', id: 'language.id' }
    }
  ]
}

const getTagsMockEmpty: MockedResponse<GetTagsQuery> = {
  request: {
    query: GET_TAGS
  },
  result: {
    data: {
      tags: []
    }
  }
}

const getTagsMock: MockedResponse<GetTagsQuery> = {
  request: {
    query: GET_TAGS
  },
  result: {
    data: {
      tags: [...parentTags, ...tags.map((tag) => ({ ...tag, service: null }))]
    }
  }
}

const primaryImageBlock: PrimaryImageBlock = {
  parentBlockId: '1',
  id: 'pImage.id',
  __typename: 'ImageBlock' as const,
  src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public',
  alt: 'onboarding primary',
  width: 1152,
  height: 768,
  blurhash: 'UE9Qmr%MIpWCtmbH%Mxu_4xuWYoL-;oIWYt7',
  parentOrder: 1,
  scale: null,
  focalLeft: 50,
  focalTop: 50
}

const getJourneysMockEmpty: MockedResponse<GetJourneysQuery> = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds: []
      }
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

const getJourneysMock: MockedResponse<GetJourneysQuery> = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds: [...tags].map((tag) => tag.id)
      }
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          id: 'taggedJourney3.id',
          tags: [tag],
          trashedAt: null,
          primaryImageBlock
        },
        {
          ...defaultJourney,
          id: 'taggedJourney3.id',
          tags: [tag],
          trashedAt: null,
          primaryImageBlock
        },
        {
          ...defaultJourney,
          id: 'taggedJourney3.id',
          tags: [tag],
          trashedAt: null,
          primaryImageBlock
        },
        {
          ...defaultJourney,
          id: 'taggedJourney3.id',
          tags: [tag],
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
  tags: [],
  primaryImageBlock
}

const getUserRoleMockEmpty: MockedResponse<GetUserRoleQuery> = {
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
const getUserRoleMock: MockedResponse<GetUserRoleQuery> = {
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
    getJourneysMock: MockedResponse<GetJourneysQuery>
    getUserRoleMock: MockedResponse<GetUserRoleQuery>
    journey: Journey
    getTagsMock: MockedResponse<GetTagsQuery>
  }
> = {
  render: (args) => {
    return (
      <MockedProvider
        mocks={[
          args?.getJourneysMock,
          args?.getUserRoleMock,
          args?.getTagsMock
        ]}
      >
        <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
          <Box sx={{ height: '100%', overflow: 'hidden' }}>
            <TemplateView authUser={args.authUser as unknown as User} />
          </Box>
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    journey,
    authUser: 'user.id',
    getJourneysMock: getJourneysMockEmpty,
    getUserRoleMock: getUserRoleMockEmpty,
    getTagsMock: getTagsMockEmpty
  }
}

export const Complete = {
  ...Template,
  args: {
    journey: {
      ...journey,
      strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view',
      tags,
      creatorDescription:
        'Created by a Name of a Mission or Missionaries Organisation label by a Name of a Mission or Missionaries',
      creatorImageBlock: {
        id: 'creatorImageBlock.id',
        parentBlockId: null,
        parentOrder: 3,
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'photo-1552410260-0fd9b577afa6',
        width: 6000,
        height: 4000,
        blurhash: 'LHFr#AxW9a%L0KM{IVRkoMD%D%R*',
        __typename: 'ImageBlock'
      }
    },
    authUser: 'user.id',
    getJourneysMock,
    getUserRoleMock,
    getTagsMock
  }
}

export const Loading = {
  ...Template,
  args: {
    ...Complete.args,
    journey: undefined
  }
}

export default TemplateViewStory
