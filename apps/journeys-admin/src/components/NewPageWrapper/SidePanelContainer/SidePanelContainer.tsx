import { ReactElement, ReactNode, useMemo } from 'react'
import Stack from '@mui/material/Stack'

interface SidePanelContainerProps {
  children: ReactNode
  border?: boolean
}

export function SidePanelContainer({
  children,
  border = true
}: SidePanelContainerProps): ReactElement {
  const borderProps = useMemo(() => {
    if (border) {
      return {
        borderBottom: { sm: '1px solid' },
        borderColor: { sm: 'divider' }
      }
    }
    return {}
  }, [border])
  return (
    <Stack
      sx={{
        ...borderProps,
        backgroundColor: 'background.paper',
        px: 6,
        py: 4
      }}
    >
      {children}
    </Stack>
  )
}
