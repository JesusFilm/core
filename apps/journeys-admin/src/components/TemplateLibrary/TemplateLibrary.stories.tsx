import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'

import {
  defaultTemplate,
  descriptiveTemplate,
  oldTemplate,
  publishedTemplate
} from './TemplateListData'

import { TemplateLibrary } from '.'

const TemplateLibraryStory: Meta<typeof TemplateLibrary> = {
  ...journeysAdminConfig,
  component: TemplateLibrary,
  title: 'Journeys-Admin/TemplateLibrary'
}

const Template: StoryObj<typeof TemplateLibrary> = {
  render: ({ ...args }) => (
    <MockedProvider mocks={args.mocks}>
      <TemplateLibrary {...args.props} />
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
              template: true
            }
          }
        },
        result: {
          data: {
            journeys: [
              defaultTemplate,
              oldTemplate,
              descriptiveTemplate,
              publishedTemplate
            ]
          }
        }
      }
    ]
  }
}

export const Loading = {
  ...Template,
  args: {
    mocks: []
  }
}

export default TemplateLibraryStory
