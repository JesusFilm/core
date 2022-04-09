import { Meta, Story } from '@storybook/react'
import { PageWrapperProps } from './PageWrapper'
import { PageWrapper } from '.'

const PageWrapperStory = {
  component: PageWrapper,
  title: 'Watch/PageWrapper',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story<PageWrapperProps> = ({ ...args }) => (
  <PageWrapper {...args} />
)

export const Default = Template.bind({})
Default.args = { title: 'Journeys' }

export const Complete = Template.bind({})
Complete.args = {
  backHref: '/',
  title: 'Journey Details'
}

export default PageWrapperStory as Meta
