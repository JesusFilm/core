import FormatAlignCenterRoundedIcon from '@mui/icons-material/FormatAlignCenterRounded'
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded'
import FormatAlignRightRoundedIcon from '@mui/icons-material/FormatAlignRightRounded'
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'
import { ReactNode, useState } from 'react'

import {
  TypographyAlign,
  TypographyVariant
} from '../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../libs/storybook'

import { ToggleButtonGroup } from '.'

const ToggleButtonGroupStory: Meta<typeof ToggleButtonGroup> = {
  ...simpleComponentConfig,
  component: ToggleButtonGroup,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/ToggleButtonGroup',
  parameters: {
    layout: 'fullscreen'
  }
}

const ToggleButtonGroupComponent = ({ ...args }): ReactNode => {
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

const Template: StoryObj<typeof ToggleButtonGroup> = {
  render: ({ ...args }) => <ToggleButtonGroupComponent {...args} />
}

export const Default = { ...Template }

export const CustomLabel = {
  ...Template,
  args: {
    label: 'Typography Alignment'
  }
}

export const CustomOptions = {
  ...Template,
  args: {
    initialValue: TypographyVariant.h1,
    options: [
      {
        value: TypographyVariant.h1,
        label: (
          <Typography variant={TypographyVariant.h1}>Heading 1</Typography>
        ),
        icon: <HorizontalRuleRoundedIcon />
      },
      {
        value: TypographyVariant.h2,
        label: (
          <Typography variant={TypographyVariant.h2}>Heading 2</Typography>
        ),
        icon: <HorizontalRuleRoundedIcon />
      }
    ]
  }
}

export default ToggleButtonGroupStory
