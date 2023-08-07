import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'
import {
  defaultTemplate,
  descriptiveTemplate
} from '../TemplateLibrary/TemplateListData'

import { TemplateCard } from '.'

const TemplateCardStory = {
  ...journeysAdminConfig,
  component: TemplateCard,
  title: 'Journeys-Admin/TemplateCard'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <TemplateCard journey={args.template} isPublisher={args.isPublisher} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  template: defaultTemplate,
  isPublisher: false
}

export const Loading = Template.bind({})
Loading.args = {
  template: undefined,
  isPublisher: false
}

export const Complete = Template.bind({})
Complete.args = {
  template: descriptiveTemplate,
  isPublisher: true
}

export const CompleteLoading = Template.bind({})
CompleteLoading.args = {
  template: undefined,
  isPublisher: true
}

export default TemplateCardStory as Meta
