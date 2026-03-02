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

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { transformer } from '@core/journeys/ui/transformer'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { useCurrentUserLazyQuery } from '../../../../../libs/useCurrentUserLazyQuery'
import { useGetChildTemplateJourneyLanguages } from '../../../../../libs/useGetChildTemplateJourneyLanguages'
import { useGetParentTemplateJourneyLanguages } from '../../../../../libs/useGetParentTemplateJourneyLanguages'
import { useTeamCreateMutation } from '../../../../../libs/useTeamCreateMutation'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'
import { CardsPreview } from '../LinksScreen/CardsPreview'

import { JourneyCustomizeTeamSelect } from './JourneyCustomizeTeamSelect'

interface LanguageScreenProps {
  handleNext: (overrideJourneyId?: string) => void
  handleScreenNavigation: (screen: CustomizationScreen) => void
}

const FORM_SM_BREAKPOINT_WIDTH = '390px'

export function LanguageScreen({
  handleNext,
  handleScreenNavigation
}: LanguageScreenProps): ReactElement {
  const { t } = useTranslation('journeys-ui')
  const { templateCustomizationGuestFlow } = useFlags()
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const user = useUser()
  const { journey } = useJourney()
  const { query } = useTeam()
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const { loadUser } = useCurrentUserLazyQuery()
  const [teamCreate] = useTeamCreateMutation()
  const [loading, setLoading] = useState(false)

  const steps = transformer(journey?.blocks ?? []) as Array<
    TreeBlock<StepBlock>
  >
  const isParentTemplate = journey?.fromTemplateId == null
  //If the user is not authenticated, useUser will return a User instance with a null id https://github.com/gladly-team/next-firebase-auth?tab=readme-ov-file#useuser
  const isSignedIn = user?.email != null && user?.id != null

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

  function shouldSkipDuplicate(
    journey: {
      template?: boolean | null
      language?: { id: string } | null
      team?: { id: string } | null
    },
    selectedLanguageId: string,
    selectedTeamId: string
  ): boolean {
    const isNotTemplate = journey.template === false
    const languageMatches = journey.language?.id === selectedLanguageId
    const teamMatches = journey.team?.id === selectedTeamId
    return Boolean(isNotTemplate && languageMatches && teamMatches)
  }

  async function createGuestUser(): Promise<{ teamId: string }> {
    const teamName = t('My Team')
    const isAnonymous = user?.firebaseUser?.isAnonymous ?? false
    if (!isAnonymous) {
      try {
        await signInAnonymously(getAuth(getApp()))
      } catch {
        throw new Error('Could not firebase user')
      }
    }

    const [, teamResult] = await Promise.all([
      loadUser(),
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

    void router.push(
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
      enqueueSnackbar(
        t('Journey failed to load. Please refresh the page and try again.'),
        { variant: 'error' }
      )
      return
    }

    const { teamSelect: teamId } = values
    const {
      languageSelect: { id: languageId }
    } = values
    const journeyId =
      languagesJourneyMap?.[values.languageSelect?.id] ?? journey?.id

    if (shouldSkipDuplicate(journey, languageId, teamId)) {
      handleNext()
      return
    } else if (isSignedIn) {
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
            t('Unable to create guest user. Please try again or sign in.'),
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
      }
    }
    setLoading(false)
  }

  return (
    <Stack alignItems="center" gap={4} sx={{ px: { xs: 0, sm: 20 } }}>
      <Stack alignItems="center" sx={{ pb: { xs: 6, sm: 10 } }}>
        <Typography
          variant="h4"
          display={{ xs: 'none', sm: 'block' }}
          gutterBottom
          sx={{ mb: 2 }}
        >
          {t("Let's Get Started!")}
        </Typography>
        <Typography
          variant="h6"
          display={{ xs: 'block', sm: 'none' }}
          gutterBottom
        >
          {t('Get Started')}
        </Typography>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          align="center"
          display={{ xs: 'none', sm: 'block' }}
        >
          {t('A few quick edits and your template will be ready to share.')}
        </Typography>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          align="center"
          display={{ xs: 'block', sm: 'none' }}
        >
          {t("A few quick edits and it's ready to share!")}
        </Typography>
      </Stack>

      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ mb: { xs: 0, sm: 2 } }}
      >
        {`'${journey?.title ?? ''}'`}
      </Typography>

      {steps.length > 0 && <CardsPreview steps={steps} />}

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
                  disabled={!templateCustomizationGuestFlow || loading}
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
