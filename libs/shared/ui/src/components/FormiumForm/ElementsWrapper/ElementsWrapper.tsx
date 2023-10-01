import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

interface ElementsWrapperProps {
  children: ReactElement
}

// Wraps around the all of the field elements

export function ElementsWrapper({
  children
}: ElementsWrapperProps): ReactElement {
  return (
    <Card sx={{ minWidth: '404px', borderRadius: '8px', mb: '18px' }}>
      <CardContent
        sx={{
          '&:last-of-type': {
            paddingBottom: '12px'
          },
          pt: '12px',
          px: '24px'
        }}
      >
        <Stack spacing={10}>{children}</Stack>
      </CardContent>
    </Card>
  )
}
