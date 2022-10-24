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
const input = [
  {
    id:"Jesse Ernst",
    teamId: 56445,
    userId: 84454,
    createdAt: "This date"
  },
  {
    id:"Tataihono Nikora",
    teamId: 1111,
    userId: 8465,
    createdAt: "This date"
  },
  {
    id:"Siyang Cao",
    teamId: 2222,
    userId: 32165,
    createdAt: "This date"
  },
  {
    id:"Steven Diller",
    teamId: 33332,
    userId: 5,
    createdAt: "This date"
  },
  {
    id:"Aaron Thompson",
    teamId: 798654,
    userId: 132465,
    createdAt: "This date"
  }
]

const Template: Story = ({ ...args }) => (
  <MockedProvider   
  >
    <FlagsProvider flags={{ templates: true }}>
      <VisitorListReport input={input} />
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