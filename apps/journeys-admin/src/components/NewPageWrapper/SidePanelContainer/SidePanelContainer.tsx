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
        borderColor: { sm: 'divider' },
        pb: 4
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
        pt: 4
      }}
    >
      {children}
    </Stack>
  )
}
