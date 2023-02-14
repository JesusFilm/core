import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material'

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
        justifyContent: 'flex-start',
        padding: 5
      }}
    >
      <ListItemText
        primary={stepNumber}
        primaryTypographyProps={{
          fontFamily: [
            '"Montserrat", "Open Sans", "Tahoma", "Verdana", sans-serif'
          ].join(','),
          fontWeight: 400,
          fontSize: '36px',
          lineHeight: '40px',
          textAlign: 'center'
        }}
        sx={{ justifyContent: 'center', width: '40px' }}
      />
      <ListItemText primary={heading} secondary={description} sx={{ ml: 3 }} />
      {handleRequestAccess != null &&
        (requestAccess ? (
          <ListItemButton>
            <ListItemIcon>
              <CheckCircleRoundedIcon />
            </ListItemIcon>
            <ListItemText primary={t('Request Sent')} />
          </ListItemButton>
        ) : (
          <Button
            variant="contained"
            onClick={handleRequestAccess}
            startIcon={<SupervisorAccountRoundedIcon />}
          >
            {t('Request Now')}
          </Button>
        ))}
    </ListItem>
  )
}
