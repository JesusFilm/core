import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ReactElement, useState } from 'react'
import { screen, userEvent } from 'storybook/test'

import { simpleComponentConfig } from '../../libs/simpleComponentConfig'

import {
  Language,
  LanguageOption,
  MultipleLanguageAutocomplete
} from './MultipleLanguageAutocomplete'

const LanguageAutocompleteStory: Meta<typeof MultipleLanguageAutocomplete> = {
  ...simpleComponentConfig,
  component: MultipleLanguageAutocomplete,
  title: 'Shared-Ui/MultipleLanguageAutocomplete',
  argTypes: { onChange: { action: 'onChange' } },
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const languages: Language[] = [
  {
    id: '529',
    name: [
      {
        value: 'English',
        primary: true
      }
    ]
  },
  {
    id: '496',
    name: [
      {
        value: 'Français',
        primary: true
      },
      {
        value: 'French',
        primary: false
      }
    ]
  },
  {
    id: '1106',
    name: [
      {
        value: 'Deutsch',
        primary: true
      },
      {
        value: 'German, Standard',
        primary: false
      }
    ]
  }
]

function LanguageAutocompleteTemplate({
  onChange
}: {
  onChange: (value?: readonly LanguageOption[]) => void
}): ReactElement {
  const [values, setValues] = useState<LanguageOption[]>([
    {
      id: '529',
      localName: undefined,
      nativeName: 'English'
    },
    {
      id: '1106',
      localName: 'German, Standard',
      nativeName: 'Deutsch'
    }
  ])

  const handleChange = (value?: readonly LanguageOption[]): void => {
    setValues(value ? [...value] : [])
    onChange(value)
  }

  return (
    <Box sx={{ m: 4 }}>
      <MultipleLanguageAutocomplete
        onChange={handleChange}
        values={values}
        languages={languages}
        loading={false}
      />
    </Box>
  )
}

const Template: StoryObj<typeof MultipleLanguageAutocomplete> = {
  render: ({ onChange }) => <LanguageAutocompleteTemplate onChange={onChange} />
}

export const Default = {
  ...Template,
  play: async () => {
    await userEvent.click(screen.getAllByRole('button', { name: 'Open' })[0])
  }
}

export default LanguageAutocompleteStory
