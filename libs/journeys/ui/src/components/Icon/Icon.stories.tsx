import { Story, Meta } from '@storybook/react'
import { Box } from '@mui/system'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import {
  IconName,
  IconSize,
  IconColor
} from '../../../__generated__/globalTypes'
import { ButtonFields_startIcon as IconType } from '../Button/__generated__/ButtonFields'
import { journeyUiConfig, simpleComponentConfig } from '../..'
import { Icon } from '.'

const IconDemo = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: Icon,
  title: 'Journeys-Ui/Icon'
}

interface IconStoryProps extends IconType {
  variants: string[]
}

const VariantTemplate: Story<IconStoryProps> = ({ ...args }) => (
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
          <Icon {...args} name={variant as IconName} />
          <Typography mt={1} variant={'caption'}>{`${variant}`}</Typography>
        </Grid>
      ))}
    </Grid>
  </Container>
)

export const Variant = VariantTemplate.bind({})
Variant.args = {
  __typename: 'Icon',
  color: null,
  size: IconSize.lg,
  variants: [
    IconName.ArrowForwardRounded,
    IconName.BeenhereRounded,
    IconName.ChatBubbleOutlineRounded,
    IconName.CheckCircleRounded,
    IconName.ChevronRightRounded,
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
  ]
}

const ColorTemplate: Story<IconStoryProps> = ({ ...args }) => (
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
        <Icon {...args} color={variant as IconColor} />
      </Box>
    ))}
  </Container>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  __typename: 'Icon',
  name: IconName.CheckCircleRounded,
  size: IconSize.lg,
  variants: [
    IconColor.inherit,
    IconColor.primary,
    IconColor.secondary,
    IconColor.error,
    IconColor.action,
    IconColor.disabled
  ]
}

const SizeTemplate: Story<IconStoryProps> = ({ ...args }) => (
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
        <Icon {...args} size={variant as IconSize} />
      </Box>
    ))}
  </Container>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  __typename: 'Icon',
  name: IconName.CheckCircleRounded,
  color: null,
  variants: [
    IconSize.inherit,
    IconSize.sm,
    IconSize.md,
    IconSize.lg,
    IconSize.xl
  ]
}

export default IconDemo as Meta
