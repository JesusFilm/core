import { Story, Meta } from '@storybook/react'
import { Icon } from '.'
import { Box } from '@mui/system'
import { Typography } from '@mui/material'
import {
  IconName,
  IconSize,
  IconColor
} from '../../../__generated__/globalTypes'

import { ButtonFields_startIcon as IconType } from '../../../__generated__/ButtonFields'
import { journeysConfig, StoryCard } from '../../libs/storybook'

const IconDemo = {
  ...journeysConfig,
  component: Icon,
  title: 'Journeys/Icon'
}

interface IconStoryProps extends IconType {
  variants: string[]
}

const VariantTemplate: Story<IconStoryProps> = ({ ...args }) => (
  <StoryCard>
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
        <Icon {...args} name={variant as IconName} />
      </Box>
    ))}
  </StoryCard>
)

export const Variant = VariantTemplate.bind({})
Variant.args = {
  __typename: 'Icon',
  color: null,
  size: IconSize.lg,
  variants: [
    IconName.arrowForward,
    IconName.chatBubbleOutline,
    IconName.checkCircle,
    IconName.formatQuote,
    IconName.liveTv,
    IconName.lockOpen,
    IconName.menuBook,
    IconName.playArrow,
    IconName.radioButtonUnchecked,
    IconName.translate
  ]
}

const ColorTemplate: Story<IconStoryProps> = ({ ...args }) => (
  <StoryCard>
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
  </StoryCard>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  __typename: 'Icon',
  name: IconName.checkCircle,
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
  <StoryCard>
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
  </StoryCard>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  __typename: 'Icon',
  name: IconName.checkCircle,
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
