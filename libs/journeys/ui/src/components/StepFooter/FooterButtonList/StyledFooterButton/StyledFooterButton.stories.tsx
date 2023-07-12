import { ComponentProps } from 'react'
import { Meta, Story } from '@storybook/react'
import Typography from '@mui/material/Typography'
import { noop } from 'lodash'
import { journeyUiConfig } from '../../../../libs/journeyUiConfig'
import { StyledFooterButton } from './StyledFooterButton'

const Demo = {
  ...journeyUiConfig,
  component: StyledFooterButton,
  title: 'Journeys-Ui/StepFooter/FooterButtonList/StyledFooterButton'
}

const Template: Story<ComponentProps<typeof StyledFooterButton>> = ({
  ...args
}) => <StyledFooterButton {...args} />

export const Default = Template.bind({})
Default.args = {
  onClick: noop,
  children: <Typography>Test</Typography>
}

export default Demo as Meta
