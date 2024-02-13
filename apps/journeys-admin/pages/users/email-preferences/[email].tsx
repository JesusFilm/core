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

const FIND_OR_CREATE_EMAIL_PREFERENCE = gql`
  mutation FindOrCreateEmailPreference($email: String!) {
    findOrCreateEmailPreference(email: $email) {
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
  mutation UpdateEmailPreference($input: EmailPreferenceUpdateInput!) {
    updateEmailPreference(input: $input) {
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

interface EmailPreference {
  email: string
  unsubscribeAll: boolean
  teamInvite: boolean
  teamRemoved: boolean
  teamInviteAccepted: boolean
  journeyEditInvite: boolean
  journeyRequestApproved: boolean
  journeyAccessRequest: boolean
}

function EmailPreferencesPage(): ReactElement {
  const router = useRouter()
  const { email, unsuball } = router.query
  const { enqueueSnackbar } = useSnackbar()
  console.log(unsuball)
  const { t } = useTranslation('apps-journeys-admin')
  const [updateEmailPreference] = useMutation(UPDATE_EMAIL_PREFERENCE)
  const [findOrCreateEmailPreference] = useMutation(FIND_OR_CREATE_EMAIL_PREFERENCE)
  const [emailPreferences, setEmailPreferences] =
    useState<EmailPreference | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchEmailPreferences = async (): Promise<void> => {
      const { data } = await findOrCreateEmailPreference({
        variables: {
          email: email as string
        }
      })
      console.log('data', data)
      setEmailPreferences(data.findOrCreateEmailPreference)

      // Check if the unsuball query parameter is present
      if (unsuball !== undefined) {
        await updateEmailPreference({
          variables: {
            input: {
              email: data.findOrCreateEmailPreference.email,
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
        enqueueSnackbar(t(`Unsubscribed From all Emails.`), {
          variant: 'success',
          preventDuplicate: true
        })
      }
    }
if (email !== undefined && email !== null) {
    fetchEmailPreferences().catch((error) => {
      console.error('Error fetching email preferences:', error)
    })
  }
  }, [email, findOrCreateEmailPreference])

  const handlePreferenceChange = (preference: keyof EmailPreference) => async () =>{
    if (emailPreferences !== null) {
      console.log('emailPreferences', emailPreferences)
      console.log('preference', preference)
      const updatedPreferences: EmailPreference = {
        ...emailPreferences,
        [preference]: !(emailPreferences[preference] as boolean)
      }
      setEmailPreferences(updatedPreferences)
    }
  }

  const handleSubmit = async (): Promise<void> => {
    if (emailPreferences !== null) {
      setLoading(true) // Set loading state to true
      await updateEmailPreference({
        variables: {
          input: {
            email: emailPreferences.email,
            unsubscribeAll: emailPreferences.unsubscribeAll,
            teamInvite: emailPreferences.teamInvite,
            teamRemoved: emailPreferences.teamRemoved,
            teamInviteAccepted: emailPreferences.teamInviteAccepted,
            journeyEditInvite: emailPreferences.journeyEditInvite,
            journeyRequestApproved: emailPreferences.journeyRequestApproved,
            journeyAccessRequest: emailPreferences.journeyAccessRequest
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
    if (emailPreferences != null) {
      const updatedPreferences: EmailPreference = {
        ...emailPreferences,
        unsubscribeAll: !emailPreferences.unsubscribeAll
      }
      setEmailPreferences(updatedPreferences)
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

      {emailPreferences !== null && (
        <Grid container spacing={12}>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">{t('Team Invite')}</Typography>
            <Typography variant="body2">
              {t('Optional Description.')}
            </Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={emailPreferences.teamInvite}
              onChange={handlePreferenceChange('teamInvite')}
              name="journeyNotifications"
              inputProps={{ 'aria-label': 'Team Invites' }}
            />
          </Grid>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">{t('Team Remova')}</Typography>
            <Typography variant="body2">
              {t('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.')}
            </Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={emailPreferences.teamRemoved}
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
              checked={emailPreferences.teamInviteAccepted}
              onChange={handlePreferenceChange('teamInviteAccepted')
              }
              name="teamInviteAccepted"
              inputProps={{ 'aria-label': 'Team Invite Accepted' }}
            />
          </Grid>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">{t('Journey Edit Invite')}</Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
                  checked={emailPreferences.journeyEditInvite}
                  onChange={handlePreferenceChange('journeyEditInvite')}
                  name="journeyEditInvite"
                  inputProps={{ 'aria-label': 'Journey Edit Invite' }}
                />
          </Grid>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">{t('Journey Request Approved')}</Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
                  checked={emailPreferences.journeyRequestApproved}
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
                  checked={emailPreferences.journeyAccessRequest}
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

export default EmailPreferencesPage
