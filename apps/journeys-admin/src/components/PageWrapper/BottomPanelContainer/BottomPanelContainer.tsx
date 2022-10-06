import { ReactElement, ReactNode } from 'react'
import Grid from '@mui/material/Unstable_Grid2'

export interface BottomPanelContainerProps {
  children: ReactNode
}

export function BottomPanelContainer({
  children
}: BottomPanelContainerProps): ReactElement {
  return (
    <Grid
      xs={4}
      sm={12}
      sx={{
        height: '300px',
        position: { xs: 'fixed', sm: 'unset' },
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      {children}
    </Grid>
  )
}
