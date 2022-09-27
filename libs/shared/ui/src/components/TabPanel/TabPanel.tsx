import Box, { BoxProps } from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'

interface TabPanelProps extends BoxProps {
  name: string
  children?: ReactNode
  value: number
  index: number
}
export function TabPanel({
  name,
  children,
  value,
  index,
  ...other
}: TabPanelProps): ReactElement {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`${name}-tabpanel-${index}`}
      aria-labelledby={`${name}-tab-${index}`}
      {...other}
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
