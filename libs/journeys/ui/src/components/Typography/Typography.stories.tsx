import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import {
  ThemeMode,
  ThemeName,
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../__generated__/globalTypes'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { StoryCard } from '../StoryCard'

import { Typography } from './Typography'

const TypographyDemo = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: Typography,
  title: 'Journeys-Ui/Typography'
}

const VariantTemplate: Story<
  ComponentProps<typeof Typography> & {
    variants: TypographyVariant[]
  }
> = (args) => (
  <StoryCard>
    {args.variants.map((variant) => (
      <Typography
        {...args}
        id="id"
        key={variant}
        variant={variant}
        content={variant ?? ''}
      />
    ))}
  </StoryCard>
)

export const Variants = VariantTemplate.bind({})
Variants.args = {
  variants: [
    TypographyVariant.h1,
    TypographyVariant.h2,
    TypographyVariant.h3,
    TypographyVariant.h4,
    TypographyVariant.h5,
    TypographyVariant.h6,
    TypographyVariant.subtitle1,
    TypographyVariant.subtitle2,
    TypographyVariant.body1,
    TypographyVariant.body2,
    TypographyVariant.caption,
    TypographyVariant.overline
  ]
}

const TypographyColors: Story<
  ComponentProps<typeof Typography> & {
    variants: Array<TypographyColor | null>
    heading?: string
  }
> = ({ heading = '', ...args }) => {
  return (
    <>
      {args.variants.map((variant) => (
        <>
          <Typography
            {...args}
            id="id"
            variant={TypographyVariant.overline}
            content={variant ?? heading}
          />
          <Typography
            {...args}
            id="id"
            variant={TypographyVariant.h5}
            color={variant}
            content="Heading"
          />
        </>
      ))}
    </>
  )
}

const ColorTemplate: Story<
  ComponentProps<typeof Typography> & { variants: TypographyColor[] }
> = (args) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: '580px',
      justifyContent: 'space-between'
    }}
  >
    <StoryCard themeMode={ThemeMode.light} themeName={ThemeName.base}>
      <TypographyColors {...args} variants={[null]} heading="Default " />
      <TypographyColors {...args} variants={args.variants} />
    </StoryCard>
    <StoryCard themeMode={ThemeMode.dark} themeName={ThemeName.base}>
      <TypographyColors {...args} variants={[null]} heading="Default" />
      <TypographyColors
        {...args}
        variants={args.variants}
        heading="Override colors"
      />
    </StoryCard>
  </div>
)

export const Colors = ColorTemplate.bind({})
Colors.args = {
  variants: [
    TypographyColor.primary,
    TypographyColor.secondary,
    TypographyColor.error
  ]
}

const AlignmentTemplate: Story<
  ComponentProps<typeof Typography> & { variants: TypographyAlign[] }
> = (args) => (
  <StoryCard>
    {args.variants.map((variant) => (
      <Typography
        {...args}
        id="id"
        key={variant}
        variant={TypographyVariant.h6}
        align={variant}
        content={variant ?? ''}
      />
    ))}
  </StoryCard>
)

export const Alignment = AlignmentTemplate.bind({})
Alignment.args = {
  variants: [
    TypographyAlign.left,
    TypographyAlign.center,
    TypographyAlign.right
  ]
}

export const RTL = VariantTemplate.bind({})
RTL.args = { ...Variants.args }
RTL.parameters = { rtl: true }

export const Urdu = VariantTemplate.bind({})
Urdu.args = { ...RTL.args }
Urdu.parameters = {
  rtl: true,
  locale: 'ur',
  // Disable until we get i18n translations in SB
  chromatic: { disableSnapshot: true }
}

export default TypographyDemo as Meta
