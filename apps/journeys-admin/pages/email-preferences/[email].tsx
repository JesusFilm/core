import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  FindOrCreateJourneysEmailPreference,
  FindOrCreateJourneysEmailPreferenceVariables
} from '../../__generated__/FindOrCreateJourneysEmailPreference'
import {
  UpdateJourneysEmailPreference,
  UpdateJourneysEmailPreferenceVariables,
  UpdateJourneysEmailPreference_updateJourneysEmailPreference
} from '../../__generated__/UpdateJourneysEmailPreference'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

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

type JourneysEmailPreference = Omit<
  UpdateJourneysEmailPreference_updateJourneysEmailPreference,
  '__typename'
>

function EmailPreferencesPage({
  journeysEmailPreferenceData,
  updatePrefs
}): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const [updateJourneysEmailPreference, { loading }] =
    useMutation<UpdateJourneysEmailPreference>(UPDATE_EMAIL_PREFERENCE)

  const [journeysEmailPreference, setJourneysEmailPreference] = useState<
    JourneysEmailPreference | null | undefined
  >(
    updatePrefs?.updateJourneysEmailPreference ??
      journeysEmailPreferenceData?.findOrCreateJourneysEmailPreference
  )

  const handlePreferenceChange =
    (preference: keyof JourneysEmailPreference) => async () => {
      if (journeysEmailPreference != null) {
        const updatedPreferences: JourneysEmailPreference = {
          ...journeysEmailPreference,
          [preference]: !(journeysEmailPreference[preference] as boolean)
        }
        setJourneysEmailPreference(updatedPreferences)
      }
    }

  const handleSubmit = async (): Promise<void> => {
    if (journeysEmailPreference != null) {
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
    }
  }

  const handleUnsubscribeAll = async (): Promise<void> => {
    if (journeysEmailPreference != null) {
      const updatedPreferences: JourneysEmailPreference = {
        email: journeysEmailPreference.email,
        unsubscribeAll: true,
        teamInvite: false,
        teamRemoved: false,
        teamInviteAccepted: false,
        journeyEditInvite: false,
        journeyRequestApproved: false,
        journeyAccessRequest: false
      }
      await updateJourneysEmailPreference({
        variables: {
          input: {
            ...updatedPreferences
          }
        }
      }).then(() => {
        enqueueSnackbar(t(`Email Preferences Updated. Unsubscribed to all`), {
          variant: 'success',
          preventDuplicate: true
        })
      })

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

      {journeysEmailPreference != null && (
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

export const getServerSideProps = withUserTokenSSR()(
  async ({ user, locale, resolvedUrl, params, query }) => {
    const { apolloClient, translations } = await initAndAuthApp({
      user,
      locale,
      resolvedUrl
    })

    let updatePrefs: UpdateJourneysEmailPreference | null | undefined

    // TemplateDetailsPage
    const { data: journeysEmailPreferenceData } = await apolloClient.mutate<
      FindOrCreateJourneysEmailPreference,
      FindOrCreateJourneysEmailPreferenceVariables
    >({
      mutation: FIND_OR_CREATE_EMAIL_PREFERENCE,
      variables: {
        email: query?.email as string
      }
    })

    if (query?.unsubscribeAll != null) {
      console.log('here')
      const { data: updatePrefsData } = await apolloClient.mutate<
        UpdateJourneysEmailPreference,
        UpdateJourneysEmailPreferenceVariables
      >({
        mutation: UPDATE_EMAIL_PREFERENCE,
        variables: {
          input: {
            email: journeysEmailPreferenceData?.findOrCreateEmailPreference
              ?.email as string,
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
      if (updatePrefsData != null) updatePrefs = updatePrefsData
    }
    if (updatePrefs == null)
      return {
        props: {
          ...translations,
          initialApolloState: apolloClient.cache.extract(),
          journeysEmailPreferenceData
        }
      }
    return {
      props: {
        ...translations,
        initialApolloState: apolloClient.cache.extract(),
        journeysEmailPreferenceData,
        updatePrefs
      }
    }
  }
)

export default withUser()(EmailPreferencesPage)
