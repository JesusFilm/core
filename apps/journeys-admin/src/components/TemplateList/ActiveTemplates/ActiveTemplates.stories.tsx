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

import { ActiveTemplates } from '.'

const ActiveTemplatesStory: Meta<typeof ActiveTemplates> = {
  component: ActiveTemplates,
  title: 'Journeys-Admin/TemplatesList/ActiveTemplates',
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

const Template: StoryObj<
  ComponentProps<typeof ActiveTemplates> & {
    props: JourneyListProps
    mocks: [MockedResponse<GetAdminJourneys>]
  }
> = {
  render: ({ ...args }) => (
    <MockedProvider mocks={args.mocks}>
      <ActiveTemplates {...args.props} />
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

export const NoTemplates = {
  ...Template,
  args: {
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

export const Loading = {
  ...Template,
  args: {
    mocks: []
  }
}

export const ArchiveDialog = {
  ...Template,
  args: {
    props: {
      event: 'archiveAllActive'
    },
    mocks: []
  }
}

export const TrashDialog = {
  ...Template,
  args: {
    props: {
      event: 'trashAllActive'
    },
    mocks: []
  }
}

export default ActiveTemplatesStory
