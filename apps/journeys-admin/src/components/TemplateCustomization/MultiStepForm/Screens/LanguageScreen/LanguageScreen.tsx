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
import { useTeamCreateMutation } from '../../../../../libs/useTeamCreateMutation'

interface LanguageScreenProps {
  handleNext: () => void
}

export function LanguageScreen({
  handleNext
}: LanguageScreenProps): ReactElement {
  const { t } = useTranslation('journeys-ui')
  const user = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  console.log('user', user)

  const { journey } = useJourney()
  const isSignedIn = user?.email != null
  const { query } = useTeam()
  const [teamCreate] = useTeamCreateMutation()

  const validationSchema = object({
    teamSelect: string().required()
  })

  const initialValues = {
    teamSelect: query?.data?.getJourneyProfile?.lastActiveTeamId ?? ''
  }

  const [journeyDuplicate] = useJourneyDuplicateMutation()

  async function handleSignedInSubmit(values: FormikValues) {
    setLoading(true)
    if (journey == null) {
      setLoading(false)
      return
    }
    if (isSignedIn) {
      const { teamSelect: teamId } = values
      const { data: duplicateData } = await journeyDuplicate({
        variables: { id: journey.id, teamId }
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

  async function handleSignedOutSubmit() {
    setLoading(true)
    if (journey == null) {
      setLoading(false)
      return
    }
    const { data: teamCreateData } = await teamCreate({
      variables: {
        input: {
          title: 'My Team'
        }
      }
    })
    if (teamCreateData?.teamCreate == null) {
      enqueueSnackbar(
        t('Failed to create team, please refresh the page and try again'),
        {
          variant: 'error'
        }
      )
      setLoading(false)
      return
    }

    const { data: duplicateData } = await journeyDuplicate({
      variables: { id: journey.id, teamId: teamCreateData.teamCreate.id }
    })
    handleNext()
    setLoading(false)
  }

  return (
    <Stack justifyContent="center" alignItems="center" gap={4}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('Lets get started!')}
      </Typography>
      <LanguageScreenCardPreview />

      <Typography variant="body1" color="text.secondary" align="center">
        {t('Select a team')}
      </Typography>
      {isSignedIn && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSignedInSubmit}
        >
          {({ handleSubmit }) => (
            <Form>
              <FormControl sx={{ alignSelf: 'center' }}>
                <JourneyCustomizeTeamSelect />
                <Button
                  data-testid="LanguageScreenSubmitButton"
                  disabled={loading}
                  variant="contained"
                  color="secondary"
                  onClick={() => handleSubmit()}
                  sx={{
                    width: { xs: '100%', sm: 300 },
                    alignSelf: 'center',
                    mt: 4
                  }}
                >
                  <ArrowRightIcon />
                </Button>
              </FormControl>
            </Form>
          )}
        </Formik>
      )}
      {!isSignedIn && (
        <Button
          data-testid="LanguageScreenSubmitButton"
          disabled={loading}
          variant="contained"
          color="secondary"
          onClick={() => handleSignedOutSubmit()}
          sx={{
            width: { xs: '100%', sm: 300 },
            alignSelf: 'center',
            mt: 4
          }}
        >
          <ArrowRightIcon />
        </Button>
      )}
    </Stack>
  )
}
