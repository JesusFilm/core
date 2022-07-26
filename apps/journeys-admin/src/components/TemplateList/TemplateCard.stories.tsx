import { Meta, Story } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import { TemplateList } from './TemplateList'

const TemplateListStory = {
  ...journeysAdminConfig,
  component: TemplateList,
  title: 'Journeys-Admin/TemplateList'
}

const Template: Story = () => <TemplateList />

export const Default = Template.bind({})

export default TemplateListStory as Meta
