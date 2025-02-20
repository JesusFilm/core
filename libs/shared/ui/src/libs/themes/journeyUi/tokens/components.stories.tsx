import AddIcon from '@mui/icons-material/Add'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ReactElement, SyntheticEvent, useState } from 'react'

import { ThemeName } from '../..'
import {
  Language,
  LanguageAutocomplete
} from '../../../../components/LanguageAutocomplete'
import { TabPanel, tabA11yProps } from '../../../../components/TabPanel'
import { simpleComponentConfig } from '../../../simpleComponentConfig'

const ComponentsDemo: Meta<typeof Button> = {
  ...simpleComponentConfig,
  component: Button,
  title: 'Journey UI Theme',
  parameters: {
    ...simpleComponentConfig.parameters,
    themeName: ThemeName.journeyUi,
    theme: 'all'
  }
}

const ComponentStories = (): ReactElement => {
  const [value, setValue] = useState(0)

  const handleChange = (e: SyntheticEvent, newValue: number): void => {
    setValue(newValue)
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

  return (
    <Stack spacing={8} alignItems="flex-start">
      <Typography variant="h1">Header 1</Typography>
      <Typography variant="body1">body 1</Typography>
      {/* BUTTONS */}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Button
          startIcon={<AddIcon fontSize="large" />}
          size="large"
          variant="contained"
        >
          Large Contained button
        </Button>
        <Button
          startIcon={<AddIcon fontSize="medium" />}
          size="medium"
          variant="contained"
        >
          Medium Contained button
        </Button>
        <Button
          startIcon={<AddIcon fontSize="small" />}
          size="small"
          variant="contained"
        >
          Small Contained button
        </Button>
        <Button
          startIcon={<AddIcon fontSize="small" />}
          size="small"
          variant="contained"
          disabled
        >
          Disabled Contained button
        </Button>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Button
          startIcon={<AddIcon fontSize="large" />}
          size="large"
          variant="outlined"
        >
          Large Outlined button
        </Button>
        <Button
          startIcon={<AddIcon fontSize="medium" />}
          size="medium"
          variant="outlined"
        >
          Medium Outlined button
        </Button>
        <Button
          startIcon={<AddIcon fontSize="small" />}
          size="small"
          variant="outlined"
        >
          Small Outlined button
        </Button>
        <Button
          startIcon={<AddIcon fontSize="small" />}
          size="small"
          variant="outlined"
          disabled
        >
          Disabled Outlined button
        </Button>
      </Stack>
      <Button
        startIcon={<AddIcon fontSize="medium" />}
        size="medium"
        variant="outlined"
        color="secondary"
      >
        Secondary Outlined button
      </Button>
      <IconButton color="primary">
        <ShareOutlinedIcon />
      </IconButton>
      {/* TEXT FIELD */}
      <TextField
        fullWidth
        id="embedLink"
        defaultValue="Embed TextField (Read only)"
        variant="outlined"
        InputProps={{
          readOnly: true
        }}
      />
      {/* SELECT FIELD */}
      <TextField
        select
        fullWidth
        id="fileSize"
        label="Select a file size"
        variant="outlined"
      >
        <MenuItem value="high">High (59.83 MB)</MenuItem>
        <MenuItem value="low">Low (12 MB)</MenuItem>
      </TextField>
      {/* LANGUAGE AUTOCOMPLETE */}
      <LanguageAutocomplete
        onChange={noop}
        value={languages[0]}
        languages={languages}
        loading={false}
      />
      {/* TABS */}
      <Tabs value={value} onChange={handleChange} aria-label="tabs example">
        <Tab label="Description" {...tabA11yProps('description', 0)} />
        <Tab label="Discussion" {...tabA11yProps('discussion', 1)} />
      </Tabs>
      <TabPanel name="description" value={value} index={0}>
        Description
      </TabPanel>
      <TabPanel name="discussion" value={value} index={1}>
        Discussion
      </TabPanel>
    </Stack>
  )
}

const Template: StoryObj<typeof Button> = {
  render: () => <ComponentStories />
}

export const Components = { ...Template }

export default ComponentsDemo
