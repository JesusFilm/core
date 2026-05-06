import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { ThemeName } from '../..'
import {
  Language,
  LanguageAutocomplete
} from '../../../../components/LanguageAutocomplete'
import { simpleComponentConfig } from '../../../simpleComponentConfig'

const ComponentsDemo: Meta<typeof LanguageAutocomplete> = {
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

const Template: StoryObj<typeof LanguageAutocomplete> = {
  render: (args) => {
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
}

export const Components = { ...Template }

export default ComponentsDemo
