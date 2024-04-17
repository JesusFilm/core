import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

interface AccessDeniedCardProps {
  stepNumber: number
  heading: string
  description: string
  requestAccess?: boolean
  handleRequestAccess?: () => void
}

export function AccessDeniedCard({
  stepNumber,
  heading,
  description,
  requestAccess = false,
  handleRequestAccess
}: AccessDeniedCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Card
      sx={{ display: 'flex', flexDirection: 'row' }}
      data-testid="AccessDeniedCard"
    >
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
      {handleRequestAccess != null &&
        (requestAccess ? (
          <Stack direction="row" sx={{ color: 'success.main' }}>
            <CheckContainedIcon />
            <Typography>{t('Request Sent')}</Typography>
          </Stack>
        ) : (
          <CardActions>
            <Button
              variant="contained"
              onClick={handleRequestAccess}
              startIcon={<UsersProfiles2Icon />}
            >
              {t('Request Now')}
            </Button>
          </CardActions>
        ))}
    </Card>
  )
}
