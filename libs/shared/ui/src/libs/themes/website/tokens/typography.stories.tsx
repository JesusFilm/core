import { Story, Meta } from '@storybook/react'
import Container from '@mui/material/Container'
import MuiTypography, { TypographyTypeMap } from '@mui/material/Typography'

import { simpleComponentConfig } from '../../../simpleComponentConfig'
import { ThemeName } from '../..'

const TypographyDemo = {
  ...simpleComponentConfig,
  component: MuiTypography,
  title: 'Website Theme',
  parameters: {
    ...simpleComponentConfig.parameters,
    themeName: ThemeName.website,
    theme: 'all'
  }
}

const Template: Story<
  Parameters<typeof MuiTypography>[0] & {
    variants: Array<TypographyTypeMap['props']['variant']>
  }
> = (args) => (
  <Container>
    {args.variants.map((variant) => (
      <MuiTypography {...args} variant={variant}>
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
