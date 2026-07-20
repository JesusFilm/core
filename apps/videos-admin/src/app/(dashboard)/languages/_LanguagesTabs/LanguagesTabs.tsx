'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { ReactElement, SyntheticEvent, useState } from 'react'

import { LanguageDebug } from '../_LanguageDebug'
import { LanguageList } from '../_LanguageList'

type LanguagesTabValue = 'languages' | 'debug'

export function LanguagesTabs(): ReactElement {
  const [currentTab, setCurrentTab] = useState<LanguagesTabValue>('languages')

  const handleTabChange = (
    _event: SyntheticEvent,
    value: LanguagesTabValue
  ): void => {
    setCurrentTab(value)
  }

  return (
    <Stack
      sx={{
        width: '100%',
        maxWidth: { sm: '100%', md: '1700px' },
        alignSelf: 'stretch',
        height: { xs: 'calc(100svh - 160px)', md: 'calc(100vh - 150px)' },
        minHeight: 0,
        overflow: 'hidden',
        pt: { xs: 4, md: 0 }
      }}
      spacing={2}
    >
      <Typography component="h2" variant="h6" sx={{ flexShrink: 0 }}>
        Language Admin
      </Typography>

      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        aria-label="Language admin sections"
        sx={{ flexShrink: 0, minHeight: 0 }}
      >
        <Tab value="languages" label="Languages" />
        <Tab value="debug" label="Language Debug" />
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {currentTab === 'languages' ? <LanguageList /> : <LanguageDebug />}
      </Box>
    </Stack>
  )
}
