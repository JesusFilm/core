import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import Stack from '@mui/material/Stack'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { journeyUiConfig } from '../../../libs/journeyUiConfig'
import { HostAvatars } from './HostAvatars'

const HostAvatarsDemo = {
  ...journeyUiConfig,
  component: HostAvatars,
  title: 'Journeys-Ui/StepFooter/HostAvatars',
  parameters: {
    ...journeyUiConfig.parameters
  }
}

const Template: Story<
  ComponentProps<typeof HostAvatars> & {
    editableStepFooter: boolean
    admin: boolean
  }
> = ({ src1, src2, editableStepFooter, admin }) => (
  <FlagsProvider flags={{ editableStepFooter }}>
    <JourneyProvider value={{ admin }}>
      <Stack direction="row">
        <HostAvatars src1={src1} src2={src2} hasPlaceholder />
      </Stack>
    </JourneyProvider>
  </FlagsProvider>
)

export const Default = Template.bind({})
Default.args = { admin: true, editableStepFooter: true }

export const OneAvatarWithPlaceHolder = Template.bind({})
OneAvatarWithPlaceHolder.args = {
  ...Default.args,
  src1: 'http://surl.li/iauzf'
}

export const OneAvatar = Template.bind({})
OneAvatar.args = {
  ...Default.args,
  admin: false,
  src1: 'http://surl.li/iauzf'
}

export const TwoAvatars = Template.bind({})
TwoAvatars.args = {
  ...Default.args,
  admin: false,
  src1: 'http://surl.li/iauzf',
  src2: 'http://surl.li/iauzv'
}

export default HostAvatarsDemo as Meta
