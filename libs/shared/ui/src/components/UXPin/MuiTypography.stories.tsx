import { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import MuiTypography from '@mui/material/Typography'
import { sharedUiConfig } from '../../libs/sharedUiConfig'
import { ThemeProvider } from '../ThemeProvider'
import { ThemeMode, ThemeName } from '../../libs/themes'

const MuiTypographyComponentsDemo = {
  ...sharedUiConfig,
  title: 'Mui Components/Data Display',
  component: MuiTypography,
  parameters: {
    theme: 'light',
    chromatic: {
      disableSnapshot: true
    }
  },
  controls: { sort: 'requiredFirst' }
}

const TypographyTemplate: Story<
  ComponentProps<typeof MuiTypography> & { themeMode: ThemeMode }
> = (args) => {
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={args.themeMode}>
      <MuiTypography {...args}>{args.children}</MuiTypography>
    </ThemeProvider>
  )
}

export const Typography = TypographyTemplate.bind({})
Typography.args = {
  children: 'Typography',
  variant: 'body1',
  align: 'left',
  color: 'primary.main',
  display: 'initial',
  gutterBottom: false,
  paragraph: false,
  noWrap: false,
  sx: {
    ariaLabel: 'Typography',
    padding: '0px 0px 0px 0px',
    margin: '0px 0px 0px 0px'
  },
  themeMode: ThemeMode.light
}
Typography.argTypes = {
  children: {
    name: 'content'
  },
  variant: {
    control: { type: 'select' },
    options: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'subtitle1',
      'subtitle2',
      'body1',
      'body2',
      'caption',
      'button',
      'overline'
    ]
  },
  align: {
    control: { type: 'select' },
    options: ['left', 'center', 'right', 'justify']
  },
  color: {
    control: { type: 'select' },
    options: [
      'white',
      'grey.100',
      'grey.200',
      'grey.300',
      'grey.400',
      'grey.500',
      'primary.main',
      'primary.light',
      'primary.dark',
      'secondary.main',
      'secondary.light',
      'secondary.dark',
      'error.main',
      'warning.main',
      'info.main',
      'success.main',
      'text.primary',
      'text.secondary',
      'text.disabled'
    ]
  },
  display: {
    control: { type: 'select' },
    options: ['initial', 'block', 'inline']
  },
  themeMode: { control: false }
}

export default MuiTypographyComponentsDemo as Meta
