import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import {
  defaultTemplate,
  descriptiveTemplate
} from '../TemplateList/TemplateListData'
import { TemplateCard } from '.'

const TemplateCardStory = {
  ...journeysAdminConfig,
  component: TemplateCard,
  title: 'Journeys-Admin/TemplateList/TemplateCard'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <TemplateCard journey={args.template} admin={args.admin} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  template: defaultTemplate,
  admin: false
}

export const Complete = Template.bind({})
Complete.args = {
  template: descriptiveTemplate,
  admin: true
}

export const Loading = Template.bind({})
Loading.args = {
  template: undefined,
  admin: true
}

export default TemplateCardStory as Meta
