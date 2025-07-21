import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'

import { TemplateGalleryCard } from '.'

const TemplateGalleryCardStory: Meta<typeof TemplateGalleryCard> = {
  ...journeysAdminConfig,
  component: TemplateGalleryCard,
  title: 'Journeys-Admin/TemplateGalleryCard',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const journey = {
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
        __typename: 'LanguageName',
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
  primaryImageBlock: null,
  publishedAt: '2023-08-14T04:24:24.392Z',
  createdAt: '2023-08-14T04:24:24.392Z',
  featuredAt: '2023-08-14T04:24:24.392Z'
}

const Template: StoryObj<ComponentProps<typeof TemplateGalleryCard>> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          p: 5
        }}
      >
        <TemplateGalleryCard item={args.item} />
      </Box>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    item: journey
  }
}

export const Loading = {
  ...Template,
  args: {
    item: undefined
  }
}

export const Complete = {
  ...Template,
  args: {
    item: {
      ...journey,
      title: 'Where did Jesus body go',
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
      language: {
        __typename: 'Language',
        id: '529',
        name: [
          {
            __typename: 'LanguageName',
            value: 'Kalagan, Tagalu Kalua',
            primary: true
          }
        ]
      }
    }
  }
}

export default TemplateGalleryCardStory
