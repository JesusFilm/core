import Box from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'

interface TabContainerProps {
  children?: ReactNode
  index: number
  value: number
}

export function TabContainer(props: TabContainerProps): ReactElement {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ mt: 3 }}>{children}</Box>}
    </div>
  )
}
