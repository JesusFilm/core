import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { ReactElement, useState } from 'react'

import { simpleComponentConfig } from '../../libs/simpleComponentConfig'

import type { LanguageOptionVariant } from './LanguageAutocomplete'

import { Language, LanguageAutocomplete } from '.'

const LanguageAutocompleteStory: Meta<typeof LanguageAutocomplete> = {
  ...simpleComponentConfig,
  component: LanguageAutocomplete,
  title: 'Shared-Ui/LanguageAutocomplete',
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
  onChange: (value: LanguageOptionVariant | undefined) => void
}): ReactElement {
  const [value, setValue] = useState<LanguageOptionVariant | undefined>({
    id: '529',
    localName: undefined,
    nativeName: 'English'
  })

  const handleChange = (value?: LanguageOptionVariant): void => {
    setValue(value)
    onChange(value)
  }

  return (
    <Box sx={{ m: 4 }}>
      <LanguageAutocomplete
        onChange={handleChange}
        value={value}
        languages={languages}
        loading={false}
      />
    </Box>
  )
}

const Template: StoryObj<typeof LanguageAutocomplete> = {
  render: ({ onChange }) => <LanguageAutocompleteTemplate onChange={onChange} />
}

export const Default = {
  ...Template,
  play: async () => {
    await userEvent.click(screen.getAllByRole('button', { name: 'Open' })[0])
  }
}

export default LanguageAutocompleteStory
