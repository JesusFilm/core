import { Meta, Story } from '@storybook/react'
import { PageWrapper } from '.'

const PageWrapperStory = {
  component: PageWrapper,
  title: 'Watch/PageWrapper',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story = () => <PageWrapper />

export const Default = Template.bind({})

export default PageWrapperStory as Meta
