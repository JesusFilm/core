import { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import MuiIconButton from '@mui/material/IconButton'
import MuiIcon from '@mui/material/Icon'
import { sharedUiConfig } from '../../libs/sharedUiConfig'
import { ThemeProvider } from '../ThemeProvider'
import { ThemeMode, ThemeName } from '../../libs/themes'
import UniversalIcon, { IconNames } from '../Icons'

const MuiIconButtonComponentsDemo = {
  ...sharedUiConfig,
  title: 'Mui Components/Inputs/IconButton',
  component: MuiIconButton,
  subcomponent: { MuiIcon },
  parameters: {
    theme: 'light',
    chromatic: {
      disableSnapshot: true
    }
  },
  controls: { sort: 'requiredFirst' }
}

const IconButtonTemplate: Story<
  ComponentProps<typeof MuiIconButton> & {
    themeMode: ThemeMode
    // edgeAlignment: 'start' | 'end'
  }
> = (args) => {
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={args.themeMode}>
      <MuiIconButton {...args}>
        <UniversalIcon name="Bar1Down" color="inherit" fontSize="inherit" />
      </MuiIconButton>
    </ThemeProvider>
  )
}

export const IconButton = IconButtonTemplate.bind({})
IconButton.args = {
  children: 'Bar1Down',
  color: 'primary',
  size: 'medium',
  // edge: false, - complex type
  disabled: false,
  // centerRipple: false,
  // disableRipple: false,
  // disableFocusRipple: false,
  // disableTouchRipple: false,
  // focusRipple: false,
  sx: { ariaLabel: 'IconButton' },
  themeMode: ThemeMode.light
}
IconButton.argTypes = {
  children: {
    name: 'icon',
    control: { type: 'select' },
    options: IconNames
  },
  color: {
    control: { type: 'select' },
    options: ['primary', 'secondary', 'error', 'info', 'success', 'warning'],
    defaultValue: 'primary'
  },
  size: {
    control: { type: 'inline-radio' },
    options: ['small', 'medium', 'large']
  },
  themeMode: { control: false }
}

export const IconButtonOnDark = IconButtonTemplate.bind({})
IconButtonOnDark.args = {
  ...IconButton.args,
  themeMode: ThemeMode.dark
}
IconButtonOnDark.argTypes = IconButton.argTypes

export default MuiIconButtonComponentsDemo as Meta
