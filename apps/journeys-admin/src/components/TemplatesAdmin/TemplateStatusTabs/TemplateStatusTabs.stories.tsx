import { Story, Meta } from '@storybook/react'

import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../libs/storybook'
import {
  defaultTemplate,
  oldTemplate,
  descriptiveTemplate,
  publishedTemplate
} from '../../TemplateList/TemplateListData'

import { GET_ACTIVE_PUBLISHER_TEMPLATES } from './ActiveTemplates/ActiveTemplates'
import { TemplateStatusTabs } from '.'

const TemplateStatusTabsStory = {
  ...journeysAdminConfig,
  component: TemplateStatusTabs,
  title: 'Journeys-Admin/TemplatesAdmin/TemplateStatusTabs',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <TemplateStatusTabs event="" />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  mocks: [
    {
      request: {
        query: GET_ACTIVE_PUBLISHER_TEMPLATES
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

export default TemplateStatusTabsStory as Meta
