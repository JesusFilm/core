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

import { ActiveTemplateList } from '.'

import '../../../../test/i18n'

const ActiveTemplateListStory: Meta<typeof ActiveTemplateList> = {
  component: ActiveTemplateList,
  title: 'Journeys-Admin/TemplateList/ActiveTemplateList',
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

const Template: StoryObj<ComponentProps<typeof ActiveTemplateList>> = {
  render: ({ ...args }) => <ActiveTemplateList {...args} />
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

export const ArchiveDialog = {
  ...Template,
  args: {
    event: 'archiveAllActive'
  }
}

export const TrashDialog = {
  ...Template,
  args: {
    event: 'trashAllActive'
  }
}

export default ActiveTemplateListStory
