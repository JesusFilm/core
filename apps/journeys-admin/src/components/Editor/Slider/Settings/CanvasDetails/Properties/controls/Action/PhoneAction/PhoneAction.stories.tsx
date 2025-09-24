import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { steps } from '../data'

import { PhoneAction } from '.'

const PhoneActionStory: Meta<typeof PhoneAction> = {
  ...simpleComponentConfig,
  component: PhoneAction,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/PhoneAction'
}

const Template: StoryObj<typeof PhoneAction> = {
  render: () => {
    const selectedBlock = steps[1].children[0].children[5]
    return (
      <EditorProvider initialState={{ selectedBlock }}>
        <PhoneAction />
      </EditorProvider>
    )
  }
}

export const Default: StoryObj<typeof PhoneAction> = {
  ...Template
}

export const Required: StoryObj<typeof PhoneAction> = {
  ...Template,
  play: async () => {
    const textfield = screen.getByRole('textbox', { name: 'Phone number' })
    await userEvent.clear(textfield)
  }
}

export const Invalid: StoryObj<typeof PhoneAction> = {
  ...Template,
  play: async () => {
    const textfield = screen.getByRole('textbox', { name: 'Phone number' })
    await userEvent.clear(textfield)
    await userEvent.type(textfield, 'not-a-phone-number')
  }
}

export default PhoneActionStory
