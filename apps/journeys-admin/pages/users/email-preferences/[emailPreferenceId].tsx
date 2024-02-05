import { gql, useQuery, useMutation } from '@apollo/client'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { useRouter } from 'next/router'
import Switch from '@mui/material/Switch'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { ReactElement, useState, useEffect } from 'react'
import AlignCenter from '@core/shared/ui/icons/AlignCenter'

const GET_EMAIL_PREFERENCES = gql`
  query GetEmailPreference($emailPreferenceId: ID!, $idType: String!) {
    emailPreference(id: $emailPreferenceId, idType: $idType) {
      journeyNotifications
      teamInvites
      thirdCategory
    }
  }
`

const UPDATE_EMAIL_PREFERENCES = gql`
  mutation UpdateEmailPreferences($input: EmailPreferencesUpdateInput!) {
    updateEmailPreferences(input: $input) {
      id
      journeyNotifications
      teamInvites
      thirdCategory
    }
  }
`

type EmailPreferences = {
  journeyNotifications: boolean
  teamInvites: boolean
  thirdCategory: boolean
}
function EmailPreferencesPage(): ReactElement {
  const router = useRouter()
  const { emailPreferenceId } = router.query

  const { data, refetch } = useQuery(GET_EMAIL_PREFERENCES, {
    variables: { emailPreferenceId: emailPreferenceId, idType: 'id' }
  })
  const [updateEmailPreferences] = useMutation(UPDATE_EMAIL_PREFERENCES)

  const [emailPreferences, setEmailPreferences] =
    useState<EmailPreferences | null>(null)
  const [loading, setLoading] = useState(false) // Add loading state

  useEffect(() => {
    if (data && data.emailPreference) {
      console.log(data.emailPreference) 
      setEmailPreferences(data.emailPreference)
    }
  }, [data])

  const handlePreferenceChange = async (
    preference: keyof EmailPreferences
  ): Promise<void> => {
    if (emailPreferences) {
      const updatedPreferences: EmailPreferences = {
        ...emailPreferences,
        [preference]: !emailPreferences[preference]
      }
      setEmailPreferences(updatedPreferences)
    }
  }

  const handleSubmit = async (): Promise<void> => {
    if (emailPreferences) {
      const { journeyNotifications, teamInvites, thirdCategory } = emailPreferences;
      setLoading(true) // Set loading state to true
      await updateEmailPreferences({
        variables: {
          input: {
            id: emailPreferenceId,
            journeyNotifications,
            teamInvites,
            thirdCategory
          }
        }
      })
      setLoading(false) // Set loading state to false after mutation is complete
    }
  }

  const handleUnsubscribeAll = async (): Promise<void> => {
    if (emailPreferences) {
      const updatedPreferences: EmailPreferences = {
        journeyNotifications: false,
        teamInvites: false,
        thirdCategory: false
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
        Email Preferences
      </Typography>

      {emailPreferences && (
        <Grid container spacing={12}>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">Journey Notifications</Typography>
            <Typography variant="body2">
              Description for Journey Notifications
            </Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={emailPreferences.journeyNotifications}
              onChange={() => handlePreferenceChange('journeyNotifications')}
              name="journeyNotifications"
              inputProps={{ 'aria-label': 'Journey Notifications' }}
            />
          </Grid>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">Team Invites</Typography>
            <Typography variant="body2">
              This is a description for Team Invites. This is a description for
              Team Invites. This is a description for Team Invites. This is a
              description for Team Invites.
            </Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={emailPreferences.teamInvites}
              onChange={() => handlePreferenceChange('teamInvites')}
              name="teamInvites"
              inputProps={{ 'aria-label': 'Team Invites' }}
            />
          </Grid>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">Third Category</Typography>
            <Typography variant="body2">
              Description for Third Category
            </Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={emailPreferences.thirdCategory}
              onChange={() => handlePreferenceChange('thirdCategory')}
              name="thirdCategory"
              inputProps={{ 'aria-label': 'Third Category' }}
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
              Unsubscribe All
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
              {loading ? 'Loading...' : 'Submit'} {/* Show loading text when loading is true */}
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default EmailPreferencesPage
