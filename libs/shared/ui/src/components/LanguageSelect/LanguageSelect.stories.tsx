import { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import Box from '@mui/material/Box'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { LanguageFields } from './__generated__/LanguageFields'
import { LanguageSelect, LanguageSelectOption } from '.'

const LanguageSelectStory = {
  ...simpleComponentConfig,
  component: LanguageSelect,
  title: 'Shared-Ui/LanguageSelect',
  argTypes: { onChange: { action: 'onChange' } },
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const languages: LanguageFields[] = [
  {
    __typename: 'Language',
    id: '529',
    name: [
      {
        value: 'English',
        primary: true,
        __typename: 'Translation'
      }
    ]
  },
  {
    id: '496',
    __typename: 'Language',
    name: [
      {
        value: 'Français',
        primary: true,
        __typename: 'Translation'
      },
      {
        value: 'French',
        primary: false,
        __typename: 'Translation'
      }
    ]
  },
  {
    id: '1106',
    __typename: 'Language',
    name: [
      {
        value: 'Deutsch',
        primary: true,
        __typename: 'Translation'
      },
      {
        value: 'German, Standard',
        primary: false,
        __typename: 'Translation'
      }
    ]
  }
]

const Template: Story = ({ onChange }) => {
  const [value, setValue] = useState<LanguageSelectOption | undefined>({
    id: '529',
    localName: undefined,
    nativeName: 'English'
  })

  const handleChange = (value?: LanguageSelectOption): void => {
    setValue(value)
    onChange(value)
  }

  return (
    <Box sx={{ m: 4 }}>
      <LanguageSelect
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
  const button = screen.getByRole('button', { name: 'Open' })
  userEvent.click(button)
}

export default LanguageSelectStory as Meta
