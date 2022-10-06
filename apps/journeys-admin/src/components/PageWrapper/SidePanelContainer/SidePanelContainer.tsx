import { ReactElement, ReactNode } from 'react'
import Grid from '@mui/material/Unstable_Grid2'

export interface SidePanelContainerProps {
  children: ReactNode
}

export function SidePanelContainer({
  children
}: SidePanelContainerProps): ReactElement {
  return (
    <Grid
      xs={4}
      sx={{
        backgroundColor: 'background.paper',
        px: 6,
        py: 4,
        borderBottom: { sm: '1px solid' },
        borderColor: { sm: 'divider' }
      }}
    >
      {children}
    </Grid>
  )
}
