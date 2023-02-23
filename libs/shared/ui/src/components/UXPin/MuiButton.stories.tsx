import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { sharedUiConfig } from '../../libs/sharedUiConfig'
import { ThemeProvider } from '../ThemeProvider'
import { ThemeMode, ThemeName } from '../../libs/themes'

const MuiInputComponentsDemo = {
  ...sharedUiConfig,
  title: 'Mui Components/Inputs',
  component: Button,
  parameters: {
    theme: 'light',
    layout: 'fullscreen',
    chromatic: {
      disableSnapshot: true
    }
  },
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'error', 'info', 'success', 'warning'],
      defaultValue: 'primary'
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large']
    },
    themeMode: {
      control: { type: 'select' },
      options: ['light', 'dark']
    }
  }
}

const ButtonTemplate: Story<
  ComponentProps<typeof Button> & { themeMode: ThemeMode }
> = (args) => {
  return (
    // <ThemeProvider themeName={ThemeName.base} themeMode={args.themeMode}>
    <Button {...args}>{args.children}</Button>
    // </ThemeProvider>
  )
}

export const MuiButton = ButtonTemplate.bind({})
MuiButton.args = {
  children: 'Button',
  color: 'primary',
  disabled: false,
  disableElevation: false,
  fullWidth: false,
  size: 'medium',
  variant: 'contained',
  href: '',
  // MuiButtonBase
  centerRipple: false,
  disableRipple: false,
  disableFocusRipple: false,
  disableTouchRipple: false,
  focusRipple: false,
  sx: { ariaLabel: 'Button' },
  themeMode: ThemeMode.light
}
MuiButton.argTypes = {
  variant: {
    control: { type: 'select' },
    options: ['text', 'outlined', 'contained']
  },
  children: {
    name: 'label'
  }
}

const IconButtonTemplate: Story<
  ComponentProps<typeof IconButton> & { themeMode: ThemeMode }
> = (args) => {
  return <IconButton {...args}>{args.children}</IconButton>
}

export const MuiIconButton = IconButtonTemplate.bind({})
MuiIconButton.args = {
  children: 'Button',
  color: 'primary',
  disabled: false,
  edge: false,
  size: 'medium',
  centerRipple: false,
  disableRipple: false,
  disableFocusRipple: false,
  disableTouchRipple: false,
  focusRipple: false,
  sx: { ariaLabel: 'Button' }
}
MuiIconButton.argTypes = {
  edge: {
    control: { type: 'select' },
    options: ['start', 'end', false]
  }
}

export default MuiInputComponentsDemo as Meta
