import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps, ReactNode } from 'react'

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

import { Typography, TypographyProps } from './Typography'

const TypographyDemo: Meta<typeof Typography> = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: Typography,
  title: 'Journeys-Ui/Typography'
}

type VariantStory = StoryObj<
  ComponentProps<typeof Typography> & {
    variants: TypographyVariant[]
  }
>

const VariantTemplate: VariantStory = {
  render: (args) => (
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
}

export const Variants = {
  ...VariantTemplate,
  args: {
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
}

const TypographyColors = ({
  heading = '',
  ...args
}: TypographyProps & {
  heading?: string
  variants: Array<TypographyColor | null>
}): ReactNode => {
  return (
    <>
      {args.variants.map((variant: TypographyColor | null) => (
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

type ColorTemplateStory = StoryObj<
  ComponentProps<typeof Typography> & { variants: TypographyColor[] }
>

const ColorTemplate: ColorTemplateStory = {
  render: (args) => (
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
}

export const Colors = {
  ...ColorTemplate,
  args: {
    variants: [
      TypographyColor.primary,
      TypographyColor.secondary,
      TypographyColor.error
    ]
  }
}

type AlignmentTemplateStory = StoryObj<
  ComponentProps<typeof Typography> & { variants: TypographyAlign[] }
>

const AlignmentTemplate: AlignmentTemplateStory = {
  render: (args) => (
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
}

export const Alignment = {
  ...AlignmentTemplate,
  args: {
    variants: [
      TypographyAlign.left,
      TypographyAlign.center,
      TypographyAlign.right
    ]
  }
}

export const RTL = {
  ...VariantTemplate,
  args: { ...Variants.args },
  parameters: { rtl: true }
}

export const Urdu = {
  ...VariantTemplate,
  args: { ...RTL.args },
  parameters: {
    rtl: true,
    locale: 'ur',
    // Disable until we get i18n translations in SB
    chromatic: { disableSnapshot: true }
  }
}

export default TypographyDemo
