import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Decorator, Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { ComponentProps } from 'react'

import { GetAdminJourneys } from '../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useJourneysAdminQuery/useJourneysAdminQuery'
import { JourneyListProps } from '../../JourneyList/JourneyList'
import {
  defaultTemplate,
  descriptiveTemplate,
  oldTemplate,
  publishedTemplate
} from '../../TemplateLibrary/TemplateListData'
import { ThemeProvider } from '../../ThemeProvider'

import { ArchivedTemplates } from '.'

const ArchivedTemplatesStory: Meta<typeof ArchivedTemplates> = {
  component: ArchivedTemplates,
  title: 'Journeys-Admin/TemplatesList/ArchivedTemplates',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  },
  decorators: [
    (Story: Parameters<Decorator>[0]) => (
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

const Template: StoryObj<
  ComponentProps<typeof ArchivedTemplates> & {
    props: JourneyListProps
    mocks: [MockedResponse<GetAdminJourneys>]
  }
> = {
  render: ({ ...args }) => (
    <MockedProvider mocks={args.mocks}>
      <ArchivedTemplates {...args.props} />
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    mocks: [
      {
        request: {
          query: GET_ADMIN_JOURNEYS,
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
}

export const NoTemplates = {
  ...Template,
  args: {
    mocks: [
      {
        request: {
          query: GET_ADMIN_JOURNEYS,
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
}

export const Loading = {
  ...Template,
  args: {
    mocks: []
  }
}

export const UnarchiveDialog = {
  ...Template,
  args: {
    props: {
      event: 'restoreAllArchived'
    },
    mocks: []
  }
}

export const TrashDialog = {
  ...Template,
  args: {
    props: {
      event: 'trashAllArchived'
    },
    mocks: []
  }
}

export default ArchivedTemplatesStory
