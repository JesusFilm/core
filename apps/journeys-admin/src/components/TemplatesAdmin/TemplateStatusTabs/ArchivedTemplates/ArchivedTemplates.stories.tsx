import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import noop from 'lodash/noop'
import { journeysAdminConfig } from '../../../../libs/storybook'
import {
  defaultTemplate,
  oldTemplate,
  descriptiveTemplate,
  publishedTemplate
} from '../../../TemplateLibrary/TemplateListData'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { GET_ARCHIVED_PUBLISHER_TEMPLATES } from './ArchivedTemplates'
import { ArchivedTemplates } from '.'

const ArchivedTemplatesStory = {
  ...journeysAdminConfig,
  component: ArchivedTemplates,
  title: 'Journeys-Admin/TemplatesAdmin/TemplateStatusTabs/ArchivedTemplates',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const defaultArchivedTemplate = {
  ...defaultTemplate,
  status: JourneyStatus.archived
}
const oldArchivedTemplate = {
  ...oldTemplate,
  status: JourneyStatus.archived
}
const descriptiveArchivedTemplate = {
  ...descriptiveTemplate,
  status: JourneyStatus.archived
}
const archivedTemplate = {
  ...publishedTemplate,
  status: JourneyStatus.archived
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <ArchivedTemplates {...args.props} />
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
        query: GET_ARCHIVED_PUBLISHER_TEMPLATES
      },
      result: {
        data: {
          journeys: [
            defaultArchivedTemplate,
            oldArchivedTemplate,
            descriptiveArchivedTemplate,
            archivedTemplate
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
        query: GET_ARCHIVED_PUBLISHER_TEMPLATES
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

export const UnarchiveDialog = Template.bind({})
UnarchiveDialog.args = {
  props: {
    onLoad: noop,
    event: 'restoreAllArchived'
  },
  mocks: []
}

export const TrashDialog = Template.bind({})
TrashDialog.args = {
  props: {
    onLoad: noop,
    event: 'trashAllArchived'
  },
  mocks: []
}

export default ArchivedTemplatesStory as Meta
