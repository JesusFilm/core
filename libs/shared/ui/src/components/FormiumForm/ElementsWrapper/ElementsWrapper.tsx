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
      <CardContent>
        <Stack spacing={10} sx={{ px: '24px', pt: '20px', pb: '28px' }}>
          {children}
        </Stack>
      </CardContent>
    </Card>
  )
}
