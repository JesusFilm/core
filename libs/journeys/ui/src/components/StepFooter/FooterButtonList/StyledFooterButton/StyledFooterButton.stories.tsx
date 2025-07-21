import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { journeyUiConfig } from '../../../../libs/journeyUiConfig'

import { StyledFooterButton } from './StyledFooterButton'

const Demo: Meta<typeof StyledFooterButton> = {
  ...journeyUiConfig,
  component: StyledFooterButton,
  title: 'Journeys-Ui/StepFooter/FooterButtonList/StyledFooterButton'
}

const Template: StoryObj<typeof StyledFooterButton> = {
  render: ({ ...args }) => <StyledFooterButton {...args} />
}

export const Default = {
  ...Template,
  args: {
    onClick: noop,
    children: <Typography>Test</Typography>
  }
}

export default Demo
