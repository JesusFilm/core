import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { StepBlockNodeIcon } from '.'

const StepBlockNodeIconStory: Meta<typeof StepBlockNodeIcon> = {
  ...simpleComponentConfig,
  component: StepBlockNodeIcon,
  title:
    'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/StepBlockNode/StepBlockNodeIcon'
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof StepBlockNodeIcon>> = {
  render: ({ typename, showMultiIcon }) => {
    return (
      <StepBlockNodeIcon typename={typename} showMultiIcon={showMultiIcon} />
    )
  }
}

export const Default = {
  ...Template,
  args: {
    typename: 'IconBlock'
  }
}

export const Image = {
  ...Template,
  args: {
    typename: 'ImageBlock'
  }
}

export const Video = {
  ...Template,
  args: {
    typename: 'VideoBlock'
  }
}

export const TextResponse = {
  ...Template,
  args: {
    typename: 'TextResponseBlock'
  }
}

export const Button = {
  ...Template,
  args: {
    typename: 'ButtonBlock'
  }
}

export const Typography = {
  ...Template,
  args: {
    typename: 'TypographyBlock'
  }
}

export const RadioQuestion = {
  ...Template,
  args: {
    typename: 'RadioQuestionBlock'
  }
}

export const SignUp = {
  ...Template,
  args: {
    typename: 'SignUpBlock'
  }
}

export const Multiple = {
  ...Template,
  args: {
    typename: 'ButtonBlock',
    showMultiIcon: true
  }
}

export default StepBlockNodeIconStory
