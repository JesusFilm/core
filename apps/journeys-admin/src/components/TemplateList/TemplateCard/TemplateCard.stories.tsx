import { Meta, Story } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { TemplateCard } from '.'

const TemplateCardStory = {
  ...journeysAdminConfig,
  component: TemplateCard,
  title: 'Journeys-Admin/TemplateList/TemplateCard'
}

const Template: Story = ({ ...args }) => (
  <TemplateCard template={args.template} />
)

export const Default = Template.bind({})
Default.args = {
  template: {
    id: '1',
    title: 'Default Journey',
    date: '25 September',
    description: 'A short preview of the description',
    socialShareImage:
      'https://images.unsplash.com/photo-1657299142317-00e647447f80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHw2fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60'
  }
}

export default TemplateCardStory as Meta
