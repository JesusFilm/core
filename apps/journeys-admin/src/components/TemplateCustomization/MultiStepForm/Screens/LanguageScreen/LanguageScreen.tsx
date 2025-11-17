import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
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
import { useJourneyAiTranslateSubscription } from '@core/journeys/ui/useJourneyAiTranslateSubscription'
import { SUPPORTED_LANGUAGE_IDS } from '@core/journeys/ui/useJourneyAiTranslateSubscription/supportedLanguages'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { useGetChildTemplateJourneyLanguages } from '../../../../../libs/useGetChildTemplateJourneyLanguages'
import { useGetParentTemplateJourneyLanguages } from '../../../../../libs/useGetParentTemplateJourneyLanguages'
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

  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529',
    where: {
      ids: [...SUPPORTED_LANGUAGE_IDS]
    }
  })

  const validationSchema = object({
    teamSelect: string().required(),
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

  const [journeyDuplicate] = useJourneyDuplicateMutation()

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

  // Set up the subscription for translation
  const { data: translationData } = useJourneyAiTranslateSubscription({
    variables: translationVariables,
    skip: !translationVariables,
    onData: ({ data }) => {
      // Check if translation is complete (progress is 100 and journey is present)
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

        // Navigate to the translated journey
        void router.push(
          `/templates/${translatedJourneyId}/customize`,
          undefined,
          { shallow: true }
        )
        handleNext()
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

  // Extract translation progress for display
  const translationProgress =
    translationData?.journeyAiTranslateCreateSubscription
      ? {
          progress:
            translationData.journeyAiTranslateCreateSubscription.progress ?? 0,
          message:
            translationData.journeyAiTranslateCreateSubscription.message ?? ''
        }
      : undefined

  const FORM_SM_BREAKPOINT_WIDTH = '390px'

  async function handleSubmit(values: FormikValues) {
    setLoading(true)
    if (journey == null) {
      setLoading(false)
      return
    }
    if (isSignedIn) {
      const { teamSelect: teamId, translateWithAI, translateLanguage } = values

      // Validate that translateLanguage is selected if translateWithAI is enabled
      if (translateWithAI && !translateLanguage?.id) {
        enqueueSnackbar(t('Please select a translation language'), {
          variant: 'error'
        })
        setLoading(false)
        return
      }
      const {
        languageSelect: { id: languageId }
      } = values

      // Check if a journey for this language already exists
      const existingJourneyId = languagesJourneyMap?.[languageId]

      if (existingJourneyId && !translateWithAI) {
        // Journey for this language exists and no AI translation requested - just duplicate it
        const { data: duplicateData } = await journeyDuplicate({
          variables: { id: existingJourneyId, teamId }
        })
        if (duplicateData?.journeyDuplicate == null) {
          enqueueSnackbar(
            t(
              'Failed to duplicate journey to team, please refresh the page and try again'
            ),
            {
              variant: 'error'
            }
          )
          setLoading(false)
          return
        }
        await router.push(
          `/templates/${duplicateData.journeyDuplicate.id}/customize`,
          undefined,
          { shallow: true }
        )
        handleNext()
        setLoading(false)
      } else {
        // AI translation requested or journey doesn't exist - duplicate and translate
        try {
          // Use the source journey or existing journey for duplication
          const sourceJourneyId = existingJourneyId ?? journey.id
          const { data: duplicateData } = await journeyDuplicate({
            variables: { id: sourceJourneyId, teamId }
          })

          if (duplicateData?.journeyDuplicate?.id == null) {
            throw new Error('Journey duplication failed')
          }

          const newJourneyId = duplicateData.journeyDuplicate.id

          // If AI translation is requested, use the translateLanguage, otherwise use languageSelect
          if (translateWithAI && translateLanguage) {
            // Get source language name
            const sourceLanguageName =
              journey.language.name.find((name) => !name.primary)?.value ?? ''

            // Get target language name from translateLanguage
            const targetLanguageName =
              translateLanguage.nativeName ?? translateLanguage.localName ?? ''

            // Start translation
            setTranslationCompleted(false)
            setTranslationVariables({
              journeyId: newJourneyId,
              name: journey.title,
              journeyLanguageName: sourceLanguageName,
              textLanguageId: translateLanguage.id,
              textLanguageName: targetLanguageName
            })

            // Don't navigate yet - wait for translation to complete
          } else if (!existingJourneyId) {
            // No existing journey and no AI translation - duplicate and translate to selected language
            const {
              languageSelect: { id: targetLanguageId, localName, nativeName }
            } = values

            // Get source language name
            const sourceLanguageName =
              journey.language.name.find((name) => !name.primary)?.value ?? ''

            // Get target language name
            const targetLanguageName = nativeName ?? localName ?? ''

            // Start translation
            setTranslationCompleted(false)
            setTranslationVariables({
              journeyId: newJourneyId,
              name: journey.title,
              journeyLanguageName: sourceLanguageName,
              textLanguageId: targetLanguageId,
              textLanguageName: targetLanguageName
            })

            // Don't navigate yet - wait for translation to complete
          } else {
            // Existing journey found and no translation needed - just navigate
            await router.push(
              `/templates/${newJourneyId}/customize`,
              undefined,
              { shallow: true }
            )
            handleNext()
            setLoading(false)
          }
        } catch (error) {
          enqueueSnackbar(
            t(
              'Failed to duplicate journey to team, please refresh the page and try again'
            ),
            {
              variant: 'error'
            }
          )
          setLoading(false)
        }
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
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.translateWithAI}
                      onChange={(e) => {
                        setFieldValue('translateWithAI', e.target.checked)
                        if (!e.target.checked) {
                          setFieldValue('translateLanguage', undefined)
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
                {isSignedIn && <JourneyCustomizeTeamSelect />}
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
                <CustomizeFlowNextButton
                  label={t('Next')}
                  onClick={() => handleSubmit()}
                  disabled={
                    loading ||
                    (translationProgress != null &&
                      translationProgress.progress < 100)
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
