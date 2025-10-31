import { Decorator, Meta, StoryObj } from '@storybook/nextjs'
import { SnackbarProvider } from 'notistack'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { cache } from '../../../libs/apolloClient/cache'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { ThemeProvider } from '../../ThemeProvider'
import {
  defaultTemplate,
  descriptiveTemplate,
  oldTemplate,
  publishedTemplate
} from '../data'

import { ArchivedTemplateList } from '.'

import '../../../../test/i18n'

const ArchivedTemplatesStory: Meta<typeof ArchivedTemplateList> = {
  component: ArchivedTemplateList,
  title: 'Journeys-Admin/TemplateList/ArchivedTemplateList',
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

const Template: StoryObj<ComponentProps<typeof ArchivedTemplateList>> = {
  render: ({ ...args }) => <ArchivedTemplateList {...args} />
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      cache: cache(),
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
}

export const NoTemplates = {
  ...Template,
  parameters: {
    apolloClient: {
      cache: cache(),
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
}

export const Loading = {
  ...Template,
  parameters: {
    apolloClient: {
      cache: cache(),
      mocks: []
    }
  }
}

export const UnarchiveDialog = {
  ...Template,
  args: {
    event: 'restoreAllArchived'
  }
}

export const TrashDialog = {
  ...Template,
  args: {
    event: 'trashAllArchived'
  }
}

export default ArchivedTemplatesStory
