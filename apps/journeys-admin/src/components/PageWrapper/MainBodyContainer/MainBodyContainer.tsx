import { ReactElement, ReactNode } from 'react'
import Grid from '@mui/material/Unstable_Grid2'

export interface MainBodyContainerProps {
  children: ReactNode
  xsColumns?: number
  smColumns?: number
}

export function MainBodyContainer({
  xsColumns = 4,
  smColumns = 12,
  children
}: MainBodyContainerProps): ReactElement {
  return (
    <Grid
      xs={xsColumns}
      sm={smColumns}
      sx={{
        backgroundColor: 'background.paper',
        px: 8,
        py: 9
      }}
    >
      {children}
    </Grid>
  )
}
