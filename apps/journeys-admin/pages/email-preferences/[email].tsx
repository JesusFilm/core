import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  JourneysEmailPreference,
  JourneysEmailPreferenceVariables
} from '../../__generated__/JourneysEmailPreference'
import {
  UpdateJourneysEmailPreference,
  UpdateJourneysEmailPreferenceVariables,
  UpdateJourneysEmailPreference_updateJourneysEmailPreference
} from '../../__generated__/UpdateJourneysEmailPreference'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

const GET_EMAIL_PREFERENCE = gql`
  query JourneysEmailPreference($email: String!) {
    journeysEmailPreference(email: $email) {
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

function EmailPreferencesPage({
  journeysEmailPreferenceData,
  updatePrefs
}): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const [updateJourneysEmailPreference, { loading }] =
    useMutation<UpdateJourneysEmailPreference>(UPDATE_EMAIL_PREFERENCE)

  const [journeysEmailPreference, setJourneysEmailPreference] = useState<
    | UpdateJourneysEmailPreference_updateJourneysEmailPreference
    | null
    | undefined
  >(
    updatePrefs?.updateJourneysEmailPreference ??
      journeysEmailPreferenceData?.journeysEmailPreference
  )

  const handlePreferenceChange =
    (
      preference: keyof UpdateJourneysEmailPreference_updateJourneysEmailPreference
    ) =>
    async () => {
      if (journeysEmailPreference != null) {
        const value = !(journeysEmailPreference[preference] as boolean)
        await updateJourneysEmailPreference({
          variables: {
            input: {
              email: journeysEmailPreference.email,
              preference,
              value
            }
          }
        }).then(() => {
          enqueueSnackbar(t(`Email Preferences Updated.`), {
            variant: 'success',
            preventDuplicate: true
          })
        })
        const updatedPreferences = {
          ...journeysEmailPreference,
          [preference]: value
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

      {journeysEmailPreference != null && (
        <Grid container spacing={12}>
          <Grid item xs={10} md={10}>
            <Typography variant="h5">{t('Stop All Notifications')}</Typography>
            <Typography variant="body2">
              {t('Stop all current and future email notifications.')}
            </Typography>
          </Grid>
          <Grid item xs={2} md={2}>
            <Switch
              checked={journeysEmailPreference.unsubscribeAll}
              onChange={handlePreferenceChange('unsubscribeAll')}
              name="journeyNotifications"
              inputProps={{ 'aria-label': 'Team Invites' }}
            />
          </Grid>
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
              disabled={journeysEmailPreference.unsubscribeAll}
              inputProps={{ 'aria-label': 'Team Invites' }}
            />
          </Grid>
          <Grid item xs={12} md={12} textAlign="center">
            <NextLink href="/" passHref legacyBehavior>
              <Button variant="contained" disabled={loading}>
                {t('Done')}
              </Button>
            </NextLink>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export const getServerSideProps = withUserTokenSSR()(
  async ({ user, locale, resolvedUrl, query }) => {
    const { apolloClient, translations } = await initAndAuthApp({
      user,
      locale,
      resolvedUrl
    })

    let updatePrefs: UpdateJourneysEmailPreference | null | undefined

    // TemplateDetailsPage
    let { data: journeysEmailPreferenceData } = await apolloClient.query<
      JourneysEmailPreference,
      JourneysEmailPreferenceVariables
    >({
      query: GET_EMAIL_PREFERENCE,
      variables: {
        email: query?.email as string
      }
    })

    if (journeysEmailPreferenceData.journeysEmailPreference == null) {
      journeysEmailPreferenceData = {
        journeysEmailPreference: {
          email: query?.email as string,
          unsubscribeAll: false,
          accountNotifications: true,
          __typename: 'JourneysEmailPreference'
        }
      }
    }

    if (query?.unsubscribeAll != null) {
      const { data: updatePrefsData } = await apolloClient.mutate<
        UpdateJourneysEmailPreference,
        UpdateJourneysEmailPreferenceVariables
      >({
        mutation: UPDATE_EMAIL_PREFERENCE,
        variables: {
          input: {
            email: journeysEmailPreferenceData?.journeysEmailPreference
              ?.email as string,
            preference: 'unsubscribeAll',
            value: true
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
