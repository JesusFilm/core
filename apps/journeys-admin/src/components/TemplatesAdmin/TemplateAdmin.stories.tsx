import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { journeysAdminConfig } from '../../libs/storybook'
import { PageWrapper } from '../PageWrapper'
import {
  defaultTemplate,
  oldTemplate,
  descriptiveTemplate,
  publishedTemplate
} from '../TemplateList/TemplateListData'
import { GET_ACTIVE_PUBLISHER_TEMPLATES } from './TemplateStatusTabs/ActiveTemplates/ActiveTemplates'
import { TemplatesAdmin } from '.'

const TemplatesAdminStory = {
  ...journeysAdminConfig,
  component: TemplatesAdmin,
  title: 'Journeys-Admin/TemplatesAdmin',
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
          query: GET_ACTIVE_PUBLISHER_TEMPLATES
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
    <FlagsProvider flags={{ reports: true }}>
      <PageWrapper title="Templates Admin">
        <TemplatesAdmin {...args.props} />
      </PageWrapper>
    </FlagsProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  props: {
    event: ''
  }
}

export default TemplatesAdminStory as Meta
