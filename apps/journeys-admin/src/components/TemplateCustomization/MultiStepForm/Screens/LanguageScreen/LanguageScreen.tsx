import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { getApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { Form, Formik } from 'formik'
import uniqBy from 'lodash/uniqBy'
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
import { useUpdateLastActiveTeamIdMutation } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import Translate from '@core/shared/ui/icons/Translate'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { useAuth } from '../../../../../libs/auth'
import { useCurrentUserLazyQuery } from '../../../../../libs/useCurrentUserLazyQuery'
import { useGetChildTemplateJourneyLanguages } from '../../../../../libs/useGetChildTemplateJourneyLanguages'
import { useGetParentTemplateJourneyLanguages } from '../../../../../libs/useGetParentTemplateJourneyLanguages'
import { useTeamCreateMutation } from '../../../../../libs/useTeamCreateMutation'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'
import { CardsPreview } from '../LinksScreen/CardsPreview'
import { ScreenWrapper } from '../ScreenWrapper'

import { JourneyCustomizeTeamSelect } from './JourneyCustomizeTeamSelect'
import Button from '@mui/material/Button'

interface LanguageFormValues {
  teamSelect: string
  languageSelect: {
    id: string
    localName?: string
    nativeName?: string
  }
}

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
  const { query, setActiveTeam } = useTeam()
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const updateLastActiveTeamId = useUpdateLastActiveTeamIdMutation()
  const { loadUser } = useCurrentUserLazyQuery()
  const [teamCreate] = useTeamCreateMutation()
  const [loading, setLoading] = useState(false)
  const isSignedIn = user?.email != null && user?.id != null
  const isGuestFlowEnabled = templateCustomizationGuestFlow === true
  // Guests don't have teams yet — only block on team load errors for signed-in users
  const isDataReady = journey != null && (!isSignedIn || query?.data != null)
  const hasTeamLoadError = isSignedIn && query?.error != null

  const steps = transformer(journey?.blocks ?? []) as Array<
    TreeBlock<StepBlock>
  >
  // If the user is not authenticated, useAuth returns { user: null }
  const isParentTemplate = journey?.fromTemplateId == null
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
    if (isParentTemplate && journey?.language?.id != null) {
      mapArray.push([journey.language.id, journey.id ?? ''])
    }
    const map = Object.fromEntries(mapArray)
    return map
  })()
  const languagesJourneyMap = {
    ...parentJourneyLanguagesJourneyMap,
    ...filteredChildJourneyLanguagesJourneyMap
  }

  const validationSchema = object({
    teamSelect: isSignedIn ? string().required() : string()
  })

  const teams = query?.data?.teams ?? []
  const lastActiveTeamId =
    query?.data?.getJourneyProfile?.lastActiveTeamId ?? ''
  const defaultTeamId = teams.some((t) => t.id === lastActiveTeamId)
    ? lastActiveTeamId
    : (teams[0]?.id ?? '')

  const initialValues = {
    teamSelect: defaultTeamId,
    languageSelect: {
      id: journey?.language?.id ?? '',
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
    values: LanguageFormValues
  ): boolean {
    const selectedTeamId = values.teamSelect !== '' ? values.teamSelect : null
    const selectedLanguageId = values.languageSelect?.id ?? ''

    const isNotTemplate = journey.template === false
    const languageMatches = journey.language?.id === selectedLanguageId
    const teamMatches =
      selectedTeamId != null ? journey.team?.id === selectedTeamId : true

    return isNotTemplate && languageMatches && teamMatches
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
    if (existingTeams.length > 0 && defaultTeamId !== '') {
      return { teamId: defaultTeamId }
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
    journeyId: string,
    selectedTeamId?: string
  ): Promise<string | null> {
    let teamId
    if (type === 'signedIn') {
      teamId = selectedTeamId
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
      enqueueSnackbar(
        t(
          'Failed to duplicate journey to team, please refresh the page and try again'
        ),
        { variant: 'error' }
      )
      return null
    }

    if (teamId != null) {
      const selectedTeam = teams.find((t) => t.id === teamId)
      if (selectedTeam != null) {
        setActiveTeam(selectedTeam)
      }
      void updateLastActiveTeamId({
        variables: { input: { lastActiveTeamId: teamId } }
      })
    }

    return data.journeyDuplicate.id
  }

  async function handleSubmit(values: LanguageFormValues) {
    setLoading(true)
    try {
      if (journey == null) {
        enqueueSnackbar(
          t('Journey failed to load. Please refresh the page and try again.'),
          { variant: 'error' }
        )
        return
      }

      const journeyId =
        languagesJourneyMap?.[values.languageSelect?.id ?? ''] ?? journey?.id

      if (shouldSkipDuplicate(journey, values)) {
        await handleNext()
        return
      }

      const type = isSignedIn ? 'signedIn' : 'guest'
      const duplicatedJourneyId = await handleJourneyDuplication(
        type,
        journeyId,
        isSignedIn ? values.teamSelect : undefined
      )

      if (duplicatedJourneyId != null) {
        await handleNext(duplicatedJourneyId)
      }
    } catch {
      enqueueSnackbar(
        t(
          'Failed to duplicate journey to team, please refresh the page and try again'
        ),
        { variant: 'error' }
      )
      setLoading(false)
    }
  }

  if (hasTeamLoadError || !isDataReady) {
    const loadingContent = hasTeamLoadError ? (
      <Typography color="error" align="center" role="alert">
        {t('Failed to load teams. Please refresh the page and try again.')}
      </Typography>
    ) : (
      <CircularProgress />
    )

    return (
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
            onClick={undefined}
            disabled
            loading={false}
            ariaLabel={t('Next')}
          />
        }
      >
        <Stack
          sx={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200
          }}
        >
          {loadingContent}
        </Stack>
      </ScreenWrapper>
    )
  }

  return (
    <Formik<LanguageFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
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
            {steps.length > 0 && <CardsPreview steps={steps} />}
            <Form style={{ width: '100%' }}>
              <FormControl
                sx={{
                  width: { xs: '100%' },
                  alignSelf: 'center'
                }}
              >
                <Stack gap={2} sx={{ px: { xs: 0 } }}>
                  <LanguageAutocomplete
                    value={values.languageSelect}
                    languages={languages.map((language) => ({
                      id: language?.id,
                      name: language?.name,
                      slug: language?.slug
                    }))}
                    onChange={(value) => setFieldValue('languageSelect', value)}
                    renderInput={(params) => (
                      <TextField
                        data-testid="LanguageAutocompleteInput"
                        {...params}
                        hiddenLabel
                        placeholder={t('Search Language')}
                        variant="filled"
                        InputProps={{
                          ...params.InputProps,
                          sx: { paddingBottom: 2 },
                          startAdornment: (
                            <InputAdornment position="start">
                              <Translate />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                  {isSignedIn && (
                    <Box sx={{ mt: 4 }}>
                      <JourneyCustomizeTeamSelect />
                    </Box>
                  )}
                  <Button
                    variant="blockOutlined"
                    color="secondary"
                    size="large"
                  >
                    Test
                  </Button>
                </Stack>
              </FormControl>
            </Form>
          </Stack>
        </ScreenWrapper>
      )}
    </Formik>
  )
}
