import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

interface AccessDeniedCardProps {
  stepNumber: number
  heading: string
  description: string
  requestAccess?: boolean
  onClick?: () => void
}

export function AccessDeniedCard({
  stepNumber,
  heading,
  description,
  requestAccess = false,
  onClick
}: AccessDeniedCardProps): ReactElement {
  return (
    <Card>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'row',
          padding: 5,
          '&:last-child': {
            pb: 5
          }
        }}
      >
        <Stack
          sx={{
            mr: 3,
            width: '40px',
            height: '52px',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h1" color="secondary.light" align="center">
            {stepNumber}
          </Typography>
        </Stack>
        <Stack>
          <Typography variant="h6" color="secondary.dark">
            {heading}
          </Typography>
          <Typography variant="body2" color="secondary.light" sx={{ mt: 1.5 }}>
            {description}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
