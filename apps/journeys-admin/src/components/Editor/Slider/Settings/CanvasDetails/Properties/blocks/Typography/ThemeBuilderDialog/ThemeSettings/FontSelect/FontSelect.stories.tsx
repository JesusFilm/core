import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import Header1Icon from '@core/shared/ui/icons/Header1'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { FontSelect } from '.'

const FontSelectStory: Meta<typeof FontSelect> = {
  ...simpleComponentConfig,
  component: FontSelect,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Typography/ThemeBuilderDialog/ThemeSettings/FontSelect'
}

const Template: StoryObj<ComponentProps<typeof FontSelect>> = {
  render: (args) => <FontSelect {...args} />
}

export const Default = {
  ...Template,
  args: {
    label: 'Font Family',
    value: 'Roboto',
    options: ['Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Poppins'],
    onChange: (font: string) => console.log('Font changed:', font),
    icon: <Header1Icon />,
    labelId: 'font-family-label',
    selectId: 'font-family-select'
  }
}

export const WithHelperText = {
  ...Template,
  args: {
    label: 'Font Family',
    value: 'Open Sans',
    options: ['Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Poppins'],
    onChange: (font: string) => console.log('Font changed:', font),
    icon: <Header1Icon />,
    labelId: 'font-family-helper-label',
    selectId: 'font-family-helper-select',
    helperText: 'Choose a font for your typography'
  }
}

export const Empty = {
  ...Template,
  args: {
    label: 'Font Family',
    value: '',
    options: ['Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Poppins'],
    onChange: (font: string) => console.log('Font changed:', font),
    icon: <Header1Icon />,
    labelId: 'font-family-empty-label',
    selectId: 'font-family-empty-select'
  }
}

export default FontSelectStory
