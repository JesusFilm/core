import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { GET_TAGS } from '@core/journeys/ui/useTagsQuery'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { Service } from '../../../../../../../__generated__/globalTypes'
import { JourneyFields_tags as Tag } from '../../../../../../../__generated__/JourneyFields'

import { TemplateSettingsDialog } from './TemplateSettingsDialog'

const TemplateSettingsDialogStory: Meta<typeof TemplateSettingsDialog> = {
  ...journeysAdminConfig,
  component: TemplateSettingsDialog,
  title:
    'Journeys-Admin/Editor/Toolbar/Items/TemplateSettingsItem/TemplateSettingsDialog',
  parameters: {
    ...journeysAdminConfig.parameters
  }
}

const topics = [
  {
    __typename: 'Tag',
    id: 'parentId1',
    service: Service.apiJourneys,
    parentId: null,
    name: [
      {
        value: 'Topics',
        primary: true
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tagId1',
    service: Service.apiJourneys,
    parentId: 'parentId1',
    name: [
      {
        value: 'Acceptance',
        primary: true
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tagId2',
    service: Service.apiJourneys,
    parentId: 'parentId1',
    name: [
      {
        value: 'Addiction',
        primary: true
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tagId3',
    service: Service.apiJourneys,
    parentId: 'parentId1',
    name: [
      {
        value: 'Anger',
        primary: true
      }
    ]
  }
]

const feltNeeds = [
  {
    __typename: 'Tag',
    id: 'parentId2',
    service: Service.apiJourneys,
    parentId: null,
    name: [
      {
        value: 'Felt Needs',
        primary: true
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tagId4',
    service: Service.apiJourneys,
    parentId: 'parentId2',
    name: [
      {
        value: 'Loneliness',
        primary: true
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tagId5',
    service: Service.apiJourneys,
    parentId: 'parentId2',
    name: [
      {
        value: 'Fear/Anxiety',
        primary: true
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tagId6',
    service: Service.apiJourneys,
    parentId: 'parentId2',
    name: [
      {
        value: 'Depression',
        primary: true
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tagId7',
    service: Service.apiJourneys,
    parentId: 'parentId2',
    name: [
      {
        value: 'Love',
        primary: true
      }
    ]
  }
]

const holidays = [
  {
    __typename: 'Tag',
    id: 'parentId3',
    service: Service.apiJourneys,
    parentId: null,
    name: [
      {
        value: 'Holidays',
        primary: true
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tagId8',
    service: Service.apiJourneys,
    parentId: 'parentId3',
    name: [
      {
        value: 'Christmas',
        primary: true
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tagId9',
    service: Service.apiJourneys,
    parentId: 'parentId3',
    name: [
      {
        value: 'Easter',
        primary: true
      }
    ]
  }
]

const audience = [
  {
    __typename: 'Tag',
    id: 'parentId4',
    service: Service.apiJourneys,
    parentId: null,
    name: [
      {
        value: 'Audience',
        primary: true
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tagId10',
    service: Service.apiJourneys,
    parentId: 'parentId4',
    name: [
      {
        value: 'Christian',
        primary: true
      }
    ]
  }
]

const genre = [
  {
    __typename: 'Tag',
    id: 'parentId5',
    service: Service.apiJourneys,
    parentId: null,
    name: [
      {
        value: 'Genre',
        primary: true
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tagId11',
    service: Service.apiJourneys,
    parentId: 'parentId5',
    name: [
      {
        value: 'Drama',
        primary: true
      }
    ]
  }
]

const collections = [
  {
    __typename: 'Tag',
    id: 'parentId6',
    service: Service.apiJourneys,
    parentId: null,
    name: [
      {
        value: 'Collections',
        primary: true
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tagId12',
    service: Service.apiJourneys,
    parentId: 'parentId6',
    name: [
      {
        value: 'Jesus Film',
        primary: true
      }
    ]
  }
]

const tagsMock = [
  {
    request: {
      query: GET_TAGS
    },
    result: {
      data: {
        tags: [
          ...holidays,
          ...topics,
          ...genre,
          ...feltNeeds,
          ...collections,
          ...audience
        ]
      }
    }
  }
]

const Template: StoryObj<typeof TemplateSettingsDialog> = {
  render: () => (
    <MockedProvider mocks={tagsMock}>
      <JourneyProvider
        value={{
          journey: {
            ...defaultJourney,
            tags: [
              ...topics,
              ...feltNeeds,
              audience[1],
              genre[1]
            ] as unknown as Tag[],
            publishedAt: '2021-12-19T12:34:56.647Z'
          },
          variant: 'admin'
        }}
      >
        <TemplateSettingsDialog open onClose={() => undefined} />
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template
}

export const Categories = {
  ...Template,
  play: async () => {
    await userEvent.click(screen.getByRole('tab', { name: 'Categories' }))
  }
}

export const About = {
  ...Template,
  play: async () => {
    await userEvent.click(screen.getByRole('tab', { name: 'About' }))
  }
}

export default TemplateSettingsDialogStory
