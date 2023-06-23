import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { journeysAdminConfig } from '../../../libs/storybook'
import {
  defaultTemplate,
  oldTemplate,
  descriptiveTemplate,
  publishedTemplate
} from '../../TemplateLibrary/TemplateListData'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../ThemeProvider'
import { GET_JOURNEYS } from '../../../libs/useJourneys/useJourneys'
import { ArchivedTemplates } from '.'

const ArchivedTemplatesStory = {
  component: ArchivedTemplates,
  title: 'Journeys-Admin/TemplatesList/ArchivedTemplates',
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
  mocks: [
    {
      request: {
        query: GET_JOURNEYS,
        variables: {
          status: [JourneyStatus.archived],
          template: true
        }
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
  mocks: [
    {
      request: {
        query: GET_JOURNEYS,
        variables: {
          status: [JourneyStatus.archived],
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

export const UnarchiveDialog = Template.bind({})
UnarchiveDialog.args = {
  props: {
    event: 'restoreAllArchived'
  },
  mocks: []
}

export const TrashDialog = Template.bind({})
TrashDialog.args = {
  props: {
    event: 'trashAllArchived'
  },
  mocks: []
}

export default ArchivedTemplatesStory as Meta
