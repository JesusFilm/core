import { gql, useQuery, useMutation } from '@apollo/client'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { useRouter } from 'next/router'
import Switch from '@mui/material/Switch'
import Box from '@mui/material/Box'

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

const EmailPreferencesPage: React.FC = () => {
  const router = useRouter()
  const { emailPreferenceId } = router.query

  const { data } = useQuery(GET_EMAIL_PREFERENCES, {
    variables: { emailPreferenceId: emailPreferenceId, idType: 'id' }
  })
  const [updateEmailPreferences] = useMutation(UPDATE_EMAIL_PREFERENCES)

  const handlePreferenceChange = async (preference: string): Promise<void> => {
    const { __typename, ...emailPreference } = data.emailPreference
    const updatedPreferences: EmailPreferences = {
      ...emailPreference,
      [preference]: !emailPreference[preference]
    }
    await updateEmailPreferences({
      variables: {
        input: {
          id: emailPreferenceId,
          ...updatedPreferences
        }
      }
    })
  }

  return (
    <Box
      sx={{
        alignItems: 'flex-center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        paddingLeft: '10%',
        paddingRight: '10%',

      }}
    >
      <Typography variant="h1" sx={{marginBottom: 5}}>Email Preferences</Typography>
      {data && (
        <Grid container spacing={12} justifyItems={'center'}>
          <Grid item xs={10} md={10}>
            <Typography variant="h5" >
              Team Invites
            </Typography>
            <Typography variant="body2" >
              Description for Team Invitesantoehu santoeuh sanotehu santoheusanothusatohus anoteuh asnotuhe asnoetuh asontuh asonth
            </Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={data.teamInvites}
              onChange={() => handlePreferenceChange('teamInvites')}
              name="teamInvites"
              inputProps={{ 'aria-label': 'Team Invites' }}
            />
          </Grid>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">Journey Notifications</Typography>
            <Typography variant="body2">
              Description for Journey Notifications
            </Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={data.journeyNotifications}
              onChange={() => handlePreferenceChange('journeyNotifications')}
              name="journeyNotifications"
              inputProps={{ 'aria-label': 'Journey Notifications' }}
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
              checked={data.thirdCategory}
              onChange={() => handlePreferenceChange('thirdCategory')}
              name="thirdCategory"
              inputProps={{ 'aria-label': 'Third Category' }}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default EmailPreferencesPage
