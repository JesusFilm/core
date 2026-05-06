import Container from '@mui/material/Container'
import MuiTypography, { TypographyTypeMap } from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { ThemeName } from '../..'
import { simpleComponentConfig } from '../../../simpleComponentConfig'

const TypographyDemo: Meta<typeof MuiTypography> = {
  ...simpleComponentConfig,
  component: MuiTypography,
  title: 'Website Theme',
  parameters: {
    ...simpleComponentConfig.parameters,
    themeName: ThemeName.website,
    theme: 'all'
  }
}

const Template: StoryObj<
  ComponentProps<typeof MuiTypography> & {
    variants: Array<TypographyTypeMap['props']['variant']>
  }
> = {
  render: (args) => (
    <Container>
      {args.variants.map((variant) => (
        <MuiTypography key={variant} {...args} variant={variant}>
          {variant}
          <br />
        </MuiTypography>
      ))}
    </Container>
  )
}

export const Typography = {
  ...Template,
  args: {
    variants: [
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
      'overline1',
      'overline2'
    ]
  }
}

export default TypographyDemo
