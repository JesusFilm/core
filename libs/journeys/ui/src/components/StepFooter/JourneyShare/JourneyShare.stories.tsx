import { ComponentProps } from 'react'
import { Meta, Story } from '@storybook/react'
// import { screen, userEvent, waitFor } from '@storybook/testing-library'
import { SnackbarProvider } from 'notistack'
import { journeyUiConfig } from '../../../libs/journeyUiConfig'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { JourneyShare } from '.'

const Demo = {
  ...journeyUiConfig,
  component: JourneyShare,
  title: 'Journeys-Ui/StepFooter/JourneyShare'
}

const Template: Story<
  ComponentProps<typeof JourneyShare> & {
    journey: Journey
    admin: boolean
  }
> = ({ journey, admin }) => {
  return (
    <SnackbarProvider>
      <JourneyProvider value={{ journey, admin }}>
        <JourneyShare />
      </JourneyProvider>
    </SnackbarProvider>
  )
}

const journey = {} as unknown as Journey

export const Default = Template.bind({})
Default.args = {
  journey
}

// Need to mock navigator object for this to work
// export const DesktopDialog = Template.bind({})
// DesktopDialog.args = {
//   journey
// }
// DesktopDialog.play = async () => {
//   const shareButton = screen.getAllByRole('button', { name: 'Share' })[0]
//   await waitFor(() => {
//     userEvent.click(shareButton)
//   })
// }

export default Demo as Meta
