import Box, { BoxProps } from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'

interface TabContainerProps extends BoxProps {
  children?: ReactNode
  index: number
  value: number
}

export function TabContainer(props: TabContainerProps): ReactElement {
  const { children, value, index, ...other } = props

  return (
    <Box role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </Box>
  )
}
