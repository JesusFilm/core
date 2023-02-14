import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
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
        justifyContent: 'flex-start',
        padding: 5
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
        sx={{ ml: 3 }}
      />
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
