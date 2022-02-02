import { Box, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import { ReactElement, ReactNode } from 'react'

interface TabPanelProps {
  children?: ReactNode
  value: number
  index: number
}
export function TabPanel({
  children,
  value,
  index,
  ...other
}: TabPanelProps): ReactElement {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
}

export function tabProps(index: number): {
  id: string
  'aria-controls': string
} {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}
