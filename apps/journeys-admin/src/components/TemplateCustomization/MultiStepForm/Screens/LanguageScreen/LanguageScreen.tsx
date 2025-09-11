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
    <Stack justifyContent="center" alignItems="center" gap={4}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('Lets get started!')}
      </Typography>
      <LanguageScreenCardPreview />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, setFieldValue, values }) => (
          <Form>
            <FormControl sx={{ alignSelf: 'center' }}>
              <Stack gap={4}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                >
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
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                >
                  {t('Select a team')}
                </Typography>
                {isSignedIn && <JourneyCustomizeTeamSelect />}
              </Stack>
              <Button
                data-testid="LanguageScreenSubmitButton"
                disabled={loading}
                variant="contained"
                color="secondary"
                onClick={() => handleSubmit()}
                sx={{
                  width: { xs: '100%', sm: 300 },
                  alignSelf: 'center',
                  mt: 6
                }}
              >
                <ArrowRightIcon />
              </Button>
            </FormControl>
          </Form>
        )}
      </Formik>
    </Stack>
  )
}
