import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { GetServerSideProps } from 'next'
import NextLink from 'next/link'
import { useUser, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import {
  JourneysEmailPreference,
  JourneysEmailPreferenceVariables
} from '../../__generated__/JourneysEmailPreference'
import {
  UpdateJourneysEmailPreference,
  UpdateJourneysEmailPreferenceVariables,
  UpdateJourneysEmailPreference_updateJourneysEmailPreference
} from '../../__generated__/UpdateJourneysEmailPreference'
import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
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

interface EmailPreferencesPageProps {
  journeysEmailPreferenceData: JourneysEmailPreference
  updatePrefs?: UpdateJourneysEmailPreference
}

function EmailPreferencesPage({
  journeysEmailPreferenceData,
  updatePrefs
}: EmailPreferencesPageProps): ReactElement {
  const user = useUser()
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
          enqueueSnackbar(t('Email Preferences Updated.'), {
            variant: 'success',
            preventDuplicate: false
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
    <OnboardingPageWrapper
      emailSubject="a question about email preferences"
      user={user}
    >
      <Stack
        sx={{
          maxWidth: '400px'
        }}
      >
        <Typography variant="h4" align="center">
          {t('Email Preferences')}
        </Typography>
        <Typography variant="body1" align="center" sx={{ mt: 1 }}>
          {t(
            'Select the types of email notifications you want to receive from NextSteps.'
          )}
        </Typography>
        <Card sx={{ my: 8, borderRadius: 2 }}>
          <CardContent sx={{ px: 7, py: '30px' }}>
            <Typography variant="subtitle2">
              {t('Account Notifications')}
            </Typography>
            <Stack direction="row">
              <Typography variant="caption">
                {t(
                  'Email updates about new members to your teams, invited to a team, journey shared with you, journey access requests, and removed from a team.'
                )}
              </Typography>
              <Switch
                checked={journeysEmailPreference?.accountNotifications}
                onChange={handlePreferenceChange('accountNotifications')}
                name="accountNotifications"
                disabled={loading}
              />
            </Stack>
          </CardContent>
        </Card>
        <Button
          LinkComponent={NextLink}
          href="/"
          variant="contained"
          disabled={loading}
          sx={{ backgroundColor: 'secondary.dark' }}
        >
          {t('Done')}
        </Button>
      </Stack>
    </OnboardingPageWrapper>
  )
}

export const getServerSideProps: GetServerSideProps<EmailPreferencesPageProps> =
  withUserTokenSSR()(async ({ user, locale, resolvedUrl, query }) => {
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
            preference: 'accountNotifications',
            value: false
          }
        }
      })
      if (updatePrefsData != null) updatePrefs = updatePrefsData
    }
    return {
      props: {
        ...translations,
        initialApolloState: apolloClient.cache.extract(),
        journeysEmailPreferenceData,
        updatePrefs: updatePrefs ?? undefined
      }
    }
  })

export default withUser()(EmailPreferencesPage)
