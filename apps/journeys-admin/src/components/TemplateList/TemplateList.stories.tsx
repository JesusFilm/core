import { Meta, Story } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import { templatesData } from './TemplateListData'
import { TemplateList } from '.'

const TemplateListStory = {
  ...journeysAdminConfig,
  component: TemplateList,
  title: 'Journeys-Admin/TemplateList'
}

const Template: Story = ({ props }) => (
  <TemplateList templates={props.templates} />
)

export const Default = Template.bind({})
Default.props = {
  templates: templatesData
}

export default TemplateListStory as Meta
