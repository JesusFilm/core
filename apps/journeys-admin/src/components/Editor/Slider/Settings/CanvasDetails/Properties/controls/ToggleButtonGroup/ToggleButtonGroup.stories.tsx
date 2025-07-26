import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ReactNode, useState } from 'react'

import AlignCenterIcon from '@core/shared/ui/icons/AlignCenter'
import AlignLeftIcon from '@core/shared/ui/icons/AlignLeft'
import AlignRightIcon from '@core/shared/ui/icons/AlignRight'
import DashIcon from '@core/shared/ui/icons/Dash'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import {
  TypographyAlign,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'

import { ToggleButtonGroup } from '.'

const ToggleButtonGroupStory: Meta<typeof ToggleButtonGroup> = {
  ...simpleComponentConfig,
  component: ToggleButtonGroup,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/controls/ToggleButtonGroup',
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
      icon: <AlignLeftIcon />
    },
    {
      value: TypographyAlign.center,
      label: 'Center',
      icon: <AlignCenterIcon />
    },
    {
      value: TypographyAlign.right,
      label: 'Right',
      icon: <AlignRightIcon />
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
        icon: <DashIcon />
      },
      {
        value: TypographyVariant.h2,
        label: (
          <Typography variant={TypographyVariant.h2}>Heading 2</Typography>
        ),
        icon: <DashIcon />
      }
    ]
  }
}

export default ToggleButtonGroupStory
