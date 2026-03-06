import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikValues } from 'formik'
import uniqBy from 'lodash/uniqBy'
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

import { useGetChildTemplateJourneyLanguages } from '../../../../../libs/useGetChildTemplateJourneyLanguages'
import { useGetParentTemplateJourneyLanguages } from '../../../../../libs/useGetParentTemplateJourneyLanguages'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'
import { CardsPreview } from '../LinksScreen/CardsPreview'
import { ScreenWrapper } from '../ScreenWrapper'

import { JourneyCustomizeTeamSelect } from './JourneyCustomizeTeamSelect'

interface LanguageScreenProps {
  handleNext: (overrideJourneyId?: string) => void
  handleScreenNavigation: (screen: CustomizationScreen) => void
}

export function LanguageScreen({
  handleNext,
  handleScreenNavigation
}: LanguageScreenProps): ReactElement {
  const { templateCustomizationGuestFlow } = useFlags()
  const { t } = useTranslation('journeys-ui')
  const user = useUser()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const { journey } = useJourney()
  const steps = transformer(journey?.blocks ?? []) as Array<
    TreeBlock<StepBlock>
  >
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

  const validationSchema = object({
    teamSelect: string().required()
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

  const FORM_SM_BREAKPOINT_WIDTH = '390px'

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

  async function handleSubmit(values: FormikValues) {
    if (journey == null) return

    const { teamSelect: teamId } = values
    const {
      languageSelect: { id: languageId }
    } = values

    setLoading(true)
    if (shouldSkipDuplicate(journey, languageId, teamId)) {
      handleNext()
    } else if (isSignedIn) {
      const journeyId = languagesJourneyMap?.[languageId] ?? journey.id
      const { data: duplicateData } = await journeyDuplicate({
        variables: { id: journeyId, teamId, forceNonTemplate: true }
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
      handleNext(duplicateData.journeyDuplicate.id)
    }
    setLoading(false)
  }

  return (
    <Stack alignItems="center" gap={4} sx={{ px: { xs: 0, sm: 20 } }}>
      <ScreenWrapper
        title={t("Let's Get Started!")}
        mobileTitle={t('Get Started')}
        subtitle={t(
          'A few quick edits and your template will be ready to share.'
        )}
        mobileSubtitle={t("A few quick edits and it's ready to share!")}
      >
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
      </ScreenWrapper>
    </Stack>
  )
}
