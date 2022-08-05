import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { formatISO } from 'date-fns'
import noop from 'lodash/noop'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../libs/storybook'
import {
  defaultTemplate,
  oldTemplate,
  descriptiveTemplate,
  publishedTemplate
} from '../../../TemplateList/TemplateListData'
import { GET_TRASHED_PUBLISHER_TEMPLATES } from './TrashedTemplates'
import { TrashedTemplates } from '.'

const TrashedTemplatesStory = {
  ...journeysAdminConfig,
  component: TrashedTemplates,
  title: 'Journeys-Admin/TemplatesAdmin/TemplateStatusTabs/TrashedTemplates',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const defaultDeletedTemplate = {
  ...defaultTemplate,
  trashedAt: formatISO(new Date()),
  status: JourneyStatus.trashed
}
const oldDeletedTemplate = {
  ...oldTemplate,
  trashedAt: formatISO(new Date()),
  status: JourneyStatus.trashed
}
const descriptiveDeletedTemplate = {
  ...descriptiveTemplate,
  trashedAt: formatISO(new Date()),
  status: JourneyStatus.trashed
}
const publishedDeletedTemplate = {
  ...publishedTemplate,
  trashedAt: formatISO(new Date()),
  status: JourneyStatus.trashed
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <TrashedTemplates {...args.props} />
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
        query: GET_TRASHED_PUBLISHER_TEMPLATES
      },
      result: {
        data: {
          journeys: [
            defaultDeletedTemplate,
            oldDeletedTemplate,
            descriptiveDeletedTemplate,
            publishedDeletedTemplate
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
        query: GET_TRASHED_PUBLISHER_TEMPLATES
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

export const RestoreDialog = Template.bind({})
RestoreDialog.args = {
  props: {
    onLoad: noop,
    event: 'restoreAllTrashed'
  },
  mocks: []
}

export const DeleteDialog = Template.bind({})
DeleteDialog.args = {
  props: {
    onLoad: noop,
    event: 'deleteAllTrashed'
  },
  mocks: []
}

export default TrashedTemplatesStory as Meta
