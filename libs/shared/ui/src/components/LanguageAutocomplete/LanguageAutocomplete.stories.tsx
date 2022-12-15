import { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import Box from '@mui/material/Box'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { LanguageAutocomplete, LanguageOption, Language } from '.'

const LanguageAutocompleteStory = {
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

const Template: Story = ({ onChange }) => {
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

export const Default = Template.bind({})
Default.play = () => {
  const button = screen.getAllByRole('button', { name: 'Open' })[0]
  userEvent.click(button)
}

export default LanguageAutocompleteStory as Meta
