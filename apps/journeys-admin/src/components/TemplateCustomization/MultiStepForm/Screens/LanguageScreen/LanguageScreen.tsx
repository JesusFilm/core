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
import { ReactElement, useState } from 'react'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { SocialImage } from '@core/journeys/ui/TemplateView/TemplateViewHeader/SocialImage'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { useCurrentUserLazyQuery } from '../../../../../libs/useCurrentUserLazyQuery'
import { useGetChildTemplateJourneyLanguages } from '../../../../../libs/useGetChildTemplateJourneyLanguages'
import { useGetParentTemplateJourneyLanguages } from '../../../../../libs/useGetParentTemplateJourneyLanguages'
import { useTeamCreateMutation } from '../../../../../libs/useTeamCreateMutation'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'

import { JourneyCustomizeTeamSelect } from './JourneyCustomizeTeamSelect'

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

  const validationSchema = object({
    teamSelect: isSignedIn ? string().required() : string()
  })

  const initialValues = {
    teamSelect: query?.data?.getJourneyProfile?.lastActiveTeamId ?? '',
    languageSelect: {
      id: journey?.language?.id,
      localName: journey?.language?.name.find((name) => name.primary)?.value,
      nativeName: journey?.language?.name.find((name) => !name.primary)?.value
    }
  }

  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const { loadUser } = useCurrentUserLazyQuery()
  const [teamCreate] = useTeamCreateMutation()

  const FORM_SM_BREAKPOINT_WIDTH = '390px'

  async function createGuestUser(): Promise<{ teamId: string }> {
    const teamName = t('My Team')
    const isAnonymous = user?.firebaseUser?.isAnonymous ?? false
    if (!isAnonymous) {
      await signInAnonymously(getAuth(getApp()))
    }

    const [, teamResult] = await Promise.all([
      loadUser().catch(() => null),
      teamCreate({
        variables: {
          input: { title: teamName, publicTitle: teamName }
        }
      })
    ])

    if (teamResult?.data?.teamCreate == null) {
      throw new Error('Guest team creation returned no team')
    }

    return { teamId: teamResult.data.teamCreate.id }
  }

  async function duplicateJourneyAndRedirect(
    journeyId: string,
    teamId: string,
    duplicateAsDraft?: boolean
  ): Promise<boolean> {
    const { data } = await journeyDuplicate({
      variables: {
        id: journeyId,
        teamId,
        forceNonTemplate: true,
        duplicateAsDraft
      }
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
      // Duplicates journey for a signed in user
      const teams = query?.data?.teams ?? []
      const teamId =
        query?.data?.getJourneyProfile?.lastActiveTeamId ?? teams[0]?.id
      if (teamId == null) {
        enqueueSnackbar(t('No team available. Please create a team first.'), {
          variant: 'error'
        })
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
      // Creates a guest user and duplicates the journey for them
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

        const journeyDuplicateSuccess = await duplicateJourneyAndRedirect(
          journeyId,
          guestResult.teamId,
          true
        )
        if (!journeyDuplicateSuccess) {
          enqueueSnackbar(
            t(
              'Failed to duplicate journey to team, please refresh the page and try again'
            ),
            { variant: 'error' }
          )
        } else {
          handleNext()
        }
      } catch {
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
                {isSignedIn && (
                  <>
                    <Typography
                      variant="h6"
                      display={{ xs: 'none', sm: 'block' }}
                      sx={{ mt: 4 }}
                    >
                      {t('Select a team')}
                    </Typography>

                    <Typography
                      variant="body2"
                      display={{ xs: 'block', sm: 'none' }}
                      sx={{ mt: 4 }}
                    >
                      {t('Select a team')}
                    </Typography>
                    <JourneyCustomizeTeamSelect />
                  </>
                )}
                <CustomizeFlowNextButton
                  label={t('Next')}
                  onClick={() => handleSubmit()}
                  disabled={
                    (templateCustomizationGuestFlow && !isSignedIn) || loading
                  }
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
