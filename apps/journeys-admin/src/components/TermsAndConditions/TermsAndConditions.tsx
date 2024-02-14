import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'
import ArrowRightSmIcon from '@core/shared/ui/icons/ArrowRightSm'
import CheckSquareBrokenIcon from '@core/shared/ui/icons/CheckSquareBroken'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { JourneyProfileCreate } from '../../../__generated__/JourneyProfileCreate'

import { TermsListItem } from './TermsListItem'

export const JOURNEY_PROFILE_CREATE = gql`
  mutation JourneyProfileCreate {
    journeyProfileCreate {
      id
      userId
      acceptedTermsAt
    }
  }
`

export function TermsAndConditions(): ReactElement {
  const [accepted, setAccepted] = useState(false)
  const [journeyProfileCreate] = useMutation<JourneyProfileCreate>(
    JOURNEY_PROFILE_CREATE
  )
  const router = useRouter()

  const handleJourneyProfileCreate = async (): Promise<void> => {
    await journeyProfileCreate()
    await router.push({
      pathname: '/onboarding-form',
      query: { redirect: router.query.redirect }
    })
  }
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <Typography variant="h4">{t('Before You Start')}</Typography>
      <Typography variant="body1" sx={{ mt: 3 }}>
        {t('Please review these documents:')}
      </Typography>
      <List
        sx={{
          bgcolor: 'background.paper',
          borderRadius: '6px',
          mt: 6,
          overflow: 'hidden'
        }}
        disablePadding
      >
        <TermsListItem
          link="https://your.nextstep.is/terms-of-use"
          icon={<AlertCircleIcon sx={{ color: 'secondary.light' }} />}
          text="Terms of Use"
        />
        <Divider component="li" />
        <TermsListItem
          link="https://your.nextstep.is/end-user-license-agreement"
          icon={<UsersProfiles2Icon sx={{ color: 'secondary.light' }} />}
          text="End User License Agreement"
        />
        <Divider component="li" />
        <TermsListItem
          link="https://your.nextstep.is/community-guidelines"
          icon={<CheckSquareBrokenIcon sx={{ color: 'secondary.light' }} />}
          text="Community Guidelines"
        />
        <Divider component="li" />
        <ListItemButton onClick={() => setAccepted(!accepted)}>
          <ListItemIcon sx={{ minWidth: 44 }}>
            <Checkbox
              edge="start"
              checked={accepted}
              tabIndex={-1}
              disableRipple
              inputProps={{ 'aria-labelledby': 'i-agree-label' }}
              sx={{ p: 0, ml: 0 }}
            />
          </ListItemIcon>
          <ListItemText
            id="i-agree-label"
            primary={
              <Typography variant="body1" color="secondary.dark">
                {t('I agree with listed above conditions and requirements')}
              </Typography>
            }
          />
        </ListItemButton>
      </List>
      <Button
        variant="contained"
        disabled={!accepted}
        onClick={handleJourneyProfileCreate}
        sx={{
          mt: 6,
          width: '100%',
          borderRadius: '12px',
          bgcolor: 'secondary.dark',
          py: 3.25,
          color: 'secondary.contrastText',
          '&:hover': {
            bgcolor: 'secondary.dark'
          }
        }}
        endIcon={<ArrowRightSmIcon />}
      >
        {t('Next')}
      </Button>
    </>
  )
}
