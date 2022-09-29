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

const Template: Story = ({ ...args }) => {
  const [value, setValue] = useState(args.initialValue ?? TypographyAlign.left)

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
    <ToggleButtonGroup
      label={args.label}
      value={value}
      onChange={setValue}
      options={args.options ?? options}
    />
  )
}

export const Default = Template.bind({})

export const CustomLabel = Template.bind({})
CustomLabel.args = {
  label: 'Typography Alignment'
}

export const CustomOptions = Template.bind({})
CustomOptions.args = {
  initialValue: TypographyVariant.h1,
  options: [
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
}

export default ToggleButtonGroupStory as Meta
