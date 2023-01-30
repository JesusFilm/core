import { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import Box from '@mui/material/Box'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { TitleAutocomplete, Title } from '.'

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
    id: '2_GOJ4925-0-0',
    label: 'segment',
    title: [{ value: 'The Good Shepherd' }]
  },
  {
    id: '2_GOJ4926-0-0',
    label: 'segment',
    title: [{ value: 'Are You Messiah?' }]
  },
  {
    id: '2_GOJ4927-0-0',
    label: 'segment',
    title: [{ value: 'Lazarus Dies' }]
  }
]

// export interface Title {
//   id: string
//   title: Translation[]
//   label: string
// }

// export interface Translation {
//   value: string
// }

// export interface Title {
//   id: string
//   label: string
//   name: string
// }

const Template: Story = ({ onChange }) => {
  const [value, setValue] = useState<Title | undefined>({
    id: '2_GOJ4925-0-0',
    label: 'segment',
    title: [{ value: 'The Good Shepherd' }]
  })

  const handleChange = (value?: Title): void => {
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
