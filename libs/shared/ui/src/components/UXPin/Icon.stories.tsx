import { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import { sharedUiConfig } from '../../libs/sharedUiConfig'
import { ThemeProvider } from '../ThemeProvider'
import { ThemeMode, ThemeName } from '../../libs/themes'
import UniversalIcon, { IconNames } from '../Icons'

const MuiIconComponentsDemo = {
  ...sharedUiConfig,
  title: 'Mui Components/Inputs/Icon',
  component: UniversalIcon,
  subcomponent: {},
  parameters: {
    theme: 'light',
    chromatic: {
      disableSnapshot: true
    }
  },
  controls: { sort: 'requiredFirst' }
}

const IconTemplate: Story<
  ComponentProps<typeof UniversalIcon> & {
    themeMode: ThemeMode
  }
> = (args) => {
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={args.themeMode}>
      <UniversalIcon {...args} />
    </ThemeProvider>
  )
}

export const Icon = IconTemplate.bind({})
Icon.args = {
  name: 'Bar1Down',
  color: 'primary',
  fontSize: 'medium',
  sx: { ariaLabel: 'Icon' },
  themeMode: ThemeMode.light
}
Icon.argTypes = {
  name: {
    control: { type: 'select' },
    options: IconNames
  },
  color: {
    control: { type: 'select' },
    options: ['primary', 'secondary', 'error', 'info', 'success', 'warning'],
    defaultValue: 'primary'
  },
  fontSize: {
    control: { type: 'inline-radio' },
    options: ['small', 'medium', 'large']
  },
  themeMode: { control: false }
}

export const IconOnDark = IconTemplate.bind({})
IconOnDark.args = {
  ...Icon.args,
  themeMode: ThemeMode.dark
}
IconOnDark.argTypes = Icon.argTypes

export default MuiIconComponentsDemo as Meta
