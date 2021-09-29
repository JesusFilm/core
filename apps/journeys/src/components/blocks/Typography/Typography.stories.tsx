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
  useAlt?: boolean
}

// TODO: Replace with real card component
interface CardProps {
  useAlt?: boolean
  children: ReactNode
}

const Card = ({ children, useAlt = false }: CardProps): ReactElement => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette[useAlt ? 'surfaceAlt' : 'surface'].main,
        color: theme.palette[useAlt ? 'surfaceAlt' : 'surface'].contrastText,
        p: theme.spacing(3),
        borderRadius: 4,
        mb: theme.spacing(3)
      }}
    >
      {children}
    </Box>
  )
}

const ColorCards = ({
  variants,
  heading = '',
  useAlt,
  ...props
}: TypographyStoryProps): ReactElement => {
  return (
    <Card useAlt={useAlt}>
      <Typography {...props} variant={TypographyVariant.h6} content={heading} />
      {variants.map((variant) => (
        <>
          <Typography
            {...props}
            variant={TypographyVariant.overline}
            content={variant ?? 'Default'}
          />
          <Typography
            {...props}
            variant={TypographyVariant.h5}
            color={variant as TypographyColor}
            content="Heading"
          />
        </>
      ))}
    </Card>
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
    <ColorCards {...props} variants={props.variants} heading={'Surface'} />
    <ColorCards
      {...props}
      useAlt
      variants={props.variants}
      heading={'Surface Alt'}
    />
  </div>
)

export const Colors = ColorTemplate.bind({})
Colors.args = {
  variants: [null, 'primary', 'secondary', 'error']
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
