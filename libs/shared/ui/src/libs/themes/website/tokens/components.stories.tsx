import { useState, SyntheticEvent } from 'react'
import { Story, Meta } from '@storybook/react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import AddIcon from '@mui/icons-material/Add'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import MenuItem from '@mui/material/MenuItem'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { simpleComponentConfig } from '../../../simpleComponentConfig'
import { ThemeName } from '../..'

const ComponentsDemo = {
  ...simpleComponentConfig,
  component: Button,
  title: 'Website Theme',
  parameters: {
    ...simpleComponentConfig.parameters,
    themeName: ThemeName.website,
    theme: 'all'
  }
}

const Template: Story<Parameters<typeof Button>[0]> = (args) => {
  const [value, setValue] = useState(0)

  const handleChange = (e: SyntheticEvent, newValue: number): void => {
    setValue(newValue)
  }

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
      {/* DIALOG */}
      {/* TODO: Move Dialog to shared-ui */}
      {/* <FormControl>
        <InputLabel htmlFor="search">Keyword, Country or Language</InputLabel>
        <FilledInput
          id="search"
          endAdornment={
            <InputAdornment position="end">
              <IconButton>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl> */}
    </Stack>
  )
}

export const Components = Template.bind({})

export default ComponentsDemo as Meta
