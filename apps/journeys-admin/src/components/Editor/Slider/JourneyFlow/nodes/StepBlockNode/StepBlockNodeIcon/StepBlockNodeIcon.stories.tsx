import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { simpleComponentConfig } from '../../../../../../../libs/storybook'

import { StepBlockNodeIcon } from '.'

const StepBlockNodeIconStory: Meta<typeof StepBlockNodeIcon> = {
  ...simpleComponentConfig,
  component: StepBlockNodeIcon,
  title:
    'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/StepBlockNode/StepBlockNodeIcon'
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof StepBlockNodeIcon>> = {
  render: ({ typename }) => {
    return <StepBlockNodeIcon typename={typename} />
  }
}

export const Default = {
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

export default StepBlockNodeIconStory
