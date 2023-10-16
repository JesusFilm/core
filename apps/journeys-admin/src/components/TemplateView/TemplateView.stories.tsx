import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { User } from 'next-firebase-auth'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey_primaryImageBlock as PrimaryImageBlock } from '../../../__generated__/GetJourney'
import { GetJourneys } from '../../../__generated__/GetJourneys'
// import { GetTags } from '../../../__generated__/GetTags'
import { GetUserRole } from '../../../__generated__/GetUserRole'
import { Role } from '../../../__generated__/globalTypes'
import {
  JourneyFields as Journey,
  JourneyFields_tags as Tag
} from '../../../__generated__/JourneyFields'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'
// import { GET_TAGS } from '../../libs/useTagsQuery/useTagsQuery'
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
  id: 'tag1.id',
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

// const getTagsMockEmpty: MockedResponse<GetTags> = {
//   request: {
//     query: GET_TAGS
//   },
//   result: {
//     data: {
//       tags: []
//     }
//   }
// }

// const getTagsMock: MockedResponse<GetTags> = {
//   request: {
//     query: GET_TAGS
//   },
//   result: {
//     data: {
//       tags: [
//         {
//           __typename: 'Tag',
//           id: 'tag1.id',
//           service: null,
//           parentId: null,
//           name: [
//             {
//               __typename: 'Translation',
//               value: 'Topics',
//               primary: true,
//               language: {
//                 __typename: 'Language',
//                 id: '529'
//               }
//             }
//           ]
//         },
//         {
//           __typename: 'Tag',
//           id: 'tag2.id',
//           parentId: null,
//           service: null,
//           name: [
//             {
//               __typename: 'Translation',
//               value: 'Felt Needs',
//               primary: true,
//               language: {
//                 __typename: 'Language',
//                 id: '529'
//               }
//             }
//           ]
//         },
//         {
//           __typename: 'Tag',
//           id: 'tag3.id',
//           parentId: null,
//           service: null,
//           name: [
//             {
//               __typename: 'Translation',
//               value: 'Holidays',
//               primary: true,
//               language: {
//                 __typename: 'Language',
//                 id: '529'
//               }
//             }
//           ]
//         },
//         {
//           __typename: 'Tag',
//           id: 'tag4.id',
//           parentId: null,
//           service: null,
//           name: [
//             {
//               __typename: 'Translation',
//               value: 'Audience',
//               primary: true,
//               language: {
//                 __typename: 'Language',
//                 id: '529'
//               }
//             }
//           ]
//         },
//         {
//           __typename: 'Tag',
//           id: 'tag5.id',
//           parentId: null,
//           service: null,
//           name: [
//             {
//               __typename: 'Translation',
//               value: 'Genre',
//               primary: true,
//               language: {
//                 __typename: 'Language',
//                 id: '529'
//               }
//             }
//           ]
//         },
//         {
//           __typename: 'Tag',
//           id: 'tag6.id',
//           parentId: null,
//           service: null,
//           name: [
//             {
//               __typename: 'Translation',
//               value: 'Collection',
//               primary: true,
//               language: {
//                 __typename: 'Language',
//                 id: '529'
//               }
//             }
//           ]
//         },
//         {
//           __typename: 'Tag',
//           id: 'tag7.id',
//           service: Service.apiJourneys,
//           parentId: 'tag1.id',
//           name: [
//             {
//               __typename: 'Translation',
//               value: 'Addiction',
//               primary: true,
//               language: {
//                 __typename: 'Language',
//                 id: '529'
//               }
//             }
//           ]
//         },
//         {
//           __typename: 'Tag',
//           id: 'tag8.id',
//           service: Service.apiJourneys,
//           parentId: 'tag2.id',
//           name: [
//             {
//               __typename: 'Translation',
//               value: 'Love',
//               primary: true,
//               language: {
//                 __typename: 'Language',
//                 id: '529'
//               }
//             }
//           ]
//         },
//         {
//           __typename: 'Tag',
//           id: 'tag9.id',
//           service: Service.apiJourneys,
//           parentId: 'tag3.id',
//           name: [
//             {
//               __typename: 'Translation',
//               value: 'Christmas',
//               primary: true,
//               language: {
//                 __typename: 'Language',
//                 id: '529'
//               }
//             }
//           ]
//         },
//         {
//           __typename: 'Tag',
//           id: 'tag10.id',
//           service: Service.apiJourneys,
//           parentId: 'tag4.id',
//           name: [
//             {
//               __typename: 'Translation',
//               value: 'Christian',
//               primary: true,
//               language: {
//                 __typename: 'Language',
//                 id: '529'
//               }
//             }
//           ]
//         },
//         {
//           __typename: 'Tag',
//           id: 'tag11.id',
//           service: Service.apiJourneys,
//           parentId: 'tag5.id',
//           name: [
//             {
//               __typename: 'Translation',
//               value: 'Drama',
//               primary: true,
//               language: {
//                 __typename: 'Language',
//                 id: '529'
//               }
//             }
//           ]
//         },
//         {
//           __typename: 'Tag',
//           id: 'tag12.id',
//           service: Service.apiJourneys,
//           parentId: 'tag6.id',
//           name: [
//             {
//               __typename: 'Translation',
//               value: 'Jesus Film',
//               primary: true,
//               language: {
//                 __typename: 'Language',
//                 id: '529'
//               }
//             }
//           ]
//         }
//       ]
//     }
//   }
// }

const primaryImageBlock: PrimaryImageBlock = {
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

const getJourneyMockEmpty: MockedResponse<GetJourneys> = {
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
      journeys: []
    }
  }
}

const getJourneyMock: MockedResponse<GetJourneys> = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds: ['tag1.id']
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

const getUserRoleMockEmpty: MockedResponse<GetUserRole> = {
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
const getUserRoleMock: MockedResponse<GetUserRole> = {
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
    journey: Journey
    // getTagsMock: MockedResponse<GetTags>
  }
> = {
  render: (args) => {
    return (
      <MockedProvider mocks={[args?.getJourneyMock, args?.getUserRoleMock]}>
        <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
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
    getJourneyMock: getJourneyMockEmpty,
    getUserRoleMock: getUserRoleMockEmpty,
    journey
    // getTagsMock: getTagsMockEmpty
  }
}

export const Publisher = {
  ...Template,
  args: {
    ...Default.args,
    getUserRoleMock
  }
}

export const WithTags = {
  ...Template,
  args: {
    ...Publisher.args
    // getTagsMock
  }
}

export const Complete = {
  ...Template,
  args: {
    ...Publisher.args,
    getJourneyMock
    // getTagsMock
  }
}

export const Loading = {
  ...Template,
  args: {
    ...Default.args,
    journey: undefined
    // getTagsMock: []
  }
}

export default TemplateViewStory
