import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { formatISO } from 'date-fns'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import {
  defaultTemplate,
  descriptiveTemplate,
  oldTemplate,
  publishedTemplate
} from '../../TemplateLibrary/TemplateListData'
import { ThemeProvider } from '../../ThemeProvider'

import { TrashedTemplates } from '.'

const TrashedTemplatesStory = {
  component: TrashedTemplates,
  title: 'Journeys-Admin/TemplatesList/TrashedTemplates',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  },
  decorators: [
    (Story: Story) => (
      <SnackbarProvider>
        <ThemeProvider>
          <div style={{ height: '900px' }}>
            <Story />
          </div>
        </ThemeProvider>
      </SnackbarProvider>
    )
  ]
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
  mocks: [
    {
      request: {
        query: GET_ADMIN_JOURNEYS,
        variables: {
          status: [JourneyStatus.trashed],
          template: true
        }
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
  mocks: [
    {
      request: {
        query: GET_ADMIN_JOURNEYS,
        variables: {
          status: [JourneyStatus.trashed],
          template: true
        }
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
  mocks: []
}

export const RestoreDialog = Template.bind({})
RestoreDialog.args = {
  props: {
    event: 'restoreAllTrashed'
  },
  mocks: []
}

export const DeleteDialog = Template.bind({})
DeleteDialog.args = {
  props: {
    event: 'deleteAllTrashed'
  },
  mocks: []
}

export default TrashedTemplatesStory as Meta
