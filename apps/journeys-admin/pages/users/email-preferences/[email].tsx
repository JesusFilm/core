import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
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
  const { email } = router.query
  const { t } = useTranslation('apps-journeys-admin')
  const [updateEmailPreference] = useMutation(UPDATE_EMAIL_PREFERENCE)
  const [findOrCreateEmailPreference] = useMutation(FIND_OR_CREATE_EMAIL_PREFERENCE)
  const [emailPreferences, setEmailPreferences] =
    useState<EmailPreference | null>(null)
  const [loading, setLoading] = useState(false) // Add loading state

  useEffect(() => {
    const fetchEmailPreferences = async (): Promise<void> => {
      const { data } = await findOrCreateEmailPreference({
        variables: {
          email: email as string
        }
      })
      setEmailPreferences(data.findOrCreateEmailPreference)
    }

    fetchEmailPreferences().catch((error) => {
      console.error('Error fetching email preferences:', error)
    })
  }, [email, findOrCreateEmailPreference])

  const handlePreferenceChange = async (
    preference: keyof EmailPreference
  ): Promise<void> => {
    if (emailPreferences !== null) {
      const updatedPreferences: EmailPreference = {
        ...emailPreferences,
        [preference]: emailPreferences[preference]
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
            <Typography variant="h5">{t('Team Invites')}</Typography>
            <Typography variant="body2">
              {t('Optional Description.')}
            </Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={emailPreferences.teamInvite}
              onChange={async () =>
                await handlePreferenceChange('teamInvite')
              }
              name="journeyNotifications"
              inputProps={{ 'aria-label': 'Team Invites' }}
            />
          </Grid>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">{t('Team Removed')}</Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={emailPreferences.teamRemoved}
              onChange={async () => await handlePreferenceChange('teamRemoved')}
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
              onChange={async () =>
                await handlePreferenceChange('teamInviteAccepted')
              }
              name="teamInviteAccepted"
              inputProps={{ 'aria-label': 'Team Invite Accepted' }}
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
              disabled={loading} // Disable the button when loading is true
              sx={{
                display: 'flex',
                margin: 'auto'
              }}
            >
              {loading ? 'Loading...' : 'Submit'}{' '}
              {/* Show loading text when loading is true */}
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default EmailPreferencesPage
