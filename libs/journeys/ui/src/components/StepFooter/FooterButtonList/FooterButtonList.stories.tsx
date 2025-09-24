import { Meta, StoryObj } from '@storybook/nextjs'
import { SnackbarProvider } from 'notistack'

import { journeyUiConfig } from '../../../libs/journeyUiConfig'

import { FooterButtonList } from './FooterButtonList'

const Demo: Meta<typeof FooterButtonList> = {
  ...journeyUiConfig,
  component: FooterButtonList,
  title: 'Journeys-Ui/StepFooter/FooterButtonList'
}

const Template: StoryObj = {
  render: () => (
    <SnackbarProvider>
      <FooterButtonList />
    </SnackbarProvider>
  )
}

export const Default = { ...Template }

export default Demo
