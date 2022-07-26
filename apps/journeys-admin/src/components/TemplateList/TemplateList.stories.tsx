import { Meta, Story } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import { templatesData } from './TemplateListData'
import { TemplateList } from '.'

const TemplateListStory = {
  ...journeysAdminConfig,
  component: TemplateList,
  title: 'Journeys-Admin/TemplateList'
}

const Template: Story = ({ ...args }) => (
  <TemplateList templates={args.templates} />
)

export const Default = Template.bind({})
Default.args = {
  templates: templatesData
}

export default TemplateListStory as Meta
