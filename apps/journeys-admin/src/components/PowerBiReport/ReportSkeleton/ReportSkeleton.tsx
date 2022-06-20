import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

export interface ReportSkeletonProps {
  message: string
}

export function ReportSkeleton({ message }: ReportSkeletonProps): ReactElement {
  return (
    <Box
      sx={{
        height: 190,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Typography variant="overline" color="secondary.light">
        {message}
      </Typography>
    </Box>
  )
}
