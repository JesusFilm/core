import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

interface AccessDeniedListItemProps {
  stepNumber: number
  heading: string
  description: string
  stepActive?: boolean
  requestedAccess?: boolean
  handleRequestAccess?: () => void
}

export function AccessDeniedListItem({
  stepNumber,
  heading,
  description,
  stepActive = false,
  requestedAccess = false,
  handleRequestAccess
}: AccessDeniedListItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <ListItem
      sx={{
        bgcolor: stepActive ? 'background.paper' : '#F5F5F5',
        padding: 5,
        borderRadius: 'inherit'
      }}
    >
      <ListItemText
        disableTypography
        primary={
          <Typography
            sx={{
              fontFamily: 'Montserrat',
              fontWeight: 400,
              fontSize: '36px',
              lineHeight: '40px',
              textAlign: 'center',
              color: 'secondary.light',
              fontStyle: 'normal'
            }}
          >
            {stepNumber}
          </Typography>
        }
        sx={{ width: '40px' }}
      />
      <ListItemText
        disableTypography
        primary={<Typography variant="h6">{heading}</Typography>}
        secondary={<Typography variant="body2">{description}</Typography>}
        sx={{ ml: 3 }}
      />
      {handleRequestAccess != null &&
        (requestedAccess ? (
          <Stack
            direction="row"
            alignItems="center"
            sx={{ ml: 'auto', color: 'success.main', mr: 3 }}
          >
            <CheckCircleRoundedIcon fontSize="small" sx={{ mr: 2 }} />
            <Typography variant="subtitle2">{t('Request Sent')}</Typography>
          </Stack>
        ) : (
          <Button
            variant="contained"
            onClick={handleRequestAccess}
            startIcon={<SupervisorAccountRoundedIcon />}
            sx={{ ml: 'auto' }}
          >
            {t('Request Now')}
          </Button>
        ))}
    </ListItem>
  )
}
