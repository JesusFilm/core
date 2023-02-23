import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

// import Icon from '@mui/material/Icon'
import Button from '@mui/material/Button'
import { sharedUiConfig } from '../../libs/sharedUiConfig'

const MuiButtonDemo = {
  ...sharedUiConfig,
  title: 'Mui Components/Button',
  component: Button,
  parameters: {
    ...sharedUiConfig.parameters,
    chromatic: {
      disableSnapshot: true
    }
  }
}

const Template: Story<ComponentProps<typeof Button>> = (args) => {
  return args.children != null ? (
    <Button {...args}>{args.children}</Button>
  ) : (
    <Button {...args} />
  )
}

export const MuiButton = Template.bind({})
MuiButton.args = {
  children: 'Button',
  color: 'primary',
  disabled: false,
  disableElevation: false,
  fullWidth: true,
  size: 'medium',
  variant: 'contained',
  href: '',
  sx: {}
}

export default MuiButtonDemo as Meta
