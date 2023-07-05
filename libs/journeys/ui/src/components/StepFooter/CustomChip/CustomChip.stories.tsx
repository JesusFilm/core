import { ComponentProps } from 'react'
import { Meta, Story } from '@storybook/react'
import Typography from '@mui/material/Typography'
import { noop } from 'lodash'
import { journeyUiConfig } from '../../../libs/journeyUiConfig'
import { CustomChip } from './CustomChip'

const Demo = {
  ...journeyUiConfig,
  component: CustomChip,
  title: 'Journeys-Ui/StepFooter/CustomChip'
}

const Template: Story<ComponentProps<typeof CustomChip>> = ({ ...args }) => (
  <CustomChip {...args} />
)

export const Default = Template.bind({})
Default.args = {
  handleClick: noop,
  children: <Typography>Test</Typography>
}

export default Demo as Meta
