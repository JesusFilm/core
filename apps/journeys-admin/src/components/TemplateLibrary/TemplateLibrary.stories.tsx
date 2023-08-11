import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'

import {
  defaultTemplate,
  descriptiveTemplate,
  oldTemplate,
  publishedTemplate
} from './TemplateListData'

import { TemplateLibrary } from '.'

const TemplateLibraryStory = {
  ...journeysAdminConfig,
  component: TemplateLibrary,
  title: 'Journeys-Admin/TemplateLibrary'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <TemplateLibrary {...args.props} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
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

export const Loading = Template.bind({})
Loading.args = {
  mocks: []
}

export default TemplateLibraryStory as Meta
