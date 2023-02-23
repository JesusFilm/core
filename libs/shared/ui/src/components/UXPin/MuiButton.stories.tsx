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
      options: [
        'inherit',
        'primary',
        'secondary',
        'error',
        'info',
        'success',
        'warning'
      ]
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large']
    }
  }
}

const ButtonTemplate: Story<
  ComponentProps<typeof Button> & { themeMode: ThemeMode }
> = (args) => {
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={args.themeMode}>
      <Button {...args}>{args.children}</Button>
    </ThemeProvider>
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
  centerRipple: false,
  disableRipple: false,
  disableTouchRipple: false,
  focusRipple: false,
  sx: { ariaLabel: 'Button' },
  themeMode: ThemeMode.light
}
MuiButton.argTypes = {
  variant: {
    control: { type: 'select' },
    options: ['text', 'outlined', 'contained']
  }
}

const IconButtonTemplate: Story<
  ComponentProps<typeof IconButton> & { themeMode: ThemeMode }
> = (args) => {
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={args.themeMode}>
      <IconButton {...args}>{args.children}</IconButton>
    </ThemeProvider>
  )
}

export const MuiIconButton = IconButtonTemplate.bind({})
MuiIconButton.args = {
  children: 'Button',
  color: 'primary',
  disabled: false,
  edge: 'start',
  size: 'medium',
  centerRipple: false,
  disableRipple: false,
  disableTouchRipple: false,
  focusRipple: false,
  sx: { ariaLabel: 'Button' },
  themeMode: ThemeMode.light
}

export default MuiInputComponentsDemo as Meta
