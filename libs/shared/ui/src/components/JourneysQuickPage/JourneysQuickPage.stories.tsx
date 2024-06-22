import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { JourneysQuickPage } from './JourneysQuickPage'

const JourneysQuickPageStory: Meta<typeof JourneysQuickPage> = {
  ...simpleComponentConfig,
  component: JourneysQuickPage,
  title: 'Shared-Ui/JourneysQuickPage'
}

const Template: StoryObj<typeof JourneysQuickPage> = {
  render: () => (
    <SnackbarProvider>
      <JourneysQuickPage />
    </SnackbarProvider>
  )
}

export const Default = {
  ...Template
}

export default JourneysQuickPageStory
