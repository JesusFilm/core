import { Decorator, Meta, StoryObj } from '@storybook/nextjs'
import { formatISO } from 'date-fns'
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

import { TrashedTemplateList } from '.'

import '../../../../test/i18n'

const TrashedTemplateListStory: Meta<typeof TrashedTemplateList> = {
  component: TrashedTemplateList,
  title: 'Journeys-Admin/TemplateList/TrashedTemplateList',
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

const Template: StoryObj<ComponentProps<typeof TrashedTemplateList>> = {
  render: ({ ...args }) => <TrashedTemplateList {...args} />
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

export const RestoreDialog = {
  ...Template,
  args: {
    event: 'restoreAllTrashed'
  }
}

export const DeleteDialog = {
  ...Template,
  args: {
    event: 'deleteAllTrashed'
  }
}

export default TrashedTemplateListStory
