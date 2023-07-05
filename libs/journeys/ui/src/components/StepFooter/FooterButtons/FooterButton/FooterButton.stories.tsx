import { ComponentProps } from 'react'
import { Meta, Story } from '@storybook/react'
import Typography from '@mui/material/Typography'
import { noop } from 'lodash'
import { journeyUiConfig } from '../../../../libs/journeyUiConfig'
import { FooterButton } from './FooterButton'

const Demo = {
  ...journeyUiConfig,
  component: FooterButton,
  title: 'Journeys-Ui/StepFooter/FooterButtons/FooterButton'
}

const Template: Story<ComponentProps<typeof FooterButton>> = ({ ...args }) => (
  <FooterButton {...args} />
)

export const Default = Template.bind({})
Default.args = {
  handleClick: noop,
  children: <Typography>Test</Typography>
}

export default Demo as Meta
