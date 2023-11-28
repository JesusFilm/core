import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode, useMemo } from 'react'

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
        borderBottom: '1px solid',
        borderColor: 'divider'
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
      data-testid="SidePanelContainer"
    >
      {children}
    </Stack>
  )
}
