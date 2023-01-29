import { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import Box from '@mui/material/Box'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { TitleAutocomplete, TitleOption, Title } from '.'

const TitleAutocompleteStory = {
  ...simpleComponentConfig,
  component: TitleAutocomplete,
  title: 'Shared-Ui/TitleAutocomplete',
  argTypes: { onChange: { action: 'onChange' } },
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const titles: Title[] = [
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
  const [value, setValue] = useState<TitleOption | undefined>({
    id: '529',
    localName: undefined,
    nativeName: 'English'
  })

  const handleChange = (value?: TitleOption): void => {
    setValue(value)
    onChange(value)
  }

  return (
    <Box sx={{ m: 4 }}>
      <TitleAutocomplete
        onChange={handleChange}
        value={value}
        titles={titles}
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

export default TitleAutocompleteStory as Meta
