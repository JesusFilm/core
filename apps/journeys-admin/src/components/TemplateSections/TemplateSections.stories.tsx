import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { GetJourneys } from '../../../__generated__/GetJourneys'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'

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

const defaultTemplate = {
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
        __typename: 'Translation',
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
  featuredAt: '2023-08-14T04:24:24.392Z'
}

const Template: StoryObj<
  ComponentProps<typeof TemplateSections> & {
    mocks: [MockedResponse<GetJourneys>]
  }
> = {
  render: ({ mocks }) => (
    <MockedProvider mocks={mocks}>
      <Box sx={{ backgroundColor: 'background.paper', p: 5 }}>
        <TemplateSections />
      </Box>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    mocks: [
      {
        request: {
          query: GET_JOURNEYS,
          variables: {
            where: {
              featured: true,
              template: true,
              orderByRecent: true
            }
          }
        },
        result: {
          data: {
            journeys: [
              {
                ...defaultTemplate,
                id: '1',
                title: 'Featured Template 1',
                publishedAt: '2023-09-05T23:27:45.596Z'
              },
              {
                ...defaultTemplate,
                id: '2',
                title: 'Featured Template 2',
                publishedAt: '2023-09-05T23:27:45.596Z'
              }
            ]
          }
        }
      },
      {
        request: {
          query: GET_JOURNEYS,
          variables: {
            where: {
              featured: false,
              template: true,
              limit: 10,
              orderByRecent: true
            }
          }
        },
        result: {
          data: {
            journeys: [
              defaultTemplate,
              defaultTemplate,
              defaultTemplate,
              defaultTemplate,
              defaultTemplate,
              defaultTemplate,
              defaultTemplate,
              defaultTemplate,
              defaultTemplate,
              defaultTemplate
            ]
          }
        }
      }
    ]
  }
}

export default TemplateSectionsStory
