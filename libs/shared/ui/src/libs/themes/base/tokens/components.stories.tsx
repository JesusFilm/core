import Stack from '@mui/material/Stack'
import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'

import { ThemeName } from '../..'
import {
  Language,
  LanguageAutocomplete
} from '../../../../components/LanguageAutocomplete'
import { simpleComponentConfig } from '../../../simpleComponentConfig'

const ComponentsDemo = {
  ...simpleComponentConfig,
  component: LanguageAutocomplete,
  title: 'Default Theme',
  parameters: {
    ...simpleComponentConfig.parameters,
    themeName: ThemeName.base,
    theme: 'all'
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

const Template: Story = (args) => {
  return (
    <Stack spacing={8} alignItems="flex-start">
      {/* LANGUAGE AUTOCOMPLETE */}
      <LanguageAutocomplete
        onChange={noop}
        value={languages[0]}
        languages={languages}
        loading={false}
      />
    </Stack>
  )
}

export const Components = Template.bind({})

export default ComponentsDemo as Meta
