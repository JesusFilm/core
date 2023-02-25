import { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import MuiButton from '@mui/material/Button'
import MuiIconButton from '@mui/material/IconButton'
import { sharedUiConfig } from '../../libs/sharedUiConfig'
import { ThemeProvider } from '../ThemeProvider'
import { ThemeMode, ThemeName } from '../../libs/themes'
import UniversalIcon, { IconNames } from '../Icons'

const MuiButtonComponentsDemo = {
  ...sharedUiConfig,
  title: 'Mui Components/Inputs',
  component: MuiButton,
  subcomponent: { MuiIconButton },
  parameters: {
    theme: 'light',
    chromatic: {
      disableSnapshot: true
    }
  },
  controls: { sort: 'requiredFirst' }
}

const ButtonTemplate: Story<
  ComponentProps<typeof MuiButton> & { themeMode: ThemeMode }
> = (args) => {
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={args.themeMode}>
      <MuiButton
        {...args}
        startIcon={
          typeof args.startIcon === 'string' ? (
            <UniversalIcon name={args.startIcon} />
          ) : undefined
        }
        endIcon={
          typeof args.endIcon === 'string' ? (
            <UniversalIcon name={args.endIcon} />
          ) : undefined
        }
      >
        {args.children}
      </MuiButton>
    </ThemeProvider>
  )
}

export const Button = ButtonTemplate.bind({})
Button.args = {
  children: 'Button',
  variant: 'contained',
  color: 'primary',
  size: 'medium',
  disabled: false,
  disableElevation: false,
  fullWidth: false,
  href: '',
  startIcon: 'none',
  endIcon: 'none',
  // centerRipple: false,
  // disableRipple: false,
  // disableFocusRipple: false,
  // disableTouchRipple: false,
  // focusRipple: false,
  sx: { ariaLabel: 'Button' },
  themeMode: ThemeMode.light
}
Button.argTypes = {
  children: {
    name: 'label'
  },
  variant: {
    control: { type: 'select' },
    options: ['text', 'outlined', 'contained']
  },
  color: {
    control: { type: 'select' },
    options: ['primary', 'secondary', 'error', 'info', 'success', 'warning'],
    defaultValue: 'primary'
  },
  size: {
    control: { type: 'select' },
    options: ['small', 'medium', 'large']
  },
  startIcon: {
    control: { type: 'select' },
    options: IconNames
  },
  endIcon: {
    control: { type: 'select' },
    options: IconNames
  },
  themeMode: { control: false }
}

export const ButtonOnDark = ButtonTemplate.bind({})
ButtonOnDark.args = {
  ...Button.args,
  themeMode: ThemeMode.dark
}
ButtonOnDark.argTypes = Button.argTypes

export default MuiButtonComponentsDemo as Meta
