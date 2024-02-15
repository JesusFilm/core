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
      accountNotifications
    }
  }
`

const UPDATE_EMAIL_PREFERENCE = gql`
  mutation UpdateJourneysEmailPreference(
    $input: JourneysEmailPreferenceUpdateInput!
  ) {
    updateJourneysEmailPreference(input: $input) {
      email
      unsubscribeAll
      accountNotifications
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
            accountNotifications: journeysEmailPreference.accountNotifications
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
        accountNotifications: false
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
            <Typography variant="h5">{t('Account Notifications')}</Typography>
            <Typography variant="body2">
              {t(
                'Email updates about new members to your teams, invited to a team, journey shared with you, journey access requests, and removed from a team.'
              )}
            </Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={journeysEmailPreference.accountNotifications}
              onChange={handlePreferenceChange('accountNotifications')}
              name="journeyNotifications"
              inputProps={{ 'aria-label': 'Team Invites' }}
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
      const { data: updatePrefsData } = await apolloClient.mutate<
        UpdateJourneysEmailPreference,
        UpdateJourneysEmailPreferenceVariables
      >({
        mutation: UPDATE_EMAIL_PREFERENCE,
        variables: {
          input: {
            email: journeysEmailPreferenceData
              ?.findOrCreateJourneysEmailPreference?.email as string,
            unsubscribeAll: true,
            accountNotifications: false
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
