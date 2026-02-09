import { gql, useMutation } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { Form, Formik, FormikValues } from 'formik'
import { useRouter } from 'next/router'
import { useUser } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'
import { object } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { SocialImage } from '@core/journeys/ui/TemplateView/TemplateViewHeader/SocialImage'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { JourneyProfileCreate } from '../../../../../../__generated__/JourneyProfileCreate'
import { useCurrentUserLazyQuery } from '../../../../../libs/useCurrentUserLazyQuery'
import { useGetChildTemplateJourneyLanguages } from '../../../../../libs/useGetChildTemplateJourneyLanguages'
import { useGetParentTemplateJourneyLanguages } from '../../../../../libs/useGetParentTemplateJourneyLanguages'
import {
  useTeamCreateMutation,
  useTeamCreateMutationGuest
} from '../../../../../libs/useTeamCreateMutation'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'


// const JOURNEY_PROFILE_CREATE = gql`
//   mutation JourneyProfileCreate {
//     journeyProfileCreate {
//       id
//       userId
//       acceptedTermsAt
//     }
//   }
// `

interface LanguageScreenProps {
  handleNext: () => void
  handleScreenNavigation: (screen: CustomizationScreen) => void
}

export function LanguageScreen({
  handleNext,
  handleScreenNavigation
}: LanguageScreenProps): ReactElement {
  const { templateCustomizationGuestFlow } = useFlags()
  const { t } = useTranslation('journeys-ui')
  const user = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const { journey } = useJourney()
  //If the user is not authenticated, useUser will return a User instance with a null id https://github.com/gladly-team/next-firebase-auth?tab=readme-ov-file#useuser
  const isSignedIn = user?.email != null && user?.id != null
  const { query } = useTeam()

  useEffect(() => {
    //TODO: delete this effect
    const firebaseUserId = user?.id ?? null
    const isAnonymous = user?.firebaseUser?.isAnonymous ?? false
    console.log('[LanguageScreen] Firebase user id:', firebaseUserId)
    console.log('[LanguageScreen] Is anonymous user:', isAnonymous)
  }, [user?.id, user?.firebaseUser?.isAnonymous])

  const isParentTemplate = journey?.fromTemplateId == null

  const {
    languages: childJourneyLanguages,
    languagesJourneyMap: childJourneyLanguagesJourneyMap
  } = useGetChildTemplateJourneyLanguages({
    variables: {
      where: {
        fromTemplateId: isParentTemplate
          ? journey?.id
          : journey?.fromTemplateId,
        template: true
      }
    },
    skip: journey?.id == null
  })

  const {
    languages: parentJourneyLanguages,
    languagesJourneyMap: parentJourneyLanguagesJourneyMap
  } = useGetParentTemplateJourneyLanguages({
    variables: {
      // type cast as query will be skipped if variable is null
      where: { ids: [journey?.fromTemplateId as string], template: true }
    },
    skip: isParentTemplate
  })

  const languages = isParentTemplate
    ? [
        ...parentJourneyLanguages,
        ...childJourneyLanguages,
        {
          id: journey?.language?.id ?? '',
          name: journey?.language?.name ?? [],
          slug: null
        }
      ]
    : [...parentJourneyLanguages, ...childJourneyLanguages]

  const languagesJourneyMap = isParentTemplate
    ? {
        ...parentJourneyLanguagesJourneyMap,
        ...childJourneyLanguagesJourneyMap,
        [journey?.language?.id as string]: journey?.id
      }
    : {
        ...parentJourneyLanguagesJourneyMap,
        ...childJourneyLanguagesJourneyMap
      }

  const validationSchema = object({})

  const initialValues = {
    languageSelect: {
      id: journey?.language?.id,
      localName: journey?.language?.name.find((name) => name.primary)?.value,
      nativeName: journey?.language?.name.find((name) => !name.primary)?.value
    }
  }

  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const { loadUser } = useCurrentUserLazyQuery()
  // const [journeyProfileCreate] = useMutation<JourneyProfileCreate>(
  //   JOURNEY_PROFILE_CREATE
  // )
  const [teamCreate] = useTeamCreateMutation()
  const [teamCreateGuest] = useTeamCreateMutationGuest()

  const FORM_SM_BREAKPOINT_WIDTH = '390px'

  async function createGuestUser(): Promise<{ teamId: string } | null> {
    try {
      console.log('[createGuestUser] 1. start', {
        isAnonymous: user?.firebaseUser?.isAnonymous ?? false
      })
      const isAnonymous = user?.firebaseUser?.isAnonymous ?? false
      if (!isAnonymous) {
        console.log('[createGuestUser] 2. calling signInAnonymously')
        await signInAnonymously(getAuth(getApp()))
        console.log('[createGuestUser] 3. signInAnonymously done')
      } else {
        console.log('[createGuestUser] 2. already anonymous, skip signInAnonymously')
      }

      const teamName = t('My Team')

    let meResult: Awaited<ReturnType<typeof loadUser>> | null = null
    try {
      console.log('[createGuestUser] 4. calling loadUser')
      meResult = await loadUser()
      console.log('[createGuestUser] 5. loadUser done', {
        hasMe: meResult?.data?.me != null,
        __typename: meResult?.data?.me?.__typename
      })
    } catch (e) {
      console.error('[createGuestUser] loadUser failed:', e)
    }

    // let profileResult: Awaited<ReturnType<typeof journeyProfileCreate>> | null =
    //   null
    // try {
    //   profileResult = await journeyProfileCreate()
    // } catch (e) {
    //   console.error('[createGuestUser] journeyProfileCreate failed:', e)
    // }

    let teamResult: Awaited<ReturnType<typeof teamCreate>> | null = null
    try {
      console.log('[createGuestUser] 6. calling teamCreate', { teamName })
      teamResult = await teamCreateGuest({
        variables: {
          input: { title: teamName, publicTitle: teamName }
        }
      })
      console.log('[createGuestUser] 7. teamCreate done', {
        teamId: teamResult?.data?.teamCreate?.id
      })
    } catch (e) {
      const err = e as {
        graphQLErrors?: Array<{ message: string; extensions?: unknown }>
        networkError?: unknown
        message?: string
        cause?: unknown
      }
      console.error('[createGuestUser] teamCreate failed:', err?.message ?? e)
      if (err?.graphQLErrors?.length) {
        err.graphQLErrors.forEach((g, i) => {
          console.error(
            `[createGuestUser] graphQLErrors[${i}]:`,
            g.message,
            g.extensions
          )
        })
      }
      if (err?.networkError) {
        console.error('[createGuestUser] networkError:', err.networkError)
      }
      if (err?.cause != null) {
        console.error('[createGuestUser] cause:', err.cause)
      }
      return null
    }

    if (teamResult?.data?.teamCreate == null) {
      console.log('[createGuestUser] 8. returning null (team missing)', {
        hasMe: meResult?.data?.me != null,
        hasTeam: false
      })
      return null
    }

    // Refetch me after teamCreate (user was created in resolveReference); optional for guest flow
    if (meResult?.data?.me == null) {
      try {
        await loadUser()
      } catch {
        // ignore
      }
    }

      // Guest flow success: we have a team (user exists in api-users via resolveReference)
      console.log('[createGuestUser] 9. success', {
        teamId: teamResult.data.teamCreate.id
      })
      return { teamId: teamResult.data.teamCreate.id }
    } catch (e) {
      console.error('[createGuestUser] unexpected error:', e)
      return null
    }
  }

  async function duplicateJourneyAndRedirect(
    journeyId: string,
    teamId: string
  ): Promise<boolean> {
    const { data } = await journeyDuplicate({
      variables: { id: journeyId, teamId, forceNonTemplate: true }
    })
    if (data?.journeyDuplicate == null) return false

    await router.push(
      `/templates/${data.journeyDuplicate.id}/customize`,
      undefined,
      { shallow: true }
    )
    return true
  }

  async function handleSubmit(values: FormikValues) {
    setLoading(true)
    if (journey == null) {
      setLoading(false)
      return
    }

    const journeyId =
      languagesJourneyMap?.[values.languageSelect?.id] ?? journey?.id
    if (journeyId == null) {
      enqueueSnackbar(
        t('Unable to continue as guest. Please try again or sign in.'),
        { variant: 'error' }
      )
      setLoading(false)
      return
    }

    if (isSignedIn) {
      const teams = query?.data?.teams ?? []
      const teamId =
        query?.data?.getJourneyProfile?.lastActiveTeamId ?? teams[0]?.id
      if (teamId == null) {
        enqueueSnackbar(
          t(
            'No team available. Please create a team first.'
          ),
          { variant: 'error' }
        )
        setLoading(false)
        return
      }
      const success = await duplicateJourneyAndRedirect(journeyId, teamId)
      if (!success) {
        enqueueSnackbar(
          t(
            'Failed to duplicate journey to team, please refresh the page and try again'
          ),
          { variant: 'error' }
        )
      } else {
        handleNext()
      }
      setLoading(false)
      return
    } else {
      try {
        const guestResult = await createGuestUser()
        if (guestResult == null) {
          enqueueSnackbar(
            t('Unable to continue as guest. Please try again or sign in.'),
            { variant: 'error' }
          )
          setLoading(false)
          return
        }

        try {
          const success = await duplicateJourneyAndRedirect(
            journeyId,
            guestResult.teamId
          )
          if (!success) {
            enqueueSnackbar(
              t(
                'Failed to duplicate journey to team, please refresh the page and try again'
              ),
              { variant: 'error' }
            )
          } else {
            handleNext()
          }
        } catch (e) {
          console.error('[LanguageScreen] duplicateJourneyAndRedirect error:', e)
          enqueueSnackbar(
            t(
              'Failed to duplicate journey to team, please refresh the page and try again'
            ),
            { variant: 'error' }
          )
        }
      } catch (e) {
        console.error('[LanguageScreen] createGuestUser error:', e)
        enqueueSnackbar(
          t('Unable to continue as guest. Please try again or sign in.'),
          { variant: 'error' }
        )
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Stack alignItems="center" gap={4} sx={{ px: { xs: 0, sm: 20 } }}>
      <Stack alignItems="center" sx={{ pb: { xs: 0, sm: 3 } }}>
        <Typography
          variant="h4"
          display={{ xs: 'none', sm: 'block' }}
          gutterBottom
          sx={{ mb: 2 }}
        >
          {t("Let's get started!")}
        </Typography>
        <Typography
          variant="h6"
          display={{ xs: 'block', sm: 'none' }}
          gutterBottom
        >
          {t("Let's get started!")}
        </Typography>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          align="center"
          display={{ xs: 'none', sm: 'block' }}
        >
          {t('A few quick edits and your template will be ready to share.')}
        </Typography>
      </Stack>
      <SocialImage />
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ mb: { xs: 0, sm: 2 } }}
      >
        {journey?.title ?? ''}
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, setFieldValue, values }) => (
          <Form style={{ width: '100%' }}>
            <FormControl
              sx={{
                width: { xs: '100%', sm: FORM_SM_BREAKPOINT_WIDTH },
                alignSelf: 'center'
              }}
            >
              <Stack gap={2}>
                <Typography variant="h6" display={{ xs: 'none', sm: 'block' }}>
                  {t('Select a language')}
                </Typography>
                <Typography
                  variant="body2"
                  display={{ xs: 'block', sm: 'none' }}
                >
                  {t('Select a language')}
                </Typography>
                <LanguageAutocomplete
                  value={values.languageSelect}
                  languages={languages.map((language) => ({
                    id: language?.id,
                    name: language?.name,
                    slug: language?.slug
                  }))}
                  onChange={(value) => setFieldValue('languageSelect', value)}
                />
                <CustomizeFlowNextButton
                  label={t('Next')}
                  onClick={() => handleSubmit()}
                  disabled={templateCustomizationGuestFlow || loading}
                  ariaLabel={t('Next')}
                />
              </Stack>
            </FormControl>
          </Form>
        )}
      </Formik>
    </Stack>
  )
}
