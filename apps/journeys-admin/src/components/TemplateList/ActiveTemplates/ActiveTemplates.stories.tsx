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
import { ThemeProvider } from '../../ThemeProvider'
import { GET_JOURNEYS } from '../../../libs/useJourneys/useJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { ActiveTemplates } from '.'

const ActiveTemplatesStory = {
  component: ActiveTemplates,
  title: 'Journeys-Admin/TemplatesList/ActiveTemplates',
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

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <ActiveTemplates {...args.props} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  mocks: [
    {
      request: {
        query: GET_JOURNEYS,
        variables: {
          status: [JourneyStatus.draft, JourneyStatus.published],
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

export const NoTemplates = Template.bind({})
NoTemplates.args = {
  mocks: [
    {
      request: {
        query: GET_JOURNEYS,
        variables: {
          status: [JourneyStatus.draft, JourneyStatus.published],
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

export const ArchiveDialog = Template.bind({})
ArchiveDialog.args = {
  props: {
    event: 'archiveAllActive'
  },
  mocks: []
}

export const TrashDialog = Template.bind({})
TrashDialog.args = {
  props: {
    event: 'trashAllActive'
  },
  mocks: []
}

export default ActiveTemplatesStory as Meta
