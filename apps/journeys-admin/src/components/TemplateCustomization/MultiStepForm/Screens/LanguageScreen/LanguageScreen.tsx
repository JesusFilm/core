import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { getApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { Form, Formik, FormikValues } from 'formik'
import uniqBy from 'lodash/uniqBy'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { object, string } from 'yup'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { transformer } from '@core/journeys/ui/transformer'
import { useJourneyAiTranslateSubscription } from '@core/journeys/ui/useJourneyAiTranslateSubscription'
import { SUPPORTED_LANGUAGE_IDS } from '@core/journeys/ui/useJourneyAiTranslateSubscription/supportedLanguages'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'
import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { useAuth } from '../../../../../libs/auth'
import { useCurrentUserLazyQuery } from '../../../../../libs/useCurrentUserLazyQuery'
import { useGetChildTemplateJourneyLanguages } from '../../../../../libs/useGetChildTemplateJourneyLanguages'
import { useGetParentTemplateJourneyLanguages } from '../../../../../libs/useGetParentTemplateJourneyLanguages'
import { useTeamCreateMutation } from '../../../../../libs/useTeamCreateMutation'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'
import { CardsPreview, EDGE_FADE_PX } from '../LinksScreen/CardsPreview'
import { ScreenWrapper } from '../ScreenWrapper'

import { JourneyCustomizeTeamSelect } from './JourneyCustomizeTeamSelect'

interface LanguageScreenProps {
  handleNext: (overrideJourneyId?: string) => void
}

export function LanguageScreen({
  handleNext
}: LanguageScreenProps): ReactElement {
  const { t } = useTranslation('journeys-ui')
  const { templateCustomizationGuestFlow } = useFlags()
  const { enqueueSnackbar } = useSnackbar()
  const { user } = useAuth()
  const { journey } = useJourney()
  const { query } = useTeam()
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const { loadUser } = useCurrentUserLazyQuery()
  const [teamCreate] = useTeamCreateMutation()
  const [loading, setLoading] = useState(false)

  const steps = transformer(journey?.blocks ?? []) as Array<
    TreeBlock<StepBlock>
  >
  // If the user is not authenticated, useAuth returns { user: null }
  const isParentTemplate = journey?.fromTemplateId == null
  const isSignedIn = user?.email != null && user?.id != null
  const isGuestFlowEnabled = templateCustomizationGuestFlow === true
  const isNextDisabled = (!isSignedIn && !isGuestFlowEnabled) || loading

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

  const currentJourneyLanguage = isParentTemplate
    ? {
        id: journey?.language?.id ?? '',
        name: journey?.language?.name ?? [],
        slug: null
      }
    : null
  const languages = uniqBy(
    [
      ...parentJourneyLanguages,
      ...(currentJourneyLanguage != null
        ? [...childJourneyLanguages, currentJourneyLanguage]
        : childJourneyLanguages)
    ],
    (lang) => lang.id
  )

  const currentLanguageId = journey?.language?.id
  const currentJourneyId = journey?.id
  const filteredChildJourneyLanguagesJourneyMap = (() => {
    const mapArray = Object.entries(
      childJourneyLanguagesJourneyMap ?? {}
    ).filter(
      ([langId, journeyId]) =>
        langId !== currentLanguageId || journeyId === currentJourneyId
    )
    if (isParentTemplate) {
      mapArray.push([journey?.language?.id as string, journey?.id ?? ''])
    }
    const map = Object.fromEntries(mapArray)
    return map
  })()
  const languagesJourneyMap = {
    ...parentJourneyLanguagesJourneyMap,
    ...filteredChildJourneyLanguagesJourneyMap
  }

  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529',
    where: {
      ids: [...SUPPORTED_LANGUAGE_IDS]
    }
  })

  const validationSchema = object({
    teamSelect: isSignedIn ? string().required() : string(),
    translateLanguage: object()
      .nullable()
      .test(
        'translateLanguage-required',
        'Please select a translation language',
        function (value) {
          const { translateWithAI } = this.parent
          if (translateWithAI) {
            return value != null && typeof value === 'object' && 'id' in value
          }
          return true
        }
      )
  })

  const initialValues = {
    teamSelect: query?.data?.getJourneyProfile?.lastActiveTeamId ?? '',
    languageSelect: {
      id: journey?.language?.id,
      localName: journey?.language?.name.find((name) => name.primary)?.value,
      nativeName: journey?.language?.name.find((name) => !name.primary)?.value
    },
    translateWithAI: false,
    translateLanguage: undefined as
      | { id: string; localName?: string; nativeName?: string }
      | undefined
  }

  function shouldSkipDuplicate(
    journey: {
      template?: boolean | null
      language?: { id: string } | null
      team?: { id: string } | null
    },
    values: FormikValues
  ): boolean {
    const selectedTeamId =
      values.teamSelect != null && values.teamSelect !== ''
        ? values.teamSelect
        : null
    const selectedLanguageId = values.languageSelect?.id ?? ''

    const isNotTemplate = journey.template === false
    const languageMatches = journey.language?.id === selectedLanguageId
    const teamMatches =
      selectedTeamId != null ? journey.team?.id === selectedTeamId : true

    return Boolean(isNotTemplate && languageMatches && teamMatches)
  }

  async function createGuestUser(): Promise<{ teamId: string }> {
    const teamName = t('My Team')
    const isAnonymous = user?.isAnonymous ?? false
    if (!isAnonymous) {
      try {
        await signInAnonymously(getAuth(getApp()))
      } catch {
        throw new Error('Could not create firebase user')
      }
    }

    await loadUser()

    const existingTeams = query?.data?.teams ?? []
    if (existingTeams.length > 0) {
      const teamId =
        query?.data?.getJourneyProfile?.lastActiveTeamId ?? existingTeams[0].id
      return { teamId }
    }

    const teamResult = await teamCreate({
      variables: {
        input: { title: teamName, publicTitle: teamName }
      }
    })

    if (teamResult?.data?.teamCreate == null) {
      throw new Error('Guest team creation returned no team')
    }

    return { teamId: teamResult.data.teamCreate.id }
  }

  async function handleJourneyDuplication(
    type: 'signedIn' | 'guest',
    journeyId: string
  ): Promise<string | null> {
    let teamId
    if (type === 'signedIn') {
      const teams = query?.data?.teams ?? []
      teamId = query?.data?.getJourneyProfile?.lastActiveTeamId ?? teams[0]?.id
    } else {
      const guestResult = await createGuestUser()
      if (guestResult == null) {
        enqueueSnackbar(
          t('Unable to create guest user. Please try again or sign in.'),
          { variant: 'error' }
        )
        setLoading(false)
        return null
      }
      teamId = guestResult.teamId
    }

    const { data } = await journeyDuplicate({
      variables: {
        id: journeyId,
        teamId,
        forceNonTemplate: true,
        duplicateAsDraft: type === 'guest'
      }
    })

    if (data?.journeyDuplicate == null) {
      switch (type) {
        case 'signedIn':
          enqueueSnackbar(
            t(
              'Failed to duplicate journey to team, please refresh the page and try again'
            ),
            { variant: 'error' }
          )
          return null
        case 'guest':
          enqueueSnackbar(
            t(
              'Failed to duplicate journey to team, please refresh the page and try again'
            ),
            { variant: 'error' }
          )
          return null
      }
    }

    return data?.journeyDuplicate?.id ?? null
  }

  const [translationVariables, setTranslationVariables] = useState<
    | {
        journeyId: string
        name: string
        journeyLanguageName: string
        textLanguageId: string
        textLanguageName: string
      }
    | undefined
  >(undefined)
  const [translationCompleted, setTranslationCompleted] = useState(false)

  const { data: translationData } = useJourneyAiTranslateSubscription({
    variables: translationVariables,
    skip: !translationVariables,
    onData: ({ data }) => {
      if (
        !translationCompleted &&
        data?.data?.journeyAiTranslateCreateSubscription?.progress === 100 &&
        data?.data?.journeyAiTranslateCreateSubscription?.journey
      ) {
        setTranslationCompleted(true)
        const translatedJourneyId =
          data.data.journeyAiTranslateCreateSubscription.journey.id

        enqueueSnackbar(t('Journey Translated'), {
          variant: 'success',
          preventDuplicate: true
        })
        setLoading(false)
        setTranslationVariables(undefined)
        handleNext(translatedJourneyId)
      }
    },
    onError: (error) => {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
      setLoading(false)
      setTranslationVariables(undefined)
      setTranslationCompleted(false)
    }
  })

  const translationProgress =
    translationData?.journeyAiTranslateCreateSubscription
      ? {
          progress:
            translationData.journeyAiTranslateCreateSubscription.progress ?? 0,
          message:
            translationData.journeyAiTranslateCreateSubscription.message ?? ''
        }
      : undefined

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

    const { translateWithAI, translateLanguage } = values

    if (translateWithAI && !translateLanguage?.id) {
      enqueueSnackbar(t('Please select a translation language'), {
        variant: 'error'
      })
      setLoading(false)
      return
    }

    const journeyId =
      languagesJourneyMap?.[values.languageSelect?.id] ?? journey?.id

    if (shouldSkipDuplicate(journey, values) && !translateWithAI) {
      handleNext()
    } else if (isSignedIn) {
      if (translateWithAI && translateLanguage) {
        const duplicatedJourneyId = await handleJourneyDuplication(
          'signedIn',
          journeyId
        )

        if (duplicatedJourneyId != null) {
          const sourceLanguageName =
            journey.language.name.find((name) => !name.primary)?.value ?? ''
          const targetLanguageName =
            translateLanguage.nativeName ?? translateLanguage.localName ?? ''

          setTranslationCompleted(false)
          setTranslationVariables({
            journeyId: duplicatedJourneyId,
            name: journey.title,
            journeyLanguageName: sourceLanguageName,
            textLanguageId: translateLanguage.id,
            textLanguageName: targetLanguageName
          })
        } else {
          setLoading(false)
        }
      } else {
        const duplicatedJourneyId = await handleJourneyDuplication(
          'signedIn',
          journeyId
        )

        if (duplicatedJourneyId != null) {
          handleNext(duplicatedJourneyId)
        } else {
          setLoading(false)
        }
      }
    } else {
      const duplicatedJourneyId = await handleJourneyDuplication(
        'guest',
        journeyId
      )

      if (duplicatedJourneyId != null) {
        handleNext(duplicatedJourneyId)
      } else {
        setLoading(false)
      }
    }
    return
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ handleSubmit: formikHandleSubmit, setFieldValue, values }) => (
        <ScreenWrapper
          title={t("Let's Get Started!")}
          mobileTitle={t('Get Started')}
          subtitle={t(
            'A few quick edits and your template will be ready to share.'
          )}
          mobileSubtitle={t("A few quick edits and it's ready to share!")}
          footer={
            <CustomizeFlowNextButton
              label={t('Next')}
              onClick={() => formikHandleSubmit()}
              disabled={isNextDisabled}
              loading={loading}
              ariaLabel={t('Next')}
            />
          }
        >
          <Stack
            sx={{
              width: '100%',
              alignItems: 'center',
              gap: { xs: 3, sm: 4 }
            }}
          >
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ mb: { xs: 0, sm: 2 } }}
            >
              {`'${journey?.title ?? ''}'`}
            </Typography>
            <Box
              sx={{
                mx: `-${EDGE_FADE_PX}px`,
                width: `calc(100% + ${EDGE_FADE_PX * 2}px)`
              }}
            >
              {steps.length > 0 && <CardsPreview steps={steps} />}
            </Box>
            <Form style={{ width: '100%' }}>
              <FormControl
                sx={{
                  width: { xs: '100%' },
                  alignSelf: 'center'
                }}
              >
                <Stack gap={2} sx={{ px: { xs: 0 } }}>
                  <Typography
                    variant="h6"
                    display={{ xs: 'none', sm: 'block' }}
                  >
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.translateWithAI}
                        onChange={async (e) => {
                          await setFieldValue(
                            'translateWithAI',
                            e.target.checked
                          )
                          if (!e.target.checked) {
                            await setFieldValue('translateLanguage', undefined)
                          }
                        }}
                      />
                    }
                    label={t('Translate with AI')}
                  />
                  {values.translateWithAI && (
                    <LanguageAutocomplete
                      value={values.translateLanguage}
                      languages={languagesData?.languages}
                      loading={languagesLoading}
                      onChange={(value) =>
                        setFieldValue('translateLanguage', value)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={t('Search Language')}
                          label={t('Select Translation Language')}
                          variant="filled"
                        />
                      )}
                    />
                  )}
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
                  {translationProgress && (
                    <Box
                      sx={{
                        width: '100%',
                        mt: 2,
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ width: '100%', textAlign: 'center' }}>
                        <Typography
                          variant="body1"
                          sx={{
                            mb: 2,
                            color: 'text.primary',
                            fontWeight: 500
                          }}
                        >
                          {translationProgress.message}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={translationProgress.progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4
                            }
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 1,
                            display: 'block',
                            color: 'text.secondary'
                          }}
                        >
                          {Math.round(translationProgress.progress)}%
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </FormControl>
            </Form>
          </Stack>
        </ScreenWrapper>
      )}
    </Formik>
  )
}
