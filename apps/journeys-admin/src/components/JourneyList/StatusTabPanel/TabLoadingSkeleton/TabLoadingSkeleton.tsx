import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { JourneyCard } from '../../JourneyCard'

export function TabLoadingSkeleton(): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  return (
    <>
      {!smUp && (
        <Box sx={{ my: 4, ml: 6 }}>
          <Chip label="Sort By" variant="outlined" disabled />
        </Box>
      )}
      <Card
        variant="outlined"
        sx={{
          borderColor: 'divider',
          borderBottom: 'none',
          mt: { xs: 0, sm: 6 },
          borderTopLeftRadius: { xs: 0, sm: 12 },
          borderTopRightRadius: { xs: 0, sm: 12 },
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0
        }}
      >
        <Tabs
          value={0}
          aria-label="journey status tabs"
          data-testid="journey-list"
        >
          <Tab label="Active" disabled />
          <Tab label="Archived" disabled />
          <Tab label="Deleted" disabled />
          {smUp && (
            <Box
              sx={{
                mr: 6,
                ml: 'auto',
                mt: 3,
                mb: 2
              }}
            >
              <Chip label="Sort By" variant="outlined" disabled />
            </Box>
          )}
        </Tabs>
      </Card>
      <JourneyCard />
      <JourneyCard />
      <JourneyCard />
      <JourneyCard />
    </>
  )
}
