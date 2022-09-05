import { Meta, Story } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import {
  oldTemplate,
  publishedTemplate,
  descriptiveTemplate
} from './TemplateListData'
import { TemplateLibrary } from '.'

const TemplateLibraryStory = {
  ...journeysAdminConfig,
  component: TemplateLibrary,
  title: 'Journeys-Admin/TemplateLibrary'
}

const Template: Story = ({ ...args }) => (
  <TemplateLibrary journeys={args.templates} />
)

export const Default = Template.bind({})
Default.args = {
  templates: [oldTemplate, publishedTemplate, descriptiveTemplate]
}

export const Loading = Template.bind({})
Loading.args = {
  templates: null
}

export default TemplateLibraryStory as Meta
