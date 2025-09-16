import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
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
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

import { JourneyCustomizeTeamSelect } from './JourneyCustomizeTeamSelect'
import { LanguageScreenCardPreview } from './LanguageScreenCardPreview'
import { useTemplateJourneyLanguages } from '../../../../../libs/useTemplateJourneyLanguages'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'
import { SocialImage } from '@core/journeys/ui/TemplateView/TemplateViewHeader/SocialImage'
import { BUTTON_NEXT_STEP_WIDTH, BUTTON_NEXT_STEP_HEIGHT } from '../../../utils/sharedStyles'

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

  const { languages, languagesJourneyMap } = useTemplateJourneyLanguages({
    variables: {
      where: { fromTemplateId: journey?.fromTemplateId, template: true }
    },
    skip: journey?.fromTemplateId == null
  })

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

  async function handleSubmit(values: FormikValues) {
    setLoading(true)
    if (journey == null) {
      setLoading(false)
      return
    }
    if (isSignedIn) {
      const { teamSelect: teamId } = values
      const {
        languageSelect: { id: languageId }
      } = values
      const journeyId = languagesJourneyMap?.[languageId] ?? journey.id
      const { data: duplicateData } = await journeyDuplicate({
        variables: { id: journeyId, teamId }
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
    }
  }

  return (
    <Stack
      alignItems="center"
      gap={4}
      sx={{ px: { xs: 0, sm: 20 } }}
    >
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
          variant="h6"
          color="text.secondary"
          align="center"
        >
          {t('A few quick edits and your template will be ready to share.')}
        </Typography>
      </Stack>
      <SocialImage />
      <Typography
        variant="h6"
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
            <FormControl sx={{ width: { xs: '100%', sm: FORM_SM_BREAKPOINT_WIDTH }, alignSelf: 'center' }} >
              <Stack gap={2}>
                <Typography variant="h6" display={{ xs: 'none', sm: 'block' }}>
                  {t('Select a language')}
                </Typography>
                <Typography variant="body2" display={{ xs: 'block', sm: 'none' }}>
                  {t('Select a language')}
                </Typography>
                <LanguageAutocomplete
                  value={values.languageSelect}
                  languages={languages.map((language) => ({
                    id: language.id,
                    name: language.name,
                    slug: language.slug
                  }))}
                  onChange={(value) => setFieldValue('languageSelect', value)}
                />
                <Typography variant="h6" display={{ xs: 'none', sm: 'block' }} sx={{ mt: 4 }}>
                  {t('Select a team')}
                </Typography>
                <Typography variant="body2" display={{ xs: 'block', sm: 'none' }} sx={{ mt: 4 }}>
                  {t('Select a team')}
                </Typography>
                {isSignedIn && <JourneyCustomizeTeamSelect />}
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={loading}
                  onClick={() => handleSubmit()}
                  data-testid="LanguageScreenSubmitButton"
                  sx={{
                    width: BUTTON_NEXT_STEP_WIDTH,
                    height: BUTTON_NEXT_STEP_HEIGHT,
                    alignSelf: 'center',
                    mt: { xs: 6, sm: 4 },
                    borderRadius: '8px'
                  }}
                >
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        display: { xs: 'none', sm: 'block' }
                      }}
                    >
                      {t('Next Step')}
                    </Typography>
                    <ArrowRightIcon sx={{ fontSize: { xs: '24px', sm: '16px' } }} />
                  </Stack>
                </Button>
              </Stack>
            </FormControl>
          </Form>
        )}
      </Formik>
    </Stack>
  )
}
