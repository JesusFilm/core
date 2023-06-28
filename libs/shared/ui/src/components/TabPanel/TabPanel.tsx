import Box, { BoxProps } from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'

interface TabPanelProps extends BoxProps {
  name: string
  children?: ReactNode
  value: number
  index: number
  unmountOnExit?: boolean
}
export function TabPanel({
  name,
  children,
  value,
  index,
  unmountOnExit,
  ...other
}: TabPanelProps): ReactElement {
  const hidden = value !== index
  return (
    <Box
      role="tabpanel"
      hidden={hidden}
      id={`${name}-tabpanel-${index}`}
      aria-labelledby={`${name}-tab-${index}`}
      {...other}
    >
      {(unmountOnExit !== true || !hidden) && children}
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
