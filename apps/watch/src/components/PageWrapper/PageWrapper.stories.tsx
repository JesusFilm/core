import { Meta, Story } from '@storybook/react'
import { ThemeProvider } from '../ThemeProvider'
import { PageWrapper } from '.'

const PageWrapperStory = {
  component: PageWrapper,
  title: 'Watch/PageWrapper',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story = () => (
  <ThemeProvider>
    <PageWrapper />
  </ThemeProvider>
)

export const Default = Template.bind({})

export default PageWrapperStory as Meta
