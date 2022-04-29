import { ReactElement, ReactNode } from 'react'
import Box from '@mui/material/Box'
import { SxProps } from '@mui/system/styleFunctionSx'

interface TabPanelProps {
  name: string
  children?: ReactNode
  value: number
  index: number
  sx?: SxProps
}
export function TabPanel({
  name,
  children,
  value,
  index,
  sx
}: TabPanelProps): ReactElement {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`${name}-tabpanel-${index}`}
      aria-labelledby={`${name}-tab-${index}`}
      sx={sx}
    >
      {children}
    </Box>
  )
}

export function tabA11yProps(
  name: string,
  index: number
): {
  id: string
  'aria-controls': string
} {
  return {
    id: `${name}-tab-${index}`,
    'aria-controls': `${name}-tabpanel-${index}`
  }
}
