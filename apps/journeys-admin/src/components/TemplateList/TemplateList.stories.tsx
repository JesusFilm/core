import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { JourneyStatus } from '../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_ADMIN_JOURNEYS } from '../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import {
  defaultTemplate,
  descriptiveTemplate,
  oldTemplate,
  publishedTemplate
} from '../TemplateLibrary/TemplateListData'

import { TemplateList } from '.'

const TemplateListStory: Meta<typeof TemplateList> = {
  ...journeysAdminConfig,
  component: TemplateList,
  title: 'Journeys-Admin/TemplatesList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof TemplateList> = {
  render: ({ ...args }) => (
    <MockedProvider
      mocks={[
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
      ]}
    >
      <TemplateList {...args.props} />
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    props: {
      event: ''
    }
  }
}

export default TemplateListStory
