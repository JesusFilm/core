import { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import MuiTextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { sharedUiConfig } from '../../libs/sharedUiConfig'
import { ThemeProvider } from '../ThemeProvider'
import { ThemeMode, ThemeName } from '../../libs/themes'
import UniversalIcon, { IconNames } from '../Icons'

const MuiTextFieldComponentsDemo = {
  ...sharedUiConfig,
  title: 'Mui Components/Inputs',
  component: MuiTextField,
  subcomponent: { UniversalIcon },
  parameters: {
    theme: 'light',
    chromatic: {
      disableSnapshot: true
    }
  },
  controls: { sort: 'requiredFirst' }
}

const TextFieldTemplate: Story<
  ComponentProps<typeof MuiTextField> & {
    themeMode: ThemeMode
    startIcon?: string
    endIcon?: string
    readOnly?: boolean
  }
> = (args) => {
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={args.themeMode}>
      <MuiTextField
        {...args}
        InputProps={{
          readOnly: args.readOnly,
          startAdornment:
            typeof args.startIcon === 'string' ? (
              <InputAdornment position="start">
                <UniversalIcon name={args.startIcon} />
              </InputAdornment>
            ) : undefined,
          endAdornment:
            typeof args.endIcon === 'string' ? (
              <InputAdornment position="end">
                <UniversalIcon name={args.endIcon} />
              </InputAdornment>
            ) : undefined
        }}
      >
        {args.value}
      </MuiTextField>
    </ThemeProvider>
  )
}

export const TextField = TextFieldTemplate.bind({})
TextField.args = {
  label: 'Label',
  helperText: 'Helper Text',
  placeholder: 'Placeholder',
  value: 'Value',
  variant: 'outlined',
  color: 'primary',
  size: 'medium',
  margin: 'none',
  defaultValue: '',
  disabled: false,
  type: 'text',
  required: false,
  error: false,
  fullWidth: false,
  // Fix styling on these
  startIcon: 'none',
  endIcon: 'none',
  multiline: false,
  maxRows: 1,
  minRows: 1,
  rows: 1,
  readOnly: false,
  sx: { ariaLabel: 'TextField' },
  themeMode: ThemeMode.light
}
TextField.argTypes = {
  variant: {
    control: { type: 'select' },
    options: ['standard', 'outlined', 'filled']
  },
  color: {
    control: { type: 'select' },
    options: ['primary', 'secondary', 'error', 'info', 'success', 'warning'],
    defaultValue: 'primary'
  },
  size: {
    control: { type: 'select' },
    options: ['small', 'medium']
  },
  margin: {
    control: { type: 'select' },
    options: ['dense', 'none', 'normal']
  },
  type: {
    control: { type: 'select' },
    options: ['text', 'number', 'password', 'email', 'tel', 'url']
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

export const TextFieldOnDark = TextFieldTemplate.bind({})
TextFieldOnDark.args = {
  ...TextField.args,
  themeMode: ThemeMode.dark
}
TextFieldOnDark.argTypes = TextField.argTypes

export default MuiTextFieldComponentsDemo as Meta
