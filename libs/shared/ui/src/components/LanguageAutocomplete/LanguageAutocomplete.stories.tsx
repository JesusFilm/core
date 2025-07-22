import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ReactElement, useState } from 'react'
import { screen, userEvent } from 'storybook/test'

import { simpleComponentConfig } from '../../libs/simpleComponentConfig'

import { Language, LanguageAutocomplete, LanguageOption } from '.'

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
    id: '496',
    slug: 'french',
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
    id: '529',
    slug: 'english',
    name: [
      {
        value: 'English',
        primary: true
      }
    ]
  },
  {
    id: '1106',
    slug: 'german-standard',
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
  onChange: (value: LanguageOption | undefined) => void
}): ReactElement {
  const [value, setValue] = useState<LanguageOption | undefined>({
    id: '529',
    localName: undefined,
    nativeName: 'English'
  })

  const handleChange = (value?: LanguageOption): void => {
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
