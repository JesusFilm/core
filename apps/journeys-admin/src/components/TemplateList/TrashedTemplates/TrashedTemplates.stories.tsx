import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Decorator, Meta, StoryObj } from '@storybook/react'
import { formatISO } from 'date-fns'
import { SnackbarProvider } from 'notistack'
import { ComponentProps } from 'react'

import { GetAdminJourneys } from '../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { JourneyListProps } from '../../JourneyList/JourneyList'
import {
  defaultTemplate,
  descriptiveTemplate,
  oldTemplate,
  publishedTemplate
} from '../../TemplateLibrary/TemplateListData'
import { ThemeProvider } from '../../ThemeProvider'

import { TrashedTemplates } from '.'

const TrashedTemplatesStory: Meta<typeof TrashedTemplates> = {
  component: TrashedTemplates,
  title: 'Journeys-Admin/TemplatesList/TrashedTemplates',
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

const Template: StoryObj<
  ComponentProps<typeof TrashedTemplates> & {
    props: JourneyListProps
    mocks: [MockedResponse<GetAdminJourneys>]
  }
> = {
  render: ({ ...args }) => (
    <MockedProvider mocks={args.mocks}>
      <TrashedTemplates {...args.props} />
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

export const NoTemplates = {
  ...Template,
  args: {
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

export const Loading = {
  ...Template,
  args: {
    mocks: []
  }
}

export const RestoreDialog = {
  ...Template,
  args: {
    props: {
      event: 'restoreAllTrashed'
    },
    mocks: []
  }
}

export const DeleteDialog = {
  ...Template,
  args: {
    props: {
      event: 'deleteAllTrashed'
    },
    mocks: []
  }
}

export default TrashedTemplatesStory
