import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { JourneyStatus } from '../../../__generated__/globalTypes'
import { cache } from '../../libs/apolloClient/cache'
import { GET_ADMIN_JOURNEYS } from '../../libs/useAdminJourneysQuery/useAdminJourneysQuery'

import {
  defaultTemplate,
  descriptiveTemplate,
  oldTemplate,
  publishedTemplate
} from './data'

import { TemplateList } from '.'
import '../../../test/i18n'

const TemplateListStory: Meta<typeof TemplateList> = {
  ...journeysAdminConfig,
  component: TemplateList,
  title: 'Journeys-Admin/TemplateList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof TemplateList> = {
  render: ({ ...args }) => <TemplateList {...args} />
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
  },
  args: {
    event: ''
  }
}

export default TemplateListStory
