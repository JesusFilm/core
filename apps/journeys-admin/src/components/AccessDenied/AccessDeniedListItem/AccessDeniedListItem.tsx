import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'

interface AccessDeniedListItemProps {
  stepNumber: number
  heading: string
  description: string
  requestAccess?: boolean
  handleRequestAccess?: () => void
}

export function AccessDeniedListItem({
  stepNumber,
  heading,
  description,
  requestAccess = false,
  handleRequestAccess
}: AccessDeniedListItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <ListItem
      sx={{
        bgcolor: 'background.paper',
        padding: 5,
        display: 'flex'
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
        primaryTypographyProps={{}}
        sx={{ width: '40px' }}
      />
      <ListItemText
        disableTypography
        primary={<Typography variant="h6">{heading}</Typography>}
        secondary={<Typography variant="body2">{description}</Typography>}
        sx={{ ml: 3, justifySelf: 'stretch' }}
      />
      {handleRequestAccess != null &&
        (requestAccess ? (
          <Button
            startIcon={<CheckCircleRoundedIcon />}
            sx={{ ml: 'auto', color: 'success.main' }}
          >
            {t('Request Sent')}
          </Button>
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
