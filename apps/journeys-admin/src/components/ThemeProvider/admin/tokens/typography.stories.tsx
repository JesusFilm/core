import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import Container from '@mui/material/Container'
import MuiTypography, { TypographyTypeMap } from '@mui/material/Typography'

import { simpleComponentConfig } from '../../../../libs/storybook'

const TypographyDemo = {
  ...simpleComponentConfig,
  component: MuiTypography,
  title: 'Admin Theme/Typography'
}

const Template: Story<
  ComponentProps<typeof MuiTypography> & {
    variants: Array<TypographyTypeMap['props']['variant']>
  }
> = (args) => (
  <Container>
    {args.variants.map((variant) => (
      <MuiTypography key={variant} {...args} variant={variant}>
        {variant}
        <br />
      </MuiTypography>
    ))}
  </Container>
)

export const Typography = Template.bind({})
Typography.args = {
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

export default TypographyDemo as Meta
