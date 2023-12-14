import Box, { BoxProps } from '@mui/material/Box'
import { ReactElement, ReactNode, useEffect, useState } from 'react'

interface TabPanelProps extends BoxProps {
  name: string
  children?: ReactNode
  value: number
  index: number
  unmountUntilVisible?: true
}
export function TabPanel({
  name,
  children,
  value,
  index,
  unmountUntilVisible,
  ...other
}: TabPanelProps): ReactElement {
  const [unmount, setUnmount] = useState(unmountUntilVisible != null)

  useEffect(() => {
    if (value === index) setUnmount(false)
  }, [index, unmountUntilVisible, value])

  const hidden = value !== index
  return (
    <Box
      role="tabpanel"
      hidden={hidden}
      id={`${name}-tabpanel-${index}`}
      aria-labelledby={`${name}-tab-${index}`}
      {...other}
    >
      {!unmount && children}
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
