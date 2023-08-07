import { Meta, Story } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { journeyUiConfig } from '../../../libs/journeyUiConfig'

import { FooterButtonList } from './FooterButtonList'

const Demo = {
  ...journeyUiConfig,
  component: FooterButtonList,
  title: 'Journeys-Ui/StepFooter/FooterButtonList'
}

const Template: Story = () => (
  <SnackbarProvider>
    <FooterButtonList />
  </SnackbarProvider>
)

export const Default = Template.bind({})

export default Demo as Meta
