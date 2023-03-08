import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'

interface ActionsListProps {
  actions: any[]
}

export function ActionsList({ actions }: ActionsListProps): ReactElement {
  return (
    <>
      {actions?.map((action, i) => (
        <Typography key={i} sx={{ pb: 2 }}>
          {action.url}
        </Typography>
      ))}
    </>
  )
}
