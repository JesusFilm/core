import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded'
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded'
import FormatAlignCenterRoundedIcon from '@mui/icons-material/FormatAlignCenterRounded'
import FormatAlignRightRoundedIcon from '@mui/icons-material/FormatAlignRightRounded'
import Typography from '@mui/material/Typography'
import {
  TypographyAlign,
  TypographyVariant
} from '../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { ToggleButtonGroup } from '.'

const ToggleButtonGroupStory = {
  ...simpleComponentConfig,
  component: ToggleButtonGroup,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/ToggleButtonGroup',
  layout: 'fullscreen'
}

export const Default: Story = () => {
  const [value, setValue] = useState(TypographyAlign.left)

  const options = [
    {
      value: TypographyAlign.left,
      label: 'Left',
      icon: <FormatAlignLeftRoundedIcon />
    },
    {
      value: TypographyAlign.center,
      label: 'Center',
      icon: <FormatAlignCenterRoundedIcon />
    },
    {
      value: TypographyAlign.right,
      label: 'Right',
      icon: <FormatAlignRightRoundedIcon />
    }
  ]

  return (
    <ToggleButtonGroup value={value} onChange={setValue} options={options} />
  )
}
export const CustomLabel: Story = () => {
  const [value, setValue] = useState(TypographyVariant.h1)
  const options = [
    {
      value: TypographyVariant.h1,
      label: <Typography variant={TypographyVariant.h1}>Heading 1</Typography>,
      icon: <HorizontalRuleRoundedIcon />
    },
    {
      value: TypographyVariant.h2,
      label: <Typography variant={TypographyVariant.h2}>Heading 2</Typography>,
      icon: <HorizontalRuleRoundedIcon />
    }
  ]

  return (
    <ToggleButtonGroup value={value} onChange={setValue} options={options} />
  )
}

export default ToggleButtonGroupStory as Meta
