import { ThemeProvider } from '@mui/material/styles'
import { Meta, StoryObj } from '@storybook/nextjs'

import { simpleComponentConfig } from '@core/shared/ui/simpleComponentConfig'
import { adminLight } from '@core/shared/ui/themes/journeysAdmin/theme'

import { ExportDialog } from './ExportDialog'

const ExportDialogStory: Meta<typeof ExportDialog> = {
  ...simpleComponentConfig,
  title: 'Journeys-Admin/JourneyVisitorsList/FilterDrawer/ExportDialog',
  component: ExportDialog
}

type Story = StoryObj<typeof ExportDialog>

const Template: Story = {
  render: ({ ...args }) => {
    return (
      <ThemeProvider theme={adminLight}>
        <ExportDialog {...args} />
      </ThemeProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    open: true,
    onClose: () => null,
    journeyId: 'journey-id',
    availableBlockTypes: [
      'RadioQuestionBlock',
      'MultiselectBlock',
      'TextResponseBlock',
      'SignUpBlock'
    ],
    createdAt: '2024-01-01T00:00:00Z'
  }
}

export default ExportDialogStory
