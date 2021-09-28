import { ReactElement, ReactNode } from 'react'
import { Story, Meta } from '@storybook/react'
import { useTheme } from '@mui/material'
import { Box } from '@mui/system'

import { Typography, TypographyProps } from './Typography'
import {
  TypographyVariant,
  TypographyColor,
  TypographyAlign
} from '../../../../__generated__/globalTypes'
import { journeysConfig } from '../../../libs/storybook/decorators'

const TypographyDemo = {
  ...journeysConfig,
  component: Typography,
  title: 'Journeys/Blocks/Typography'
}

interface TypographyStoryProps extends TypographyProps {
  variants: Array<string | null>
  heading?: string
}

// TODO: Replace with real card component
interface CardProps {
  background?: string
  children: ReactNode
}

const Card = ({
  background = 'primary',
  children
}: CardProps): ReactElement => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor:
          background === 'background'
            ? background
            : theme.palette[background].main,
        color:
          background === 'background'
            ? theme.palette.text.primary
            : theme.palette[background].contrastText,
        p: theme.spacing(3),
        borderRadius: 4,
        mb: theme.spacing(3)
      }}
    >
      {children}
    </Box>
  )
}

const TypographyColors = ({
  variants,
  heading = '',
  ...props
}: TypographyStoryProps): ReactElement => {
  return (
    <>
      {variants.map((variant) => (
        <>
          <Typography
            {...props}
            variant={TypographyVariant.overline}
            content={variant ?? heading}
          />
          <Typography
            {...props}
            variant={TypographyVariant.h5}
            color={variant as TypographyColor}
            content="Heading"
          />
        </>
      ))}
    </>
  )
}

const VariantTemplate: Story<TypographyStoryProps> = (props) => (
  <Card>
    {props.variants.map((variant) => (
      <Typography
        {...props}
        key={variant}
        variant={variant as TypographyVariant}
        content={variant ?? ''}
      />
    ))}
  </Card>
)

export const Variants = VariantTemplate.bind({})
Variants.args = {
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
    'caption',
    'overline'
  ]
}

const ColorTemplate: Story<TypographyStoryProps> = (props) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <Card>
      <TypographyColors
        {...props}
        variants={[null]}
        heading={'Default on Primary'}
      />
    </Card>
    <Card background={'secondary'}>
      <TypographyColors
        {...props}
        variants={[null]}
        heading={'Default on Secondary'}
      />
    </Card>
    <Card background={'background'}>
      <Typography
        {...props}
        variant={TypographyVariant.h6}
        content={'Override Colors'}
      />
      <TypographyColors
        {...props}
        variants={props.variants}
        heading={'Override colors'}
      />
    </Card>
  </div>
)

export const Colors = ColorTemplate.bind({})
Colors.args = {
  variants: ['primary', 'secondary', 'error']
}

const AlignmentTemplate: Story<TypographyStoryProps> = (props) => (
  <Card>
    {props.variants.map((variant) => (
      <Typography
        {...props}
        key={variant}
        variant={TypographyVariant.h6}
        align={variant as TypographyAlign}
        content={variant ?? ''}
      />
    ))}
  </Card>
)

export const Alignment = AlignmentTemplate.bind({})
Alignment.args = {
  variants: ['left', 'center', 'right']
}

export default TypographyDemo as Meta
