import { ReactElement } from 'react'
import { Story, Meta } from '@storybook/react'

import { Typography } from './Typography'
import {
  ThemeMode,
  ThemeName,
  TypographyVariant,
  TypographyColor,
  TypographyAlign
} from '../../../../__generated__/globalTypes'
import {
  journeysConfig,
  simpleComponentConfig,
  StoryCard
} from '../../../libs/storybook'
import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/TreeBlock'

const TypographyDemo = {
  ...journeysConfig,
  ...simpleComponentConfig,
  component: Typography,
  title: 'Journeys/Blocks/Typography'
}

interface TypographyStoryProps extends TreeBlock<TypographyBlock> {
  variants: Array<string | null>
  heading?: string
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
  <StoryCard>
    {props.variants.map((variant) => (
      <Typography
        {...props}
        key={variant}
        variant={variant as TypographyVariant}
        content={variant ?? ''}
      />
    ))}
  </StoryCard>
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
      flexDirection: 'column',
      height: '580px',
      justifyContent: 'space-between'
    }}
  >
    <StoryCard themeMode={ThemeMode.light} themeName={ThemeName.base}>
      <TypographyColors {...props} variants={[null]} heading={'Default '} />
      <TypographyColors {...props} variants={props.variants} />
    </StoryCard>
    <StoryCard themeMode={ThemeMode.dark} themeName={ThemeName.base}>
      <TypographyColors {...props} variants={[null]} heading={'Default'} />
      <TypographyColors
        {...props}
        variants={props.variants}
        heading={'Override colors'}
      />
    </StoryCard>
  </div>
)

export const Colors = ColorTemplate.bind({})
Colors.args = {
  variants: ['primary', 'secondary', 'error']
}

const AlignmentTemplate: Story<TypographyStoryProps> = (props) => (
  <StoryCard>
    {props.variants.map((variant) => (
      <Typography
        {...props}
        key={variant}
        variant={TypographyVariant.h6}
        align={variant as TypographyAlign}
        content={variant ?? ''}
      />
    ))}
  </StoryCard>
)

export const Alignment = AlignmentTemplate.bind({})
Alignment.args = {
  variants: ['left', 'center', 'right']
}

export default TypographyDemo as Meta
