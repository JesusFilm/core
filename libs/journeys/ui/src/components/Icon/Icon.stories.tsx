import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import {
  IconColor,
  IconName,
  IconSize,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { JourneyProvider } from '../../libs/JourneyProvider'
import {
  JourneyFields as Journey,
  JourneyFields_language as Language
} from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'

import { Icon } from '.'

const IconDemo = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: Icon,
  title: 'Journeys-Ui/Icon'
}

const VariantTemplate: Story<
  ComponentProps<typeof Icon> & { variants: IconName[]; language: Language }
> = ({ ...args }) => (
  <JourneyProvider
    value={{
      journey: {
        id: 'journeyId',
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        language: args.language
      } as unknown as Journey,
      variant: 'admin'
    }}
  >
    <Container>
      <Grid container spacing={6} columns={{ xs: 4, sm: 8, md: 12 }}>
        {args.variants.map((variant, i) => (
          <Grid
            container
            item
            key={i}
            xs={2}
            sm={4}
            md={4}
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Icon {...args} iconName={variant} />
            <Typography mt={1} variant="caption">{`${
              variant === IconName.ArrowBackRounded
                ? 'ArrowLeftRounded'
                : variant === IconName.ArrowForwardRounded
                ? 'ArrowRightRounded'
                : variant
            }`}</Typography>
          </Grid>
        ))}
      </Grid>
    </Container>
  </JourneyProvider>
)

// Add ArrowBackRounded, ChevronLeftRounded
export const Variant = VariantTemplate.bind({})
Variant.args = {
  __typename: 'IconBlock',
  iconColor: null,
  iconSize: IconSize.lg,
  variants: [
    IconName.ArrowForwardRounded,
    IconName.ArrowBackRounded,
    IconName.BeenhereRounded,
    IconName.ChatBubbleOutlineRounded,
    IconName.CheckCircleRounded,
    IconName.ChevronRightRounded,
    IconName.ChevronLeftRounded,
    IconName.ContactSupportRounded,
    IconName.FormatQuoteRounded,
    IconName.LiveTvRounded,
    IconName.LockOpenRounded,
    IconName.MenuBookRounded,
    IconName.PlayArrowRounded,
    IconName.RadioButtonUncheckedRounded,
    IconName.SendRounded,
    IconName.SubscriptionsRounded,
    IconName.TranslateRounded
  ],
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'Translation',
        value: 'English',
        primary: true
      }
    ]
  }
}

const ColorTemplate: Story<
  ComponentProps<typeof Icon> & { variants: IconColor[] }
> = ({ ...args }) => (
  <Container>
    {args.variants.map((variant, i) => (
      <Box
        key={i}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <Typography>{`${variant}`}</Typography>
        <Icon {...args} iconColor={variant} />
      </Box>
    ))}
  </Container>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  __typename: 'IconBlock',
  iconName: IconName.CheckCircleRounded,
  iconSize: IconSize.lg,
  variants: [
    IconColor.inherit,
    IconColor.primary,
    IconColor.secondary,
    IconColor.error,
    IconColor.action,
    IconColor.disabled
  ]
}

const SizeTemplate: Story<
  ComponentProps<typeof Icon> & { variants: IconSize[] }
> = ({ ...args }) => (
  <Container>
    {args.variants.map((variant, i) => (
      <Box
        key={i}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <Typography>{`${variant}`}</Typography>
        <Icon {...args} iconSize={variant} />
      </Box>
    ))}
  </Container>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  id: 'icon',
  __typename: 'IconBlock',
  iconName: IconName.CheckCircleRounded,
  iconColor: null,
  variants: [
    IconSize.inherit,
    IconSize.sm,
    IconSize.md,
    IconSize.lg,
    IconSize.xl
  ]
}

export const RTL = VariantTemplate.bind({})
RTL.args = {
  ...Variant.args,
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'ar',
    iso3: 'arb',
    name: [
      {
        __typename: 'Translation',
        value: 'Arabic',
        primary: false
      }
    ]
  }
}

export default IconDemo as Meta
