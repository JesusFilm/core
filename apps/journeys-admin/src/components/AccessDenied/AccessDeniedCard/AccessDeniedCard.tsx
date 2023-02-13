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
      <CardContent sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography
          sx={{
            fontFamily: 'Montserrat',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '36px',
            lineHeight: '40px'
          }}
          color="secondary.light"
        >
          {stepNumber}
        </Typography>
        <Stack>
          <Typography variant="h6" color="secondary.dark">
            {heading}
          </Typography>
          <Typography variant="body2" color="secondary.light">
            {description}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
