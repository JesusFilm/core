import { Meta, Story } from '@storybook/react'
import { watchConfig } from '../../libs/storybook'
import { PageWrapper } from '.'

const PageWrapperStory = {
  ...watchConfig,
  component: PageWrapper,
  title: 'Watch/PageWrapper',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story = () => <PageWrapper />

export const Default = Template.bind({})

export default PageWrapperStory as Meta
