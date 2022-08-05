import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import noop from 'lodash/noop'
import { journeysAdminConfig } from '../../../../libs/storybook'
import {
  defaultTemplate,
  oldTemplate,
  descriptiveTemplate,
  publishedTemplate
} from '../../../TemplateList/TemplateListData'
import { GET_ACTIVE_PUBLISHER_TEMPLATES } from './ActiveTemplates'
import { ActiveTemplates } from '.'

const ActiveTemplatesStory = {
  ...journeysAdminConfig,
  component: ActiveTemplates,
  title: 'Journeys-Admin/TemplatesAdmin/TemplateStatusTabs/ActiveTemplates',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <ActiveTemplates {...args.props} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  props: {
    onLoad: noop,
    event: ''
  },
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

export const NoTemplates = Template.bind({})
NoTemplates.args = {
  props: {
    onLoad: noop,
    event: ''
  },
  mocks: [
    {
      request: {
        query: GET_ACTIVE_PUBLISHER_TEMPLATES
      },
      result: {
        data: {
          journeys: []
        }
      }
    }
  ]
}

export const Loading = Template.bind({})
Loading.args = {
  props: {
    onLoad: noop,
    event: ''
  },
  mocks: []
}

export const ArchiveDialog = Template.bind({})
ArchiveDialog.args = {
  props: {
    onLoad: noop,
    event: 'archiveAllActive'
  },
  mocks: []
}

export const TrashDialog = Template.bind({})
TrashDialog.args = {
  props: {
    onLoad: noop,
    event: 'trashAllActive'
  },
  mocks: []
}

export default ActiveTemplatesStory as Meta
