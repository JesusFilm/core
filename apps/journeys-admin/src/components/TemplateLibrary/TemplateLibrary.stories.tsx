import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_ADMIN_JOURNEYS } from '../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import {
  oldTemplate,
  publishedTemplate,
  descriptiveTemplate,
  defaultTemplate
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
        query: GET_ADMIN_JOURNEYS,
        variables: {
          template: true
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
