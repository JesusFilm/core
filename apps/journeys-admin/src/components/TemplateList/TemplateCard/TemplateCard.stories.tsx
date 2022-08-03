import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../libs/storybook'
import { defaultTemplate, descriptiveTemplate } from '../TemplateListData'
import { TemplateCard } from '.'

const TemplateCardStory = {
  ...journeysAdminConfig,
  component: TemplateCard,
  title: 'Journeys-Admin/TemplateList/TemplateCard'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <TemplateCard template={args.template} admin={args.admin} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  template: defaultTemplate,
  admin: false
}

export const Descriptive = Template.bind({})
Descriptive.args = {
  template: descriptiveTemplate,
  admin: false
}

export const Loading = Template.bind({})
Loading.args = {
  template: undefined,
  admin: false
}

export const AdminDraft = Template.bind({})
AdminDraft.args = {
  template: defaultTemplate,
  admin: true
}

export const AdminLoading = Template.bind({})
AdminLoading.args = {
  template: undefined,
  admin: true
}

export default TemplateCardStory as Meta
