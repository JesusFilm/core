import { Meta, StoryObj } from '@storybook/react'

import { GET_JOURNEY } from '../../../libs/useJourneyQuery/useJourneyQuery'
import { simpleComponentConfig } from '../../../libs/storybook'
import { OnboardingDrawer } from './OnboardingDrawer'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'

const OnboardingDrawerStory: Meta<typeof OnboardingDrawer> = {
  ...simpleComponentConfig,
  component: OnboardingDrawer,
  title: 'Journeys-Admin/OnboardingPageWrapper/OnboardingDrawer'
}

const Template: StoryObj<typeof OnboardingDrawer> = {
  render: ({ ...args }) => {
    return <OnboardingDrawer {...args} />
  }
}

const getJourneyMock = {
  request: {
    query: GET_JOURNEY,
    variables: {
      id: 'template-id'
    }
  },
  result: {
    data: {
      journey: {
        __typename: 'Journey',
        id: 'template-id',
        title: 'A Template Heading',
        description: null,
        slug: 'default',
        template: true,
        language: {
          __typename: 'Language',
          id: '529',
          name: [
            {
              __typename: 'Translation',
              value: 'English',
              primary: true
            }
          ]
        },
        status: JourneyStatus.published,
        userJourneys: [],
        seoTitle: null,
        seoDescription: null,
        themeName: ThemeName.base,
        themeMode: ThemeMode.dark,
        tags: [],
        trashedAt: null,
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
        featuredAt: '2023-08-14T04:24:24.392Z'
      }
    }
  }
}

export const Default = {
  ...Template
}

export const Completed = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getJourneyMock]
    },
    nextjs: {
      router: {
        query: {
          redirect: '/templates/template-id/?newAccount=true'
        }
      }
    }
  }
}

export default OnboardingDrawerStory
