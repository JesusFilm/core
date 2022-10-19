import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { journeysAdminConfig } from '../../libs/storybook'
// import {
//   defaultTemplate,
//   oldTemplate,
//   descriptiveTemplate,
//   publishedTemplate
// } from '../TemplateLibrary/TemplateListData'
import { VisitorListReport } from '.'

const VisitorListStory = {
  ...journeysAdminConfig,
  component: VisitorListReport,
  title: 'Journeys-Admin/VisitorList',  
}

const Template: Story = ({ ...args }) => (
  <MockedProvider   
  >
    <FlagsProvider flags={{ templates: true }}>
      <VisitorListReport input={[]} />
    </FlagsProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  props: {
    event: ''
  }
}

export default VisitorListStory as Meta