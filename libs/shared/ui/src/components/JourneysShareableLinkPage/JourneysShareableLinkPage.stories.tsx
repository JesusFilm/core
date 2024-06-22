import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { JourneysShareableLinkPage } from './JourneysShareableLinkPage'

const JourneysShareableLinkPageStory: Meta<typeof JourneysShareableLinkPage> = {
  ...simpleComponentConfig,
  component: JourneysShareableLinkPage,
  title: 'Shared-Ui/JourneysShareableLinkPage'
}

const Template: StoryObj<typeof JourneysShareableLinkPage> = {
  render: () => (
    <SnackbarProvider>
      <JourneysShareableLinkPage />
    </SnackbarProvider>
  )
}

export const Default = {
  ...Template
}

export default JourneysShareableLinkPageStory
