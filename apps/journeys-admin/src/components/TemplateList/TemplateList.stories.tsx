import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import {
  defaultTemplate,
  oldTemplate,
  descriptiveTemplate,
  publishedTemplate
} from '../TemplateLibrary/TemplateListData'
import { GET_JOURNEYS } from '../../libs/useJourneys/useJourneys'
import { JourneyStatus } from '../../../__generated__/globalTypes'
import { TemplateList } from '.'

const TemplateListStory = {
  ...journeysAdminConfig,
  component: TemplateList,
  title: 'Journeys-Admin/TemplatesList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider
    mocks={[
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
    ]}
  >
    <TemplateList {...args.props} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  props: {
    event: ''
  }
}

export default TemplateListStory as Meta
