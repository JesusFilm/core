import { Meta, Story } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import {
  oldTemplate,
  publishedTemplate,
  descriptiveTemplate
} from './TemplateListData'
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
  templates: [oldTemplate, publishedTemplate, descriptiveTemplate]
}

export const Loading = Template.bind({})
Loading.args = {
  templates: null
}

export default TemplateListStory as Meta
