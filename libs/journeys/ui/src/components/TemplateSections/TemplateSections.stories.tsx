import { MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery'
import {
  GetJourneys,
  GetJourneys_journeys as Journey,
  GetJourneys_journeys_tags as Tag
} from '../../libs/useJourneysQuery/__generated__/GetJourneys'

import { TemplateSections } from '.'

const TemplateSectionsStory: Meta<typeof TemplateSections> = {
  ...journeysAdminConfig,
  component: TemplateSections,
  title: 'Journeys-Admin/TemplateSections',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const defaultTemplate: Journey = {
  __typename: 'Journey',
  trashedAt: null,
  themeName: ThemeName.base,
  themeMode: ThemeMode.dark,
  id: '1',
  title: 'New Template 1',
  description: null,
  slug: 'default',
  template: true,
  language: {
    __typename: 'Language',
    id: '529',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  tags: [],
  primaryImageBlock: {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: null,
    parentOrder: 0,
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
  },
  publishedAt: '2023-08-14T04:24:24.392Z',
  createdAt: '2023-08-14T04:24:24.392Z',
  featuredAt: '2023-08-14T04:24:24.392Z',
  updatedAt: '2023-08-14T04:24:24.392Z',
  status: JourneyStatus.published,
  seoTitle: null,
  seoDescription: null,
  userJourneys: []
}

const acceptance: Tag = {
  __typename: 'Tag',
  id: 'acceptanceTagId',
  name: [
    {
      value: 'Acceptance',
      primary: true,
      __typename: 'TagName',
      language: {
        __typename: 'Language',
        id: 'en'
      }
    }
  ],
  parentId: 'parentId'
}

const addiction: Tag = {
  __typename: 'Tag',
  id: 'addictionTagId',
  name: [
    {
      value: 'Addiction',
      primary: true,
      __typename: 'TagName',
      language: {
        __typename: 'Language',
        id: 'en'
      }
    }
  ],
  parentId: 'parentId'
}

const journeys: Journey[] = [
  {
    ...defaultTemplate,
    id: 'featuredId1',
    title: 'Featured Template 1',
    createdAt: '2023-09-05T23:27:45.596Z',
    tags: [acceptance]
  },
  {
    ...defaultTemplate,
    id: 'featuredId2',
    title: 'Featured Template 2',
    createdAt: '2023-08-05T23:27:45.596Z',
    tags: [addiction]
  },
  {
    ...defaultTemplate,
    id: 'featuredId3',
    title: 'Featured Template 3',
    createdAt: '2023-08-05T23:27:45.596Z',
    tags: [acceptance]
  },
  {
    ...defaultTemplate,
    id: 'newId1',
    title: 'New Template 1',
    createdAt: '2023-09-05T23:27:45.596Z',
    tags: [acceptance, addiction],
    featuredAt: null
  },
  {
    ...defaultTemplate,
    id: 'newId2',
    title: 'New Template 2',
    createdAt: '2023-08-05T23:27:45.596Z',
    featuredAt: null
  },
  {
    ...defaultTemplate,
    id: 'newId3',
    title: 'New Template 3',
    createdAt: '2023-08-05T23:27:45.596Z',
    tags: [acceptance, addiction],
    featuredAt: null
  },
  {
    ...defaultTemplate,
    id: 'newId4',
    title: 'New Template 4',
    createdAt: '2023-08-05T23:27:45.596Z',
    tags: [addiction],
    featuredAt: null
  },
  {
    ...defaultTemplate,
    id: 'newId5',
    title: 'New Template 5',
    createdAt: '2023-08-05T23:27:45.596Z',
    tags: [acceptance],
    featuredAt: null
  }
]

const getJourneysMock: MockedResponse<GetJourneys> = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        languageIds: ['529']
      }
    }
  },
  result: {
    data: {
      journeys
    }
  }
}

const getJourneysWithTagIdsMock: MockedResponse<GetJourneys> = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds: [addiction.id],
        languageIds: ['529']
      }
    }
  },
  result: {
    data: {
      journeys: journeys.filter(({ tags }) =>
        tags.some(({ id }) => id === addiction.id)
      )
    }
  }
}

const getJourneysWithInvalidTagIdsMock: MockedResponse<GetJourneys> = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds: [addiction.id, 'invalidId'],
        languageIds: ['529']
      }
    }
  },
  result: {
    data: {
      journeys: journeys.filter(({ tags }) =>
        tags.some(({ id }) => id === addiction.id)
      )
    }
  }
}

const Template: StoryObj<ComponentProps<typeof TemplateSections>> = {
  render: ({ ...args }) => (
    <Box sx={{ backgroundColor: 'background.paper', p: 5, overflow: 'hidden' }}>
      <TemplateSections {...args} />
    </Box>
  )
}

export const Default = {
  ...Template,
  args: {
    languageIds: ['529']
  },
  parameters: {
    apolloClient: {
      mocks: [getJourneysMock]
    }
  }
}

export const Match = {
  ...Template,
  args: {
    tagIds: [addiction.id],
    languageIds: ['529']
  },
  parameters: {
    apolloClient: {
      mocks: [getJourneysWithTagIdsMock]
    }
  }
}

export const NoMatch = {
  ...Template,
  args: {
    tagIds: [addiction.id, 'invalidId'],
    languageIds: ['529']
  },
  parameters: {
    apolloClient: {
      mocks: [getJourneysWithInvalidTagIdsMock]
    }
  }
}

export default TemplateSectionsStory
