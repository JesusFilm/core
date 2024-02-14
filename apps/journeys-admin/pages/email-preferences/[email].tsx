import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FindOrCreateEmailPreference } from '../../__generated__/FindOrCreateEmailPreference'
import {
  UpdateEmailPreference,
  UpdateEmailPreference_updateEmailPreference
} from '../../__generated__/UpdateEmailPreference'

const FIND_OR_CREATE_EMAIL_PREFERENCE = gql`
  mutation FindOrCreateJourneysEmailPreference($email: String!) {
    findOrCreateJourneysEmailPreference(email: $email) {
      email
      unsubscribeAll
      teamInvite
      teamRemoved
      teamInviteAccepted
      journeyEditInvite
      journeyRequestApproved
      journeyAccessRequest
    }
  }
`

const UPDATE_EMAIL_PREFERENCE = gql`
  mutation UpdateJourneysEmailPreference($input: JourneysEmailPreferenceUpdateInput!) {
    updateJourneysEmailPreference(input: $input) {
      email
      unsubscribeAll
      teamInvite
      teamRemoved
      teamInviteAccepted
      journeyEditInvite
      journeyRequestApproved
      journeyAccessRequest
    }
  }
`

type EmailPreference = Omit<
  UpdateEmailPreference_updateEmailPreference,
  '__typename'
>

function JourneysEmailPreferencesPage(): ReactElement {
  const router = useRouter()
  const { email, unsubscribeAll } = router.query
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const [updateEmailPreference] = useMutation<UpdateEmailPreference>(
    UPDATE_EMAIL_PREFERENCE
  )
  const [findOrCreateEmailPreference] =
    useMutation<FindOrCreateEmailPreference>(FIND_OR_CREATE_EMAIL_PREFERENCE)
  const [emailPreferences, setEmailPreferences] = useState<
    EmailPreference | null | undefined
  >(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchJourneysEmailPreferences = async (): Promise<void> => {
      const { data } = await findOrCreateJourneysEmailPreference({
        variables: {
          email: email as string
        }
      })
      setEmailPreferences(data?.findOrCreateEmailPreference)

      // Check if the unsuball query parameter is present
      if (unsubscribeAll !== undefined) {
        const updatePrefs = await updateJourneysEmailPreference({
          variables: {
            input: {
              email: data?.findOrCreateEmailPreference?.email,
              unsubscribeAll: true,
              teamInvite: false,
              teamRemoved: false,
              teamInviteAccepted: false,
              journeyEditInvite: false,
              journeyRequestApproved: false,
              journeyAccessRequest: false
            }
          }
        })
        setEmailPreferences(updatePrefs?.data?.updateEmailPreference)
        enqueueSnackbar(t(`Unsubscribed From all Emails.`), {
          variant: 'success',
          preventDuplicate: true
        })
      }
    }
    if (email !== undefined && email !== null) {
      fetchJourneysEmailPreferences().catch((error) => {
        console.error('Error fetching email preferences:', error)
      })
    }
  }, [
    email,
    enqueueSnackbar,
    findOrCreateEmailPreference,
    t,
    unsubscribeAll,
    updateEmailPreference
  ])

  const handlePreferenceChange =
    (preference: keyof EmailPreference) => async () => {
      if (emailPreferences != null) {
        const updatedPreferences: EmailPreference = {
          ...emailPreferences,
          [preference]: !(emailPreferences[preference] as boolean)
        }
        setJourneysEmailPreference(updatedPreferences)
      }
    }

  const handleSubmit = async (): Promise<void> => {
    if (emailPreferences != null) {
      setLoading(true) // Set loading state to true
      await updateJourneysEmailPreference({
        variables: {
          input: {
            email: journeysEmailPreference.email,
            unsubscribeAll: false,
            teamInvite: journeysEmailPreference.teamInvite,
            teamRemoved: journeysEmailPreference.teamRemoved,
            teamInviteAccepted: journeysEmailPreference.teamInviteAccepted,
            journeyEditInvite: journeysEmailPreference.journeyEditInvite,
            journeyRequestApproved: journeysEmailPreference.journeyRequestApproved,
            journeyAccessRequest: journeysEmailPreference.journeyAccessRequest
          }
        }
      }).then(() => {
        enqueueSnackbar(t(`Email Preferences Updated.`), {
          variant: 'success',
          preventDuplicate: true
        })
      })
      setLoading(false) // Set loading state to false after mutation is complete
    }
  }

  const handleUnsubscribeAll = async (): Promise<void> => {
    if (journeysEmailPreference != null) {
      const updatedPreferences: JourneysEmailPreference = {
        ...journeysEmailPreference,
        unsubscribeAll: !journeysEmailPreference.unsubscribeAll
      }
      setJourneysEmailPreference(updatedPreferences)
    }
  }

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        paddingLeft: '10%',
        paddingRight: '10%'
      }}
    >
      <Typography
        variant="h1"
        align="center"
        sx={{ marginBottom: 5, marginTop: 5 }}
      >
        {t('Email Preferences')}
      </Typography>

      {emailPreferences != null && (
        <Grid container spacing={12}>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">{t('Team Invite')}</Typography>
            <Typography variant="body2">
              {t('Optional Description.')}
            </Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={journeysEmailPreference.teamInvite}
              onChange={handlePreferenceChange('teamInvite')}
              name="journeyNotifications"
              inputProps={{ 'aria-label': 'Team Invites' }}
            />
          </Grid>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">{t('Team Remove')}</Typography>
            <Typography variant="body2">
              {t(
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
              )}
            </Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={journeysEmailPreference.teamRemoved}
              onChange={handlePreferenceChange('teamRemoved')}
              name="teamRemoved"
              inputProps={{ 'aria-label': 'Team Removed' }}
            />
          </Grid>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">{t('Team Invite Accepted')}</Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={journeysEmailPreference.teamInviteAccepted}
              onChange={handlePreferenceChange('teamInviteAccepted')}
              name="teamInviteAccepted"
              inputProps={{ 'aria-label': 'Team Invite Accepted' }}
            />
          </Grid>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">{t('Journey Edit Invite')}</Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={journeysEmailPreference.journeyEditInvite}
              onChange={handlePreferenceChange('journeyEditInvite')}
              name="journeyEditInvite"
              inputProps={{ 'aria-label': 'Journey Edit Invite' }}
            />
          </Grid>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">
              {t('Journey Request Approved')}
            </Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={journeysEmailPreference.journeyRequestApproved}
              onChange={handlePreferenceChange('journeyRequestApproved')}
              name="journeyRequestApproved"
              inputProps={{ 'aria-label': 'Journey Request Approved' }}
            />
          </Grid>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">{t('Journey Access Request')}</Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={journeysEmailPreference.journeyAccessRequest}
              onChange={handlePreferenceChange('journeyAccessRequest')}
              name="journeyAccessRequest"
              inputProps={{ 'aria-label': 'Journey Access Request' }}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <Button
              variant="contained"
              onClick={handleUnsubscribeAll}
              sx={{
                display: 'flex',
                margin: 'auto',
                marginBottom: 5
              }}
            >
              {t('Unsubscribe All')}
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                display: 'flex',
                margin: 'auto'
              }}
            >
              {t('Submit Changes')}
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default JourneysEmailPreferencesPage
