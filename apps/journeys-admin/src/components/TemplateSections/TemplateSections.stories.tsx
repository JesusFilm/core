import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { GetJourneys } from '../../../__generated__/GetJourneys'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'

import { TemplateSections } from '.'

const TemplateSectionsStory: Meta<typeof TemplateSections> = {
  ...journeysAdminConfig,
  component: TemplateSections,
  title: 'Journeys-Admin/TemplateSections'
}

const defaultTemplate = {
  id: '1',
  title: 'Featured Template 1',
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
  primaryImageBlock: null,
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
      <TemplateSections />
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
              template: true,
              limit: 10,
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
                title: 'New Template 1',
                publishedAt: '2023-09-05T23:27:45.596Z'
              },
              {
                ...defaultTemplate,
                id: '2',
                title: 'New Template 2',
                publishedAt: '2023-09-05T23:27:45.596Z'
              }
            ]
          }
        }
      }
    ]
  }
}

export default TemplateSectionsStory
