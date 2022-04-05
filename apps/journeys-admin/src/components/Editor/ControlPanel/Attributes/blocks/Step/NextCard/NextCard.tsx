import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useTheme } from '@mui/material/styles'
import { TabPanel, tabA11yProps } from '@core/shared/ui'
import { Conditions } from './Conditions'
import { Cards } from './Cards'
import { SelectedCard } from './SelectedCard'

export function NextCard(): ReactElement {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event, newValue): void => {
    setTabValue(newValue)
  }

  return (
    <>
      <SelectedCard />
      <Box
        sx={{
          [theme.breakpoints.up('sm')]: {
            display: 'none'
          }
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="next card tabs"
          centered
          variant="fullWidth"
        >
          <Tab label="Cards" {...tabA11yProps('cardSelection', 0)} />
          <Tab label="Conditions" {...tabA11yProps('cardConditions', 1)} />
        </Tabs>
        <Divider />
        <TabPanel name="nextCardSelection" value={tabValue} index={0}>
          <Cards />
        </TabPanel>
        <TabPanel name="cardConditions" value={tabValue} index={1}>
          <Conditions />
        </TabPanel>
      </Box>
      <Box sx={{ [theme.breakpoints.down('sm')]: { display: 'none' } }}>
        <Divider />
        <Cards />
        <Divider />
        <Conditions />
      </Box>
    </>
  )
}
