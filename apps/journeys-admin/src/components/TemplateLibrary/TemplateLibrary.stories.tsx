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

const Template: Story = ({ ...args }) => <TemplateLibrary {...args} />

export const Default = Template.bind({})
Default.args = {
  journeys: [{}],
  templates: [oldTemplate, publishedTemplate, descriptiveTemplate]
}

export const Loading = Template.bind({})
Loading.args = {
  journeys: [{}],
  templates: null
}

export const Access = Template.bind({})
Access.args = {
  journeys: []
}

export default TemplateLibraryStory as Meta
