import { Meta, StoryObj } from '@storybook/react'
import { formatISO, startOfYear } from 'date-fns'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_JOURNEY } from '../../libs/useJourneyQuery/useJourneyQuery'

import { TemplateSnippet } from './TemplateSnippet'

const TemplateSnippetStory: Meta<typeof TemplateSnippet> = {
  ...journeysAdminConfig,
  component: TemplateSnippet,
  title: 'Journeys-Admin/TemplateSnippet',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const getJourney = {
  request: {
    query: GET_JOURNEY,
    variables: {
      id: 'journey.id'
    }
  },
  result: {
    data: {
      __typename: 'Journey',
      id: 'journey.id',
      title: 'Default Journey Heading',
      description: null,
      themeName: ThemeName.base,
      themeMode: ThemeMode.light,
      slug: 'default',
      language: {
        __typename: 'Language',
        id: '529',
        bcp47: 'en',
        iso3: 'en',
        name: [
          {
            __typename: 'Translation',
            value: 'English',
            primary: true
          }
        ]
      },
      createdAt: formatISO(startOfYear(new Date())),
      publishedAt: null,
      status: JourneyStatus.draft,
      seoTitle: null,
      seoDescription: null,
      template: false,
      featuredAt: null,
      strategySlug: null,
      blocks: [],
      primaryImageBlock: null,
      creatorDescription: null,
      creatorImageBlock: null,
      chatButtons: [],
      host: null,
      team: null,
      userJourneys: [],
      tags: []
    }
  }
}

const Template: StoryObj<typeof TemplateSnippet> = {
  render: () => <TemplateSnippet />
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getJourney]
    }
  }
}

export const Loading = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [{ ...getJourney, delay: 100000000000000 }]
    }
  }
}

export default TemplateSnippetStory
